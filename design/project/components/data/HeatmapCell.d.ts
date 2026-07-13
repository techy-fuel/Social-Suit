export interface HeatmapCellProps {
  /** 0-1 intensity — shading uses Royal Blue at varying alpha, never a hue ramp. */
  value: number;
  size?: number;
}
