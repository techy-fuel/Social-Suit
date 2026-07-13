import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, LogOut } from 'lucide-react';
import { Sidebar, SidebarScreen } from './components/navigation/Sidebar';
import { TopBar } from './components/navigation/TopBar';
import { WorkspaceSwitcher } from './components/navigation/WorkspaceSwitcher';
import { IconButton } from './components/core/IconButton';
import { Tooltip } from './components/feedback/Tooltip';
import { useWorkspaces } from './WorkspaceContext';
import { useAuth } from './AuthContext';
import { LoginScreen } from './screens/LoginScreen';
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

const paths: Record<SidebarScreen, string> = {
  analytics: '/analytics',
  calendar: '/calendar',
  composer: '/composer',
  inbox: '/inbox',
  smartlinks: '/smartlinks',
  ads: '/ads',
  reporting: '/reporting',
  tracker: '/tracker',
  settings: '/connections',
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

function screenFromPath(pathname: string): SidebarScreen {
  const match = (Object.entries(paths) as [SidebarScreen, string][]).find(([, p]) => p === pathname);
  return match ? match[0] : 'analytics';
}

export default function App() {
  const { authenticated, loading: authLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [wsOpen, setWsOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { workspaces, current, index, setIndex, loading, error } = useWorkspaces();

  React.useEffect(() => {
    if (authenticated && location.pathname === '/') navigate('/analytics', { replace: true });
  }, [authenticated, location.pathname, navigate]);

  if (authLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>
        Loading…
      </div>
    );
  }

  if (!authenticated) {
    return <LoginScreen />;
  }

  const screen = screenFromPath(location.pathname);
  const Screen = screens[screen];

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>
        Loading SocialSuite…
      </div>
    );
  }

  if (error || !current) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--font-body)', color: 'var(--red)', textAlign: 'center', padding: 24 }}>
        Couldn't load workspace data{error ? `: ${error}` : ''}. Confirm the database is connected and seeded.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg)' }}>
      <div className={`ss-sidebar-overlay${sidebarOpen ? ' ss-sidebar-open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <div className={`ss-sidebar${sidebarOpen ? ' ss-sidebar-open' : ''}`}>
        <Sidebar
          active={screen}
          onNavigate={(key) => { navigate(paths[key]); setSidebarOpen(false); }}
          logoSrc={tfMark}
        />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar
          title={titles[screen]}
          right={
            <>
              <span className="ss-hamburger">
                <IconButton icon={<Menu size={16} />} label="Open menu" onClick={() => setSidebarOpen((o) => !o)} />
              </span>
              <Tooltip label="Notifications">
                <IconButton icon={<Bell size={16} />} label="Notifications" />
              </Tooltip>
              <Tooltip label="Log out">
                <IconButton icon={<LogOut size={16} />} label="Log out" onClick={() => logout()} />
              </Tooltip>
            </>
          }
          workspace={
            <div style={{ position: 'relative' }}>
              <WorkspaceSwitcher workspace={current} onClick={() => setWsOpen((o) => !o)} />
              {wsOpen && (
                <div style={{ position: 'absolute', right: 0, top: '110%', width: 220, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', padding: 6, zIndex: 30 }}>
                  {workspaces.map((w, i) => (
                    <button
                      key={w.key}
                      onClick={() => { setIndex(i); setWsOpen(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px',
                        border: 'none', background: i === index ? 'var(--surface-sunken)' : 'transparent',
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
