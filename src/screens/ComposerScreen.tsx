import React from 'react';
import { Smartphone, Monitor, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '../components/core/Button';
import { IconButton } from '../components/core/IconButton';
import { Radio } from '../components/forms/Radio';
import { Textarea } from '../components/forms/Textarea';
import { Select } from '../components/forms/Select';
import { Input } from '../components/forms/Input';
import { PlatformIcon } from '../components/data/PlatformIcon';
import { useWorkspaces } from '../WorkspaceContext';
import { useToast } from '../ToastContext';
import { useApi } from '../hooks';
import { api } from '../api';

const hourOptions = Array.from({ length: 24 }, (_, i) => i);

function formatHour(h: number): string {
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}:00 ${h >= 12 ? 'PM' : 'AM'}`;
}

function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Our day-of-week scheme is 0=Mon..6=Sun; Date#getDay() is 0=Sun..6=Sat, so
// shift it.
function isoDateToDayIndex(iso: string): number {
  return (new Date(`${iso}T00:00:00`).getDay() + 6) % 7;
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

interface ComposerDraft {
  postType: 'post' | 'reel' | 'story';
  connectionIds: number[];
  caption: string;
  date: string;
  hour: string;
  mediaUrl: string | null;
  mediaPath: string | null;
  mediaType: 'image' | 'video' | null;
  mediaStorage: string | null;
}

function draftKey(workspaceKey: string): string {
  return `ss-composer-draft:${workspaceKey}`;
}

function loadDraft(workspaceKey: string): ComposerDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(workspaceKey));
    return raw ? (JSON.parse(raw) as ComposerDraft) : null;
  } catch {
    return null;
  }
}

export function ComposerScreen() {
  const { current } = useWorkspaces();
  const { showToast } = useToast();
  const { data: connections } = useApi(() => api.connections(current!.key), [current?.key]);
  const connectedAccounts = (connections || []).filter((c) => c.status === 'connected');

  const [postType, setPostType] = React.useState<'post' | 'reel' | 'story'>('post');
  const [connectionIds, setConnectionIds] = React.useState<number[]>([]);
  const [preview, setPreview] = React.useState<'mobile' | 'desktop'>('mobile');
  const [caption, setCaption] = React.useState('');
  const [date, setDate] = React.useState(tomorrowIso());
  const [hour, setHour] = React.useState('9');
  const [submitting, setSubmitting] = React.useState(false);
  const [savingDraft, setSavingDraft] = React.useState(false);
  const [publishingNow, setPublishingNow] = React.useState(false);
  const [mediaUrl, setMediaUrl] = React.useState<string | null>(null);
  const [mediaPath, setMediaPath] = React.useState<string | null>(null);
  const [mediaType, setMediaType] = React.useState<'image' | 'video' | null>(null);
  const [mediaStorage, setMediaStorage] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const loadedWorkspaceKey = React.useRef<string | null>(null);

  const limit = 2200;
  const over = caption.length > limit;

  // Restore an unsaved draft (survives an accidental refresh/close) the
  // first time we see each workspace.
  React.useEffect(() => {
    if (!current || loadedWorkspaceKey.current === current.key) return;
    loadedWorkspaceKey.current = current.key;
    const draft = loadDraft(current.key);
    if (!draft) return;
    setPostType(draft.postType);
    setConnectionIds(draft.connectionIds || []);
    setCaption(draft.caption);
    setDate(draft.date);
    setHour(draft.hour);
    setMediaUrl(draft.mediaUrl);
    setMediaPath(draft.mediaPath);
    setMediaType(draft.mediaType);
    setMediaStorage(draft.mediaStorage);
  }, [current]);

  React.useEffect(() => {
    if (!current || loadedWorkspaceKey.current !== current.key) return;
    const draft: ComposerDraft = { postType, connectionIds, caption, date, hour, mediaUrl, mediaPath, mediaType, mediaStorage };
    try {
      localStorage.setItem(draftKey(current.key), JSON.stringify(draft));
    } catch {
      // Storage full/unavailable — losing autosave isn't worth surfacing an error for.
    }
  }, [current, postType, connectionIds, caption, date, hour, mediaUrl, mediaPath, mediaType, mediaStorage]);

  function toggleConnection(id: number) {
    setConnectionIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !current) return;
    const isVideo = file.type.startsWith('video/');

    if (isVideo) {
      if (file.size > 200 * 1024 * 1024) {
        showToast({ tone: 'error', title: 'Video too large', description: 'Max 200MB.' });
        return;
      }
      setUploading(true);
      try {
        const { uploadUrl, publicUrl, path } = await api.getVideoUploadUrl(current.key, { filename: file.name, contentType: file.type });
        const put = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
        if (!put.ok) throw new Error(`Upload to storage failed (${put.status}).`);
        setMediaUrl(publicUrl);
        setMediaPath(path);
        setMediaType('video');
        setMediaStorage('r2');
      } catch (err) {
        showToast({ tone: 'error', title: "Couldn't upload video", description: err instanceof Error ? err.message : String(err) });
      } finally {
        setUploading(false);
      }
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast({ tone: 'error', title: 'Image too large', description: 'Max 8MB.' });
      return;
    }
    setUploading(true);
    try {
      const dataBase64 = await readFileAsBase64(file);
      const { url, path } = await api.uploadMedia(current.key, { filename: file.name, contentType: file.type, dataBase64 });
      setMediaUrl(url);
      setMediaPath(path);
      setMediaType('image');
      setMediaStorage('supabase');
    } catch (err) {
      showToast({ tone: 'error', title: "Couldn't upload image", description: err instanceof Error ? err.message : String(err) });
    } finally {
      setUploading(false);
    }
  }

  async function submitPost(status: 'scheduled' | 'draft') {
    if (!current || over || !caption.trim() || connectionIds.length === 0) return;
    const setBusy = status === 'draft' ? setSavingDraft : setSubmitting;
    setBusy(true);
    try {
      const h = Number(hour);
      const time = formatHour(h);
      const targets = connectedAccounts.filter((c) => connectionIds.includes(c.id));
      await Promise.all(targets.map((t) =>
        api.scheduleCalendarPost(current.key, { day: isoDateToDayIndex(date), hour: h, time, platform: t.platform, connectionId: t.id, caption, status, mediaUrl, mediaPath, mediaType, mediaStorage, scheduledDate: date })
      ));
      showToast({
        tone: 'positive',
        title: status === 'draft' ? 'Draft saved' : `Scheduled to ${targets.length} account${targets.length === 1 ? '' : 's'}`,
        description: `${formatDate(date)} · ${time} — check Planning calendar.`,
      });
      resetForm();
    } catch (err) {
      showToast({ tone: 'error', title: `Couldn't ${status === 'draft' ? 'save draft' : 'schedule post'}`, description: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
    }
  }

  async function publishNow() {
    if (!current || over || !caption.trim() || !mediaUrl || connectionIds.length === 0) return;
    setPublishingNow(true);
    try {
      const h = Number(hour);
      const time = formatHour(h);
      const targets = connectedAccounts.filter((c) => connectionIds.includes(c.id));

      const outcomes = await Promise.allSettled(targets.map(async (t) => {
        const created = await api.scheduleCalendarPost(current.key, { day: isoDateToDayIndex(date), hour: h, time, platform: t.platform, connectionId: t.id, caption, status: 'scheduled', mediaUrl, mediaPath, mediaType, mediaStorage, scheduledDate: date });
        const result = await api.publishScheduledPost(created.id);
        return { target: t, processing: !!result.processing };
      }));

      const published = outcomes.filter((o) => o.status === 'fulfilled' && !o.value.processing).length;
      const processing = outcomes.filter((o) => o.status === 'fulfilled' && o.value.processing).length;
      const failed = outcomes.filter((o): o is PromiseRejectedResult => o.status === 'rejected');

      if (failed.length === 0 && processing === 0) {
        showToast({ tone: 'positive', title: 'Published', description: `Live on ${published} account${published === 1 ? '' : 's'}.` });
      } else if (failed.length === 0) {
        showToast({ tone: 'neutral', title: 'Mostly done', description: `${published} published, ${processing} still processing (Instagram video) — check Planning calendar.` });
      } else {
        showToast({
          tone: 'error',
          title: `${published + processing}/${targets.length} succeeded`,
          description: failed.map((f) => (f.reason instanceof Error ? f.reason.message : String(f.reason))).join(' · '),
        });
      }
      resetForm();
    } catch (err) {
      showToast({ tone: 'error', title: "Couldn't publish", description: err instanceof Error ? err.message : String(err) });
    } finally {
      setPublishingNow(false);
    }
  }

  function resetForm() {
    if (!current) return;
    try {
      localStorage.removeItem(draftKey(current.key));
    } catch {
      // ignore
    }
    setCaption('');
    setMediaUrl(null);
    setMediaPath(null);
    setMediaType(null);
    setMediaStorage(null);
  }

  return (
    <div className="ss-stack-mobile" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <div style={{ flex: 1.4, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-2xl)', color: 'var(--text)' }}>New post</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="sm" disabled={over || !caption.trim() || connectionIds.length === 0 || savingDraft} onClick={() => submitPost('draft')}>
              {savingDraft ? 'Saving…' : 'Save as draft'}
            </Button>
            <Button variant="secondary" size="sm" disabled={over || !caption.trim() || connectionIds.length === 0 || submitting} onClick={() => submitPost('scheduled')}>
              {submitting ? 'Scheduling…' : 'Schedule'}
            </Button>
            <span title={!caption.trim() ? 'Write a caption above first.' : connectionIds.length === 0 ? 'Select at least one connected account above.' : !mediaUrl ? 'Add an image or video above — publishing requires media right now.' : undefined}>
              <Button size="sm" disabled={over || !caption.trim() || connectionIds.length === 0 || publishingNow || !mediaUrl} onClick={publishNow}>
                {publishingNow ? 'Publishing…' : `Publish now${connectionIds.length > 1 ? ` (${connectionIds.length})` : ''}`}
              </Button>
            </span>
          </div>
        </div>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 18 }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
            Accounts {connectionIds.length > 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({connectionIds.length} selected)</span>}
          </div>
          {connectedAccounts.length === 0 ? (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              No connected accounts yet — connect Facebook or Instagram pages from the Connections page first.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {connectedAccounts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggleConnection(c.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                    borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    border: `1.5px solid ${connectionIds.includes(c.id) ? 'var(--accent-primary)' : 'var(--border)'}`,
                    background: connectionIds.includes(c.id) ? 'var(--blue-50)' : 'var(--card)',
                  }}
                >
                  <PlatformIcon platform={c.platform} size={16} />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text)' }}>{c.account || c.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 18 }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Post type</div>
          <div style={{ display: 'flex', gap: 18 }}>
            <Radio name="type" label="Post" checked={postType === 'post'} onChange={() => setPostType('post')} />
            <Radio name="type" label="Reel" checked={postType === 'reel'} onChange={() => setPostType('reel')} />
            <Radio name="type" label="Story" checked={postType === 'story'} onChange={() => setPostType('story')} />
          </div>
        </div>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 18 }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Media</div>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} style={{ display: 'none' }} />
          {mediaUrl ? (
            <div style={{ position: 'relative', width: 140 }}>
              {mediaType === 'video' ? (
                <video src={mediaUrl} controls style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
              ) : (
                <img src={mediaUrl} alt="" style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
              )}
              <button
                onClick={() => {
                  if (mediaPath) api.discardMedia(mediaPath, mediaStorage || undefined).catch(() => {});
                  setMediaUrl(null);
                  setMediaPath(null);
                  setMediaType(null);
                  setMediaStorage(null);
                }}
                style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: 'var(--slate-900)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                aria-label="Remove media"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <Button variant="secondary" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
              {uploading ? 'Uploading…' : 'Upload image or video'}
            </Button>
          )}
        </div>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 18, display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <Input label="Date" type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <Select label="Time" value={hour} onChange={(e) => setHour(e.target.value)} options={hourOptions.map((h) => ({ value: String(h), label: formatHour(h) }))} />
          </div>
        </div>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 18 }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Caption</div>
          <Textarea
            value={caption}
            placeholder="Write a caption…"
            rows={5}
            onChange={(e) => setCaption(e.target.value)}
            error={over ? `Exceeds Instagram's ${limit.toLocaleString()}-character limit by ${caption.length - limit} characters` : undefined}
            hint={!over ? `${caption.length.toLocaleString()} / ${limit.toLocaleString()} characters` : undefined}
          />
        </div>

      </div>

      <div style={{ flex: 1, position: 'sticky', top: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)' }}>Live preview</div>
          <div style={{ display: 'flex', gap: 4 }}>
            <IconButton size="sm" icon={<Smartphone size={14} />} label="Mobile preview" active={preview === 'mobile'} onClick={() => setPreview('mobile')} />
            <IconButton size="sm" icon={<Monitor size={14} />} label="Desktop preview" active={preview === 'desktop'} onClick={() => setPreview('desktop')} />
          </div>
        </div>
        <div style={{
          background: 'var(--slate-900)', borderRadius: 'var(--radius-lg)', padding: 16,
          width: preview === 'mobile' ? 220 : '100%',
          margin: preview === 'mobile' ? '0 auto' : 0,
        }}>
          <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--blue-100)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11 }}>{current?.initials}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{current?.name.toLowerCase().replace(/\s+/g, '.')}</div>
            </div>
            <div style={{ height: preview === 'mobile' ? 220 : 260, background: 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', overflow: 'hidden' }}>
              {mediaUrl ? (
                mediaType === 'video'
                  ? <video src={mediaUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <img src={mediaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : <ImageIcon size={32} />}
            </div>
            <div style={{ padding: 10, fontSize: 11, color: 'var(--text)', lineHeight: 1.5 }}>
              {caption.slice(0, 120)}…
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
