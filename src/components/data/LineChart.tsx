import React from 'react';

export interface LineSeriesPoint {
  label?: string;
  value: number;
}
export interface LineChartProps {
  series: LineSeriesPoint[];
  width?: number;
  height?: number;
  color?: string;
}

export function LineChart({ series, width = 560, height = 200, color = 'var(--accent-primary)' }: LineChartProps) {
  const max = Math.max(...series.map((d) => d.value));
  const min = Math.min(...series.map((d) => d.value));
  const pad = 8;
  const stepX = (width - pad * 2) / (series.length - 1);
  const scaleY = (v: number) => height - pad - ((v - min) / (max - min || 1)) * (height - pad * 2);

  const points = series.map((d, i) => [pad + i * stepX, scaleY(d.value)]);
  const linePath = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1][0]},${height} L${points[0][0]},${height} Z`;
  const gradientId = React.useId();

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.18" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
