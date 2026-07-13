import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getWorkspaceId, badRequest } from './_db';
import { withAuth } from './_auth';

async function handler(req: VercelRequest, res: VercelResponse) {
  const workspace = String(req.query.workspace || (req.body && req.body.workspace) || '');
  if (!workspace) return badRequest(res, 'workspace is required');
  const workspaceId = await getWorkspaceId(workspace);

  if (req.method === 'POST') {
    const { day, hour, time, platform, caption } = req.body || {};
    if (day == null || hour == null || !time || !platform || !caption) {
      return badRequest(res, 'day, hour, time, platform, caption are required');
    }
    const rows = await sql`
      INSERT INTO scheduled_posts (workspace_id, day, hour, time_label, platform, caption)
      VALUES (${workspaceId}, ${day}, ${hour}, ${time}, ${platform}, ${caption})
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
