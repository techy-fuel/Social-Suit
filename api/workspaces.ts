import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, badRequest } from './_db.js';
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

async function handler(req: VercelRequest, res: VercelResponse, session: Session) {
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
      RETURNING key, initials, name`;
    return res.status(201).json(rows[0]);
  }

  const rows = await sql`SELECT key, initials, name FROM workspaces WHERE account_id = ${session.accountId} ORDER BY sort_order`;
  res.status(200).json(rows);
}

export default withAuth(handler);
