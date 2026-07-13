import React from 'react';

/* Lucide dropped brand/logo glyphs — every entry below is a verified generic
   glyph, never an assumed brand-name icon id. */
const platforms = {
  facebook: { icon: 'thumbs-up', color: 'var(--blue-royal)' },
  instagram: { icon: 'camera', color: 'var(--blue-sky)' },
  tiktok: { icon: 'music-2', color: 'var(--slate-900)' },
  threads: { icon: 'at-sign', color: 'var(--slate-700)' },
  x: { icon: 'hash', color: 'var(--slate-900)' },
  bluesky: { icon: 'cloud', color: 'var(--blue-400)' },
  linkedin: { icon: 'briefcase', color: 'var(--blue-700)' },
  pinterest: { icon: 'pin', color: 'var(--red)' },
  google: { icon: 'chrome', color: 'var(--blue-500)' },
  youtube: { icon: 'play', color: 'var(--red)' },
  twitch: { icon: 'gamepad-2', color: 'var(--blue-600)' },
};

export function PlatformIcon({ platform, size = 18 }) {
  const p = platforms[platform] || { icon: 'globe', color: 'var(--text-muted)' };
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
      <i data-lucide={p.icon} style={{ width: size, height: size }} />
    </span>
  );
}
