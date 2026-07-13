import React from 'react';

export interface AvatarProps {
  /** 1-2 letter initials — this system never uses photography for client/workspace avatars. */
  initials: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tone?: 'blue' | 'neutral';
}

const sizes: Record<string, number> = { sm: 24, md: 32, lg: 40, xl: 56 };

export function Avatar({ initials, size = 'md', tone = 'blue' }: AvatarProps) {
  const dim = sizes[size] || sizes.md;
  const bg = tone === 'blue' ? 'var(--blue-100)' : 'var(--surface-sunken)';
  const fg = tone === 'blue' ? 'var(--accent-primary)' : 'var(--text-muted)';
  return (
    <div
      style={{
        width: dim,
        height: dim,
        borderRadius: '50%',
        background: bg,
        color: fg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-display)',
        fontWeight: 'var(--weight-semibold)',
        fontSize: dim * 0.38,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
