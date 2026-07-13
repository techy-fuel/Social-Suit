import React from 'react';

export function ProgressBar({ value, max = 100, tone = 'brand', label }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = {
    brand: 'var(--accent-primary)',
    positive: 'var(--blue-sky)',
    warning: 'var(--amber)',
    error: 'var(--red)',
  };
  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-2xs)', color: 'var(--text-muted)', marginBottom: 4 }}>
          <span>{label}</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(pct)}%</span>
        </div>
      )}
      <div style={{ height: 6, borderRadius: 'var(--radius-full)', background: 'var(--surface-sunken)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: colors[tone] || colors.brand, borderRadius: 'var(--radius-full)', transition: 'width var(--duration-slow) var(--ease-standard)' }} />
      </div>
    </div>
  );
}
