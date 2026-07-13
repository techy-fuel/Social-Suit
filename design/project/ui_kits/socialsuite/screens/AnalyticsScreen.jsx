function AnalyticsScreen() {
  const { StatCard, LineChart, DonutChart, Table, Select, PlatformIcon } =
    window.SocialSuiteDesignSystem_f55d92;
  const { growthSeries, followersByCountry, followersByCity, platformPosts } = window.SSMockData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-2xl)', color: 'var(--text)' }}>
            Page overview
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
            HIRA Institute · all connected platforms
          </div>
        </div>
        <div style={{ width: 180 }}>
          <Select value="28d" onChange={() => {}} options={[{ value: '7d', label: 'Last 7 days' }, { value: '28d', label: 'Last 28 days' }, { value: '90d', label: 'Last 90 days' }]} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <StatCard label="Followers" value="11,400" delta="+12.4%" />
        <StatCard label="Profile views" value="48,210" delta="+6.1%" />
        <StatCard label="Website visits" value="3,982" delta="-1.8%" />
      </div>

      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>Growth</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--blue-sky)' }}>+35.7% over 28 days</div>
        </div>
        <LineChart series={growthSeries} height={180} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 16 }}>
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 20 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>
            Followers by country
          </div>
          <DonutChart data={followersByCountry} size={140} thickness={20} />
        </div>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 20 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 10 }}>
            Followers by city
          </div>
          <Table
            columns={[
              { key: 'city', label: 'City' },
              { key: 'country', label: 'Country' },
              { key: 'followers', label: 'Followers', align: 'right', mono: true },
            ]}
            rows={followersByCity}
          />
        </div>
      </div>

      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 20 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>
          Posts published
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {platformPosts.map((p) => (
            <div key={p.platform} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <PlatformIcon platform={p.platform} />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-lg)', color: 'var(--text)' }}>{p.posts}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>{p.reach} reach</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.AnalyticsScreen = AnalyticsScreen;
