import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, badRequest, getWorkspaceId } from './_db.js';
import { withAuth, Session } from './_auth.js';

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'workspace';
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'WS';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// Every workspace should show the full platform catalog on Connections, not
// just whatever's already been connected — otherwise a brand-new workspace
// (zero rows) renders as a blank page with no way to discover what's
// available to connect.
const DEFAULT_PLATFORMS: Array<{ platform: string; label: string }> = [
  { platform: 'facebook', label: 'Facebook' },
  { platform: 'instagram', label: 'Instagram' },
  { platform: 'threads', label: 'Threads' },
  { platform: 'x', label: 'X' },
  { platform: 'bluesky', label: 'Bluesky' },
  { platform: 'linkedin', label: 'LinkedIn' },
  { platform: 'pinterest', label: 'Pinterest' },
  { platform: 'tiktok', label: 'TikTok (personal)' },
  { platform: 'tiktok', label: 'TikTok (business)' },
  { platform: 'google', label: 'Google Business Profile' },
  { platform: 'youtube', label: 'YouTube' },
  { platform: 'twitch', label: 'Twitch' },
  { platform: 'facebook', label: 'Meta Ads' },
  { platform: 'google', label: 'Google Ads' },
  { platform: 'tiktok', label: 'TikTok Ads' },
];

async function listNotifications(req: VercelRequest, res: VercelResponse, session: Session) {
  const workspace = String(req.query.workspace || '');
  if (!workspace) return badRequest(res, 'workspace is required');
  const workspaceId = await getWorkspaceId(workspace, session.accountId);
  const rows = await sql`
    SELECT id, type, title, description, read, created_at AS "createdAt"
    FROM notifications WHERE workspace_id = ${workspaceId}
    ORDER BY created_at DESC LIMIT 50`;
  const unreadCount = rows.filter((r: any) => !r.read).length;
  res.status(200).json({ notifications: rows, unreadCount });
}

async function markNotificationsRead(req: VercelRequest, res: VercelResponse, session: Session) {
  const { workspace, id } = req.body || {};
  if (!workspace) return badRequest(res, 'workspace is required');
  const workspaceId = await getWorkspaceId(workspace, session.accountId);
  if (id != null) {
    await sql`UPDATE notifications SET read = true WHERE id = ${id} AND workspace_id = ${workspaceId}`;
  } else {
    await sql`UPDATE notifications SET read = true WHERE workspace_id = ${workspaceId} AND read = false`;
  }
  res.status(200).json({ ok: true });
}

async function handler(req: VercelRequest, res: VercelResponse, session: Session) {
  const action = String(req.query.action || '');
  if (req.method === 'GET' && action === 'notifications') return listNotifications(req, res, session);
  if (req.method === 'POST' && action === 'notifications-read') return markNotificationsRead(req, res, session);

  if (req.method === 'DELETE') {
    const key = String(req.query.key || '');
    if (!key) return badRequest(res, 'key is required');
    const rows = await sql`DELETE FROM workspaces WHERE key = ${key} AND account_id = ${session.accountId} RETURNING id`;
    if (rows.length === 0) return res.status(404).json({ error: 'Workspace not found.' });
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'POST') {
    const { name } = req.body || {};
    if (typeof name !== 'string' || !name.trim()) return badRequest(res, 'name is required');
    const trimmed = name.trim();
    const baseKey = slugify(trimmed);

    const existing = await sql`SELECT key FROM workspaces WHERE account_id = ${session.accountId} AND key LIKE ${baseKey + '%'}`;
    const taken = new Set(existing.map((r: any) => r.key as string));
    let key = baseKey;
    let n = 2;
    while (taken.has(key)) key = `${baseKey}-${n++}`;

    const maxOrder = await sql`SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM workspaces WHERE account_id = ${session.accountId}`;
    const rows = await sql`
      INSERT INTO workspaces (account_id, key, initials, name, sort_order)
      VALUES (${session.accountId}, ${key}, ${initialsOf(trimmed)}, ${trimmed}, ${maxOrder[0].next})
      RETURNING id, key, initials, name`;
    const workspaceId = rows[0].id;

    for (const [idx, p] of DEFAULT_PLATFORMS.entries()) {
      await sql`INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (${workspaceId}, ${p.platform}, ${p.label}, 'not-connected', NULL, ${idx})`;
    }

    return res.status(201).json({ key: rows[0].key, initials: rows[0].initials, name: rows[0].name });
  }

  const rows = await sql`SELECT key, initials, name FROM workspaces WHERE account_id = ${session.accountId} ORDER BY sort_order`;
  res.status(200).json(rows);
}

export default withAuth(handler);
