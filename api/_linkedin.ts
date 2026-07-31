// LinkedIn OAuth (OpenID Connect) + Posts API (text/image/video shares).
const AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const API_BASE = 'https://api.linkedin.com';

// LinkedIn enforces this strictly — a request missing it (or with a version
// too old) gets rejected outright. Bump periodically.
const LINKEDIN_VERSION = '202505';

function clientId(): string {
  const v = process.env.LINKEDIN_CLIENT_ID;
  if (!v) throw new Error('Set LINKEDIN_CLIENT_ID as an environment variable (LinkedIn Developer app -> Auth tab).');
  return v;
}

function clientSecret(): string {
  const v = process.env.LINKEDIN_CLIENT_SECRET;
  if (!v) throw new Error('Set LINKEDIN_CLIENT_SECRET as an environment variable (LinkedIn Developer app -> Auth tab).');
  return v;
}

// openid/profile/email (Sign In with LinkedIn using OpenID Connect) identify
// the user; w_member_social (Share on LinkedIn) is what actually lets us
// publish posts on their behalf. Both products have to be added to the app
// before these scopes can be requested.
export const LINKEDIN_SCOPES = 'openid profile email w_member_social';

export function linkedinAuthorizeUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId(),
    redirect_uri: redirectUri,
    state,
    scope: LINKEDIN_SCOPES,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export interface LinkedInTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date;
}

export async function exchangeLinkedInCode(code: string, redirectUri: string): Promise<LinkedInTokens> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId(),
      client_secret: clientSecret(),
    }).toString(),
  });
  const body: any = await res.json();
  if (!res.ok) throw new Error(`LinkedIn OAuth error: ${body.error_description || body.error || res.statusText}`);
  return {
    accessToken: body.access_token,
    // Self-serve apps generally aren't granted refresh tokens (that needs a
    // separately-approved "Programmatic refresh tokens" product) — when
    // absent, the connection just needs reconnecting once the 60-day access
    // token expires, same as any other missing-refresh-token case.
    refreshToken: body.refresh_token || null,
    expiresAt: new Date(Date.now() + body.expires_in * 1000),
  };
}

export async function refreshLinkedInAccessToken(refreshToken: string): Promise<LinkedInTokens> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId(),
      client_secret: clientSecret(),
    }).toString(),
  });
  const body: any = await res.json();
  if (!res.ok) throw new Error(`LinkedIn token refresh error: ${body.error_description || body.error || res.statusText}`);
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token || refreshToken,
    expiresAt: new Date(Date.now() + body.expires_in * 1000),
  };
}

export interface LinkedInProfile {
  sub: string;
  name: string;
}

export async function fetchLinkedInProfile(accessToken: string): Promise<LinkedInProfile> {
  const res = await fetch(`${API_BASE}/v2/userinfo`, { headers: { Authorization: `Bearer ${accessToken}` } });
  const body: any = await res.json();
  if (!res.ok) throw new Error(`LinkedIn API error: ${body.message || res.statusText}`);
  return { sub: body.sub, name: body.name || 'LinkedIn member' };
}

function restHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'X-Restli-Protocol-Version': '2.0.0',
    'LinkedIn-Version': LINKEDIN_VERSION,
  };
}

async function restPost(path: string, accessToken: string, body: unknown): Promise<{ json: any; headers: Headers }> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers: restHeaders(accessToken), body: JSON.stringify(body) });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(`LinkedIn API error: ${json.message || res.statusText}`);
  return { json, headers: res.headers };
}

async function uploadImage(accessToken: string, ownerUrn: string, imageUrl: string): Promise<string> {
  const init = await restPost('/rest/images?action=initializeUpload', accessToken, {
    initializeUploadRequest: { owner: ownerUrn },
  });
  const { uploadUrl, image } = init.json.value;

  const source = await fetch(imageUrl);
  if (!source.ok || !source.body) throw new Error(`Couldn't fetch image from storage (${source.status}).`);
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    // @ts-expect-error - Node's fetch supports streaming a ReadableStream body; duplex is required for it.
    duplex: 'half',
    body: source.body,
  });
  if (!uploadRes.ok) throw new Error(`LinkedIn image upload error: ${uploadRes.statusText}`);

  return image as string;
}

// LinkedIn's video upload is multi-part: initializeUpload hands back a list
// of byte ranges (each with its own uploadUrl), one PUT per range, and the
// ETag from each PUT response has to be collected and sent back in
// finalizeUpload. Fetching each range individually (rather than the whole
// file up front) keeps memory use to one part at a time.
async function uploadVideo(accessToken: string, ownerUrn: string, videoUrl: string): Promise<string> {
  const head = await fetch(videoUrl, { method: 'HEAD' });
  const size = Number(head.headers.get('content-length') || 0);
  if (!size) throw new Error("Couldn't determine the video's file size.");

  const init = await restPost('/rest/videos?action=initializeUpload', accessToken, {
    initializeUploadRequest: { owner: ownerUrn, fileSizeBytes: size, uploadCaptions: false, uploadThumbnail: false },
  });
  const { uploadInstructions, video, uploadToken } = init.json.value;

  const uploadedPartIds: string[] = [];
  for (const part of uploadInstructions) {
    const chunk = await fetch(videoUrl, { headers: { Range: `bytes=${part.firstByte}-${part.lastByte}` } });
    if (!chunk.ok || !chunk.body) throw new Error(`Couldn't fetch video chunk from storage (${chunk.status}).`);
    const partRes = await fetch(part.uploadUrl, {
      method: 'PUT',
      // @ts-expect-error - Node's fetch supports streaming a ReadableStream body; duplex is required for it.
      duplex: 'half',
      body: chunk.body,
    });
    if (!partRes.ok) throw new Error(`LinkedIn video upload error: ${partRes.statusText}`);
    const etag = partRes.headers.get('etag');
    if (!etag) throw new Error('LinkedIn video upload error: missing ETag on a chunk response.');
    uploadedPartIds.push(etag);
  }

  await restPost('/rest/videos?action=finalizeUpload', accessToken, {
    finalizeUploadRequest: { video, uploadToken, uploadedPartIds },
  });

  return video as string;
}

export async function publishToLinkedIn(
  accessToken: string,
  memberSub: string,
  caption: string,
  mediaUrl: string | null,
  mediaType: 'image' | 'video' | null
): Promise<string> {
  const authorUrn = `urn:li:person:${memberSub}`;

  let media: { id: string } | undefined;
  if (mediaUrl && mediaType === 'image') {
    media = { id: await uploadImage(accessToken, authorUrn, mediaUrl) };
  } else if (mediaUrl && mediaType === 'video') {
    media = { id: await uploadVideo(accessToken, authorUrn, mediaUrl) };
  }

  const { headers } = await restPost('/rest/posts', accessToken, {
    author: authorUrn,
    commentary: caption,
    visibility: 'PUBLIC',
    distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
    ...(media ? { content: { media } } : {}),
  });

  const postUrn = headers.get('x-restli-id');
  if (!postUrn) throw new Error('LinkedIn API error: no post id returned.');
  return postUrn;
}
