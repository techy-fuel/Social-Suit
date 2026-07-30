// Meta Graph API (Facebook Pages + Instagram Business) OAuth helpers.
const GRAPH_VERSION = 'v21.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

// App ID isn't secret (it's meant to appear in redirect URLs/client code);
// only the App Secret is.
export const META_APP_ID = '2021661031794455';

function appSecret(): string {
  const s = process.env.META_APP_SECRET;
  if (!s) throw new Error('Set META_APP_SECRET as an environment variable (Meta App -> Settings -> Basic -> App Secret).');
  return s;
}

export const META_SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_messaging',
  'pages_manage_engagement',
  'pages_manage_posts',
  'instagram_basic',
  'instagram_content_publish',
  'instagram_manage_comments',
  'instagram_manage_messages',
  'business_management',
].join(',');

export function metaAuthorizeUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: META_APP_ID,
    redirect_uri: redirectUri,
    state,
    scope: META_SCOPES,
    response_type: 'code',
  });
  return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
}

function describeGraphError(body: any, fallback: string): string {
  const e = body?.error;
  if (!e) return `Meta API error: ${fallback}`;
  const parts = [e.message || fallback];
  if (e.error_subcode) parts.push(`subcode ${e.error_subcode}`);
  if (e.type) parts.push(e.type);
  if (e.fbtrace_id) parts.push(`trace ${e.fbtrace_id}`);
  return `Meta API error: ${parts.join(' — ')}`;
}

async function graphGet(path: string, params: Record<string, string>): Promise<any> {
  const url = `${GRAPH_BASE}${path}?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok || body.error) {
    throw new Error(describeGraphError(body, res.statusText));
  }
  return body;
}

async function graphPost(path: string, params: Record<string, string>): Promise<any> {
  const res = await fetch(`${GRAPH_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  });
  const body = await res.json();
  if (!res.ok || body.error) {
    throw new Error(describeGraphError(body, res.statusText));
  }
  return body;
}

export async function exchangeCodeForUserToken(code: string, redirectUri: string): Promise<string> {
  const short = await graphGet('/oauth/access_token', {
    client_id: META_APP_ID,
    client_secret: appSecret(),
    redirect_uri: redirectUri,
    code,
  });
  const long = await graphGet('/oauth/access_token', {
    grant_type: 'fb_exchange_token',
    client_id: META_APP_ID,
    client_secret: appSecret(),
    fb_exchange_token: short.access_token,
  });
  return long.access_token as string;
}

export interface MetaPage {
  id: string;
  name: string;
  access_token: string;
  instagram?: { id: string; username: string } | null;
}

export async function fetchPagesWithInstagram(userAccessToken: string): Promise<MetaPage[]> {
  const { data: pages } = await graphGet('/me/accounts', { access_token: userAccessToken });
  const results: MetaPage[] = [];
  for (const page of pages || []) {
    let instagram: MetaPage['instagram'] = null;
    try {
      const details = await graphGet(`/${page.id}`, {
        fields: 'instagram_business_account{id,username}',
        access_token: page.access_token,
      });
      if (details.instagram_business_account) {
        instagram = { id: details.instagram_business_account.id, username: details.instagram_business_account.username };
      }
    } catch {
      // No linked Instagram account, or insufficient permission — fine, Facebook-only connection still works.
    }
    results.push({ id: page.id, name: page.name, access_token: page.access_token, instagram });
  }
  return results;
}

export async function publishPhotoToPage(pageId: string, pageAccessToken: string, imageUrl: string, caption: string): Promise<string> {
  const result = await graphPost(`/${pageId}/photos`, { url: imageUrl, caption, access_token: pageAccessToken });
  return result.post_id || result.id;
}

// Instagram publishing is a two-step process: create a media container from
// the image, then publish that container. Photo containers are usually
// ready immediately, but not always — a brief poll before publishing avoids
// a race where media_publish is called before Instagram has finished
// fetching the image (which surfaces as a vague "Media ID is not available"
// error rather than anything actionable).
export async function publishPhotoToInstagram(igUserId: string, pageAccessToken: string, imageUrl: string, caption: string): Promise<string> {
  const container = await graphPost(`/${igUserId}/media`, { image_url: imageUrl, caption, access_token: pageAccessToken });
  if (!container.id) {
    throw new Error(`Meta API error: no container id returned when creating the Instagram media (got ${JSON.stringify(container)}).`);
  }
  await pollInstagramContainer(container.id, pageAccessToken, 4, 1000);
  const published = await graphPost(`/${igUserId}/media_publish`, { creation_id: container.id, access_token: pageAccessToken });
  return published.id;
}

// Facebook processes Page video asynchronously after this call returns, but
// the API response itself comes back quickly — no polling needed here
// (unlike Instagram below).
export async function publishVideoToPage(pageId: string, pageAccessToken: string, videoUrl: string, caption: string): Promise<string> {
  const result = await graphPost(`/${pageId}/videos`, { file_url: videoUrl, description: caption, access_token: pageAccessToken });
  return result.id;
}

export type PublishResult = { status: 'published'; platformPostId: string } | { status: 'processing'; containerId: string };

async function pollInstagramContainer(containerId: string, pageAccessToken: string, attempts: number, delayMs: number): Promise<string | null> {
  for (let i = 0; i < attempts; i++) {
    const { status_code } = await graphGet(`/${containerId}`, { fields: 'status_code', access_token: pageAccessToken });
    if (status_code === 'FINISHED') return 'FINISHED';
    if (status_code === 'ERROR') throw new Error('Instagram failed to process this media.');
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return null;
}

// Instagram requires the video to finish processing (server-side, can take
// well beyond a single request's time budget) before it can be published,
// unlike photos. Polls for a bounded window; if it's not ready yet, returns
// the container id so the caller can retry finishInstagramVideo() later
// instead of re-uploading.
export async function publishVideoToInstagram(igUserId: string, pageAccessToken: string, videoUrl: string, caption: string): Promise<PublishResult> {
  const container = await graphPost(`/${igUserId}/media`, { video_url: videoUrl, caption, media_type: 'REELS', access_token: pageAccessToken });
  return finishInstagramVideo(container.id, igUserId, pageAccessToken);
}

export async function finishInstagramVideo(containerId: string, igUserId: string, pageAccessToken: string): Promise<PublishResult> {
  const ready = await pollInstagramContainer(containerId, pageAccessToken, 5, 1500);
  if (!ready) return { status: 'processing', containerId };
  const published = await graphPost(`/${igUserId}/media_publish`, { creation_id: containerId, access_token: pageAccessToken });
  return { status: 'published', platformPostId: published.id };
}

export async function sendMessengerReply(pageId: string, pageAccessToken: string, recipientPsid: string, text: string): Promise<void> {
  await graphPost(`/${pageId}/messages`, {
    recipient: JSON.stringify({ id: recipientPsid }),
    message: JSON.stringify({ text }),
    access_token: pageAccessToken,
  });
}

export async function sendInstagramDmReply(igUserId: string, pageAccessToken: string, recipientIgsid: string, text: string): Promise<void> {
  await graphPost(`/${igUserId}/messages`, {
    recipient: JSON.stringify({ id: recipientIgsid }),
    message: JSON.stringify({ text }),
    access_token: pageAccessToken,
  });
}

export async function replyToFacebookComment(commentId: string, pageAccessToken: string, text: string): Promise<void> {
  await graphPost(`/${commentId}/comments`, { message: text, access_token: pageAccessToken });
}

export async function replyToInstagramComment(commentId: string, pageAccessToken: string, text: string): Promise<void> {
  await graphPost(`/${commentId}/replies`, { message: text, access_token: pageAccessToken });
}

// Works for Page photos and videos alike — the Graph API deletes any object
// node the same way, by id.
export async function deleteFacebookPost(postId: string, pageAccessToken: string): Promise<void> {
  const res = await fetch(`${GRAPH_BASE}/${postId}?access_token=${encodeURIComponent(pageAccessToken)}`, { method: 'DELETE' });
  const body = await res.json();
  if (!res.ok || body.error) {
    throw new Error(describeGraphError(body, res.statusText));
  }
}
