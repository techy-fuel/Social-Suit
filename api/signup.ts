import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { sql } from './_db';
import { createSessionToken, setSessionCookie } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { email, password, accountName } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || !email.includes('@')) {
    res.status(400).json({ error: 'A valid email and password are required.' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters.' });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const name = typeof accountName === 'string' && accountName.trim() ? accountName.trim() : `${normalizedEmail.split('@')[0]}'s workspace`;
  const passwordHash = await bcrypt.hash(password, 10);

  let rows;
  try {
    rows = await sql`
      WITH new_account AS (
        INSERT INTO accounts (name) VALUES (${name}) RETURNING id
      ), new_user AS (
        INSERT INTO users (account_id, email, password_hash)
        SELECT id, ${normalizedEmail}, ${passwordHash} FROM new_account
        RETURNING id, account_id, email
      )
      SELECT id, account_id, email FROM new_user`;
  } catch (err) {
    if (err instanceof Error && /unique/i.test(err.message)) {
      res.status(409).json({ error: 'An account with that email already exists.' });
      return;
    }
    throw err;
  }

  const user = rows[0];
  const { token, maxAge } = createSessionToken({ userId: user.id as number, accountId: user.account_id as number, email: user.email as string }, false);
  setSessionCookie(res, token, maxAge);
  res.status(201).json({ email: user.email });
}
