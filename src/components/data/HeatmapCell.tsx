import React from 'react';

export interface HeatmapCellProps {
  /** 0-1 intensity — shading uses Royal Blue at varying alpha, never a hue ramp. */
  value: number;
  size?: number;
}

export function HeatmapCell({ value, size = 22 }: HeatmapCellProps) {
  const alpha = 0.08 + value * 0.82;
  return (
    <div
      title={`${Math.round(value * 100)}%`}
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        background: `rgba(44, 82, 239, ${alpha})`,
      }}
    />
  );
}
