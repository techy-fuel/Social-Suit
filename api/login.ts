import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { createSessionToken, setSessionCookie } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { username, password, remember } = req.body || {};
  const expectedUser = process.env.AGENCY_USERNAME;
  const expectedHash = process.env.AGENCY_PASSWORD_HASH;

  if (!expectedUser || !expectedHash) {
    res.status(500).json({ error: 'AGENCY_USERNAME / AGENCY_PASSWORD_HASH are not configured on the server.' });
    return;
  }

  if (typeof username !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'username and password are required' });
    return;
  }

  const userMatches = username === expectedUser;
  const passwordMatches = await bcrypt.compare(password, expectedHash);

  if (!userMatches || !passwordMatches) {
    res.status(401).json({ error: 'Incorrect username or password.' });
    return;
  }

  const { token, maxAge } = createSessionToken(username, Boolean(remember));
  setSessionCookie(res, token, maxAge);
  res.status(200).json({ username });
}
