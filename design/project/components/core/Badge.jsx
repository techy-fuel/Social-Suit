import React from 'react';

const tones = {
  neutral: { bg: 'var(--surface-sunken)', fg: 'var(--text-muted)' },
  positive: { bg: 'var(--positive-bg)', fg: '#046FAF' },
  warning: { bg: 'var(--amber-bg)', fg: 'var(--amber)' },
  error: { bg: 'var(--red-bg)', fg: 'var(--red)' },
  brand: { bg: 'var(--blue-100)', fg: 'var(--accent-primary)' },
};

export function Badge({ children, tone = 'neutral', dot = false }) {
  const t = tones[tone] || tones.neutral;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        background: t.bg,
        color: t.fg,
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-medium)',
        lineHeight: 1.4,
      }}
    >
      {dot && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.fg, flexShrink: 0 }} />
      )}
      {children}
    </span>
  );
}
