import React from 'react';
import { GripVertical } from 'lucide-react';
import { Button } from '../components/core/Button';
import { IconButton } from '../components/core/IconButton';
import { Dialog } from '../components/feedback/Dialog';
import { Input } from '../components/forms/Input';
import { useWorkspaces } from '../WorkspaceContext';
import { useToast } from '../ToastContext';
import { useApi } from '../hooks';
import { api } from '../api';

export function SmartLinksScreen() {
  const { current } = useWorkspaces();
  const key = current!.key;
  const { data: links, loading, error, refetch } = useApi(() => api.smartlinks(key), [key]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [label, setLabel] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const { showToast } = useToast();

  const totalClicks = (links || []).reduce((s, l) => s + l.clicks, 0);

  async function addLink() {
    if (!current || !label.trim()) return;
    setSaving(true);
    try {
      await api.addSmartlink(current.key, label.trim());
      showToast({ tone: 'positive', title: 'Link added', description: label.trim() });
      setLabel('');
      setDialogOpen(false);
      refetch();
    } catch (err) {
      showToast({ tone: 'error', title: "Couldn't add link", description: err instanceof Error ? err.message : String(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="ss-stack-mobile" style={{ display: 'flex', gap: 24 }}>
      <div style={{ flex: 1.4, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-2xl)', color: 'var(--text)' }}>SmartLinks</div>
          <Button size="sm" onClick={() => setDialogOpen(true)}>Add link</Button>
        </div>

        {error && <div style={{ color: 'var(--red)', fontSize: 'var(--text-sm)' }}>Couldn't load links: {error}</div>}
        {loading && <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Loading…</div>}

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 18 }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Links</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {links?.map((l) => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', fontWeight: 500 }}>{l.label}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--blue-sky)' }}>{l.clicks.toLocaleString()} clicks</div>
                  <IconButton size="sm" icon={<GripVertical size={14} />} label="Reorder" />
                </div>
              </div>
            ))}
            {links && links.length === 0 && (
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>No links yet — add one to start tracking clicks.</div>
            )}
          </div>
        </div>
        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 18 }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Click analytics</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-3xl)', color: 'var(--text)' }}>{totalClicks.toLocaleString()}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--blue-sky)' }}>+18.2% vs last 28 days</div>
        </div>
      </div>

      <div style={{ width: 260 }}>
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Phone preview</div>
        <div style={{ background: 'var(--slate-900)', borderRadius: 'var(--radius-xl)', padding: 12 }}>
          <div style={{ background: 'linear-gradient(180deg, var(--blue-royal), var(--blue-sky))', borderRadius: 'var(--radius-lg)', padding: '28px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent-primary)' }}>{current?.initials}</div>
            <div style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14 }}>{current?.name}</div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {links?.map((l) => (
                <div key={l.id} style={{ background: 'rgba(255,255,255,0.92)', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: 11, color: 'var(--text)', textAlign: 'center', fontWeight: 500 }}>
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        title="Add a SmartLink"
        onClose={() => setDialogOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button disabled={!label.trim() || saving} onClick={addLink}>{saving ? 'Adding…' : 'Add link'}</Button>
          </>
        }
      >
        <Input label="Link label" placeholder="e.g. Enroll for Winter Hifz Intensive" value={label} onChange={(e) => setLabel(e.target.value)} />
      </Dialog>
    </div>
  );
}
