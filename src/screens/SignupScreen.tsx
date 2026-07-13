import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/core/Card';
import { Input } from '../components/forms/Input';
import { Button } from '../components/core/Button';
import { useAuth } from '../AuthContext';
import tfMark from '../assets/logo/tf-mark.svg';

export function SignupScreen({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const { signup } = useAuth();
  const [accountName, setAccountName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signup(email, password, accountName);
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
              Create your account
            </div>
            <Input label="Agency or team name" placeholder="e.g. Acme Social" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <Input label="Password" type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            {error && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--red)' }}>{error}</div>}
            <Button type="submit" fullWidth disabled={submitting || !email || password.length < 8}>
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>
          By creating an account, you agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.
        </div>
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>Sign in</a>
        </div>
      </div>
    </div>
  );
}
