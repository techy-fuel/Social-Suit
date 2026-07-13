import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error('Set DATABASE_URL or POSTGRES_URL (Vercel Storage -> your database -> Connect to project).');
}

export const sql = neon(connectionString);

export async function getWorkspaceId(key: string, accountId: number): Promise<number> {
  const rows = await sql`SELECT id FROM workspaces WHERE key = ${key} AND account_id = ${accountId}`;
  if (rows.length === 0) throw new Error(`Unknown workspace: ${key}`);
  return rows[0].id as number;
}

export function badRequest(res: any, message: string) {
  res.status(400).json({ error: message });
}
