import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getWorkspaceId } from './_db.js';
import { getSession, signState, verifyState, describeError } from './_auth.js';
import { metaAuthorizeUrl, exchangeCodeForUserToken, fetchPagesWithInstagram } from './_meta.js';
import { googleAuthorizeUrl, exchangeGoogleCode, fetchYouTubeChannel } from './_google.js';
import { tiktokAuthorizeUrl, exchangeTikTokCode, fetchTikTokCreatorInfo } from './_tiktok.js';
import { linkedinAuthorizeUrl, exchangeLinkedInCode, fetchLinkedInProfile } from './_linkedin.js';
import { threadsAuthorizeUrl, exchangeThreadsCode, fetchThreadsProfile } from './_threads.js';
import { pinterestAuthorizeUrl, exchangePinterestCode, fetchPinterestBoards } from './_pinterest.js';
import { generatePkce, xAuthorizeUrl, exchangeXCode, fetchXProfile } from './_x.js';

// Consolidated (?provider=&action=) so adding more platforms doesn't cost
// another top-level file against Vercel's 12-function cap.

type Provider = 'meta' | 'google' | 'tiktok' | 'linkedin' | 'threads' | 'pinterest' | 'x';
const PROVIDERS: Provider[] = ['meta', 'google', 'tiktok', 'linkedin', 'threads', 'pinterest', 'x'];

const AUTHORIZE_URL: Record<Exclude<Provider, 'x'>, (redirectUri: string, state: string) => string> = {
  meta: metaAuthorizeUrl,
  google: googleAuthorizeUrl,
  tiktok: tiktokAuthorizeUrl,
  linkedin: linkedinAuthorizeUrl,
  threads: threadsAuthorizeUrl,
  pinterest: pinterestAuthorizeUrl,
};

function redirectUri(req: VercelRequest, provider: string): string {
  const siteUrl = process.env.PUBLIC_SITE_URL || `https://${req.headers.host}`;
  // TikTok's app dashboard rejects registering a redirect URI that contains
  // query parameters, so its callback has to be the bare path — provider
  // gets recovered from the signed `state` instead (see handler() below).
  if (provider === 'tiktok') return `${siteUrl}/api/oauth`;
  return `${siteUrl}/api/oauth?provider=${provider}&action=callback`;
}

async function oauthStart(req: VercelRequest, res: VercelResponse, provider: Provider) {
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

  // provider travels inside the signed state too — TikTok's callback has no
  // ?provider= query param to read it back from (see redirectUri() above).
  const base = { accountId: session.accountId, workspace, provider, exp: Date.now() + 10 * 60 * 1000 };

  if (provider === 'x') {
    // X mandates PKCE — the verifier has to survive the round trip to
    // X and back, and our signed state is the only thing that does that
    // (no server-side session storage for OAuth flows here).
    const { verifier, challenge } = generatePkce();
    const state = signState({ ...base, codeVerifier: verifier });
    res.redirect(302, xAuthorizeUrl(redirectUri(req, provider), state, challenge));
    return;
  }

  const state = signState(base);
  res.redirect(302, AUTHORIZE_URL[provider](redirectUri(req, provider), state));
}

interface OAuthState {
  accountId: number;
  workspace: string;
  provider: string;
  exp: number;
  codeVerifier?: string;
}

function parseState(req: VercelRequest): OAuthState | null {
  const session = getSession(req);
  const stateToken = String(req.query.state || '');
  const state = verifyState<OAuthState>(stateToken);
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

async function linkedinCallback(req: VercelRequest, res: VercelResponse) {
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
    const tokens = await exchangeLinkedInCode(code, redirectUri(req, 'linkedin'));
    const profile = await fetchLinkedInProfile(tokens.accessToken);

    await sql`
      INSERT INTO connections (workspace_id, platform, label, status, account, access_token, refresh_token, platform_account_id, token_expires_at, sort_order)
      VALUES (${workspaceId}, 'linkedin', ${profile.name}, 'connected', ${profile.name}, ${tokens.accessToken}, ${tokens.refreshToken}, ${profile.sub}, ${tokens.expiresAt.toISOString()}, 4000)
      ON CONFLICT (workspace_id, platform_account_id) WHERE platform_account_id IS NOT NULL DO UPDATE SET
        status = 'connected', label = EXCLUDED.label, account = EXCLUDED.account, access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token, token_expires_at = EXCLUDED.token_expires_at`;

    res.redirect(302, `/connections?connected=LinkedIn`);
  } catch (err) {
    console.error('linkedin oauth callback error:', err);
    res.redirect(302, `/connections?oauth_error=${encodeURIComponent(describeError(err))}`);
  }
}

async function threadsCallback(req: VercelRequest, res: VercelResponse) {
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
    const tokens = await exchangeThreadsCode(code, redirectUri(req, 'threads'));
    const profile = await fetchThreadsProfile(tokens.accessToken);

    await sql`
      INSERT INTO connections (workspace_id, platform, label, status, account, access_token, platform_account_id, token_expires_at, sort_order)
      VALUES (${workspaceId}, 'threads', ${'@' + profile.username}, 'connected', ${'@' + profile.username}, ${tokens.accessToken}, ${tokens.userId}, ${tokens.expiresAt.toISOString()}, 5000)
      ON CONFLICT (workspace_id, platform_account_id) WHERE platform_account_id IS NOT NULL DO UPDATE SET
        status = 'connected', label = EXCLUDED.label, account = EXCLUDED.account, access_token = EXCLUDED.access_token,
        token_expires_at = EXCLUDED.token_expires_at`;

    res.redirect(302, `/connections?connected=Threads`);
  } catch (err) {
    console.error('threads oauth callback error:', err);
    res.redirect(302, `/connections?oauth_error=${encodeURIComponent(describeError(err))}`);
  }
}

async function pinterestCallback(req: VercelRequest, res: VercelResponse) {
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
    const tokens = await exchangePinterestCode(code, redirectUri(req, 'pinterest'));
    const boards = await fetchPinterestBoards(tokens.accessToken);

    if (boards.length === 0) {
      res.redirect(302, '/connections?oauth_error=no_boards');
      return;
    }

    // A Pin always targets one specific board, so — same reasoning as
    // Facebook's multiple Pages — every board the user has becomes its own
    // connection row (all sharing the same account-level access token).
    for (const [i, board] of boards.entries()) {
      await sql`
        INSERT INTO connections (workspace_id, platform, label, status, account, access_token, refresh_token, platform_account_id, token_expires_at, sort_order)
        VALUES (${workspaceId}, 'pinterest', ${board.name}, 'connected', ${board.name}, ${tokens.accessToken}, ${tokens.refreshToken}, ${board.id}, ${tokens.expiresAt.toISOString()}, ${6000 + i})
        ON CONFLICT (workspace_id, platform_account_id) WHERE platform_account_id IS NOT NULL DO UPDATE SET
          status = 'connected', label = EXCLUDED.label, account = EXCLUDED.account, access_token = EXCLUDED.access_token,
          refresh_token = EXCLUDED.refresh_token, token_expires_at = EXCLUDED.token_expires_at`;
    }

    res.redirect(302, `/connections?connected=${boards.length}%20Pinterest%20board${boards.length === 1 ? '' : 's'}`);
  } catch (err) {
    console.error('pinterest oauth callback error:', err);
    res.redirect(302, `/connections?oauth_error=${encodeURIComponent(describeError(err))}`);
  }
}

async function xCallback(req: VercelRequest, res: VercelResponse) {
  const state = parseState(req);
  if (!state || !state.codeVerifier) {
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
    const tokens = await exchangeXCode(code, redirectUri(req, 'x'), state.codeVerifier);
    const profile = await fetchXProfile(tokens.accessToken);

    await sql`
      INSERT INTO connections (workspace_id, platform, label, status, account, access_token, refresh_token, platform_account_id, token_expires_at, sort_order)
      VALUES (${workspaceId}, 'x', ${'@' + profile.username}, 'connected', ${'@' + profile.username}, ${tokens.accessToken}, ${tokens.refreshToken}, ${profile.id}, ${tokens.expiresAt.toISOString()}, 7000)
      ON CONFLICT (workspace_id, platform_account_id) WHERE platform_account_id IS NOT NULL DO UPDATE SET
        status = 'connected', label = EXCLUDED.label, account = EXCLUDED.account, access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token, token_expires_at = EXCLUDED.token_expires_at`;

    res.redirect(302, `/connections?connected=X`);
  } catch (err) {
    console.error('x oauth callback error:', err);
    res.redirect(302, `/connections?oauth_error=${encodeURIComponent(describeError(err))}`);
  }
}

const CALLBACKS: Record<Provider, (req: VercelRequest, res: VercelResponse) => Promise<void>> = {
  meta: metaCallback,
  google: googleCallback,
  tiktok: tiktokCallback,
  linkedin: linkedinCallback,
  threads: threadsCallback,
  pinterest: pinterestCallback,
  x: xCallback,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const provider = String(req.query.provider || '');
  const action = String(req.query.action || '');

  try {
    if (action === 'start') {
      if (!PROVIDERS.includes(provider as Provider)) {
        res.status(400).json({ error: 'Unknown OAuth provider.' });
        return;
      }
      await oauthStart(req, res, provider as Provider);
      return;
    }

    // A bare callback (no ?provider=/&action=callback — TikTok's redirect
    // URI can't carry query params) still has ?code=&state=; recover the
    // provider from state instead of the URL in that case.
    if (action === 'callback' || (req.query.code && req.query.state)) {
      const resolvedProvider = (provider || parseState(req)?.provider) as Provider | undefined;
      if (resolvedProvider && PROVIDERS.includes(resolvedProvider)) {
        await CALLBACKS[resolvedProvider](req, res);
        return;
      }
      res.redirect(302, '/connections?oauth_error=invalid_state');
      return;
    }

    res.status(400).json({ error: 'Unknown OAuth action.' });
  } catch (err) {
    // A missing env var (e.g. a provider's client secret not set yet) or
    // any other unexpected throw during oauthStart() would otherwise crash
    // this function outright (Vercel's raw 500 page) instead of showing a
    // readable message — every callback already catches its own errors,
    // but oauthStart() itself didn't have a safety net until now.
    console.error('oauth handler error:', err);
    if (!res.headersSent) {
      res.redirect(302, `/connections?oauth_error=${encodeURIComponent(describeError(err))}`);
    }
  }
}
