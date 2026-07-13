import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getWorkspaceId, badRequest } from './_db';
import { withAuth } from './_auth';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { id, status } = req.body || {};
    if (!id || !status) return badRequest(res, 'id and status are required');
    const rows = await sql`
      UPDATE connections SET status = ${status} WHERE id = ${id}
      RETURNING id, platform, label, status, account`;
    return res.status(200).json(rows[0]);
  }

  const workspace = String(req.query.workspace || '');
  if (!workspace) return badRequest(res, 'workspace is required');
  const workspaceId = await getWorkspaceId(workspace);
  const rows = await sql`SELECT id, platform, label, status, account FROM connections WHERE workspace_id = ${workspaceId} ORDER BY sort_order`;
  res.status(200).json(rows);
}

export default withAuth(handler);
