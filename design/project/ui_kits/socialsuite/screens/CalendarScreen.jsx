function CalendarScreen() {
  const { IconButton, PlatformIcon, Badge } = window.SocialSuiteDesignSystem_f55d92;
  const { scheduledPosts } = window.SSMockData;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  // deterministic pseudo-random heat so it's stable across renders
  function heat(day, hour) {
    const seed = (day * 13 + hour * 7) % 23;
    return Math.min(1, seed / 22);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-2xl)', color: 'var(--text)' }}>
            Planning calendar
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
            Week of Jul 13 – Jul 19, 2026
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <IconButton icon={<i data-lucide="chevron-left" style={{ width: 16, height: 16 }} />} label="Previous week" />
          <IconButton icon={<i data-lucide="chevron-right" style={{ width: 16, height: 16 }} />} label="Next week" />
        </div>
      </div>

      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>Best time to post</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>% of audience online</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `48px repeat(${days.length}, 1fr)`, gap: 4 }}>
          <div />
          {days.map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: 'var(--text-2xs)', color: 'var(--text-muted)', fontWeight: 600 }}>{d}</div>
          ))}
          {hours.map((h) => (
            <React.Fragment key={h}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                {h}:00
              </div>
              {days.map((d, i) => (
                <div key={d} style={{ height: 16, borderRadius: 4, background: `rgba(44, 82, 239, ${0.08 + heat(i, h) * 0.82})` }} title={`${Math.round(heat(i, h) * 100)}%`} />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 10 }}>
          Scheduled this week
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {scheduledPosts.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
              <PlatformIcon platform={p.platform} />
              <div style={{ width: 92, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                {days[p.day]} · {p.time}
              </div>
              <div style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.caption}
              </div>
              <Badge tone="brand">Scheduled</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.CalendarScreen = CalendarScreen;
