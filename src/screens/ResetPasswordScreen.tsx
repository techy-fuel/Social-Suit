import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/core/Card';
import { Input } from '../components/forms/Input';
import { Button } from '../components/core/Button';
import { supabase } from '../supabaseClient';
import tfMark from '../assets/logo/tf-mark.svg';

export function ResetPasswordScreen() {
  const navigate = useNavigate();
  const [ready, setReady] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => navigate('/'), 2000);
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
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-lg)', color: 'var(--text)', marginBottom: 16 }}>
            Set a new password
          </div>
          {done ? (
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--blue-sky)' }}>Password updated — redirecting to sign in…</div>
          ) : !ready ? (
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Verifying your reset link…</div>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input label="New password" type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
              {error && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--red)' }}>{error}</div>}
              <Button type="submit" fullWidth disabled={submitting || password.length < 8}>
                {submitting ? 'Saving…' : 'Update password'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
