import React from 'react';

export function WorkspaceSwitcher({ workspace, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 12px 5px 5px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border)',
        background: hover ? 'var(--surface-sunken)' : 'var(--card)',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        transition: 'background var(--duration-fast) var(--ease-standard)',
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'var(--blue-100)',
          color: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 12,
        }}
      >
        {workspace.initials}
      </span>
      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text)' }}>{workspace.name}</span>
      <i data-lucide="chevron-down" style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
    </button>
  );
}
