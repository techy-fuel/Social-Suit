import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { sql } from './_db';
import { createSessionToken, setSessionCookie } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { email, password, remember } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const rows = await sql`SELECT id, account_id, email, password_hash FROM users WHERE email = ${email.toLowerCase().trim()}`;
  const user = rows[0];
  const passwordMatches = user ? await bcrypt.compare(password, user.password_hash as string) : false;

  if (!user || !passwordMatches) {
    res.status(401).json({ error: 'Incorrect email or password.' });
    return;
  }

  const { token, maxAge } = createSessionToken({ userId: user.id as number, accountId: user.account_id as number, email: user.email as string }, Boolean(remember));
  setSessionCookie(res, token, maxAge);
  res.status(200).json({ email: user.email });
}
