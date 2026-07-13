// One-off seed script — run with: DATABASE_URL=... npx tsx db/seed.ts
// Populates all 9 screens' tables with realistic per-workspace starting data.
import { Pool } from 'pg';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  console.error('Set DATABASE_URL or POSTGRES_URL before running the seed script.');
  process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

type Workspace = { key: string; initials: string; name: string };

const workspaces: Workspace[] = [
  { key: 'hira-institute', initials: 'HI', name: 'HIRA Institute' },
  { key: 'hira-kitchen', initials: 'HK', name: 'HIRA Kitchen' },
  { key: 'al-khalil', initials: 'AK', name: 'Al Khalil Huffaz School' },
  { key: 'al-rehman', initials: 'AR', name: 'Al Rehman Academy' },
];

// Per-workspace content. Numbers are hand-varied (not a mechanical multiplier)
// so each client workspace actually reads differently when you switch to it.
const data: Record<string, any> = {
  'hira-institute': {
    stats: [
      { key: 'followers', label: 'Followers', value: '11,400', delta: '+12.4%' },
      { key: 'profile_views', label: 'Profile views', value: '48,210', delta: '+6.1%' },
      { key: 'website_visits', label: 'Website visits', value: '3,982', delta: '-1.8%' },
    ],
    growth: [8400, 8650, 8590, 8900, 9200, 9120, 9450, 9800, 10120, 10380, 10290, 10640, 11050, 11400],
    byCountry: [
      { label: 'Pakistan', value: 46 }, { label: 'United Kingdom', value: 21 },
      { label: 'United States', value: 15 }, { label: 'United Arab Emirates', value: 11 },
      { label: 'Other', value: 7 },
    ],
    byCity: [
      { city: 'Karachi', country: 'Pakistan', followers: 18204 },
      { city: 'Lahore', country: 'Pakistan', followers: 11982 },
      { city: 'London', country: 'United Kingdom', followers: 6340 },
      { city: 'Dubai', country: 'UAE', followers: 4110 },
      { city: 'Birmingham', country: 'United Kingdom', followers: 2860 },
      { city: 'Houston', country: 'United States', followers: 2214 },
    ],
    platformPosts: [
      { platform: 'instagram', label: 'Instagram', posts: 18, reach: '42.1K' },
      { platform: 'facebook', label: 'Facebook', posts: 12, reach: '28.6K' },
      { platform: 'tiktok', label: 'TikTok', posts: 9, reach: '61.4K' },
    ],
    scheduledPosts: [
      { day: 1, hour: 9, time: '9:00 AM', platform: 'instagram', caption: 'Friday khutbah reminder — join us for Jummah at 1:15 PM.' },
      { day: 1, hour: 17, time: '5:00 PM', platform: 'facebook', caption: 'Registration for the Winter Hifz intensive closes this weekend.' },
      { day: 4, hour: 15, time: '3:00 PM', platform: 'instagram', caption: 'Open house for prospective families this Friday afternoon.' },
      { day: 5, hour: 10, time: '10:00 AM', platform: 'facebook', caption: 'Alumni spotlight: Class of 2019 update.' },
    ],
    connections: [
      { platform: 'facebook', label: 'Facebook', status: 'connected', account: 'HIRA Institute' },
      { platform: 'instagram', label: 'Instagram', status: 'connected', account: '@hira.institute' },
      { platform: 'threads', label: 'Threads', status: 'not-connected', account: null },
      { platform: 'x', label: 'X', status: 'not-connected', account: null },
      { platform: 'bluesky', label: 'Bluesky', status: 'not-connected', account: null },
      { platform: 'linkedin', label: 'LinkedIn', status: 'connected', account: 'HIRA Institute' },
      { platform: 'pinterest', label: 'Pinterest', status: 'not-connected', account: null },
      { platform: 'tiktok', label: 'TikTok (personal)', status: 'connected', account: '@hira.moments' },
      { platform: 'tiktok', label: 'TikTok (business)', status: 'pending', account: 'Reconnect required' },
      { platform: 'google', label: 'Google Business Profile', status: 'connected', account: 'HIRA Institute — Karachi' },
      { platform: 'youtube', label: 'YouTube', status: 'connected', account: 'HIRA Institute' },
      { platform: 'twitch', label: 'Twitch', status: 'not-connected', account: null },
      { platform: 'facebook', label: 'Meta Ads', status: 'connected', account: 'Ad account 8834' },
      { platform: 'google', label: 'Google Ads', status: 'not-connected', account: null },
      { platform: 'tiktok', label: 'TikTok Ads', status: 'not-connected', account: null },
    ],
    conversations: [
      { platform: 'instagram', name: 'Ayesha Raza', preview: 'Assalamu alaikum, what time does registration open tomorrow?', time: '2m', unread: true, resolved: false },
      { platform: 'facebook', name: 'Bilal Ahmed', preview: 'Is the Hifz program open to transfer students mid-year?', time: '18m', unread: true, resolved: false },
      { platform: 'tiktok', name: '@sana.k', preview: 'This video made me tear up, jazakAllah khair for sharing', time: '1h', unread: false, resolved: true },
      { platform: 'instagram', name: 'Umar Farooq', preview: 'Following up on the catering quote for a 40-person iftar', time: '3h', unread: false, resolved: false },
      { platform: 'facebook', name: 'Zainab Sheikh', preview: 'Thank you for the quick response earlier!', time: '1d', unread: false, resolved: true },
    ],
    smartlinks: [
      { label: 'Enroll for Winter Hifz Intensive', clicks: 842 },
      { label: 'HIRA Kitchen catering menu', clicks: 610 },
      { label: 'Donate — Ramadan appeal', clicks: 1204 },
      { label: 'Alumni newsletter signup', clicks: 214 },
    ],
    ads: [
      { channel: 'Meta Ads', name: 'Winter Hifz Intensive — enrollment', status: 'active', spend: 1240, budget: 2000 },
      { channel: 'Google Ads', name: 'HIRA Institute — brand search', status: 'active', spend: 380, budget: 500 },
      { channel: 'TikTok Ads', name: 'Ramadan appeal awareness', status: 'paused', spend: 900, budget: 900 },
      { channel: 'Meta Ads', name: 'Al Rehman Academy open house', status: 'active', spend: 210, budget: 750 },
    ],
    reports: [
      { name: 'HIRA Institute — June performance', kind: 'PDF', date: 'Jul 02, 2026', status: 'sent' },
      { name: 'HIRA Institute — Q2 overview', kind: 'PPT', date: 'Jun 28, 2026', status: 'draft' },
      { name: 'HIRA Institute — campaign recap', kind: 'PDF', date: 'Jun 14, 2026', status: 'sent' },
    ],
    tracker: [
      { hashtag: '#HIRAOpenDay', platform: 'Instagram', status: 'active', started: '2026-07-01', mentions: 312 },
      { hashtag: '#WinterHifz2026', platform: 'TikTok', status: 'active', started: '2026-06-18', mentions: 894 },
      { hashtag: '#RamadanAppeal', platform: 'All platforms', status: 'completed', started: '2026-03-10', mentions: 2140 },
    ],
  },
  'hira-kitchen': {
    stats: [
      { key: 'followers', label: 'Followers', value: '6,280', delta: '+8.7%' },
      { key: 'profile_views', label: 'Profile views', value: '19,540', delta: '+4.3%' },
      { key: 'website_visits', label: 'Website visits', value: '2,105', delta: '+2.9%' },
    ],
    growth: [4200, 4310, 4380, 4460, 4590, 4710, 4805, 4920, 5100, 5260, 5410, 5590, 5920, 6280],
    byCountry: [
      { label: 'Pakistan', value: 61 }, { label: 'United Kingdom', value: 14 },
      { label: 'United Arab Emirates', value: 13 }, { label: 'United States', value: 7 },
      { label: 'Other', value: 5 },
    ],
    byCity: [
      { city: 'Karachi', country: 'Pakistan', followers: 3820 },
      { city: 'Lahore', country: 'Pakistan', followers: 1140 },
      { city: 'Dubai', country: 'UAE', followers: 610 },
      { city: 'London', country: 'United Kingdom', followers: 410 },
      { city: 'Islamabad', country: 'Pakistan', followers: 300 },
    ],
    platformPosts: [
      { platform: 'instagram', label: 'Instagram', posts: 24, reach: '18.9K' },
      { platform: 'facebook', label: 'Facebook', posts: 15, reach: '9.4K' },
      { platform: 'tiktok', label: 'TikTok', posts: 6, reach: '22.7K' },
    ],
    scheduledPosts: [
      { day: 0, hour: 11, time: '11:00 AM', platform: 'instagram', caption: 'New menu at HIRA Kitchen: catering trays for community iftars.' },
      { day: 2, hour: 12, time: '12:00 PM', platform: 'facebook', caption: 'This week’s lunch special is now live — order before 2 PM.' },
      { day: 3, hour: 9, time: '9:00 AM', platform: 'tiktok', caption: 'Behind the scenes: prepping 300 iftar trays.' },
    ],
    connections: [
      { platform: 'facebook', label: 'Facebook', status: 'connected', account: 'HIRA Kitchen' },
      { platform: 'instagram', label: 'Instagram', status: 'connected', account: '@hira.kitchen' },
      { platform: 'threads', label: 'Threads', status: 'not-connected', account: null },
      { platform: 'x', label: 'X', status: 'not-connected', account: null },
      { platform: 'bluesky', label: 'Bluesky', status: 'not-connected', account: null },
      { platform: 'linkedin', label: 'LinkedIn', status: 'not-connected', account: null },
      { platform: 'pinterest', label: 'Pinterest', status: 'connected', account: 'HIRA Kitchen Recipes' },
      { platform: 'tiktok', label: 'TikTok (personal)', status: 'connected', account: '@hira.kitchen' },
      { platform: 'tiktok', label: 'TikTok (business)', status: 'not-connected', account: null },
      { platform: 'google', label: 'Google Business Profile', status: 'connected', account: 'HIRA Kitchen — Karachi' },
      { platform: 'youtube', label: 'YouTube', status: 'not-connected', account: null },
      { platform: 'twitch', label: 'Twitch', status: 'not-connected', account: null },
      { platform: 'facebook', label: 'Meta Ads', status: 'connected', account: 'Ad account 9021' },
      { platform: 'google', label: 'Google Ads', status: 'not-connected', account: null },
      { platform: 'tiktok', label: 'TikTok Ads', status: 'not-connected', account: null },
    ],
    conversations: [
      { platform: 'instagram', name: 'Fatima Noor', preview: 'Do you deliver catering trays outside Karachi?', time: '6m', unread: true, resolved: false },
      { platform: 'facebook', name: 'Hamza Iqbal', preview: 'Can I get a quote for a 40-person iftar next Friday?', time: '40m', unread: true, resolved: false },
      { platform: 'instagram', name: '@rukhsar.eats', preview: 'The biryani trays were amazing, ordering again!', time: '2h', unread: false, resolved: true },
    ],
    smartlinks: [
      { label: 'Catering menu (PDF)', clicks: 610 },
      { label: 'Order this week’s lunch special', clicks: 388 },
      { label: 'Community iftar sponsorship', clicks: 152 },
    ],
    ads: [
      { channel: 'Meta Ads', name: 'HIRA Kitchen — catering leads', status: 'active', spend: 420, budget: 800 },
      { channel: 'TikTok Ads', name: 'Lunch special awareness', status: 'active', spend: 160, budget: 300 },
    ],
    reports: [
      { name: 'HIRA Kitchen — campaign recap', kind: 'PDF', date: 'Jun 14, 2026', status: 'sent' },
      { name: 'HIRA Kitchen — catering season wrap', kind: 'PPT', date: 'May 30, 2026', status: 'draft' },
    ],
    tracker: [
      { hashtag: '#HIRAKitchenIftar', platform: 'Instagram', status: 'active', started: '2026-06-25', mentions: 168 },
      { hashtag: '#RamadanAppeal', platform: 'All platforms', status: 'completed', started: '2026-03-10', mentions: 940 },
    ],
  },
  'al-khalil': {
    stats: [
      { key: 'followers', label: 'Followers', value: '3,940', delta: '+15.2%' },
      { key: 'profile_views', label: 'Profile views', value: '9,880', delta: '+9.6%' },
      { key: 'website_visits', label: 'Website visits', value: '1,240', delta: '+3.1%' },
    ],
    growth: [2100, 2180, 2260, 2340, 2450, 2590, 2710, 2860, 3020, 3180, 3350, 3540, 3760, 3940],
    byCountry: [
      { label: 'Pakistan', value: 58 }, { label: 'United Kingdom', value: 19 },
      { label: 'United Arab Emirates', value: 12 }, { label: 'Canada', value: 6 },
      { label: 'Other', value: 5 },
    ],
    byCity: [
      { city: 'Lahore', country: 'Pakistan', followers: 1680 },
      { city: 'Karachi', country: 'Pakistan', followers: 640 },
      { city: 'London', country: 'United Kingdom', followers: 420 },
      { city: 'Dubai', country: 'UAE', followers: 260 },
      { city: 'Toronto', country: 'Canada', followers: 130 },
    ],
    platformPosts: [
      { platform: 'instagram', label: 'Instagram', posts: 14, reach: '11.2K' },
      { platform: 'tiktok', label: 'TikTok', posts: 11, reach: '19.8K' },
      { platform: 'facebook', label: 'Facebook', posts: 8, reach: '6.1K' },
    ],
    scheduledPosts: [
      { day: 2, hour: 16, time: '4:00 PM', platform: 'tiktok', caption: 'A day in the life of a Huffaz student at Al Khalil.' },
      { day: 4, hour: 10, time: '10:00 AM', platform: 'instagram', caption: 'Congratulations to this term’s new Huffaz graduates.' },
    ],
    connections: [
      { platform: 'facebook', label: 'Facebook', status: 'connected', account: 'Al Khalil Huffaz School' },
      { platform: 'instagram', label: 'Instagram', status: 'connected', account: '@alkhalil.huffaz' },
      { platform: 'threads', label: 'Threads', status: 'not-connected', account: null },
      { platform: 'x', label: 'X', status: 'not-connected', account: null },
      { platform: 'bluesky', label: 'Bluesky', status: 'not-connected', account: null },
      { platform: 'linkedin', label: 'LinkedIn', status: 'not-connected', account: null },
      { platform: 'pinterest', label: 'Pinterest', status: 'not-connected', account: null },
      { platform: 'tiktok', label: 'TikTok (personal)', status: 'connected', account: '@alkhalil.huffaz' },
      { platform: 'tiktok', label: 'TikTok (business)', status: 'not-connected', account: null },
      { platform: 'google', label: 'Google Business Profile', status: 'connected', account: 'Al Khalil Huffaz School — Lahore' },
      { platform: 'youtube', label: 'YouTube', status: 'connected', account: 'Al Khalil Huffaz School' },
      { platform: 'twitch', label: 'Twitch', status: 'not-connected', account: null },
      { platform: 'facebook', label: 'Meta Ads', status: 'pending', account: 'Reconnect required' },
      { platform: 'google', label: 'Google Ads', status: 'not-connected', account: null },
      { platform: 'tiktok', label: 'TikTok Ads', status: 'not-connected', account: null },
    ],
    conversations: [
      { platform: 'tiktok', name: '@huffaz.parent', preview: 'What age does the Huffaz program start from?', time: '25m', unread: true, resolved: false },
      { platform: 'instagram', name: 'Sara Malik', preview: 'Is there a waiting list for next intake?', time: '4h', unread: false, resolved: false },
    ],
    smartlinks: [
      { label: 'Huffaz program enrollment', clicks: 396 },
      { label: 'School calendar 2026', clicks: 118 },
    ],
    ads: [
      { channel: 'TikTok Ads', name: 'Huffaz graduate stories', status: 'active', spend: 140, budget: 400 },
    ],
    reports: [
      { name: 'Al Khalil Huffaz School — term summary', kind: 'PDF', date: 'Jun 20, 2026', status: 'sent' },
    ],
    tracker: [
      { hashtag: '#AlKhalilHuffaz', platform: 'TikTok', status: 'active', started: '2026-06-01', mentions: 245 },
    ],
  },
  'al-rehman': {
    stats: [
      { key: 'followers', label: 'Followers', value: '5,610', delta: '+5.4%' },
      { key: 'profile_views', label: 'Profile views', value: '14,760', delta: '+3.2%' },
      { key: 'website_visits', label: 'Website visits', value: '2,890', delta: '-0.6%' },
    ],
    growth: [4600, 4650, 4710, 4780, 4860, 4920, 5010, 5080, 5170, 5260, 5340, 5430, 5520, 5610],
    byCountry: [
      { label: 'Pakistan', value: 52 }, { label: 'United States', value: 22 },
      { label: 'United Kingdom', value: 13 }, { label: 'United Arab Emirates', value: 8 },
      { label: 'Other', value: 5 },
    ],
    byCity: [
      { city: 'Islamabad', country: 'Pakistan', followers: 2140 },
      { city: 'Karachi', country: 'Pakistan', followers: 780 },
      { city: 'Houston', country: 'United States', followers: 610 },
      { city: 'London', country: 'United Kingdom', followers: 420 },
      { city: 'Dubai', country: 'UAE', followers: 260 },
    ],
    platformPosts: [
      { platform: 'facebook', label: 'Facebook', posts: 16, reach: '20.4K' },
      { platform: 'instagram', label: 'Instagram', posts: 13, reach: '15.8K' },
      { platform: 'tiktok', label: 'TikTok', posts: 4, reach: '8.2K' },
    ],
    scheduledPosts: [
      { day: 5, hour: 10, time: '10:00 AM', platform: 'facebook', caption: 'Alumni spotlight: Class of 2019 update from Al Rehman Academy.' },
      { day: 6, hour: 13, time: '1:00 PM', platform: 'instagram', caption: 'Open house this Sunday — tour the new science lab.' },
    ],
    connections: [
      { platform: 'facebook', label: 'Facebook', status: 'connected', account: 'Al Rehman Academy' },
      { platform: 'instagram', label: 'Instagram', status: 'connected', account: '@alrehman.academy' },
      { platform: 'threads', label: 'Threads', status: 'not-connected', account: null },
      { platform: 'x', label: 'X', status: 'connected', account: '@AlRehmanAcademy' },
      { platform: 'bluesky', label: 'Bluesky', status: 'not-connected', account: null },
      { platform: 'linkedin', label: 'LinkedIn', status: 'connected', account: 'Al Rehman Academy' },
      { platform: 'pinterest', label: 'Pinterest', status: 'not-connected', account: null },
      { platform: 'tiktok', label: 'TikTok (personal)', status: 'not-connected', account: null },
      { platform: 'tiktok', label: 'TikTok (business)', status: 'not-connected', account: null },
      { platform: 'google', label: 'Google Business Profile', status: 'connected', account: 'Al Rehman Academy — Islamabad' },
      { platform: 'youtube', label: 'YouTube', status: 'connected', account: 'Al Rehman Academy' },
      { platform: 'twitch', label: 'Twitch', status: 'not-connected', account: null },
      { platform: 'facebook', label: 'Meta Ads', status: 'connected', account: 'Ad account 7743' },
      { platform: 'google', label: 'Google Ads', status: 'connected', account: 'Ad account 3390' },
      { platform: 'tiktok', label: 'TikTok Ads', status: 'not-connected', account: null },
    ],
    conversations: [
      { platform: 'facebook', name: 'Nadia Farooqi', preview: 'What documents are needed for admission next term?', time: '12m', unread: true, resolved: false },
      { platform: 'instagram', name: 'Ahsan Raza', preview: 'Do you offer transport from Bahria Town?', time: '1h', unread: false, resolved: false },
      { platform: 'facebook', name: 'Mariam Yousaf', preview: 'Thank you for the open house invite, we’ll attend.', time: '5h', unread: false, resolved: true },
    ],
    smartlinks: [
      { label: 'Open house RSVP', clicks: 318 },
      { label: 'Admissions 2026 — apply now', clicks: 704 },
      { label: 'Alumni newsletter signup', clicks: 96 },
    ],
    ads: [
      { channel: 'Meta Ads', name: 'Al Rehman Academy open house', status: 'active', spend: 210, budget: 750 },
      { channel: 'Google Ads', name: 'Al Rehman Academy — brand search', status: 'active', spend: 190, budget: 300 },
    ],
    reports: [
      { name: 'Al Rehman Academy — Q2 overview', kind: 'PPT', date: 'Jun 28, 2026', status: 'draft' },
      { name: 'Al Rehman Academy — admissions funnel', kind: 'PDF', date: 'Jun 05, 2026', status: 'sent' },
    ],
    tracker: [
      { hashtag: '#AlRehmanAlumni', platform: 'Facebook', status: 'completed', started: '2026-05-02', mentions: 156 },
      { hashtag: '#AlRehmanOpenHouse', platform: 'Instagram', status: 'active', started: '2026-07-05', mentions: 88 },
    ],
  },
};

// Deterministic best-time-to-post heat, same heuristic the UI used to compute
// client-side — now persisted per workspace so it's real, editable data.
function heat(day: number, hour: number) {
  const seed = (day * 13 + hour * 7) % 23;
  return Math.min(1, seed / 22);
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

    for (const [i, ws] of workspaces.entries()) {
      const { rows } = await client.query(
        `INSERT INTO workspaces (key, initials, name, sort_order) VALUES ($1,$2,$3,$4)
         ON CONFLICT (key) DO UPDATE SET initials=EXCLUDED.initials, name=EXCLUDED.name
         RETURNING id`,
        [ws.key, ws.initials, ws.name, i]
      );
      const workspaceId = rows[0].id;
      const d = data[ws.key];

      // Clear existing content for this workspace so the seed is re-runnable.
      for (const table of ['stat_metrics', 'growth_points', 'followers_by_country', 'followers_by_city', 'platform_posts', 'heatmap_cells', 'scheduled_posts', 'connections', 'conversations', 'smartlinks', 'ads_campaigns', 'reports', 'tracker_sessions']) {
        await client.query(`DELETE FROM ${table} WHERE workspace_id = $1`, [workspaceId]);
      }

      for (const [idx, s] of d.stats.entries()) {
        await client.query(
          `INSERT INTO stat_metrics (workspace_id, key, label, value, delta, sort_order) VALUES ($1,$2,$3,$4,$5,$6)`,
          [workspaceId, s.key, s.label, s.value, s.delta, idx]
        );
      }
      for (const [idx, v] of d.growth.entries()) {
        await client.query(`INSERT INTO growth_points (workspace_id, idx, value) VALUES ($1,$2,$3)`, [workspaceId, idx, v]);
      }
      for (const [idx, c] of d.byCountry.entries()) {
        await client.query(`INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES ($1,$2,$3,$4)`, [workspaceId, c.label, c.value, idx]);
      }
      for (const [idx, c] of d.byCity.entries()) {
        await client.query(`INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES ($1,$2,$3,$4,$5)`, [workspaceId, c.city, c.country, c.followers, idx]);
      }
      for (const p of d.platformPosts) {
        await client.query(`INSERT INTO platform_posts (workspace_id, platform, label, posts, reach) VALUES ($1,$2,$3,$4,$5)`, [workspaceId, p.platform, p.label, p.posts, p.reach]);
      }
      for (let day = 0; day < 7; day++) {
        for (let hour = 8; hour <= 19; hour++) {
          await client.query(`INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES ($1,$2,$3,$4) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value`, [workspaceId, day, hour, heat(day, hour)]);
        }
      }
      for (const p of d.scheduledPosts) {
        await client.query(`INSERT INTO scheduled_posts (workspace_id, day, hour, time_label, platform, caption) VALUES ($1,$2,$3,$4,$5,$6)`, [workspaceId, p.day, p.hour, p.time, p.platform, p.caption]);
      }
      for (const [idx, c] of d.connections.entries()) {
        await client.query(`INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES ($1,$2,$3,$4,$5,$6)`, [workspaceId, c.platform, c.label, c.status, c.account, idx]);
      }
      for (const c of d.conversations) {
        await client.query(`INSERT INTO conversations (workspace_id, platform, name, preview, time_label, unread, resolved) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [workspaceId, c.platform, c.name, c.preview, c.time, c.unread, c.resolved]);
      }
      for (const [idx, l] of d.smartlinks.entries()) {
        await client.query(`INSERT INTO smartlinks (workspace_id, label, clicks, sort_order) VALUES ($1,$2,$3,$4)`, [workspaceId, l.label, l.clicks, idx]);
      }
      for (const a of d.ads) {
        await client.query(`INSERT INTO ads_campaigns (workspace_id, channel, name, status, spend, budget) VALUES ($1,$2,$3,$4,$5,$6)`, [workspaceId, a.channel, a.name, a.status, a.spend, a.budget]);
      }
      for (const r of d.reports) {
        await client.query(`INSERT INTO reports (workspace_id, name, kind, report_date, status) VALUES ($1,$2,$3,$4,$5)`, [workspaceId, r.name, r.kind, r.date, r.status]);
      }
      for (const t of d.tracker) {
        await client.query(`INSERT INTO tracker_sessions (workspace_id, hashtag, platform, status, started, mentions) VALUES ($1,$2,$3,$4,$5,$6)`, [workspaceId, t.hashtag, t.platform, t.status, t.started, t.mentions]);
      }
      console.log(`Seeded ${ws.name}`);
    }

    await client.query('COMMIT');
    console.log('Seed complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
