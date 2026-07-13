import { describe, it, expect, beforeAll } from 'vitest';
import type { VercelRequest } from '@vercel/node';
import { createSessionToken, getSession, Session } from './_auth';

function reqWithCookie(cookie: string): VercelRequest {
  return { headers: { cookie } } as unknown as VercelRequest;
}

const testSession: Session = { userId: 1, accountId: 1, email: 'agency@example.com' };

describe('session tokens', () => {
  beforeAll(() => {
    process.env.SESSION_SECRET = 'test-secret-do-not-use-in-prod';
  });

  it('round-trips a valid token back to the session', () => {
    const { token } = createSessionToken(testSession, false);
    const req = reqWithCookie(`ss_session=${token}`);
    expect(getSession(req)).toEqual(testSession);
  });

  it('rejects a tampered signature', () => {
    const { token } = createSessionToken(testSession, false);
    const [encoded] = token.split('.');
    const tampered = `${encoded}.not-the-real-signature`;
    const req = reqWithCookie(`ss_session=${tampered}`);
    expect(getSession(req)).toBeNull();
  });

  it('rejects a missing cookie', () => {
    const req = reqWithCookie('');
    expect(getSession(req)).toBeNull();
  });

  it('gives a 30-day remember-me token a longer maxAge than the default', () => {
    const short = createSessionToken(testSession, false);
    const long = createSessionToken(testSession, true);
    expect(long.maxAge).toBeGreaterThan(short.maxAge);
  });
});
