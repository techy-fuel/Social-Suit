import React from 'react';
import { Smartphone, Monitor, Image as ImageIcon } from 'lucide-react';
import { Button } from '../components/core/Button';
import { IconButton } from '../components/core/IconButton';
import { Radio } from '../components/forms/Radio';
import { Textarea } from '../components/forms/Textarea';
import { Select } from '../components/forms/Select';
import { Switch } from '../components/forms/Switch';
import { PlatformIcon, Platform } from '../components/data/PlatformIcon';
import { Tag } from '../components/core/Tag';
import { useWorkspaces } from '../WorkspaceContext';
import { useToast } from '../ToastContext';
import { api } from '../api';

const platforms: Platform[] = ['facebook', 'instagram', 'tiktok'];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hourOptions = Array.from({ length: 12 }, (_, i) => i + 8);

export function ComposerScreen() {
  const { current } = useWorkspaces();
  const { showToast } = useToast();
  const [postType, setPostType] = React.useState<'post' | 'reel' | 'story'>('post');
  const [selected, setSelected] = React.useState<Platform[]>(['instagram', 'facebook']);
  const [preview, setPreview] = React.useState<'mobile' | 'desktop'>('mobile');
  const [autoPublish, setAutoPublish] = React.useState(true);
  const [caption, setCaption] = React.useState(
    "Registration for the Winter Hifz Intensive closes this weekend. Reserve your child's seat before spots fill up — link in bio for details and payment plans."
  );
  const [day, setDay] = React.useState('1');
  const [hour, setHour] = React.useState('9');
  const [submitting, setSubmitting] = React.useState(false);

  const limit = 2200;
  const over = caption.length > limit;

  function toggle(p: Platform) {
    setSelected((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
  }

  const [savingDraft, setSavingDraft] = React.useState(false);

  async function submitPost(status: 'scheduled' | 'draft') {
    if (!current || over || !caption.trim() || selected.length === 0) return;
    const setBusy = status === 'draft' ? setSavingDraft : setSubmitting;
    setBusy(true);
    try {
      const h = Number(hour);
      const time = `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}`;
      await api.scheduleCalendarPost(current.key, { day: Number(day), hour: h, time, platform: selected[0], caption, status });
      showToast({
        tone: 'positive',
        title: status === 'draft' ? 'Draft saved' : 'Post scheduled',
        description: `${days[Number(day)]} · ${time} — check Planning calendar.`,
      });
    } catch (err) {
      showToast({ tone: 'error', title: `Couldn't ${status === 'draft' ? 'save draft' : 'schedule post'}`, description: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ss-stack-mobile" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <div style={{ flex: 1.4, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-2xl)', color: 'var(--text)' }}>New post</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="sm" disabled={over || savingDraft || selected.length === 0} onClick={() => submitPost('draft')}>
              {savingDraft ? 'Saving…' : 'Save as draft'}
            </Button>
            <Button size="sm" disabled={over || submitting || selected.length === 0} onClick={() => submitPost('scheduled')}>
              {submitting ? 'Scheduling…' : 'Schedule'}
            </Button>
          </div>
        </div>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 18 }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Platforms</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => toggle(p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  borderRadius: 'var(--radius-md)', cursor: 'pointer',
                  border: `1.5px solid ${selected.includes(p) ? 'var(--accent-primary)' : 'var(--border)'}`,
                  background: selected.includes(p) ? 'var(--blue-50)' : 'var(--card)',
                }}
              >
                <PlatformIcon platform={p} size={16} />
                <span style={{ fontSize: 'var(--text-xs)', textTransform: 'capitalize', color: 'var(--text)' }}>{p}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 18 }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Post type</div>
          <div style={{ display: 'flex', gap: 18 }}>
            <Radio name="type" label="Post" checked={postType === 'post'} onChange={() => setPostType('post')} />
            <Radio name="type" label="Reel" checked={postType === 'reel'} onChange={() => setPostType('reel')} />
            <Radio name="type" label="Story" checked={postType === 'story'} onChange={() => setPostType('story')} />
          </div>
        </div>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 18, display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <Select label="Day" value={day} onChange={(e) => setDay(e.target.value)} options={days.map((d, i) => ({ value: String(i), label: d }))} />
          </div>
          <div style={{ flex: 1 }}>
            <Select label="Time" value={hour} onChange={(e) => setHour(e.target.value)} options={hourOptions.map((h) => ({ value: String(h), label: `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'}` }))} />
          </div>
        </div>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)' }}>Caption</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Tag color="var(--blue-sky)">Preset: Enrollment</Tag>
            </div>
          </div>
          <Textarea
            value={caption}
            rows={5}
            onChange={(e) => setCaption(e.target.value)}
            error={over ? `Exceeds Instagram's ${limit.toLocaleString()}-character limit by ${caption.length - limit} characters` : undefined}
            hint={!over ? `${caption.length.toLocaleString()} / ${limit.toLocaleString()} characters` : undefined}
          />
        </div>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>Auto-publish</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {autoPublish ? 'This post goes live at the scheduled time.' : 'You will be notified to publish this manually.'}
            </div>
          </div>
          <Switch checked={autoPublish} onChange={setAutoPublish} />
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
            <div style={{ height: preview === 'mobile' ? 220 : 260, background: 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
              <ImageIcon size={32} />
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
