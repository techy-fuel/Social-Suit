import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getWorkspaceId } from './_db.js';
import { getSession, signState, verifyState, describeError } from './_auth.js';
import { metaAuthorizeUrl, exchangeCodeForUserToken, fetchPagesWithInstagram } from './_meta.js';
import { googleAuthorizeUrl, exchangeGoogleCode, fetchYouTubeChannel } from './_google.js';
import { tiktokAuthorizeUrl, exchangeTikTokCode, fetchTikTokCreatorInfo } from './_tiktok.js';

// Consolidated (?provider=&action=) so adding more platforms doesn't cost
// another top-level file against Vercel's 12-function cap.

function redirectUri(req: VercelRequest, provider: string): string {
  const siteUrl = process.env.PUBLIC_SITE_URL || `https://${req.headers.host}`;
  return `${siteUrl}/api/oauth?provider=${provider}&action=callback`;
}

async function oauthStart(req: VercelRequest, res: VercelResponse, provider: 'meta' | 'google' | 'tiktok') {
  const session = getSession(req);
  if (!session) {
    res.redirect(302, '/');
    return;
  }
  const workspace = String(req.query.workspace || '');
  if (!workspace) {
    res.status(400).json({ error: 'workspace is required' });
    return;
  }
  // Confirms the workspace actually belongs to this account before we ever
  // redirect away — an unknown/foreign key here should fail loudly, not
  // silently kick off an OAuth flow for the wrong tenant.
  await getWorkspaceId(workspace, session.accountId);

  const state = signState({ accountId: session.accountId, workspace, exp: Date.now() + 10 * 60 * 1000 });
  const url = provider === 'meta'
    ? metaAuthorizeUrl(redirectUri(req, provider), state)
    : provider === 'google'
    ? googleAuthorizeUrl(redirectUri(req, provider), state)
    : tiktokAuthorizeUrl(redirectUri(req, provider), state);
  res.redirect(302, url);
}

function parseState(req: VercelRequest): { accountId: number; workspace: string; exp: number } | null {
  const session = getSession(req);
  const stateToken = String(req.query.state || '');
  const state = verifyState<{ accountId: number; workspace: string; exp: number }>(stateToken);
  if (!session || !state || state.exp < Date.now() || state.accountId !== session.accountId) return null;
  return state;
}

async function metaCallback(req: VercelRequest, res: VercelResponse) {
  const state = parseState(req);
  if (!state) {
    res.redirect(302, '/connections?oauth_error=invalid_state');
    return;
  }
  if (req.query.error) {
    res.redirect(302, '/connections?oauth_error=denied');
    return;
  }
  const code = String(req.query.code || '');
  if (!code) {
    res.redirect(302, '/connections?oauth_error=missing_code');
    return;
  }

  try {
    const workspaceId = await getWorkspaceId(state.workspace, state.accountId);
    const userToken = await exchangeCodeForUserToken(code, redirectUri(req, 'meta'));
    const pages = await fetchPagesWithInstagram(userToken);

    if (pages.length === 0) {
      res.redirect(302, '/connections?oauth_error=no_pages');
      return;
    }

    // Connect every Page the user granted access to (not just the first) —
    // agencies commonly manage several client Pages from one Facebook
    // login. Each becomes its own connection row, upserted by
    // platform_account_id so reconnecting refreshes tokens instead of
    // duplicating rows.
    let igCount = 0;
    for (const [i, page] of pages.entries()) {
      const sortBase = 1000 + i * 2; // keeps real connections after the seeded placeholder catalog rows
      await sql`
        INSERT INTO connections (workspace_id, platform, label, status, account, access_token, platform_account_id, sort_order)
        VALUES (${workspaceId}, 'facebook', ${page.name}, 'connected', ${page.name}, ${page.access_token}, ${page.id}, ${sortBase})
        ON CONFLICT (workspace_id, platform_account_id) WHERE platform_account_id IS NOT NULL DO UPDATE SET
          status = 'connected', label = EXCLUDED.label, account = EXCLUDED.account, access_token = EXCLUDED.access_token`;

      if (page.instagram) {
        igCount++;
        await sql`
          INSERT INTO connections (workspace_id, platform, label, status, account, access_token, platform_account_id, sort_order)
          VALUES (${workspaceId}, 'instagram', ${'@' + page.instagram.username}, 'connected', ${'@' + page.instagram.username}, ${page.access_token}, ${page.instagram.id}, ${sortBase + 1})
          ON CONFLICT (workspace_id, platform_account_id) WHERE platform_account_id IS NOT NULL DO UPDATE SET
            status = 'connected', label = EXCLUDED.label, account = EXCLUDED.account, access_token = EXCLUDED.access_token`;
      }
    }

    res.redirect(302, `/connections?connected=${pages.length}%20Page${pages.length === 1 ? '' : 's'}${igCount ? `,${igCount}%20Instagram` : ''}`);
  } catch (err) {
    console.error('meta oauth callback error:', err);
    res.redirect(302, `/connections?oauth_error=${encodeURIComponent(describeError(err))}`);
  }
}

async function googleCallback(req: VercelRequest, res: VercelResponse) {
  const state = parseState(req);
  if (!state) {
    res.redirect(302, '/connections?oauth_error=invalid_state');
    return;
  }
  if (req.query.error) {
    res.redirect(302, '/connections?oauth_error=denied');
    return;
  }
  const code = String(req.query.code || '');
  if (!code) {
    res.redirect(302, '/connections?oauth_error=missing_code');
    return;
  }

  try {
    const workspaceId = await getWorkspaceId(state.workspace, state.accountId);
    const tokens = await exchangeGoogleCode(code, redirectUri(req, 'google'));
    if (!tokens.refreshToken) {
      // Happens if the user already granted this app access before and
      // Google doesn't consider it a fresh consent — prompt=consent on the
      // authorize URL is supposed to prevent this, but if it still happens
      // there's no way to refresh the token later, so treat it as a failure
      // rather than silently connecting a channel that'll stop working in
      // an hour.
      res.redirect(302, '/connections?oauth_error=no_refresh_token');
      return;
    }
    const channel = await fetchYouTubeChannel(tokens.accessToken);
    if (!channel) {
      res.redirect(302, '/connections?oauth_error=no_channel');
      return;
    }

    await sql`
      INSERT INTO connections (workspace_id, platform, label, status, account, access_token, refresh_token, platform_account_id, token_expires_at, sort_order)
      VALUES (${workspaceId}, 'youtube', ${channel.title}, 'connected', ${channel.title}, ${tokens.accessToken}, ${tokens.refreshToken}, ${channel.id}, ${tokens.expiresAt.toISOString()}, 2000)
      ON CONFLICT (workspace_id, platform_account_id) WHERE platform_account_id IS NOT NULL DO UPDATE SET
        status = 'connected', label = EXCLUDED.label, account = EXCLUDED.account, access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token, token_expires_at = EXCLUDED.token_expires_at`;

    res.redirect(302, `/connections?connected=YouTube`);
  } catch (err) {
    console.error('google oauth callback error:', err);
    res.redirect(302, `/connections?oauth_error=${encodeURIComponent(describeError(err))}`);
  }
}

async function tiktokCallback(req: VercelRequest, res: VercelResponse) {
  const state = parseState(req);
  if (!state) {
    res.redirect(302, '/connections?oauth_error=invalid_state');
    return;
  }
  if (req.query.error) {
    res.redirect(302, '/connections?oauth_error=denied');
    return;
  }
  const code = String(req.query.code || '');
  if (!code) {
    res.redirect(302, '/connections?oauth_error=missing_code');
    return;
  }

  try {
    const workspaceId = await getWorkspaceId(state.workspace, state.accountId);
    const tokens = await exchangeTikTokCode(code, redirectUri(req, 'tiktok'));
    const creator = await fetchTikTokCreatorInfo(tokens.accessToken);

    await sql`
      INSERT INTO connections (workspace_id, platform, label, status, account, access_token, refresh_token, platform_account_id, token_expires_at, sort_order)
      VALUES (${workspaceId}, 'tiktok', ${creator.nickname}, 'connected', ${creator.nickname}, ${tokens.accessToken}, ${tokens.refreshToken}, ${tokens.openId}, ${tokens.expiresAt.toISOString()}, 3000)
      ON CONFLICT (workspace_id, platform_account_id) WHERE platform_account_id IS NOT NULL DO UPDATE SET
        status = 'connected', label = EXCLUDED.label, account = EXCLUDED.account, access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token, token_expires_at = EXCLUDED.token_expires_at`;

    res.redirect(302, `/connections?connected=TikTok`);
  } catch (err) {
    console.error('tiktok oauth callback error:', err);
    res.redirect(302, `/connections?oauth_error=${encodeURIComponent(describeError(err))}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const provider = String(req.query.provider || '');
  const action = String(req.query.action || '');

  if (provider !== 'meta' && provider !== 'google' && provider !== 'tiktok') {
    res.status(400).json({ error: 'Unknown OAuth provider.' });
    return;
  }

  if (action === 'start') return oauthStart(req, res, provider);
  if (action === 'callback') {
    if (provider === 'meta') return metaCallback(req, res);
    if (provider === 'google') return googleCallback(req, res);
    return tiktokCallback(req, res);
  }
  res.status(400).json({ error: 'Unknown OAuth action.' });
}
