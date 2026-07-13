export interface IconButtonProps {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline';
  active?: boolean;
  onClick?: () => void;
  label: string;
}
