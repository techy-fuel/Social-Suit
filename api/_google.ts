// Google OAuth + YouTube Data API v3 helpers.
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_UPLOAD_API = 'https://www.googleapis.com/upload/youtube/v3';

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
].join(' ');

function clientId(): string {
  const v = process.env.GOOGLE_CLIENT_ID;
  if (!v) throw new Error('Set GOOGLE_CLIENT_ID as an environment variable (Google Cloud Console -> Credentials).');
  return v;
}

function clientSecret(): string {
  const v = process.env.GOOGLE_CLIENT_SECRET;
  if (!v) throw new Error('Set GOOGLE_CLIENT_SECRET as an environment variable (Google Cloud Console -> Credentials).');
  return v;
}

export function googleAuthorizeUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    access_type: 'offline', // required to get a refresh_token back
    prompt: 'consent', // forces refresh_token on repeat connects too, not just the first
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export interface GoogleTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date;
}

export async function exchangeGoogleCode(code: string, redirectUri: string): Promise<GoogleTokens> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId(),
      client_secret: clientSecret(),
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }).toString(),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Google OAuth error: ${body.error_description || body.error || res.statusText}`);
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token || null,
    expiresAt: new Date(Date.now() + body.expires_in * 1000),
  };
}

export async function refreshGoogleAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId(),
      client_secret: clientSecret(),
      grant_type: 'refresh_token',
    }).toString(),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Google token refresh error: ${body.error_description || body.error || res.statusText}`);
  return { accessToken: body.access_token, expiresAt: new Date(Date.now() + body.expires_in * 1000) };
}

export interface YouTubeChannel {
  id: string;
  title: string;
}

export async function fetchYouTubeChannel(accessToken: string): Promise<YouTubeChannel | null> {
  const res = await fetch(`${YOUTUBE_API}/channels?part=snippet&mine=true`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`YouTube API error: ${body.error?.message || res.statusText}`);
  const channel = body.items?.[0];
  if (!channel) return null;
  return { id: channel.id, title: channel.snippet?.title || 'YouTube channel' };
}

// Streams the video straight from its (R2) URL into a YouTube resumable
// upload session, without buffering the whole file in memory. Still bounded
// by this function's execution time budget — large videos may not finish
// within Vercel's per-invocation limit.
export async function uploadVideoToYouTube(accessToken: string, videoUrl: string, title: string, description: string): Promise<string> {
  const source = await fetch(videoUrl);
  if (!source.ok || !source.body) throw new Error(`Couldn't fetch video from storage (${source.status}).`);
  const contentLength = source.headers.get('content-length');
  const contentType = source.headers.get('content-type') || 'video/mp4';

  const sessionRes = await fetch(`${YOUTUBE_UPLOAD_API}/videos?uploadType=resumable&part=snippet,status`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Upload-Content-Type': contentType,
      ...(contentLength ? { 'X-Upload-Content-Length': contentLength } : {}),
    },
    body: JSON.stringify({
      snippet: { title: title.slice(0, 100), description: description.slice(0, 5000) },
      status: { privacyStatus: 'public' },
    }),
  });
  if (!sessionRes.ok) {
    const body = await sessionRes.json().catch(() => ({}));
    throw new Error(`YouTube upload session error: ${body.error?.message || sessionRes.statusText}`);
  }
  const uploadUrl = sessionRes.headers.get('location');
  if (!uploadUrl) throw new Error('YouTube did not return an upload session URL.');

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType, ...(contentLength ? { 'Content-Length': contentLength } : {}) },
    // @ts-expect-error - Node's fetch supports streaming a ReadableStream body; duplex is required for it.
    duplex: 'half',
    body: source.body,
  });
  const uploadBody = await uploadRes.json();
  if (!uploadRes.ok) throw new Error(`YouTube upload error: ${uploadBody.error?.message || uploadRes.statusText}`);
  return uploadBody.id;
}

export async function deleteYouTubeVideo(accessToken: string, videoId: string): Promise<void> {
  const res = await fetch(`${YOUTUBE_API}/videos?id=${encodeURIComponent(videoId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok && res.status !== 404) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`YouTube delete error: ${body.error?.message || res.statusText}`);
  }
}
