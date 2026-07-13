import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from '../components/core/IconButton';
import { PlatformIcon } from '../components/data/PlatformIcon';
import { Badge } from '../components/core/Badge';
import { useWorkspaces } from '../WorkspaceContext';
import { useApi } from '../hooks';
import { api } from '../api';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

export function CalendarScreen() {
  const { current } = useWorkspaces();
  const key = current!.key;
  const { data, loading, error } = useApi(() => api.calendar(key), [key]);

  const heatByCell = new Map<string, number>();
  data?.heatmap.forEach((h) => heatByCell.set(`${h.day}-${h.hour}`, h.value));

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
          <IconButton icon={<ChevronLeft size={16} />} label="Previous week" />
          <IconButton icon={<ChevronRight size={16} />} label="Next week" />
        </div>
      </div>

      {error && <div style={{ color: 'var(--red)', fontSize: 'var(--text-sm)' }}>Couldn't load calendar: {error}</div>}
      {loading && <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Loading…</div>}

      {data && (
        <>
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
                  {days.map((d, i) => {
                    const value = heatByCell.get(`${i}-${h}`) ?? 0;
                    return (
                      <div key={d} style={{ height: 16, borderRadius: 4, background: `rgba(44, 82, 239, ${0.08 + value * 0.82})` }} title={`${Math.round(value * 100)}%`} />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 10 }}>
              Scheduled this week
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.scheduledPosts.length === 0 && (
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Nothing scheduled yet — create a post from Post composer.</div>
              )}
              {data.scheduledPosts.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
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
        </>
      )}
    </div>
  );
}
