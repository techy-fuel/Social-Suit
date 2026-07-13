import React from 'react';

export interface ToastProps {
  tone?: 'neutral' | 'positive' | 'warning' | 'error';
  title: string;
  description?: string;
  onClose?: () => void;
}

const tones: Record<string, { border: string }> = {
  neutral: { border: 'var(--border)' },
  positive: { border: 'var(--blue-sky)' },
  warning: { border: 'var(--amber)' },
  error: { border: 'var(--red)' },
};

export function Toast({ tone = 'neutral', title, description, onClose }: ToastProps) {
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
