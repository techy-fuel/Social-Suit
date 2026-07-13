/**
 * @startingPoint section="Core" subtitle="White surface, hairline border, xs shadow, optional header row" viewport="700x220"
 */
export interface CardProps {
  children: React.ReactNode;
  padding?: number;
  title?: React.ReactNode;
  /** Right-aligned header slot — e.g. a period selector or IconButton. */
  action?: React.ReactNode;
  style?: React.CSSProperties;
}
