import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getWorkspaceId, badRequest } from './_db.js';
import { withAuth, Session } from './_auth.js';

async function handler(req: VercelRequest, res: VercelResponse, session: Session) {
  if (req.method === 'DELETE') {
    const id = req.query.id;
    if (!id) return badRequest(res, 'id is required');
    const rows = await sql`
      DELETE FROM scheduled_posts
      WHERE id = ${id} AND workspace_id IN (SELECT id FROM workspaces WHERE account_id = ${session.accountId})
      RETURNING id`;
    if (rows.length === 0) return res.status(404).json({ error: 'Post not found.' });
    return res.status(200).json({ ok: true });
  }

  const workspace = String(req.query.workspace || (req.body && req.body.workspace) || '');
  if (!workspace) return badRequest(res, 'workspace is required');
  const workspaceId = await getWorkspaceId(workspace, session.accountId);

  if (req.method === 'POST') {
    const { day, hour, time, platform, caption, status } = req.body || {};
    if (day == null || hour == null || !time || !platform || !caption) {
      return badRequest(res, 'day, hour, time, platform, caption are required');
    }
    const postStatus = status === 'draft' ? 'draft' : 'scheduled';
    const rows = await sql`
      INSERT INTO scheduled_posts (workspace_id, day, hour, time_label, platform, caption, status)
      VALUES (${workspaceId}, ${day}, ${hour}, ${time}, ${platform}, ${caption}, ${postStatus})
      RETURNING id, day, hour, time_label AS time, platform, caption, status`;
    return res.status(201).json(rows[0]);
  }

  const [posts, heat] = await Promise.all([
    sql`SELECT id, day, hour, time_label AS time, platform, caption, status FROM scheduled_posts WHERE workspace_id = ${workspaceId} ORDER BY day, hour`,
    sql`SELECT day, hour, value FROM heatmap_cells WHERE workspace_id = ${workspaceId}`,
  ]);

  res.status(200).json({ scheduledPosts: posts, heatmap: heat });
}

export default withAuth(handler);
