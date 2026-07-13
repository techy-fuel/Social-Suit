import React from 'react';
import { StatCard } from '../components/data/StatCard';
import { LineChart } from '../components/data/LineChart';
import { DonutChart } from '../components/data/DonutChart';
import { Table } from '../components/data/Table';
import { Select } from '../components/forms/Select';
import { PlatformIcon } from '../components/data/PlatformIcon';
import { useWorkspaces } from '../WorkspaceContext';
import { useApi } from '../hooks';
import { api } from '../api';

export function AnalyticsScreen() {
  const { current } = useWorkspaces();
  const key = current!.key;
  const { data, loading, error } = useApi(() => api.analytics(key), [key]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-2xl)', color: 'var(--text)' }}>
            Page overview
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
            {current!.name} · all connected platforms
          </div>
        </div>
        <div style={{ width: 180 }}>
          <Select value="28d" onChange={() => {}} options={[{ value: '7d', label: 'Last 7 days' }, { value: '28d', label: 'Last 28 days' }, { value: '90d', label: 'Last 90 days' }]} />
        </div>
      </div>

      {error && <div style={{ color: 'var(--red)', fontSize: 'var(--text-sm)' }}>Couldn't load analytics: {error}</div>}
      {loading && <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Loading…</div>}

      {data && (
        <>
          <div className="ss-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {data.stats.map((s) => (
              <StatCard key={s.key} label={s.label} value={s.value} delta={s.delta} timeframe={s.timeframe} />
            ))}
          </div>

          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>Growth</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--blue-sky)' }}>
                {data.growthSeries.length > 1
                  ? `+${(((data.growthSeries[data.growthSeries.length - 1].value - data.growthSeries[0].value) / data.growthSeries[0].value) * 100).toFixed(1)}% over ${data.growthSeries.length} days`
                  : null}
              </div>
            </div>
            <LineChart series={data.growthSeries} height={180} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 16 }}>
            <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>
                Followers by country
              </div>
              <DonutChart data={data.followersByCountry} size={140} thickness={20} />
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
                rows={data.followersByCity}
              />
            </div>
          </div>

          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 20 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 14 }}>
              Posts published
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              {data.platformPosts.map((p) => (
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
        </>
      )}
    </div>
  );
}
