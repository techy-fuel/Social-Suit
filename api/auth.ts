import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db.js';
import { getSupabaseAdmin, supabaseAnon } from './_supabase.js';
import { createSessionToken, setSessionCookie, clearSessionCookie, getSession } from './_auth.js';

// Consolidated into one function (Vercel Hobby plan caps at 12 serverless
// functions per deployment) — dispatches on ?action= instead of one file
// per auth endpoint. Credentials and email delivery (confirmation, password
// reset) are handled by Supabase Auth; our own signed cookie remains the
// actual app session, and `users` just maps a Supabase auth user to a
// tenant (account).

async function login(req: VercelRequest, res: VercelResponse) {
  const { email, password, remember } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email: email.toLowerCase().trim(), password });
  if (error || !data.user) {
    res.status(401).json({ error: 'Incorrect email or password.' });
    return;
  }

  const rows = await sql`SELECT id, account_id, email FROM users WHERE supabase_user_id = ${data.user.id}`;
  const mapping = rows[0];
  if (!mapping) {
    res.status(401).json({ error: "Account isn't fully set up yet. Contact support." });
    return;
  }

  const { token, maxAge } = createSessionToken({ userId: mapping.id, accountId: mapping.account_id, email: mapping.email }, Boolean(remember));
  setSessionCookie(res, token, maxAge);
  res.status(200).json({ email: mapping.email });
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

  // email_confirm: false sends Supabase's built-in confirmation email; we
  // still sign the user in immediately below rather than gating on it, so
  // a slow/blocked confirmation email doesn't lock someone out of a product
  // they just signed up for.
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: false,
  });

  if (error || !data.user) {
    if (error && /already.*registered|already.*exists/i.test(error.message)) {
      res.status(409).json({ error: 'An account with that email already exists.' });
      return;
    }
    res.status(400).json({ error: error?.message || 'Could not create account.' });
    return;
  }

  let rows;
  try {
    rows = await sql`
      WITH new_account AS (
        INSERT INTO accounts (name) VALUES (${name}) RETURNING id
      ), new_user AS (
        INSERT INTO users (account_id, supabase_user_id, email)
        SELECT id, ${data.user.id}, ${normalizedEmail} FROM new_account
        RETURNING id, account_id, email
      )
      SELECT id, account_id, email FROM new_user`;
  } catch (err) {
    // Don't orphan a Supabase auth user if our own tables fail to write.
    await getSupabaseAdmin().auth.admin.deleteUser(data.user.id).catch(() => {});
    throw err;
  }

  const user = rows[0];
  const { token, maxAge } = createSessionToken({ userId: user.id, accountId: user.account_id, email: user.email }, false);
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

async function requestPasswordReset(req: VercelRequest, res: VercelResponse) {
  const { email } = req.body || {};
  if (typeof email === 'string' && email.includes('@')) {
    const siteUrl = process.env.PUBLIC_SITE_URL || `https://${req.headers.host}`;
    await supabaseAnon.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
      redirectTo: `${siteUrl}/reset-password`,
    });
  }
  // Always report success, whether or not the email is registered, so this
  // endpoint can't be used to enumerate accounts.
  res.status(200).json({ ok: true });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = String(req.query.action || '');

  try {
    if (action === 'me') return await me(req, res);

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    switch (action) {
      case 'login':
        return await login(req, res);
      case 'signup':
        return await signup(req, res);
      case 'logout':
        return await logout(req, res);
      case 'request-password-reset':
        return await requestPasswordReset(req, res);
      default:
        res.status(400).json({ error: 'Unknown auth action.' });
    }
  } catch (err) {
    // Surface the real cause instead of a bare 500 — this endpoint runs
    // before a session exists, so there's no sensitive per-user state to
    // leak here, only server misconfiguration (missing env vars, schema
    // not applied yet, etc).
    console.error('auth handler error:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unexpected server error.' });
  }
}
