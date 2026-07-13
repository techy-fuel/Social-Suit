function ReportingScreen() {
  const { Button, Card, Badge } = window.SocialSuiteDesignSystem_f55d92;

  const reports = [
    { icon: 'file-text', title: 'PDF report', desc: 'Branded performance summary for a client stakeholder.' },
    { icon: 'presentation', title: 'PPT report', desc: 'Slide deck export for review meetings.' },
    { icon: 'layout-dashboard', title: 'Campaign dashboard', desc: 'Live shareable dashboard link, no login required.' },
    { icon: 'bar-chart-2', title: 'Custom chart builder', desc: 'Pick metrics, date range and chart type.' },
  ];

  const recent = [
    { name: 'HIRA Institute — June performance', kind: 'PDF', date: 'Jul 02, 2026', status: 'sent' },
    { name: 'Al Rehman Academy — Q2 overview', kind: 'PPT', date: 'Jun 28, 2026', status: 'draft' },
    { name: 'HIRA Kitchen — campaign recap', kind: 'PDF', date: 'Jun 14, 2026', status: 'sent' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-2xl)', color: 'var(--text)' }}>Reporting</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {reports.map((r, i) => (
          <Card key={i} padding={16}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--blue-100)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <i data-lucide={r.icon} style={{ width: 18, height: 18 }} />
            </div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>{r.title}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4, marginBottom: 12 }}>{r.desc}</div>
            <Button size="sm" variant="secondary" fullWidth>Create</Button>
          </Card>
        ))}
      </div>

      <div>
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Recent reports</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recent.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
              <i data-lucide="file-text" style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
              <div style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{r.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>{r.kind} · {r.date}</div>
              <Badge tone={r.status === 'sent' ? 'positive' : 'neutral'} dot>{r.status === 'sent' ? 'Sent' : 'Draft'}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.ReportingScreen = ReportingScreen;
