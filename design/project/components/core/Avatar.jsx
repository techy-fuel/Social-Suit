import React from 'react';

const sizes = { sm: 24, md: 32, lg: 40, xl: 56 };

export function Avatar({ initials, size = 'md', tone = 'blue' }) {
  const dim = sizes[size] || sizes.md;
  const bg = tone === 'blue' ? 'var(--blue-100)' : 'var(--surface-sunken)';
  const fg = tone === 'blue' ? 'var(--accent-primary)' : 'var(--text-muted)';
  return (
    <div
      style={{
        width: dim,
        height: dim,
        borderRadius: '50%',
        background: bg,
        color: fg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-display)',
        fontWeight: 'var(--weight-semibold)',
        fontSize: dim * 0.38,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
