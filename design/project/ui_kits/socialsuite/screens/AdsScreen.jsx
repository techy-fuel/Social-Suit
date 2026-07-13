function AdsScreen() {
  const { ProgressBar, Badge, Select } = window.SocialSuiteDesignSystem_f55d92;
  const { adsCampaigns } = window.SSMockData;

  const channelIcon = { 'Meta Ads': 'facebook', 'Google Ads': 'chrome', 'TikTok Ads': 'music-2' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-2xl)', color: 'var(--text)' }}>Ads</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
            Meta, Google and TikTok campaigns for HIRA Institute
          </div>
        </div>
        <div style={{ width: 180 }}>
          <Select value="28d" onChange={() => {}} options={[{ value: '7d', label: 'Last 7 days' }, { value: '28d', label: 'Last 28 days' }]} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {adsCampaigns.map((c, i) => (
          <div key={i} style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 16, display: 'grid', gridTemplateColumns: '140px 1fr 140px 200px', gap: 16, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <i data-lucide={channelIcon[c.channel]} style={{ width: 16, height: 16, color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{c.channel}</span>
            </div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text)' }}>{c.name}</div>
            <Badge tone={c.status === 'active' ? 'positive' : 'neutral'} dot>{c.status === 'active' ? 'Active' : 'Paused'}</Badge>
            <ProgressBar value={c.spend} max={c.budget} label={`$${c.spend.toLocaleString()} / $${c.budget.toLocaleString()}`} tone={c.spend >= c.budget ? 'warning' : 'brand'} />
          </div>
        ))}
      </div>
    </div>
  );
}

window.AdsScreen = AdsScreen;
