import React from 'react';

export interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: 'brand' | 'positive' | 'warning' | 'error';
  label?: string;
}

const colors: Record<string, string> = {
  brand: 'var(--accent-primary)',
  positive: 'var(--blue-sky)',
  warning: 'var(--amber)',
  error: 'var(--red)',
};

export function ProgressBar({ value, max = 100, tone = 'brand', label }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
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
