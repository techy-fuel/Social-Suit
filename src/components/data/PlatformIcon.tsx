import React from 'react';
import { ThumbsUp, Camera, Music2, AtSign, Hash, Cloud, Briefcase, Pin, Chrome, Play, Gamepad2, Globe, LucideIcon } from 'lucide-react';

export type Platform = 'facebook' | 'instagram' | 'tiktok' | 'threads' | 'x' | 'bluesky' | 'linkedin' | 'pinterest' | 'google' | 'youtube' | 'twitch';

export interface PlatformIconProps {
  platform: Platform;
  size?: number;
}

/* Lucide dropped brand/logo glyphs — every entry below is a verified generic
   glyph, never an assumed brand-name icon id. */
const platforms: Record<string, { icon: LucideIcon; color: string }> = {
  facebook: { icon: ThumbsUp, color: 'var(--blue-royal)' },
  instagram: { icon: Camera, color: 'var(--blue-sky)' },
  tiktok: { icon: Music2, color: 'var(--slate-900)' },
  threads: { icon: AtSign, color: 'var(--slate-700)' },
  x: { icon: Hash, color: 'var(--slate-900)' },
  bluesky: { icon: Cloud, color: 'var(--blue-400)' },
  linkedin: { icon: Briefcase, color: 'var(--blue-700)' },
  pinterest: { icon: Pin, color: 'var(--red)' },
  google: { icon: Chrome, color: 'var(--blue-500)' },
  youtube: { icon: Play, color: 'var(--red)' },
  twitch: { icon: Gamepad2, color: 'var(--blue-600)' },
};

export function PlatformIcon({ platform, size = 18 }: PlatformIconProps) {
  const p = platforms[platform] || { icon: Globe, color: 'var(--text-muted)' };
  const Icon = p.icon;
  return (
    <span
      style={{
        width: size + 8,
        height: size + 8,
        borderRadius: 'var(--radius-sm)',
        background: 'var(--surface-sunken)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: p.color,
        flexShrink: 0,
      }}
    >
      <Icon size={size} />
    </span>
  );
}
