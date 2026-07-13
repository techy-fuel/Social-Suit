function TrackerScreen() {
  const { Button, Input, Select, Badge, Table } = window.SocialSuiteDesignSystem_f55d92;
  const { trackerSessions } = window.SSMockData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-2xl)', color: 'var(--text)' }}>Hashtag tracker</div>

      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 18 }}>
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Start a new tracking session</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <Input label="Hashtag" placeholder="#HIRAOpenDay" />
          <Select label="Platform" options={[{ value: 'instagram', label: 'Instagram' }, { value: 'tiktok', label: 'TikTok' }, { value: 'all', label: 'All platforms' }]} />
          <Select label="Duration" options={[{ value: '7', label: '7 days' }, { value: '30', label: '30 days' }, { value: '90', label: '90 days' }]} />
          <Button>Start tracking</Button>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Sessions</div>
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: '6px 18px' }}>
          <Table
            columns={[
              { key: 'hashtag', label: 'Hashtag', mono: true },
              { key: 'platform', label: 'Platform' },
              { key: 'started', label: 'Started', mono: true },
              { key: 'mentions', label: 'Mentions', align: 'right', mono: true },
              { key: 'status', label: 'Status' },
            ]}
            rows={trackerSessions.map((s) => ({
              ...s,
              mentions: s.mentions.toLocaleString(),
              status: <Badge tone={s.status === 'active' ? 'positive' : 'neutral'} dot>{s.status === 'active' ? 'Active' : 'Completed'}</Badge>,
            }))}
          />
        </div>
      </div>
    </div>
  );
}

window.TrackerScreen = TrackerScreen;
