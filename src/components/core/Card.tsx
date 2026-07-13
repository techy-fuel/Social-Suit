import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  padding?: number;
  title?: React.ReactNode;
  /** Right-aligned header slot — e.g. a period selector or IconButton. */
  action?: React.ReactNode;
  style?: React.CSSProperties;
}

export function Card({ children, padding = 20, title, action, style }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-xs)',
        padding,
        ...style,
      }}
    >
      {(title || action) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          {title && (
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
              {title}
            </div>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
