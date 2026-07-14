import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getWorkspaceId, badRequest } from './_db.js';
import { withAuth, Session } from './_auth.js';

async function handler(req: VercelRequest, res: VercelResponse, session: Session) {
  const workspace = String(req.query.workspace || '');
  if (!workspace) return badRequest(res, 'workspace is required');
  const workspaceId = await getWorkspaceId(workspace, session.accountId);
  const rows = await sql`SELECT id, channel, name, status, spend, budget FROM ads_campaigns WHERE workspace_id = ${workspaceId}`;
  res.status(200).json(rows);
}

export default withAuth(handler);
