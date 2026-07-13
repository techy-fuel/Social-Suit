export interface DonutDatum {
  label: string;
  value: number;
}
export interface DonutChartProps {
  data: DonutDatum[];
  size?: number;
  thickness?: number;
}
