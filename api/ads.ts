import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getWorkspaceId, badRequest } from './_db';
import { withAuth } from './_auth';

async function handler(req: VercelRequest, res: VercelResponse) {
  const workspace = String(req.query.workspace || '');
  if (!workspace) return badRequest(res, 'workspace is required');
  const workspaceId = await getWorkspaceId(workspace);
  const rows = await sql`SELECT id, channel, name, status, spend, budget FROM ads_campaigns WHERE workspace_id = ${workspaceId}`;
  res.status(200).json(rows);
}

export default withAuth(handler);
