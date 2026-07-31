// X (Twitter) API v2 OAuth 2.0 (with PKCE, mandatory) + Tweet/media posting.
//
// X's API is pay-per-use (no free tier for new developer accounts) — see
// README. Also the newest, least-stable API surface of every platform
// integrated here; the chunked media upload endpoints in particular are
// implemented from documentation/community reports rather than a live
// reference, so treat that path as the most likely to need a follow-up fix
// once actually exercised (same as TikTok's privacy_level bug needed one).
import crypto from 'node:crypto';

const AUTH_URL = 'https://x.com/i/oauth2/authorize';
const TOKEN_URL = 'https://api.x.com/2/oauth2/token';
const API_BASE = 'https://api.x.com/2';

function clientId(): string {
  const v = process.env.X_CLIENT_ID;
  if (!v) throw new Error('Set X_CLIENT_ID as an environment variable (X Developer Portal -> your app -> Keys and tokens).');
  return v;
}

function clientSecret(): string {
  const v = process.env.X_CLIENT_SECRET;
  if (!v) throw new Error('Set X_CLIENT_SECRET as an environment variable (X Developer Portal -> your app -> Keys and tokens).');
  return v;
}

export const X_SCOPES = 'tweet.read tweet.write users.read offline.access';

export function generatePkce(): { verifier: string; challenge: string } {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

export function xAuthorizeUrl(redirectUri: string, state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId(),
    redirect_uri: redirectUri,
    scope: X_SCOPES,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  return `${AUTH_URL}?${params.toString()}`;
}

function basicAuthHeader(): string {
  return `Basic ${Buffer.from(`${clientId()}:${clientSecret()}`).toString('base64')}`;
}

export interface XTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date;
}

async function tokenRequest(body: Record<string, string>): Promise<XTokens> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { Authorization: basicAuthHeader(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId(), ...body }).toString(),
  });
  const json: any = await res.json();
  if (!res.ok) throw new Error(`X OAuth error: ${json.error_description || json.error || res.statusText}`);
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token || null,
    expiresAt: new Date(Date.now() + json.expires_in * 1000),
  };
}

export function exchangeXCode(code: string, redirectUri: string, codeVerifier: string): Promise<XTokens> {
  return tokenRequest({ grant_type: 'authorization_code', code, redirect_uri: redirectUri, code_verifier: codeVerifier });
}

// Refresh tokens rotate on every use (like TikTok's) — the new one must be
// persisted or the connection becomes unrefreshable after the next refresh.
export function refreshXAccessToken(refreshToken: string): Promise<XTokens> {
  return tokenRequest({ grant_type: 'refresh_token', refresh_token: refreshToken });
}

export async function fetchXProfile(accessToken: string): Promise<{ id: string; username: string }> {
  const res = await fetch(`${API_BASE}/users/me`, { headers: { Authorization: `Bearer ${accessToken}` } });
  const json: any = await res.json();
  if (!res.ok) throw new Error(`X API error: ${json.detail || json.title || res.statusText}`);
  return { id: json.data.id, username: json.data.username };
}

async function initMediaUpload(accessToken: string, totalBytes: number, mediaType: string, mediaCategory: string): Promise<string> {
  const res = await fetch(`${API_BASE}/media/upload/initialize`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ media_type: mediaType, media_category: mediaCategory, total_bytes: totalBytes }),
  });
  const json: any = await res.json();
  if (!res.ok) throw new Error(`X media upload error: ${json.detail || json.title || res.statusText}`);
  return json.data.id;
}

// X caps each APPEND segment under 5MB.
const CHUNK_SIZE = 4 * 1024 * 1024;

async function appendMediaChunk(accessToken: string, mediaId: string, segmentIndex: number, chunk: Buffer): Promise<void> {
  const form = new FormData();
  form.append('segment_index', String(segmentIndex));
  form.append('media', new Blob([new Uint8Array(chunk)]), 'chunk');
  const res = await fetch(`${API_BASE}/media/upload/${mediaId}/append`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  if (!res.ok) {
    const json: any = await res.json().catch(() => ({}));
    throw new Error(`X media upload error: ${json.detail || json.title || res.statusText}`);
  }
}

async function finalizeMediaUpload(accessToken: string, mediaId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/media/upload/${mediaId}/finalize`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
  });
  const json: any = await res.json();
  if (!res.ok) throw new Error(`X media upload error: ${json.detail || json.title || res.statusText}`);
  return json.data;
}

async function pollMediaStatus(accessToken: string, mediaId: string, attempts: number): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(`${API_BASE}/media/upload/${mediaId}`, { headers: { Authorization: `Bearer ${accessToken}` } });
    const json: any = await res.json();
    if (!res.ok) throw new Error(`X media upload error: ${json.detail || json.title || res.statusText}`);
    const info = json.data?.processing_info;
    if (!info || info.state === 'succeeded') return;
    if (info.state === 'failed') throw new Error(`X failed to process this media${info.error?.message ? `: ${info.error.message}` : '.'}`);
    await new Promise((r) => setTimeout(r, (info.check_after_secs || 1) * 1000));
  }
}

// Fetches the media in fixed-size ranges (HTTP Range requests) rather than
// buffering the whole file up front, so only one chunk is ever in memory —
// same reasoning as LinkedIn's video upload.
async function uploadMediaToX(accessToken: string, mediaUrl: string, mediaType: 'image' | 'video'): Promise<string> {
  const head = await fetch(mediaUrl, { method: 'HEAD' });
  const size = Number(head.headers.get('content-length') || 0);
  if (!size) throw new Error("Couldn't determine the media file's size.");
  const contentType = head.headers.get('content-type') || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg');
  const mediaCategory = mediaType === 'video' ? 'tweet_video' : 'tweet_image';

  const mediaId = await initMediaUpload(accessToken, size, contentType, mediaCategory);

  let segmentIndex = 0;
  for (let offset = 0; offset < size; offset += CHUNK_SIZE) {
    const end = Math.min(offset + CHUNK_SIZE, size) - 1;
    const chunkRes = await fetch(mediaUrl, { headers: { Range: `bytes=${offset}-${end}` } });
    if (!chunkRes.ok) throw new Error(`Couldn't fetch media chunk from storage (${chunkRes.status}).`);
    await appendMediaChunk(accessToken, mediaId, segmentIndex, Buffer.from(await chunkRes.arrayBuffer()));
    segmentIndex++;
  }

  const final = await finalizeMediaUpload(accessToken, mediaId);
  if (final.processing_info && final.processing_info.state !== 'succeeded') {
    await pollMediaStatus(accessToken, mediaId, 10);
  }

  return mediaId;
}

export async function publishToX(accessToken: string, caption: string, mediaUrl: string | null, mediaType: 'image' | 'video' | null): Promise<string> {
  const body: Record<string, unknown> = { text: caption };
  if (mediaUrl && (mediaType === 'image' || mediaType === 'video')) {
    const mediaId = await uploadMediaToX(accessToken, mediaUrl, mediaType);
    body.media = { media_ids: [mediaId] };
  }

  const res = await fetch(`${API_BASE}/tweets`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json: any = await res.json();
  if (!res.ok) throw new Error(`X API error: ${json.detail || json.title || json.errors?.[0]?.message || res.statusText}`);
  return json.data.id;
}
