import React from 'react';
import { Tabs } from '../components/navigation/Tabs';
import { PlatformIcon } from '../components/data/PlatformIcon';
import { Badge } from '../components/core/Badge';
import { conversations } from '../mock-data';

export function InboxScreen() {
  const [tab, setTab] = React.useState<'unresolved' | 'unread' | 'all'>('unresolved');
  const [activeId, setActiveId] = React.useState(1);

  const filtered = conversations.filter((c) => {
    if (tab === 'unresolved') return !c.resolved;
    if (tab === 'unread') return c.unread;
    return true;
  });
  const active = conversations.find((c) => c.id === activeId) || filtered[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-2xl)', color: 'var(--text)' }}>
        Unified inbox
      </div>
      <Tabs
        items={[
          { key: 'unresolved', label: 'Unresolved', count: conversations.filter((c) => !c.resolved).length },
          { key: 'unread', label: 'Unread', count: conversations.filter((c) => c.unread).length },
          { key: 'all', label: 'All', count: conversations.length },
        ]}
        active={tab}
        onChange={(k) => setTab(k as 'unresolved' | 'unread' | 'all')}
      />
      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 320 }}>
        <div style={{ width: 300, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--surface-card)' }}>
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => setActiveId(c.id)}
              style={{
                display: 'flex', gap: 10, padding: '12px 14px', cursor: 'pointer',
                background: active && active.id === c.id ? 'var(--blue-50)' : 'transparent',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <PlatformIcon platform={c.platform} size={14} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: c.unread ? 700 : 500, color: 'var(--text)' }}>{c.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{c.time}</span>
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.preview}</div>
              </div>
              {c.unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0, marginTop: 4 }} />}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-card)', display: 'flex', flexDirection: 'column' }}>
          {active && (
            <React.Fragment>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <PlatformIcon platform={active.platform} />
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>{active.name}</div>
                </div>
                <Badge tone={active.resolved ? 'positive' : 'warning'} dot>{active.resolved ? 'Resolved' : 'Unresolved'}</Badge>
              </div>
              <div style={{ flex: 1, padding: 18 }}>
                <div style={{ background: 'var(--surface-sunken)', borderRadius: 'var(--radius-md)', padding: '10px 14px', maxWidth: 320, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                  {active.preview}
                </div>
              </div>
              <div style={{ padding: 14, borderTop: '1px solid var(--border)' }}>
                <div style={{ border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  Reply to {active.name}…
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}
