import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, LogOut, Plus, Building2 } from 'lucide-react';
import { Sidebar, SidebarScreen } from './components/navigation/Sidebar';
import { TopBar } from './components/navigation/TopBar';
import { WorkspaceSwitcher } from './components/navigation/WorkspaceSwitcher';
import { IconButton } from './components/core/IconButton';
import { Tooltip } from './components/feedback/Tooltip';
import { Dialog } from './components/feedback/Dialog';
import { Input } from './components/forms/Input';
import { Button } from './components/core/Button';
import { EmptyState } from './components/feedback/EmptyState';
import { useWorkspaces } from './WorkspaceContext';
import { useAuth } from './AuthContext';
import { AuthGate } from './screens/AuthGate';
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

function CreateWorkspaceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { createWorkspace } = useWorkspaces();
  const [name, setName] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit() {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createWorkspace(name.trim());
      setName('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      title="Add a client workspace"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={!name.trim() || saving} onClick={submit}>{saving ? 'Adding…' : 'Add workspace'}</Button>
        </>
      }
    >
      <Input label="Client name" placeholder="e.g. Sunrise Bakery" value={name} onChange={(e) => setName(e.target.value)} error={error || undefined} />
    </Dialog>
  );
}

function AppShell() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [wsOpen, setWsOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const { workspaces, current, index, setIndex, loading, error } = useWorkspaces();

  React.useEffect(() => {
    if (location.pathname === '/') navigate('/analytics', { replace: true });
  }, [location.pathname, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>
        Loading SocialSuite…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--font-body)', color: 'var(--red)', textAlign: 'center', padding: 24 }}>
        Couldn't load workspace data: {error}
      </div>
    );
  }

  if (!current) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ width: 420 }}>
          <EmptyState
            icon={<Building2 size={22} />}
            title="Add your first client workspace"
            description="SocialSuite is organized by client. Add a workspace to start scheduling posts, tracking analytics, and connecting platforms."
            action={<Button onClick={() => setCreateOpen(true)}>Add workspace</Button>}
          />
        </div>
        <CreateWorkspaceDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      </div>
    );
  }

  const screen = screenFromPath(location.pathname);
  const Screen = screens[screen];

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
                  <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
                  <button
                    onClick={() => { setWsOpen(false); setCreateOpen(true); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px',
                      border: 'none', background: 'transparent', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      textAlign: 'left', color: 'var(--accent-primary)', fontSize: 'var(--text-sm)', fontWeight: 500,
                    }}
                  >
                    <Plus size={16} />
                    Add workspace
                  </button>
                </div>
              )}
            </div>
          }
        />
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {Screen ? <Screen /> : null}
        </div>
      </div>
      <CreateWorkspaceDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

export default function App() {
  const { authenticated, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>
        Loading…
      </div>
    );
  }

  if (!authenticated) {
    return <AuthGate />;
  }

  return <AppShell />;
}
