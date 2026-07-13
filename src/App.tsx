import React from 'react';
import { Bell } from 'lucide-react';
import { Sidebar, SidebarScreen } from './components/navigation/Sidebar';
import { TopBar } from './components/navigation/TopBar';
import { WorkspaceSwitcher } from './components/navigation/WorkspaceSwitcher';
import { IconButton } from './components/core/IconButton';
import { workspaces } from './mock-data';
import tfMark from './assets/logo/tf-mark.svg';

import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { ComposerScreen } from './screens/ComposerScreen';
import { InboxScreen } from './screens/InboxScreen';
import { SmartLinksScreen } from './screens/SmartLinksScreen';
import { AdsScreen } from './screens/AdsScreen';
import { ReportingScreen } from './screens/ReportingScreen';
import { TrackerScreen } from './screens/TrackerScreen';
import { ConnectionsScreen } from './screens/ConnectionsScreen';

const titles: Record<SidebarScreen, string> = {
  analytics: 'Page overview',
  calendar: 'Planning calendar',
  composer: 'Post composer',
  inbox: 'Unified inbox',
  smartlinks: 'SmartLinks',
  ads: 'Ads',
  reporting: 'Reporting',
  tracker: 'Hashtag tracker',
  settings: 'Connections',
};

const screens: Record<SidebarScreen, React.ComponentType> = {
  analytics: AnalyticsScreen,
  calendar: CalendarScreen,
  composer: ComposerScreen,
  inbox: InboxScreen,
  smartlinks: SmartLinksScreen,
  ads: AdsScreen,
  reporting: ReportingScreen,
  tracker: TrackerScreen,
  settings: ConnectionsScreen,
};

export default function App() {
  const [screen, setScreen] = React.useState<SidebarScreen>('analytics');
  const [wsIndex, setWsIndex] = React.useState(0);
  const [wsOpen, setWsOpen] = React.useState(false);

  const Screen = screens[screen];
  const ws = workspaces[wsIndex];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)' }}>
      <Sidebar active={screen} onNavigate={setScreen} logoSrc={tfMark} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar
          title={titles[screen]}
          right={<IconButton icon={<Bell size={16} />} label="Notifications" />}
          workspace={
            <div style={{ position: 'relative' }}>
              <WorkspaceSwitcher workspace={ws} onClick={() => setWsOpen((o) => !o)} />
              {wsOpen && (
                <div style={{ position: 'absolute', right: 0, top: '110%', width: 220, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', padding: 6, zIndex: 30 }}>
                  {workspaces.map((w, i) => (
                    <button
                      key={w.key}
                      onClick={() => { setWsIndex(i); setWsOpen(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px',
                        border: 'none', background: i === wsIndex ? 'var(--surface-sunken)' : 'transparent',
                        borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--blue-100)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 10 }}>{w.initials}</span>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{w.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          }
        />
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {Screen ? <Screen /> : null}
        </div>
      </div>
    </div>
  );
}
