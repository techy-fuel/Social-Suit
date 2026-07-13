import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  /** Visual treatment. Primary = Royal Blue fill, the one high-emphasis action per view. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  /** Optional leading icon element (e.g. a lucide-react icon). */
  icon?: React.ReactNode;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { height: 32, padding: '0 12px', fontSize: 'var(--text-xs)', gap: 6 },
  md: { height: 38, padding: '0 16px', fontSize: 'var(--text-sm)', gap: 8 },
  lg: { height: 44, padding: '0 20px', fontSize: 'var(--text-md)', gap: 8 },
};

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: 'var(--accent-primary)',
    color: '#fff',
    border: '1px solid transparent',
  },
  secondary: {
    background: 'var(--card)',
    color: 'var(--text)',
    border: '1px solid var(--border-strong)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'var(--red)',
    color: '#fff',
    border: '1px solid transparent',
  },
};

const hoverBg: Record<string, string> = {
  primary: 'var(--accent-primary-hover)',
  secondary: 'var(--surface-sunken)',
  ghost: 'var(--surface-sunken)',
  danger: '#C81E1E',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon = null,
  fullWidth = false,
  onClick,
  type = 'button',
}: ButtonProps) {
  const [hover, setHover] = React.useState(false);
  const s = sizeStyles[size] || sizeStyles.md;
  const v = variantStyles[variant] || variantStyles.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: fullWidth ? '100%' : 'auto',
        height: s.height,
        padding: s.padding,
        gap: s.gap,
        fontFamily: 'var(--font-body)',
        fontSize: s.fontSize,
        fontWeight: 'var(--weight-medium)',
        borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)',
        ...v,
        background: !disabled && hover ? hoverBg[variant] : v.background,
      }}
    >
      {icon}
      {children}
    </button>
  );
}
