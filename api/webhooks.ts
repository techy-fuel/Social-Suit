import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db.js';

// Meta calls this exact URL (as registered in the app's Webhooks product)
// with no session/cookie — authenticity is a shared secret baked into the
// URL itself (?secret=...), checked on every request, plus Meta's own
// hub.verify_token echo during the one-time GET handshake.
function webhookSecret(): string {
  const s = process.env.META_WEBHOOK_SECRET;
  if (!s) throw new Error('Set META_WEBHOOK_SECRET as an environment variable.');
  return s;
}

async function findConnection(platformAccountId: string): Promise<{ workspaceId: number; accessToken: string; platform: string } | null> {
  const rows = await sql`
    SELECT workspace_id, access_token, platform FROM connections
    WHERE platform_account_id = ${platformAccountId} AND status = 'connected' AND access_token IS NOT NULL
    LIMIT 1`;
  if (rows.length === 0) return null;
  return { workspaceId: rows[0].workspace_id, accessToken: rows[0].access_token, platform: rows[0].platform };
}

async function upsertConversation(workspaceId: number, externalId: string, fields: { platform: string; name: string; preview: string; senderId: string; kind: 'dm' | 'comment' }) {
  await sql`
    INSERT INTO conversations (workspace_id, platform, name, preview, time_label, unread, resolved, external_id, sender_id, kind, updated_at)
    VALUES (${workspaceId}, ${fields.platform}, ${fields.name}, ${fields.preview}, 'now', true, false, ${externalId}, ${fields.senderId}, ${fields.kind}, now())
    ON CONFLICT (workspace_id, external_id) DO UPDATE SET
      preview = EXCLUDED.preview, unread = true, resolved = false, updated_at = now()`;
}

async function fetchSenderName(personId: string, pageAccessToken: string): Promise<string> {
  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${personId}?fields=name&access_token=${pageAccessToken}`);
    const body = await res.json();
    return body.name || 'New message';
  } catch {
    return 'New message';
  }
}

async function handlePageEntry(entry: any) {
  const conn = await findConnection(entry.id);
  if (!conn) return; // Page/IG account isn't connected to any workspace here.

  for (const event of entry.messaging || []) {
    if (event.message?.is_echo) continue; // Our own outgoing message, not an incoming one.
    const senderId = event.sender?.id;
    const text = event.message?.text;
    if (!senderId || !text) continue;
    const name = await fetchSenderName(senderId, conn.accessToken);
    await upsertConversation(conn.workspaceId, `dm:${senderId}`, {
      platform: conn.platform, name, preview: text, senderId, kind: 'dm',
    });
  }

  for (const change of entry.changes || []) {
    const value = change.value || {};
    const commentId = value.comment_id || value.id;
    const text = value.message || value.text;
    const fromId = value.from?.id;
    if (!commentId || !text) continue;
    if (fromId && fromId === entry.id) continue; // Our own reply, not a new incoming comment.
    const name = value.from?.name || value.from?.username || 'Someone';
    await upsertConversation(conn.workspaceId, `comment:${commentId}`, {
      platform: conn.platform, name, preview: text, senderId: commentId, kind: 'comment',
    });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const provider = String(req.query.provider || '');
  if (provider !== 'meta') {
    res.status(400).json({ error: 'Unknown webhook provider.' });
    return;
  }

  if (String(req.query.secret || '') !== webhookSecret()) {
    res.status(403).send('Forbidden');
    return;
  }

  if (req.method === 'GET') {
    const verifyToken = String(req.query['hub.verify_token'] || '');
    const challenge = String(req.query['hub.challenge'] || '');
    if (verifyToken === webhookSecret()) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Forbidden');
    }
    return;
  }

  if (req.method === 'POST') {
    // Always ack quickly — Meta retries on non-2xx, and one bad event
    // shouldn't fail the whole delivery.
    res.status(200).json({ ok: true });
    try {
      const body = req.body || {};
      for (const entry of body.entry || []) {
        await handlePageEntry(entry).catch((err) => console.error('webhook entry error:', err));
      }
    } catch (err) {
      console.error('webhook handler error:', err);
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
