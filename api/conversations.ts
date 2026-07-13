import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getWorkspaceId, badRequest } from './_db';
import { withAuth } from './_auth';

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { id, reply } = req.body || {};
    if (!id || !reply) return badRequest(res, 'id and reply are required');
    await sql`INSERT INTO conversation_replies (conversation_id, body) VALUES (${id}, ${reply})`;
    const rows = await sql`
      UPDATE conversations SET resolved = true, unread = false, updated_at = now() WHERE id = ${id}
      RETURNING id, platform, name, preview, time_label AS time, unread, resolved`;
    return res.status(200).json(rows[0]);
  }

  const workspace = String(req.query.workspace || '');
  if (!workspace) return badRequest(res, 'workspace is required');
  const workspaceId = await getWorkspaceId(workspace);
  const rows = await sql`
    SELECT id, platform, name, preview, time_label AS time, unread, resolved
    FROM conversations WHERE workspace_id = ${workspaceId} ORDER BY updated_at DESC`;
  res.status(200).json(rows);
}

export default withAuth(handler);
