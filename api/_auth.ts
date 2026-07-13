import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';

const COOKIE_NAME = 'ss_session';
const DEFAULT_MAX_AGE = 60 * 60 * 8; // 8 hours
const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface Session {
  userId: number;
  accountId: number;
  email: string;
}

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('Set SESSION_SECRET (any long random string) as an environment variable.');
  return s;
}

function sign(value: string): string {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

export function createSessionToken(session: Session, remember: boolean): { token: string; maxAge: number } {
  const maxAge = remember ? REMEMBER_MAX_AGE : DEFAULT_MAX_AGE;
  const payload = JSON.stringify({ u: session.userId, a: session.accountId, e: session.email, exp: Date.now() + maxAge * 1000 });
  const encoded = Buffer.from(payload).toString('base64url');
  const sig = sign(encoded);
  return { token: `${encoded}.${sig}`, maxAge };
}

export function setSessionCookie(res: VercelResponse, token: string, maxAge: number) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`);
}

export function clearSessionCookie(res: VercelResponse) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
}

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

export function getSession(req: VercelRequest): Session | null {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) return null;
  if (sign(encoded) !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    if (typeof payload.u !== 'number' || typeof payload.a !== 'number' || typeof payload.e !== 'string') return null;
    return { userId: payload.u, accountId: payload.a, email: payload.e };
  } catch {
    return null;
  }
}

export function withAuth(handler: (req: VercelRequest, res: VercelResponse, session: Session) => unknown) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const session = getSession(req);
    if (!session) {
      res.status(401).json({ error: 'Not signed in.' });
      return;
    }
    await handler(req, res, session);
  };
}
