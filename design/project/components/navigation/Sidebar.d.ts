export interface SidebarProps {
  active?: 'analytics' | 'calendar' | 'composer' | 'inbox' | 'smartlinks' | 'ads' | 'reporting' | 'tracker' | 'settings';
  onNavigate?: (key: string) => void;
  /** Path to the TF mark SVG, relative to the consuming page. Falls back to an inline "TF" gradient mark if omitted. */
  logoSrc?: string;
}
