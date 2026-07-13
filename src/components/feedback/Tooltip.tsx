import React from 'react';

export interface TooltipProps {
  children: React.ReactNode;
  label: string;
  side?: 'top' | 'bottom' | 'right';
}

export function Tooltip({ children, label, side = 'top' }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const posStyle: React.CSSProperties = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6 },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 6 },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 6 },
  }[side];

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            ...posStyle,
            background: 'var(--slate-900)',
            color: '#fff',
            fontSize: 'var(--text-2xs)',
            fontFamily: 'var(--font-body)',
            padding: '5px 9px',
            borderRadius: 'var(--radius-sm)',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-md)',
            zIndex: 20,
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}
