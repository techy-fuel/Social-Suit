import React from 'react';
import { ChevronLeft, ChevronRight, Trash2, Send } from 'lucide-react';
import { IconButton } from '../components/core/IconButton';
import { PlatformIcon } from '../components/data/PlatformIcon';
import { Badge } from '../components/core/Badge';
import { Button } from '../components/core/Button';
import { useWorkspaces } from '../WorkspaceContext';
import { useToast } from '../ToastContext';
import { useApi } from '../hooks';
import { api } from '../api';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

function formatScheduledDate(iso: string | null, dayIndex: number): string {
  if (!iso) return days[dayIndex]; // older posts created before real dates existed
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function CalendarScreen() {
  const { current } = useWorkspaces();
  const key = current!.key;
  const { data, loading, error, refetch } = useApi(() => api.calendar(key), [key]);
  const { showToast } = useToast();
  const [publishingId, setPublishingId] = React.useState<number | null>(null);

  const heatByCell = new Map<string, number>();
  data?.heatmap.forEach((h) => heatByCell.set(`${h.day}-${h.hour}`, h.value));

  async function handleDelete(id: number, platform: string) {
    try {
      const result = await api.deleteScheduledPost(id);
      if (result.platformResult === 'deleted') {
        showToast({ tone: 'positive', title: 'Deleted', description: `Removed here and on ${platform}.` });
      } else if (result.platformResult === 'unsupported') {
        showToast({ tone: 'neutral', title: 'Removed from planner', description: `${platform} doesn't support deleting posts via API — remove it there manually if needed.` });
      } else if (result.platformResult === 'failed') {
        showToast({ tone: 'error', title: 'Removed here, but not on the platform', description: result.platformError });
      }
      refetch();
    } catch (err) {
      showToast({ tone: 'error', title: "Couldn't delete post", description: err instanceof Error ? err.message : String(err) });
    }
  }

  async function handlePublish(id: number, platform: string) {
    setPublishingId(id);
    try {
      const result = await api.publishScheduledPost(id);
      if (result.processing) {
        showToast({ tone: 'neutral', title: 'Still processing', description: 'Instagram is processing the video — try Publish now again shortly.' });
      } else {
        showToast({ tone: 'positive', title: 'Published', description: `Live on ${platform}.` });
      }
      refetch();
    } catch (err) {
      showToast({ tone: 'error', title: "Couldn't publish", description: err instanceof Error ? err.message : String(err) });
    } finally {
      setPublishingId(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-2xl)', color: 'var(--text)' }}>
            Planning calendar
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
            Week of Jul 13 – Jul 19, 2026
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <IconButton icon={<ChevronLeft size={16} />} label="Previous week" />
          <IconButton icon={<ChevronRight size={16} />} label="Next week" />
        </div>
      </div>

      {error && <div style={{ color: 'var(--red)', fontSize: 'var(--text-sm)' }}>Couldn't load calendar: {error}</div>}
      {loading && <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Loading…</div>}

      {data && (
        <>
          <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>Best time to post</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--text-muted)' }}>% of audience online</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `48px repeat(${days.length}, 1fr)`, gap: 4 }}>
              <div />
              {days.map((d) => (
                <div key={d} style={{ textAlign: 'center', fontSize: 'var(--text-2xs)', color: 'var(--text-muted)', fontWeight: 600 }}>{d}</div>
              ))}
              {hours.map((h) => (
                <React.Fragment key={h}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    {h}:00
                  </div>
                  {days.map((d, i) => {
                    const value = heatByCell.get(`${i}-${h}`) ?? 0;
                    return (
                      <div key={d} style={{ height: 16, borderRadius: 4, background: `rgba(44, 82, 239, ${0.08 + value * 0.82})` }} title={`${Math.round(value * 100)}%`} />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)', marginBottom: 10 }}>
              Scheduled this week
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.scheduledPosts.length === 0 && (
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Nothing scheduled yet — create a post from Post composer.</div>
              )}
              {data.scheduledPosts.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
                  <PlatformIcon platform={p.platform} />
                  {p.connectionAccount && (
                    <div style={{ width: 110, fontSize: 'var(--text-2xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.connectionAccount}
                    </div>
                  )}
                  <div style={{ width: 92, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {formatScheduledDate(p.scheduledDate, p.day)} · {p.time}
                  </div>
                  <div style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.caption}
                  </div>
                  <Badge tone={p.status === 'draft' ? 'neutral' : 'brand'}>{p.status === 'draft' ? 'Draft' : 'Scheduled'}</Badge>
                  {p.publishStatus === 'published' && <Badge tone="positive">Published</Badge>}
                  {p.publishStatus === 'failed' && <Badge tone="error">Publish failed</Badge>}
                  {p.publishStatus === 'processing' && <Badge tone="warning">Processing</Badge>}
                  {p.status === 'scheduled' && p.publishStatus !== 'published' && (
                    <span title={!p.mediaUrl ? 'Add an image or video to this post before publishing' : undefined}>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={publishingId === p.id || !p.mediaUrl}
                        onClick={() => handlePublish(p.id, p.platform)}
                      >
                        <Send size={13} style={{ marginRight: 4 }} />
                        {publishingId === p.id ? 'Publishing…' : 'Publish now'}
                      </Button>
                    </span>
                  )}
                  <IconButton
                    size="sm"
                    icon={<Trash2 size={14} />}
                    label="Delete post"
                    onClick={() => handleDelete(p.id, p.platform[0].toUpperCase() + p.platform.slice(1))}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
