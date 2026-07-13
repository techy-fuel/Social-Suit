import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getWorkspaceId, badRequest } from './_db';
import { withAuth, Session } from './_auth';

async function handler(req: VercelRequest, res: VercelResponse, session: Session) {
  if (req.method === 'POST') {
    const { workspace, hashtag, platform, duration } = req.body || {};
    if (!workspace || !hashtag || !platform || !duration) {
      return badRequest(res, 'workspace, hashtag, platform, duration are required');
    }
    const workspaceId = await getWorkspaceId(workspace, session.accountId);
    const started = new Date().toISOString().slice(0, 10);
    const rows = await sql`
      INSERT INTO tracker_sessions (workspace_id, hashtag, platform, status, started, mentions)
      VALUES (${workspaceId}, ${hashtag}, ${platform}, 'active', ${started}, 0)
      RETURNING id, hashtag, platform, status, started, mentions`;
    return res.status(201).json(rows[0]);
  }

  const workspace = String(req.query.workspace || '');
  if (!workspace) return badRequest(res, 'workspace is required');
  const workspaceId = await getWorkspaceId(workspace, session.accountId);
  const rows = await sql`
    SELECT id, hashtag, platform, status, started, mentions FROM tracker_sessions
    WHERE workspace_id = ${workspaceId} ORDER BY started DESC`;
  res.status(200).json(rows);
}

export default withAuth(handler);
