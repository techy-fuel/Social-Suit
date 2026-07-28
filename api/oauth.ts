import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getWorkspaceId } from './_db.js';
import { getSession, signState, verifyState, describeError } from './_auth.js';
import { metaAuthorizeUrl, exchangeCodeForUserToken, fetchPagesWithInstagram } from './_meta.js';

// Consolidated like auth.ts (?provider=&action=) so adding TikTok/YouTube
// later doesn't cost another top-level file against Vercel's 12-function cap.

function redirectUri(req: VercelRequest): string {
  const siteUrl = process.env.PUBLIC_SITE_URL || `https://${req.headers.host}`;
  return `${siteUrl}/api/oauth?provider=meta&action=callback`;
}

async function metaStart(req: VercelRequest, res: VercelResponse) {
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
  // redirect to Meta — an unknown/foreign key here should fail loudly, not
  // silently kick off an OAuth flow for the wrong tenant.
  await getWorkspaceId(workspace, session.accountId);

  const state = signState({ accountId: session.accountId, workspace, exp: Date.now() + 10 * 60 * 1000 });
  res.redirect(302, metaAuthorizeUrl(redirectUri(req), state));
}

async function metaCallback(req: VercelRequest, res: VercelResponse) {
  const session = getSession(req);
  const stateToken = String(req.query.state || '');
  const state = verifyState<{ accountId: number; workspace: string; exp: number }>(stateToken);

  if (!session || !state || state.exp < Date.now() || state.accountId !== session.accountId) {
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
    const workspaceId = await getWorkspaceId(state.workspace, session.accountId);
    const userToken = await exchangeCodeForUserToken(code, redirectUri(req));
    const pages = await fetchPagesWithInstagram(userToken);

    if (pages.length === 0) {
      res.redirect(302, '/connections?oauth_error=no_pages');
      return;
    }

    // Simplification for v1: connect the first Page returned. Most agency
    // workspaces manage one client Page at a time; multi-Page picker is a
    // follow-up if it turns out to be needed.
    const page = pages[0];
    await sql`
      UPDATE connections SET status = 'connected', account = ${page.name}, access_token = ${page.access_token}, platform_account_id = ${page.id}
      WHERE workspace_id = ${workspaceId} AND platform = 'facebook' AND label = 'Facebook'`;

    if (page.instagram) {
      await sql`
        UPDATE connections SET status = 'connected', account = ${'@' + page.instagram.username}, access_token = ${page.access_token}, platform_account_id = ${page.instagram.id}
        WHERE workspace_id = ${workspaceId} AND platform = 'instagram' AND label = 'Instagram'`;
    }

    res.redirect(302, `/connections?connected=facebook${page.instagram ? ',instagram' : ''}`);
  } catch (err) {
    console.error('meta oauth callback error:', err);
    res.redirect(302, `/connections?oauth_error=${encodeURIComponent(describeError(err))}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const provider = String(req.query.provider || '');
  const action = String(req.query.action || '');

  if (provider !== 'meta') {
    res.status(400).json({ error: 'Unknown OAuth provider.' });
    return;
  }

  if (action === 'start') return metaStart(req, res);
  if (action === 'callback') return metaCallback(req, res);
  res.status(400).json({ error: 'Unknown OAuth action.' });
}
