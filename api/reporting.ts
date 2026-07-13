import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getWorkspaceId, badRequest } from './_db';
import { withAuth } from './_auth';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { workspace, name, kind } = req.body || {};
    if (!workspace || !name || !kind) return badRequest(res, 'workspace, name, kind are required');
    const workspaceId = await getWorkspaceId(workspace);
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const rows = await sql`
      INSERT INTO reports (workspace_id, name, kind, report_date, status)
      VALUES (${workspaceId}, ${name}, ${kind}, ${date}, 'draft')
      RETURNING id, name, kind, report_date AS date, status`;
    return res.status(201).json(rows[0]);
  }

  const workspace = String(req.query.workspace || '');
  if (!workspace) return badRequest(res, 'workspace is required');
  const workspaceId = await getWorkspaceId(workspace);
  const rows = await sql`
    SELECT id, name, kind, report_date AS date, status FROM reports
    WHERE workspace_id = ${workspaceId} ORDER BY created_at DESC`;
  res.status(200).json(rows);
}

export default withAuth(handler);
