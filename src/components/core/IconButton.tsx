import React from 'react';

export interface IconButtonProps {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline';
  active?: boolean;
  onClick?: () => void;
  label: string;
}

const sizes: Record<string, number> = { sm: 28, md: 34, lg: 40 };

export function IconButton({ icon, size = 'md', variant = 'ghost', active = false, onClick, label }: IconButtonProps) {
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
