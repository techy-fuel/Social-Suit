export interface AvatarProps {
  /** 1-2 letter initials — this system never uses photography for client/workspace avatars. */
  initials: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tone?: 'blue' | 'neutral';
}
