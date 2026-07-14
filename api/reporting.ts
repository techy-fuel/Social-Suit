import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getWorkspaceId, badRequest } from './_db.js';
import { withAuth, Session } from './_auth.js';

async function handler(req: VercelRequest, res: VercelResponse, session: Session) {
  if (req.method === 'DELETE') {
    const id = req.query.id;
    if (!id) return badRequest(res, 'id is required');
    const rows = await sql`
      DELETE FROM reports
      WHERE id = ${id} AND workspace_id IN (SELECT id FROM workspaces WHERE account_id = ${session.accountId})
      RETURNING id`;
    if (rows.length === 0) return res.status(404).json({ error: 'Report not found.' });
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'POST') {
    const { workspace, name, kind } = req.body || {};
    if (!workspace || !name || !kind) return badRequest(res, 'workspace, name, kind are required');
    const workspaceId = await getWorkspaceId(workspace, session.accountId);
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const rows = await sql`
      INSERT INTO reports (workspace_id, name, kind, report_date, status)
      VALUES (${workspaceId}, ${name}, ${kind}, ${date}, 'draft')
      RETURNING id, name, kind, report_date AS date, status`;
    return res.status(201).json(rows[0]);
  }

  const workspace = String(req.query.workspace || '');
  if (!workspace) return badRequest(res, 'workspace is required');
  const workspaceId = await getWorkspaceId(workspace, session.accountId);
  const rows = await sql`
    SELECT id, name, kind, report_date AS date, status FROM reports
    WHERE workspace_id = ${workspaceId} ORDER BY created_at DESC`;
  res.status(200).json(rows);
}

export default withAuth(handler);
