import React from 'react';
import { Card } from '../components/core/Card';
import { Input } from '../components/forms/Input';
import { Checkbox } from '../components/forms/Checkbox';
import { Button } from '../components/core/Button';
import { useAuth } from '../AuthContext';
import tfMark from '../assets/logo/tf-mark.svg';

export function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [remember, setRemember] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password, remember);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
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
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-lg)', color: 'var(--text)' }}>
              Sign in
            </div>
            <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            {error && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--red)' }}>{error}</div>}
            <Checkbox label="Remember me for 30 days" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <Button type="submit" fullWidth disabled={submitting || !username || !password}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>
          Shared agency login — for TechyFuel team access only.
        </div>
      </div>
    </div>
  );
}
