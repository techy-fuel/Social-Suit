import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getWorkspaceId, badRequest } from './_db.js';
import { withAuth, Session } from './_auth.js';

async function handler(req: VercelRequest, res: VercelResponse, session: Session) {
  if (req.method === 'DELETE') {
    const id = req.query.id;
    if (!id) return badRequest(res, 'id is required');
    const rows = await sql`
      DELETE FROM tracker_sessions
      WHERE id = ${id} AND workspace_id IN (SELECT id FROM workspaces WHERE account_id = ${session.accountId})
      RETURNING id`;
    if (rows.length === 0) return res.status(404).json({ error: 'Session not found.' });
    return res.status(200).json({ ok: true });
  }

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
