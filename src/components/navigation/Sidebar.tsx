import React from 'react';
import { BarChart3, CalendarDays, Send, Inbox, Link2, Megaphone, FileText, Hash, PlugZap, LucideIcon } from 'lucide-react';

export type SidebarScreen = 'analytics' | 'calendar' | 'composer' | 'inbox' | 'smartlinks' | 'ads' | 'reporting' | 'tracker' | 'settings';

export interface SidebarProps {
  active?: SidebarScreen;
  onNavigate?: (key: SidebarScreen) => void;
  /** Path to the TF mark SVG, relative to the app. Falls back to an inline "TF" gradient mark if omitted. */
  logoSrc?: string;
}

const items: { key: SidebarScreen; label: string; icon: LucideIcon }[] = [
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'calendar', label: 'Planning calendar', icon: CalendarDays },
  { key: 'composer', label: 'Post composer', icon: Send },
  { key: 'inbox', label: 'Inbox', icon: Inbox },
  { key: 'smartlinks', label: 'SmartLinks', icon: Link2 },
  { key: 'ads', label: 'Ads', icon: Megaphone },
  { key: 'reporting', label: 'Reporting', icon: FileText },
  { key: 'tracker', label: 'Hashtag tracker', icon: Hash },
  { key: 'settings', label: 'Connections', icon: PlugZap },
];

export function Sidebar({ active = 'analytics', onNavigate, logoSrc }: SidebarProps) {
  const [logoFailed, setLogoFailed] = React.useState(false);
  const showImg = logoSrc && !logoFailed;
  return (
    <div
      style={{
        width: 'var(--sidebar-w)',
        background: 'var(--surface-nav)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '18px 12px',
        gap: 2,
        fontFamily: 'var(--font-body)',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 20px' }}>
        {showImg ? (
          <img src={logoSrc} alt="" onError={() => setLogoFailed(true)} style={{ width: 28, height: 28, borderRadius: 8 }} />
        ) : (
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--blue-royal), var(--blue-sky))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
            TF
          </div>
        )}
        <div style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>
          SocialSuite
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 10, color: 'var(--text-on-dark-muted)' }}>by TechyFuel</div>
        </div>
      </div>
      {items.map((it) => {
        const isActive = it.key === active;
        const Icon = it.icon;
        return (
          <button
            key={it.key}
            onClick={() => onNavigate && onNavigate(it.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              background: isActive ? 'var(--surface-nav-active)' : 'transparent',
              color: isActive ? '#fff' : 'var(--text-on-dark-muted)',
              fontSize: 'var(--text-sm)',
              fontWeight: isActive ? 'var(--weight-medium)' : 'var(--weight-regular)',
              textAlign: 'left',
              width: '100%',
              transition: 'background var(--duration-fast) var(--ease-standard)',
            }}
          >
            <Icon size={16} />
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
