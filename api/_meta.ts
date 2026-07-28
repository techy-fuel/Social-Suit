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
  'pages_manage_posts',
  'instagram_basic',
  'instagram_content_publish',
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

async function graphGet(path: string, params: Record<string, string>): Promise<any> {
  const url = `${GRAPH_BASE}${path}?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok || body.error) {
    throw new Error(`Meta API error: ${body.error?.message || res.statusText}`);
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
