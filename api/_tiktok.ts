// TikTok Login Kit (OAuth) + Content Posting API (Direct Post) helpers.
const AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';
const TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const API_BASE = 'https://open.tiktokapis.com/v2';

function clientKey(): string {
  const v = process.env.TIKTOK_CLIENT_KEY;
  if (!v) throw new Error('Set TIKTOK_CLIENT_KEY as an environment variable (TikTok for Developers -> your app -> Basic Information).');
  return v;
}

function clientSecret(): string {
  const v = process.env.TIKTOK_CLIENT_SECRET;
  if (!v) throw new Error('Set TIKTOK_CLIENT_SECRET as an environment variable (TikTok for Developers -> your app -> Basic Information).');
  return v;
}

// video.publish = Direct Post; user.info.basic is needed to show the
// creator's name before posting, which TikTok requires. Unaudited apps can
// request both and post today, but content is restricted to SELF_ONLY
// (private, visible only to the account owner) until TikTok approves the
// app — see README.
export const TIKTOK_SCOPES = 'user.info.basic,video.publish';

export function tiktokAuthorizeUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_key: clientKey(),
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: TIKTOK_SCOPES,
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export interface TikTokTokens {
  accessToken: string;
  refreshToken: string;
  openId: string;
  expiresAt: Date;
}

async function tokenRequest(body: Record<string, string>): Promise<TikTokTokens> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
    body: new URLSearchParams({ client_key: clientKey(), client_secret: clientSecret(), ...body }).toString(),
  });
  const json: any = await res.json();
  if (!res.ok || json.error) {
    throw new Error(`TikTok OAuth error: ${json.error_description || json.error || res.statusText}`);
  }
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    openId: json.open_id,
    expiresAt: new Date(Date.now() + json.expires_in * 1000),
  };
}

export function exchangeTikTokCode(code: string, redirectUri: string): Promise<TikTokTokens> {
  return tokenRequest({ code, grant_type: 'authorization_code', redirect_uri: redirectUri });
}

// TikTok access tokens are short-lived (~24h) and each refresh rotates the
// refresh_token too — the new one must replace the old one, unlike Google.
export function refreshTikTokAccessToken(refreshToken: string): Promise<TikTokTokens> {
  return tokenRequest({ refresh_token: refreshToken, grant_type: 'refresh_token' });
}

class TikTokApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

async function apiPost(path: string, accessToken: string, body: unknown): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json: any = await res.json();
  if (!res.ok || (json.error && json.error.code && json.error.code !== 'ok')) {
    throw new TikTokApiError(`TikTok API error: ${json.error?.message || res.statusText}`, json.error?.code);
  }
  return json.data;
}

export interface TikTokCreatorInfo {
  nickname: string;
  avatarUrl: string;
  privacyOptions: string[];
  maxDurationSec: number;
}

// TikTok requires querying (and showing) this before every post — the
// creator's name/avatar and which privacy levels are actually available to
// them right now. In practice privacyOptions reflects the creator's own
// account settings, not whether this app is audited — an unaudited app can
// still get PUBLIC_TO_EVERYONE back here and only find out it's not allowed
// when the actual post is rejected (see the retry in publishVideoToTikTok).
export async function fetchTikTokCreatorInfo(accessToken: string): Promise<TikTokCreatorInfo> {
  const data = await apiPost('/post/publish/creator_info/query/', accessToken, {});
  return {
    nickname: data.creator_nickname,
    avatarUrl: data.creator_avatar_url,
    privacyOptions: data.privacy_level_options || [],
    maxDurationSec: data.max_video_post_duration_sec,
  };
}

const PRIVACY_PRIORITY = ['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'FOLLOWER_OF_CREATOR', 'SELF_ONLY'];

function pickPrivacyLevel(options: string[]): string {
  for (const p of PRIVACY_PRIORITY) if (options.includes(p)) return p;
  return options[0] || 'SELF_ONLY';
}

// TikTok's Content Posting API requires declaring the upload as one or more
// fixed-size chunks up front; we only support the single-chunk path (whole
// file in one PUT), which the API itself limits to 64MB. Splitting larger
// files into multiple chunks isn't implemented yet — see README.
const MAX_SINGLE_CHUNK_BYTES = 64 * 1024 * 1024;

export type TikTokPublishResult = { status: 'published'; platformPostId: string } | { status: 'processing'; publishId: string };

async function pollTikTokStatus(publishId: string, accessToken: string, attempts: number, delayMs: number): Promise<TikTokPublishResult> {
  for (let i = 0; i < attempts; i++) {
    const data = await apiPost('/post/publish/status/fetch/', accessToken, { publish_id: publishId });
    if (data.status === 'PUBLISH_COMPLETE') {
      return { status: 'published', platformPostId: data.publicaly_available_post_id?.[0] || publishId };
    }
    if (data.status === 'FAILED') {
      throw new Error(`TikTok failed to process this video${data.fail_reason ? `: ${data.fail_reason}` : '.'}`);
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return { status: 'processing', publishId };
}

// A previous attempt may have already uploaded the video and timed out
// waiting for TikTok to finish processing it — resume polling instead of
// uploading again.
export function finishTikTokPublish(publishId: string, accessToken: string): Promise<TikTokPublishResult> {
  return pollTikTokStatus(publishId, accessToken, 5, 1500);
}

function initVideoUpload(accessToken: string, caption: string, privacyLevel: string, size: number): Promise<any> {
  return apiPost('/post/publish/video/init/', accessToken, {
    post_info: {
      title: caption.slice(0, 150),
      privacy_level: privacyLevel,
      disable_duet: false,
      disable_comment: false,
      disable_stitch: false,
    },
    source_info: {
      source: 'FILE_UPLOAD',
      video_size: size,
      chunk_size: size,
      total_chunk_count: 1,
    },
  });
}

export async function publishVideoToTikTok(accessToken: string, videoUrl: string, caption: string): Promise<TikTokPublishResult> {
  const creator = await fetchTikTokCreatorInfo(accessToken);
  let privacyLevel = pickPrivacyLevel(creator.privacyOptions);

  const source = await fetch(videoUrl);
  if (!source.ok || !source.body) throw new Error(`Couldn't fetch video from storage (${source.status}).`);
  const size = Number(source.headers.get('content-length') || 0);
  if (!size) throw new Error("Couldn't determine the video's file size.");
  if (size > MAX_SINGLE_CHUNK_BYTES) {
    throw new Error('This video is too large for TikTok right now (64MB limit) — trim it and try again.');
  }

  let init: any;
  try {
    init = await initVideoUpload(accessToken, caption, privacyLevel, size);
  } catch (err) {
    // Unaudited apps can only ever post privately, but creator_info's
    // privacy options don't reliably reflect that — retry once forced to
    // SELF_ONLY instead of failing outright. Once the app is audited,
    // TikTok won't return this error and the first attempt above succeeds.
    if (err instanceof TikTokApiError && err.code === 'unaudited_client_can_only_post_to_private_accounts' && privacyLevel !== 'SELF_ONLY') {
      privacyLevel = 'SELF_ONLY';
      init = await initVideoUpload(accessToken, caption, privacyLevel, size);
    } else {
      throw err;
    }
  }
  if (!init.publish_id || !init.upload_url) {
    throw new Error(`TikTok API error: no upload session returned (got ${JSON.stringify(init)}).`);
  }

  const uploadRes = await fetch(init.upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': 'video/mp4', 'Content-Range': `bytes 0-${size - 1}/${size}` },
    // @ts-expect-error - Node's fetch supports streaming a ReadableStream body; duplex is required for it.
    duplex: 'half',
    body: source.body,
  });
  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => '');
    throw new Error(`TikTok upload error: ${uploadRes.statusText}${text ? ` — ${text}` : ''}`);
  }

  return finishTikTokPublish(init.publish_id, accessToken);
}
