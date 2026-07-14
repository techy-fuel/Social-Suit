import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getWorkspaceId, badRequest } from './_db.js';
import { withAuth, Session } from './_auth.js';

async function handler(req: VercelRequest, res: VercelResponse, session: Session) {
  if (req.method === 'POST') {
    const { id, status } = req.body || {};
    if (!id || !status) return badRequest(res, 'id and status are required');
    const rows = await sql`
      UPDATE connections SET status = ${status}
      WHERE id = ${id} AND workspace_id IN (SELECT id FROM workspaces WHERE account_id = ${session.accountId})
      RETURNING id, platform, label, status, account`;
    if (rows.length === 0) return res.status(404).json({ error: 'Connection not found.' });
    return res.status(200).json(rows[0]);
  }

  const workspace = String(req.query.workspace || '');
  if (!workspace) return badRequest(res, 'workspace is required');
  const workspaceId = await getWorkspaceId(workspace, session.accountId);
  const rows = await sql`SELECT id, platform, label, status, account FROM connections WHERE workspace_id = ${workspaceId} ORDER BY sort_order`;
  res.status(200).json(rows);
}

export default withAuth(handler);
