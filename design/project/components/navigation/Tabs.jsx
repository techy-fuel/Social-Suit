import React from 'react';

export function Tabs({ items, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-body)' }}>
      {items.map((it) => {
        const isActive = it.key === active;
        return (
          <button
            key={it.key}
            onClick={() => onChange && onChange(it.key)}
            style={{
              padding: '10px 14px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-regular)',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderBottom: `2px solid ${isActive ? 'var(--accent-primary)' : 'transparent'}`,
              marginBottom: -1,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {it.label}
            {it.count != null && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'inherit', opacity: 0.8 }}>{it.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
