import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getWorkspaceId, badRequest } from './_db.js';
import { withAuth, Session } from './_auth.js';

async function handler(req: VercelRequest, res: VercelResponse, session: Session) {
  if (req.method === 'POST') {
    const { id, reply } = req.body || {};
    if (!id || !reply) return badRequest(res, 'id and reply are required');
    const owned = await sql`
      SELECT c.id FROM conversations c
      JOIN workspaces w ON w.id = c.workspace_id
      WHERE c.id = ${id} AND w.account_id = ${session.accountId}`;
    if (owned.length === 0) return res.status(404).json({ error: 'Conversation not found.' });

    await sql`INSERT INTO conversation_replies (conversation_id, body) VALUES (${id}, ${reply})`;
    const rows = await sql`
      UPDATE conversations SET resolved = true, unread = false, updated_at = now() WHERE id = ${id}
      RETURNING id, platform, name, preview, time_label AS time, unread, resolved`;
    return res.status(200).json(rows[0]);
  }

  const workspace = String(req.query.workspace || '');
  if (!workspace) return badRequest(res, 'workspace is required');
  const workspaceId = await getWorkspaceId(workspace, session.accountId);
  const rows = await sql`
    SELECT id, platform, name, preview, time_label AS time, unread, resolved
    FROM conversations WHERE workspace_id = ${workspaceId} ORDER BY updated_at DESC`;
  res.status(200).json(rows);
}

export default withAuth(handler);
