import React from 'react';

const tones = {
  neutral: { border: 'var(--border)', icon: 'info' },
  positive: { border: 'var(--blue-sky)', icon: 'check-circle-2' },
  warning: { border: 'var(--amber)', icon: 'alert-triangle' },
  error: { border: 'var(--red)', icon: 'alert-circle' },
};

export function Toast({ tone = 'neutral', title, description, onClose }) {
  const t = tones[tone] || tones.neutral;
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        width: 340,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${t.border}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        padding: '12px 14px',
        fontFamily: 'var(--font-body)',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text)' }}>{title}</div>
        {description && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{description}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>×</button>
      )}
    </div>
  );
}
