export interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: 'brand' | 'positive' | 'warning' | 'error';
  label?: string;
}
