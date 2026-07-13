import React from 'react';
import { Button } from '../components/core/Button';
import { Input } from '../components/forms/Input';
import { Select } from '../components/forms/Select';
import { Badge } from '../components/core/Badge';
import { Table } from '../components/data/Table';
import { useWorkspaces } from '../WorkspaceContext';
import { useToast } from '../ToastContext';
import { useApi } from '../hooks';
import { api } from '../api';

export function TrackerScreen() {
  const { current } = useWorkspaces();
  const key = current!.key;
  const { data: sessions, loading, error, refetch } = useApi(() => api.trackerSessions(key), [key]);

  const [hashtag, setHashtag] = React.useState('');
  const [platform, setPlatform] = React.useState('instagram');
  const [duration, setDuration] = React.useState('7');
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const { showToast } = useToast();

  async function startTracking() {
    if (!current) return;
    const tag = hashtag.trim();
    if (!tag) {
      setFormError('Enter a hashtag to track.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const fullTag = tag.startsWith('#') ? tag : `#${tag}`;
      await api.startTracking(current.key, fullTag, platform, duration);
      showToast({ tone: 'positive', title: 'Tracking started', description: fullTag });
      setHashtag('');
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-2xl)', color: 'var(--text)' }}>Hashtag tracker</div>

      <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 18 }}>
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Start a new tracking session</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <Input label="Hashtag" placeholder="#HIRAOpenDay" value={hashtag} onChange={(e) => setHashtag(e.target.value)} error={formError || undefined} />
          <Select
            label="Platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            options={[{ value: 'instagram', label: 'Instagram' }, { value: 'tiktok', label: 'TikTok' }, { value: 'facebook', label: 'Facebook' }, { value: 'all', label: 'All platforms' }]}
          />
          <Select
            label="Duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            options={[{ value: '7', label: '7 days' }, { value: '30', label: '30 days' }, { value: '90', label: '90 days' }]}
          />
          <Button disabled={submitting} onClick={startTracking}>{submitting ? 'Starting…' : 'Start tracking'}</Button>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Sessions</div>

        {error && <div style={{ color: 'var(--red)', fontSize: 'var(--text-sm)', marginBottom: 8 }}>Couldn't load sessions: {error}</div>}
        {loading && <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 8 }}>Loading…</div>}

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: '6px 18px' }}>
          <Table
            columns={[
              { key: 'hashtag', label: 'Hashtag', mono: true },
              { key: 'platform', label: 'Platform' },
              { key: 'started', label: 'Started', mono: true },
              { key: 'mentions', label: 'Mentions', align: 'right', mono: true },
              { key: 'status', label: 'Status' },
            ]}
            rows={(sessions || []).map((s) => ({
              ...s,
              mentions: s.mentions.toLocaleString(),
              status: <Badge tone={s.status === 'active' ? 'positive' : 'neutral'} dot>{s.status === 'active' ? 'Active' : 'Completed'}</Badge>,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
