import { describe, it, expect, beforeAll } from 'vitest';
import type { VercelRequest } from '@vercel/node';
import { createSessionToken, getSessionUser } from './_auth';

function reqWithCookie(cookie: string): VercelRequest {
  return { headers: { cookie } } as unknown as VercelRequest;
}

describe('session tokens', () => {
  beforeAll(() => {
    process.env.SESSION_SECRET = 'test-secret-do-not-use-in-prod';
  });

  it('round-trips a valid token back to the username', () => {
    const { token } = createSessionToken('agency', false);
    const req = reqWithCookie(`ss_session=${token}`);
    expect(getSessionUser(req)).toBe('agency');
  });

  it('rejects a tampered signature', () => {
    const { token } = createSessionToken('agency', false);
    const [encoded] = token.split('.');
    const tampered = `${encoded}.not-the-real-signature`;
    const req = reqWithCookie(`ss_session=${tampered}`);
    expect(getSessionUser(req)).toBeNull();
  });

  it('rejects a missing cookie', () => {
    const req = reqWithCookie('');
    expect(getSessionUser(req)).toBeNull();
  });

  it('gives a 30-day remember-me token a longer maxAge than the default', () => {
    const short = createSessionToken('agency', false);
    const long = createSessionToken('agency', true);
    expect(long.maxAge).toBeGreaterThan(short.maxAge);
  });
});
