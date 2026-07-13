import React from 'react';

export interface DonutDatum {
  label: string;
  value: number;
}
export interface DonutChartProps {
  data: DonutDatum[];
  size?: number;
  thickness?: number;
}

const palette = ['var(--blue-900)', 'var(--blue-700)', 'var(--blue-500)', 'var(--blue-300)', 'var(--slate-300)'];

export function DonutChart({ data, size = 160, thickness = 24 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontFamily: 'var(--font-body)' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = frac * circumference;
          const offset = -cumulative * circumference;
          cumulative += frac;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={palette[i % palette.length]}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={offset}
            />
          );
        })}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-xs)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: palette[i % palette.length] }} />
            <span style={{ color: 'var(--text)', flex: 1 }}>{d.label}</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
