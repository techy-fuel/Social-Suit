import React from 'react';
import { ProgressBar } from '../components/feedback/ProgressBar';
import { Badge } from '../components/core/Badge';
import { Select } from '../components/forms/Select';
import { PlatformIcon, Platform } from '../components/data/PlatformIcon';
import { adsCampaigns } from '../mock-data';

// Same non-brand glyph convention as PlatformIcon — Meta/Google/TikTok Ads
// reuse the platform chip rather than an assumed brand-name icon id.
const channelPlatform: Record<string, Platform> = {
  'Meta Ads': 'facebook',
  'Google Ads': 'google',
  'TikTok Ads': 'tiktok',
};

export function AdsScreen() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-2xl)', color: 'var(--text)' }}>Ads</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
            Meta, Google and TikTok campaigns for HIRA Institute
          </div>
        </div>
        <div style={{ width: 180 }}>
          <Select value="28d" onChange={() => {}} options={[{ value: '7d', label: 'Last 7 days' }, { value: '28d', label: 'Last 28 days' }]} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {adsCampaigns.map((c, i) => (
          <div key={i} style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)', padding: 16, display: 'grid', gridTemplateColumns: '140px 1fr 140px 200px', gap: 16, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PlatformIcon platform={channelPlatform[c.channel]} size={16} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{c.channel}</span>
            </div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text)' }}>{c.name}</div>
            <Badge tone={c.status === 'active' ? 'positive' : 'neutral'} dot>{c.status === 'active' ? 'Active' : 'Paused'}</Badge>
            <ProgressBar value={c.spend} max={c.budget} label={`$${c.spend.toLocaleString()} / $${c.budget.toLocaleString()}`} tone={c.spend >= c.budget ? 'warning' : 'brand'} />
          </div>
        ))}
      </div>
    </div>
  );
}
