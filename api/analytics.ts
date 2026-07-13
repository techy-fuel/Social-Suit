import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getWorkspaceId, badRequest } from './_db';
import { withAuth } from './_auth';

async function handler(req: VercelRequest, res: VercelResponse) {
  const workspace = String(req.query.workspace || '');
  if (!workspace) return badRequest(res, 'workspace is required');
  const workspaceId = await getWorkspaceId(workspace);

  const [stats, growth, byCountry, byCity, platformPosts] = await Promise.all([
    sql`SELECT key, label, value, delta, timeframe FROM stat_metrics WHERE workspace_id = ${workspaceId} ORDER BY sort_order`,
    sql`SELECT value FROM growth_points WHERE workspace_id = ${workspaceId} ORDER BY idx`,
    sql`SELECT label, value FROM followers_by_country WHERE workspace_id = ${workspaceId} ORDER BY sort_order`,
    sql`SELECT city, country, followers FROM followers_by_city WHERE workspace_id = ${workspaceId} ORDER BY sort_order`,
    sql`SELECT platform, label, posts, reach FROM platform_posts WHERE workspace_id = ${workspaceId}`,
  ]);

  res.status(200).json({
    stats,
    growthSeries: growth.map((r: any) => ({ value: r.value })),
    followersByCountry: byCountry,
    followersByCity: byCity.map((r: any) => ({ ...r, followers: Number(r.followers).toLocaleString() })),
    platformPosts,
  });
}

export default withAuth(handler);
