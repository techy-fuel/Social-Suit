// Pinterest API v5 OAuth + Pins.
const AUTH_URL = 'https://www.pinterest.com/oauth/';
const TOKEN_URL = 'https://api.pinterest.com/v5/oauth/token';
const API_BASE = 'https://api.pinterest.com/v5';

function clientId(): string {
  const v = process.env.PINTEREST_CLIENT_ID;
  if (!v) throw new Error('Set PINTEREST_CLIENT_ID as an environment variable (Pinterest Developers -> your app).');
  return v;
}

function clientSecret(): string {
  const v = process.env.PINTEREST_CLIENT_SECRET;
  if (!v) throw new Error('Set PINTEREST_CLIENT_SECRET as an environment variable (Pinterest Developers -> your app).');
  return v;
}

function basicAuthHeader(): string {
  return `Basic ${Buffer.from(`${clientId()}:${clientSecret()}`).toString('base64')}`;
}

export const PINTEREST_SCOPES = 'boards:read,pins:write,pins:read,user_accounts:read';

export function pinterestAuthorizeUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId(),
    redirect_uri: redirectUri,
    scope: PINTEREST_SCOPES,
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export interface PinterestTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

async function tokenRequest(body: Record<string, string>): Promise<PinterestTokens> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { Authorization: basicAuthHeader(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
  });
  const json: any = await res.json();
  if (!res.ok) throw new Error(`Pinterest OAuth error: ${json.message || res.statusText}`);
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: new Date(Date.now() + json.expires_in * 1000),
  };
}

export function exchangePinterestCode(code: string, redirectUri: string): Promise<PinterestTokens> {
  return tokenRequest({ grant_type: 'authorization_code', code, redirect_uri: redirectUri });
}

// Trial-access apps get a rotating refresh_token like TikTok — always
// persist whatever comes back rather than assuming the old one still works.
export function refreshPinterestAccessToken(refreshToken: string): Promise<PinterestTokens> {
  return tokenRequest({ grant_type: 'refresh_token', refresh_token: refreshToken });
}

async function apiRequest(method: string, path: string, accessToken: string, body?: unknown): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json: any = await res.json();
  if (!res.ok) throw new Error(`Pinterest API error: ${json.message || res.statusText}`);
  return json;
}

export interface PinterestBoard {
  id: string;
  name: string;
}

export async function fetchPinterestBoards(accessToken: string): Promise<PinterestBoard[]> {
  const boards: PinterestBoard[] = [];
  let bookmark: string | undefined;
  do {
    const path = `/boards${bookmark ? `?bookmark=${encodeURIComponent(bookmark)}` : ''}`;
    const page = await apiRequest('GET', path, accessToken);
    for (const b of page.items || []) boards.push({ id: b.id, name: b.name });
    bookmark = page.bookmark || undefined;
  } while (bookmark);
  return boards;
}

// Video Pins aren't supported: Pinterest requires a separate cover_image_url
// for them (a still-frame thumbnail), and this app has no video-thumbnail
// generation anywhere — sending the video URL itself as the cover image
// fails outright (Pinterest expects an actual image, not a video). Only
// text/image Pins are implemented; see README.
export async function publishToPinterest(accessToken: string, boardId: string, caption: string, mediaUrl: string | null): Promise<string> {
  const title = caption.split('\n')[0].slice(0, 100);
  const result = await apiRequest('POST', '/pins', accessToken, {
    board_id: boardId,
    title: title || undefined,
    description: caption,
    media_source: { source_type: 'image_url', url: mediaUrl },
  });
  return result.id;
}
