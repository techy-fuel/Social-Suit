import React from 'react';
import { Card } from '../components/core/Card';
import { Input } from '../components/forms/Input';
import { Checkbox } from '../components/forms/Checkbox';
import { Button } from '../components/core/Button';
import { useAuth } from '../AuthContext';
import tfMark from '../assets/logo/tf-mark.svg';

export function LoginScreen({ onSwitchToSignup }: { onSwitchToSignup: () => void }) {
  const { login, requestPasswordReset } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [remember, setRemember] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [forgotMode, setForgotMode] = React.useState(false);
  const [resetSent, setResetSent] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password, remember);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResetting(true);
    try {
      await requestPasswordReset(email);
      setResetSent(true);
    } finally {
      setResetting(false);
    }
  }

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 360 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <img src={tfMark} alt="" style={{ width: 40, height: 40, borderRadius: 10 }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-lg)', color: 'var(--text)' }}>SocialSuite</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>by TechyFuel</div>
          </div>
        </div>

        <Card padding={24}>
          {forgotMode ? (
            resetSent ? (
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                If an account exists for <strong>{email}</strong>, a reset link is on its way.
                <div style={{ marginTop: 14 }}>
                  <Button variant="secondary" fullWidth onClick={() => { setForgotMode(false); setResetSent(false); }}>Back to sign in</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-lg)', color: 'var(--text)' }}>
                  Reset your password
                </div>
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                <Button type="submit" fullWidth disabled={resetting || !email}>
                  {resetting ? 'Sending…' : 'Send reset link'}
                </Button>
                <a href="#" style={{ fontSize: 'var(--text-xs)', textAlign: 'center' }} onClick={(e) => { e.preventDefault(); setForgotMode(false); }}>
                  Back to sign in
                </a>
              </form>
            )
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-lg)', color: 'var(--text)' }}>
                Sign in
              </div>
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              {error && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--red)' }}>{error}</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Checkbox label="Remember me for 30 days" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <a href="#" style={{ fontSize: 'var(--text-2xs)' }} onClick={(e) => { e.preventDefault(); setForgotMode(true); }}>Forgot password?</a>
              </div>
              <Button type="submit" fullWidth disabled={submitting || !email || !password}>
                {submitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          )}
        </Card>

        {!forgotMode && (
          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToSignup(); }}>Sign up</a>
          </div>
        )}
      </div>
    </div>
  );
}
