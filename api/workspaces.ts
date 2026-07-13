import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db';
import { withAuth } from './_auth';

async function handler(req: VercelRequest, res: VercelResponse) {
  const rows = await sql`SELECT key, initials, name FROM workspaces ORDER BY sort_order`;
  res.status(200).json(rows);
}

export default withAuth(handler);
