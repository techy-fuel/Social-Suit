import React from 'react';

const sizes = { sm: 28, md: 34, lg: 40 };

export function IconButton({ icon, size = 'md', variant = 'ghost', active = false, onClick, label }) {
  const [hover, setHover] = React.useState(false);
  const dim = sizes[size] || sizes.md;
  const isGhost = variant === 'ghost';

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: dim,
        height: dim,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-sm)',
        border: isGhost ? '1px solid transparent' : '1px solid var(--border-strong)',
        background: active
          ? 'var(--blue-100)'
          : hover
          ? 'var(--surface-sunken)'
          : isGhost
          ? 'transparent'
          : 'var(--card)',
        color: active ? 'var(--accent-primary)' : 'var(--text)',
        cursor: 'pointer',
        transition: 'background var(--duration-fast) var(--ease-standard)',
      }}
    >
      {icon}
    </button>
  );
}
