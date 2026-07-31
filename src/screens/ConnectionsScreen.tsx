import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../components/core/Button';
import { Badge } from '../components/core/Badge';
import { PlatformIcon } from '../components/data/PlatformIcon';
import { Dialog } from '../components/feedback/Dialog';
import { useWorkspaces } from '../WorkspaceContext';
import { useToast } from '../ToastContext';
import { useApi } from '../hooks';
import { api } from '../api';

// These are wired to real OAuth flows (api/oauth.ts, ?provider=<value>);
// everything else still just flips a status flag until that platform's
// integration is built.
const OAUTH_LABEL_PROVIDER: Record<string, string> = {
  Facebook: 'meta',
  Instagram: 'meta',
  YouTube: 'google',
  'TikTok (personal)': 'tiktok',
  'TikTok (business)': 'tiktok',
  LinkedIn: 'linkedin',
  Threads: 'threads',
  Pinterest: 'pinterest',
};

const HEADER_CONNECT_BUTTONS: Array<{ provider: string; label: string }> = [
  { provider: 'meta', label: 'Connect a Facebook Page' },
  { provider: 'google', label: 'Connect YouTube' },
  { provider: 'tiktok', label: 'Connect TikTok' },
  { provider: 'linkedin', label: 'Connect LinkedIn' },
  { provider: 'threads', label: 'Connect Threads' },
  { provider: 'pinterest', label: 'Connect Pinterest' },
];

const statusTone: Record<string, 'positive' | 'warning' | 'neutral'> = {
  connected: 'positive',
  pending: 'warning',
  'not-connected': 'neutral',
};
const statusLabel: Record<string, string> = {
  connected: 'Connected',
  pending: 'Reconnect needed',
  'not-connected': 'Not connected',
};

export function ConnectionsScreen() {
  const { current } = useWorkspaces();
  const key = current!.key;
  const { data, loading, error, refetch } = useApi(() => api.connections(key), [key]);
  const [pendingId, setPendingId] = React.useState<number | null>(null);
  const [managing, setManaging] = React.useState<{ id: number; label: string } | null>(null);
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  React.useEffect(() => {
    const connected = searchParams.get('connected');
    const oauthError = searchParams.get('oauth_error');
    if (connected) {
      showToast({ tone: 'positive', title: `Connected: ${connected.split(',').join(', ')}` });
      refetch();
    } else if (oauthError) {
      showToast({ tone: 'error', title: "Couldn't connect", description: oauthError });
    }
    if (connected || oauthError) setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function connectWith(provider: string) {
    window.location.href = `/api/oauth?provider=${provider}&action=start&workspace=${encodeURIComponent(key)}`;
  }

  // true if this label has a real OAuth flow to hand off to (in which case
  // the caller shouldn't also fall back to the fake status-flag toggle).
  function connectFor(label: string): boolean {
    const provider = OAUTH_LABEL_PROVIDER[label];
    if (!provider) return false;
    connectWith(provider);
    return true;
  }

  async function setStatus(id: number, status: string, label: string) {
    setPendingId(id);
    try {
      await api.updateConnection(id, status);
      showToast({ tone: status === 'not-connected' ? 'neutral' : 'positive', title: `${label} ${status === 'not-connected' ? 'disconnected' : 'connected'}` });
      refetch();
    } catch (err) {
      showToast({ tone: 'error', title: `Couldn't update ${label}`, description: err instanceof Error ? err.message : String(err) });
    } finally {
      setPendingId(null);
      setManaging(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-2xl)', color: 'var(--text)' }}>
            Connections
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
            Platforms available to {current!.name}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {HEADER_CONNECT_BUTTONS.map((b) => (
            <Button key={b.provider} size="sm" variant="secondary" onClick={() => connectWith(b.provider)}>{b.label}</Button>
          ))}
        </div>
      </div>

      {error && <div style={{ color: 'var(--red)', fontSize: 'var(--text-sm)' }}>Couldn't load connections: {error}</div>}
      {loading && <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Loading…</div>}

      <div className="ss-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {data?.map((c) => (
          <div key={c.id} style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <PlatformIcon platform={c.platform} />
              <Badge tone={statusTone[c.status]} dot>{statusLabel[c.status]}</Badge>
            </div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>{c.label}</div>
            {c.account && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>{c.account}</div>}
            <div>
              {c.status === 'not-connected' && (
                <Button size="sm" variant="secondary" disabled={pendingId === c.id} onClick={() => { if (!connectFor(c.label)) setStatus(c.id, 'connected', c.label); }}>
                  {pendingId === c.id ? 'Connecting…' : 'Connect'}
                </Button>
              )}
              {c.status === 'pending' && (
                <Button size="sm" variant="primary" disabled={pendingId === c.id} onClick={() => { if (!connectFor(c.label)) setStatus(c.id, 'connected', c.label); }}>
                  {pendingId === c.id ? 'Reconnecting…' : 'Reconnect'}
                </Button>
              )}
              {c.status === 'connected' && (
                <Button size="sm" variant="ghost" onClick={() => setManaging({ id: c.id, label: c.label })}>Manage</Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={!!managing}
        title={managing?.label || ''}
        onClose={() => setManaging(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setManaging(null)}>Cancel</Button>
            <Button
              variant="danger"
              disabled={pendingId === managing?.id}
              onClick={() => managing && setStatus(managing.id, 'not-connected', managing.label)}
            >
              {pendingId === managing?.id ? 'Disconnecting…' : 'Disconnect'}
            </Button>
          </>
        }
      >
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
          Disconnecting {managing?.label} stops scheduling and publishing to this account until it's reconnected.
        </div>
      </Dialog>
    </div>
  );
}
