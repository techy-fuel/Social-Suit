/**
 * @startingPoint section="Core" subtitle="Primary action button, 3 sizes, 4 variants" viewport="700x260"
 */
export interface ButtonProps {
  children: React.ReactNode;
  /** Visual treatment. Primary = Royal Blue fill, the one high-emphasis action per view. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  /** Optional leading icon element (e.g. a Lucide <i> or inline svg). */
  icon?: React.ReactNode;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}
