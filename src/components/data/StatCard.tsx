import React from 'react';

export interface StatCardProps {
  label: string;
  value: string;
  /** Signed delta string, e.g. "+12.4%" or "-3.1%". Negative renders in red, positive in Sky Blue. */
  delta?: string;
  timeframe?: string;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, delta, timeframe = 'vs last 28 days', icon }: StatCardProps) {
  const isNegative = typeof delta === 'string' && delta.trim().startsWith('-');
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-xs)',
        padding: 18,
        fontFamily: 'var(--font-body)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--weight-medium)' }}>{label}</span>
        {icon && <span style={{ color: 'var(--text-muted)' }}>{icon}</span>}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-3xl)', color: 'var(--text)', marginTop: 6 }}>
        {value}
      </div>
      {delta && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: isNegative ? 'var(--red)' : 'var(--blue-sky)', marginTop: 4 }}>
          {delta} <span style={{ color: 'var(--text-muted)' }}>{timeframe}</span>
        </div>
      )}
    </div>
  );
}
