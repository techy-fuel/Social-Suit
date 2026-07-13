export interface ToastProps {
  tone?: 'neutral' | 'positive' | 'warning' | 'error';
  title: string;
  description?: string;
  onClose?: () => void;
}
