import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { sql } from './_db';
import { createSessionToken, setSessionCookie, clearSessionCookie, getSession } from './_auth';

// Consolidated into one function (Vercel Hobby plan caps at 12 serverless
// functions per deployment) — dispatches on ?action= instead of one file
// per auth endpoint.
async function login(req: VercelRequest, res: VercelResponse) {
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

async function signup(req: VercelRequest, res: VercelResponse) {
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

async function logout(req: VercelRequest, res: VercelResponse) {
  clearSessionCookie(res);
  res.status(200).json({ ok: true });
}

async function me(req: VercelRequest, res: VercelResponse) {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: 'Not signed in.' });
    return;
  }
  res.status(200).json({ email: session.email });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = String(req.query.action || '');

  if (action === 'me') return me(req, res);

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  switch (action) {
    case 'login':
      return login(req, res);
    case 'signup':
      return signup(req, res);
    case 'logout':
      return logout(req, res);
    default:
      res.status(400).json({ error: 'Unknown auth action.' });
  }
}
