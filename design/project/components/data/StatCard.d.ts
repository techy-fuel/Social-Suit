/**
 * @startingPoint section="Data" subtitle="Metric card — Space Grotesk figure, Plex Mono delta" viewport="700x180"
 */
export interface StatCardProps {
  label: string;
  value: string;
  /** Signed delta string, e.g. "+12.4%" or "-3.1%". Negative renders in red, positive in Sky Blue. */
  delta?: string;
  timeframe?: string;
  icon?: React.ReactNode;
}
