import React from 'react';
import { FileText, Presentation, LayoutDashboard, BarChart2 } from 'lucide-react';
import { Button } from '../components/core/Button';
import { Card } from '../components/core/Card';
import { Badge } from '../components/core/Badge';
import { useWorkspaces } from '../WorkspaceContext';
import { useToast } from '../ToastContext';
import { useApi } from '../hooks';
import { api } from '../api';

const reportTypes = [
  { icon: FileText, title: 'PDF report', desc: 'Branded performance summary for a client stakeholder.', kind: 'PDF' },
  { icon: Presentation, title: 'PPT report', desc: 'Slide deck export for review meetings.', kind: 'PPT' },
  { icon: LayoutDashboard, title: 'Campaign dashboard', desc: 'Live shareable dashboard link, no login required.', kind: 'Dashboard' },
  { icon: BarChart2, title: 'Custom chart builder', desc: 'Pick metrics, date range and chart type.', kind: 'Chart' },
];

export function ReportingScreen() {
  const { current } = useWorkspaces();
  const key = current!.key;
  const { data: reports, loading, error, refetch } = useApi(() => api.reports(key), [key]);
  const [creating, setCreating] = React.useState<string | null>(null);
  const { showToast } = useToast();

  async function create(kind: string, title: string) {
    if (!current) return;
    setCreating(kind);
    try {
      await api.createReport(current.key, `${current.name} — ${title}`, kind);
      showToast({ tone: 'positive', title: 'Report created', description: `${current.name} — ${title}` });
      refetch();
    } catch (err) {
      showToast({ tone: 'error', title: "Couldn't create report", description: err instanceof Error ? err.message : String(err) });
    } finally {
      setCreating(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-2xl)', color: 'var(--text)' }}>Reporting</div>

      <div className="ss-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {reportTypes.map((r) => {
          const Icon = r.icon;
          return (
            <Card key={r.kind} padding={16}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--blue-100)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Icon size={18} />
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>{r.title}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4, marginBottom: 12 }}>{r.desc}</div>
              <Button size="sm" variant="secondary" fullWidth disabled={creating === r.kind} onClick={() => create(r.kind, new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))}>
                {creating === r.kind ? 'Creating…' : 'Create'}
              </Button>
            </Card>
          );
        })}
      </div>

      <div>
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Recent reports</div>

        {error && <div style={{ color: 'var(--red)', fontSize: 'var(--text-sm)' }}>Couldn't load reports: {error}</div>}
        {loading && <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Loading…</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reports?.map((r) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
              <FileText size={16} color="var(--text-muted)" />
              <div style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{r.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>{r.kind} · {r.date}</div>
              <Badge tone={r.status === 'sent' ? 'positive' : 'neutral'} dot>{r.status === 'sent' ? 'Sent' : 'Draft'}</Badge>
            </div>
          ))}
          {reports && reports.length === 0 && (
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>No reports yet — create one above.</div>
          )}
        </div>
      </div>
    </div>
  );
}
