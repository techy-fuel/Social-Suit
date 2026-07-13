function ConnectionsScreen() {
  const { Button, Badge, PlatformIcon } = window.SocialSuiteDesignSystem_f55d92;
  const { connections } = window.SSMockData;

  const statusTone = { connected: 'positive', pending: 'warning', 'not-connected': 'neutral' };
  const statusLabel = { connected: 'Connected', pending: 'Reconnect needed', 'not-connected': 'Not connected' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-2xl)', color: 'var(--text)' }}>
          Connections
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
          Platforms available to HIRA Institute
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {connections.map((c, i) => (
          <div key={i} style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <PlatformIcon platform={c.platform} />
              <Badge tone={statusTone[c.status]} dot>{statusLabel[c.status]}</Badge>
            </div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>{c.label}</div>
            {c.account && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>{c.account}</div>}
            <div>
              {c.status === 'not-connected' && <Button size="sm" variant="secondary">Connect</Button>}
              {c.status === 'pending' && <Button size="sm" variant="primary">Reconnect</Button>}
              {c.status === 'connected' && <Button size="sm" variant="ghost">Manage</Button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.ConnectionsScreen = ConnectionsScreen;
