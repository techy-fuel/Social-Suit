export interface BadgeProps {
  children: React.ReactNode;
  tone?: 'neutral' | 'positive' | 'warning' | 'error' | 'brand';
  /** Show a small status dot before the label. */
  dot?: boolean;
}
