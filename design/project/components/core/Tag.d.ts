export interface TagProps {
  children: React.ReactNode;
  onRemove?: () => void;
  /** Small leading dot color — e.g. per-hashtag or per-platform tint. */
  color?: string;
}
