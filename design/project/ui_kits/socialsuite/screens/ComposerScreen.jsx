function ComposerScreen() {
  const { Button, IconButton, Radio, Textarea, Switch, PlatformIcon, Tag, Badge } = window.SocialSuiteDesignSystem_f55d92;
  const [postType, setPostType] = React.useState('post');
  const [selected, setSelected] = React.useState(['instagram', 'facebook']);
  const [preview, setPreview] = React.useState('mobile');
  const [autoPublish, setAutoPublish] = React.useState(true);
  const caption = "Registration for the Winter Hifz Intensive closes this weekend. Reserve your child's seat before spots fill up — link in bio for details and payment plans.";
  const limit = 2200;
  const over = caption.length > limit;

  const platforms = ['facebook', 'instagram', 'tiktok'];

  function toggle(p) {
    setSelected((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
  }

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <div style={{ flex: 1.4, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-2xl)', color: 'var(--text)' }}>New post</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="sm">Save as draft</Button>
            <Button size="sm" disabled={over}>Schedule</Button>
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

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text)' }}>Caption</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Tag color="var(--blue-sky)">Preset: Enrollment</Tag>
            </div>
          </div>
          <Textarea value={caption} rows={5} readOnly onChange={() => {}} error={over ? `Exceeds Instagram's ${limit.toLocaleString()}-character limit by ${caption.length - limit} characters` : undefined} hint={!over ? `${caption.length.toLocaleString()} / ${limit.toLocaleString()} characters` : undefined} />
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
            <IconButton size="sm" icon={<i data-lucide="smartphone" style={{ width: 14, height: 14 }} />} label="Mobile preview" active={preview === 'mobile'} onClick={() => setPreview('mobile')} />
            <IconButton size="sm" icon={<i data-lucide="monitor" style={{ width: 14, height: 14 }} />} label="Desktop preview" active={preview === 'desktop'} onClick={() => setPreview('desktop')} />
          </div>
        </div>
        <div style={{
          background: 'var(--slate-900)', borderRadius: 'var(--radius-lg)', padding: 16,
          width: preview === 'mobile' ? 220 : '100%',
          margin: preview === 'mobile' ? '0 auto' : 0,
        }}>
          <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--blue-100)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11 }}>HI</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>hira.institute</div>
            </div>
            <div style={{ height: preview === 'mobile' ? 220 : 260, background: 'var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
              <i data-lucide="image" style={{ width: 32, height: 32 }} />
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

window.ComposerScreen = ComposerScreen;
