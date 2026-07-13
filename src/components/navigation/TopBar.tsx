import React from 'react';

export interface TopBarProps {
  title: string;
  /** Typically a <WorkspaceSwitcher>. */
  workspace?: React.ReactNode;
  /** Extra actions left of the workspace switcher (search, notifications icon buttons). */
  right?: React.ReactNode;
}

export function TopBar({ title, workspace, right }: TopBarProps) {
  return (
    <div
      style={{
        height: 'var(--topbar-h)',
        background: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        fontFamily: 'var(--font-body)',
        flexShrink: 0,
      }}
    >
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-lg)', color: 'var(--text)' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {right}
        {workspace}
      </div>
    </div>
  );
}
