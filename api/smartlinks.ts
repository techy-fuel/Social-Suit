import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getWorkspaceId, badRequest } from './_db';
import { withAuth } from './_auth';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { workspace, label } = req.body || {};
    if (!workspace || !label) return badRequest(res, 'workspace and label are required');
    const workspaceId = await getWorkspaceId(workspace);
    const rows = await sql`
      INSERT INTO smartlinks (workspace_id, label, clicks, sort_order)
      VALUES (${workspaceId}, ${label}, 0, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM smartlinks WHERE workspace_id = ${workspaceId}))
      RETURNING id, label, clicks`;
    return res.status(201).json(rows[0]);
  }

  const workspace = String(req.query.workspace || '');
  if (!workspace) return badRequest(res, 'workspace is required');
  const workspaceId = await getWorkspaceId(workspace);
  const rows = await sql`SELECT id, label, clicks FROM smartlinks WHERE workspace_id = ${workspaceId} ORDER BY sort_order`;
  res.status(200).json(rows);
}

export default withAuth(handler);
