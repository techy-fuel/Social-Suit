import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getWorkspaceId, badRequest } from './_db.js';
import { withAuth, Session } from './_auth.js';
import { sendMessengerReply, sendInstagramDmReply, replyToFacebookComment, replyToInstagramComment } from './_meta.js';

async function sendRealReply(conversation: { platform: string; kind: string; sender_id: string | null; workspace_id: number }, text: string): Promise<void> {
  if (!conversation.sender_id) return; // Seed/demo conversation, not a real webhook-sourced one — nothing to actually deliver to.

  const label = conversation.platform === 'facebook' ? 'Facebook' : conversation.platform === 'instagram' ? 'Instagram' : null;
  if (!label) return;

  const conns = await sql`SELECT access_token, platform_account_id FROM connections WHERE workspace_id = ${conversation.workspace_id} AND platform = ${conversation.platform} AND label = ${label} AND status = 'connected'`;
  const conn = conns[0];
  if (!conn?.access_token || !conn?.platform_account_id) {
    throw new Error(`${label} isn't connected anymore — reconnect it on the Connections page.`);
  }

  if (conversation.kind === 'comment') {
    if (conversation.platform === 'facebook') await replyToFacebookComment(conversation.sender_id, conn.access_token, text);
    else await replyToInstagramComment(conversation.sender_id, conn.access_token, text);
  } else {
    if (conversation.platform === 'facebook') await sendMessengerReply(conn.platform_account_id, conn.access_token, conversation.sender_id, text);
    else await sendInstagramDmReply(conn.platform_account_id, conn.access_token, conversation.sender_id, text);
  }
}

async function handler(req: VercelRequest, res: VercelResponse, session: Session) {
  if (req.method === 'POST') {
    const { id, reply } = req.body || {};
    if (!id || !reply) return badRequest(res, 'id and reply are required');
    const owned = await sql`
      SELECT c.id, c.platform, c.kind, c.sender_id, c.workspace_id FROM conversations c
      JOIN workspaces w ON w.id = c.workspace_id
      WHERE c.id = ${id} AND w.account_id = ${session.accountId}`;
    const conversation = owned[0];
    if (!conversation) return res.status(404).json({ error: 'Conversation not found.' });

    let deliveryError: string | null = null;
    try {
      await sendRealReply(conversation, reply);
    } catch (err) {
      deliveryError = err instanceof Error ? err.message : String(err);
    }

    await sql`INSERT INTO conversation_replies (conversation_id, body) VALUES (${id}, ${reply})`;
    const rows = await sql`
      UPDATE conversations SET resolved = true, unread = false, updated_at = now() WHERE id = ${id}
      RETURNING id, platform, name, preview, time_label AS time, unread, resolved`;
    return res.status(200).json({ ...rows[0], deliveryError });
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
