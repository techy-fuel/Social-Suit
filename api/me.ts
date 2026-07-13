import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSessionUser } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not signed in.' });
    return;
  }
  res.status(200).json({ username: user });
}
