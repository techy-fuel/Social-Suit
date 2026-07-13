import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from './_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ error: 'Not signed in.' });
    return;
  }
  res.status(200).json({ email: session.email });
}
