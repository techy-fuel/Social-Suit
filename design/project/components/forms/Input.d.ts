/**
 * @startingPoint section="Forms" subtitle="Labeled text input with focus ring + inline error" viewport="700x200"
 */
export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}
