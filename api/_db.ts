import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error('Set DATABASE_URL or POSTGRES_URL (Vercel Storage -> your database -> Connect to project).');
}

// A plain Postgres connection (works with Supabase, Neon, or any standard
// Postgres host) — reused across warm serverless invocations. We deliberately
// don't use @neondatabase/serverless's HTTP driver: it only speaks Neon's
// proprietary query endpoint, not a generic Postgres provider like Supabase.
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

export async function sql(strings: TemplateStringsArray, ...values: unknown[]): Promise<any[]> {
  const text = strings.reduce((acc, str, i) => acc + (i > 0 ? `$${i}` : '') + str, '');
  const result = await pool.query(text, values);
  return result.rows;
}

export async function getWorkspaceId(key: string, accountId: number): Promise<number> {
  const rows = await sql`SELECT id FROM workspaces WHERE key = ${key} AND account_id = ${accountId}`;
  if (rows.length === 0) throw new Error(`Unknown workspace: ${key}`);
  return rows[0].id as number;
}

export function badRequest(res: any, message: string) {
  res.status(400).json({ error: message });
}
