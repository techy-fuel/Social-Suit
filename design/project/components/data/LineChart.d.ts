/**
 * @startingPoint section="Data" subtitle="Growth line chart with soft fill — followers/views/visits over time" viewport="700x260"
 */
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
