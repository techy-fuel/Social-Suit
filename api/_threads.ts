// Threads API (Meta) — reuses the same Meta App ID/Secret as Facebook/
// Instagram (api/_meta.ts); Threads is just another "use case" added to
// that same app in the Meta App Dashboard, not a separate app.
import { META_APP_ID } from './_meta.js';

const GRAPH_BASE = 'https://graph.threads.net/v1.0';

function appSecret(): string {
  const s = process.env.META_APP_SECRET;
  if (!s) throw new Error('Set META_APP_SECRET as an environment variable (Meta App -> Settings -> Basic -> App Secret).');
  return s;
}

export const THREADS_SCOPES = 'threads_basic,threads_content_publish';

export function threadsAuthorizeUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: META_APP_ID,
    redirect_uri: redirectUri,
    scope: THREADS_SCOPES,
    response_type: 'code',
    state,
  });
  return `https://threads.net/oauth/authorize?${params.toString()}`;
}

function describeThreadsError(body: any, fallback: string): string {
  const e = body?.error;
  if (!e) return `Threads API error: ${fallback}`;
  const parts = [e.message || fallback];
  if (e.error_subcode) parts.push(`subcode ${e.error_subcode}`);
  return `Threads API error: ${parts.join(' — ')}`;
}

export interface ThreadsTokens {
  accessToken: string;
  userId: string;
  expiresAt: Date;
}

// Threads has no separate refresh_token — the long-lived access token
// itself gets extended in place via th_refresh_token, so there's only ever
// one token value to track (unlike YouTube/TikTok/LinkedIn's access+refresh
// pair).
export async function exchangeThreadsCode(code: string, redirectUri: string): Promise<ThreadsTokens> {
  const shortRes = await fetch('https://graph.threads.net/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: META_APP_ID,
      client_secret: appSecret(),
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    }).toString(),
  });
  const shortBody: any = await shortRes.json();
  if (!shortRes.ok || shortBody.error) throw new Error(describeThreadsError(shortBody, shortRes.statusText));

  const longParams = new URLSearchParams({
    grant_type: 'th_exchange_token',
    client_secret: appSecret(),
    access_token: shortBody.access_token,
  });
  const longRes = await fetch(`https://graph.threads.net/access_token?${longParams.toString()}`);
  const longBody: any = await longRes.json();
  if (!longRes.ok || longBody.error) throw new Error(describeThreadsError(longBody, longRes.statusText));

  return {
    accessToken: longBody.access_token,
    userId: String(shortBody.user_id),
    expiresAt: new Date(Date.now() + longBody.expires_in * 1000),
  };
}

export async function refreshThreadsAccessToken(currentAccessToken: string): Promise<{ accessToken: string; expiresAt: Date }> {
  const params = new URLSearchParams({ grant_type: 'th_refresh_token', access_token: currentAccessToken });
  const res = await fetch(`https://graph.threads.net/refresh_access_token?${params.toString()}`);
  const body: any = await res.json();
  if (!res.ok || body.error) throw new Error(describeThreadsError(body, res.statusText));
  return { accessToken: body.access_token, expiresAt: new Date(Date.now() + body.expires_in * 1000) };
}

export async function fetchThreadsProfile(accessToken: string): Promise<{ id: string; username: string }> {
  const res = await fetch(`${GRAPH_BASE}/me?fields=id,username&access_token=${encodeURIComponent(accessToken)}`);
  const body: any = await res.json();
  if (!res.ok || body.error) throw new Error(describeThreadsError(body, res.statusText));
  return { id: body.id, username: body.username };
}

export type ThreadsPublishResult = { status: 'published'; platformPostId: string } | { status: 'processing'; containerId: string };

async function pollThreadsContainer(containerId: string, accessToken: string, attempts: number, delayMs: number): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(`${GRAPH_BASE}/${containerId}?fields=status,error_message&access_token=${encodeURIComponent(accessToken)}`);
    const body: any = await res.json();
    if (!res.ok || body.error) throw new Error(describeThreadsError(body, res.statusText));
    if (body.status === 'FINISHED') return true;
    if (body.status === 'ERROR') throw new Error(`Threads failed to process this media${body.error_message ? `: ${body.error_message}` : '.'}`);
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}

export async function finishThreadsPublish(containerId: string, threadsUserId: string, accessToken: string): Promise<ThreadsPublishResult> {
  const ready = await pollThreadsContainer(containerId, accessToken, 5, 1500);
  if (!ready) return { status: 'processing', containerId };
  const res = await fetch(`${GRAPH_BASE}/${threadsUserId}/threads_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ creation_id: containerId, access_token: accessToken }).toString(),
  });
  const body: any = await res.json();
  if (!res.ok || body.error) throw new Error(describeThreadsError(body, res.statusText));
  return { status: 'published', platformPostId: body.id };
}

export async function publishToThreads(
  accessToken: string,
  threadsUserId: string,
  caption: string,
  mediaUrl: string | null,
  mediaType: 'image' | 'video' | null
): Promise<ThreadsPublishResult> {
  const params: Record<string, string> = { access_token: accessToken, text: caption };
  if (mediaUrl && mediaType === 'video') {
    params.media_type = 'VIDEO';
    params.video_url = mediaUrl;
  } else if (mediaUrl && mediaType === 'image') {
    params.media_type = 'IMAGE';
    params.image_url = mediaUrl;
  } else {
    params.media_type = 'TEXT';
  }

  const res = await fetch(`${GRAPH_BASE}/${threadsUserId}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  });
  const body: any = await res.json();
  if (!res.ok || body.error) throw new Error(describeThreadsError(body, res.statusText));
  if (!body.id) throw new Error(`Threads API error: no container id returned (got ${JSON.stringify(body)}).`);

  return finishThreadsPublish(body.id, threadsUserId, accessToken);
}
