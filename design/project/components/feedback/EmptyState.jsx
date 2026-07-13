import React from 'react';

export function EmptyState({ icon, title, description, action }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 6,
        padding: '48px 32px',
        fontFamily: 'var(--font-body)',
      }}
    >
      {icon && (
        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--blue-100)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
          {icon}
        </div>
      )}
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-lg)', color: 'var(--text)' }}>{title}</div>
      {description && <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', maxWidth: 360 }}>{description}</div>}
      {action && <div style={{ marginTop: 10 }}>{action}</div>}
    </div>
  );
}
