// Seeds the demo login + demo workspace content entirely over HTTPS via
// Supabase's Admin API and PostgREST — no raw Postgres/TCP connection
// needed, so this can run from environments (like this sandbox) that only
// have HTTPS egress.
//
// Prerequisite: db/schema.sql (or db/schema_and_seed.sql) must already be
// applied in the Supabase SQL Editor, since DDL can't be run over PostgREST.
//
// Run with: SUPABASE_SERVICE_ROLE_KEY=... npx tsx db/seed-via-api.ts
import { createClient } from '@supabase/supabase-js';
import { workspaces, data, heat, DEMO_ACCOUNT_NAME, DEMO_EMAIL, DEMO_PASSWORD } from './seed-data';

const SUPABASE_URL = 'https://ieavtfjmjimeguhpegki.supabase.co';

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY before running this script.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CONTENT_TABLES = [
  'stat_metrics', 'growth_points', 'followers_by_country', 'followers_by_city',
  'platform_posts', 'heatmap_cells', 'scheduled_posts', 'connections',
  'conversations', 'smartlinks', 'ads_campaigns', 'reports', 'tracker_sessions',
] as const;

async function ensureAuthUser(): Promise<string> {
  // supabase-js has no "get user by email" call, so page through admin.listUsers.
  let page = 1;
  while (true) {
    const { data: list, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const existing = list.users.find((u) => u.email === DEMO_EMAIL);
    if (existing) {
      console.log(`Auth user already exists: ${existing.id}`);
      return existing.id;
    }
    if (list.users.length < 200) break;
    page += 1;
  }

  const { data: created, error } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;
  console.log(`Created auth user: ${created.user.id}`);
  return created.user.id;
}

async function ensureAccount(): Promise<number> {
  const { data: existing, error: selErr } = await supabase
    .from('accounts').select('id').eq('name', DEMO_ACCOUNT_NAME).maybeSingle();
  if (selErr) throw selErr;
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('accounts').insert({ name: DEMO_ACCOUNT_NAME }).select('id').single();
  if (error) throw error;
  console.log(`Created account: ${created.id}`);
  return created.id;
}

async function ensureUserRow(accountId: number, supabaseUserId: string) {
  const { error } = await supabase
    .from('users')
    .upsert(
      { account_id: accountId, supabase_user_id: supabaseUserId, email: DEMO_EMAIL },
      { onConflict: 'supabase_user_id' }
    );
  if (error) throw error;
}

async function ensureWorkspace(accountId: number, key: string, initials: string, name: string, sortOrder: number): Promise<number> {
  const { data: row, error } = await supabase
    .from('workspaces')
    .upsert(
      { account_id: accountId, key, initials, name, sort_order: sortOrder },
      { onConflict: 'account_id,key' }
    )
    .select('id')
    .single();
  if (error) throw error;
  return row.id;
}

async function seedWorkspaceContent(workspaceId: number, key: string) {
  const d = data[key];

  for (const table of CONTENT_TABLES) {
    const { error } = await supabase.from(table).delete().eq('workspace_id', workspaceId);
    if (error) throw error;
  }

  const inserts: Array<PromiseLike<{ error: unknown }>> = [
    supabase.from('stat_metrics').insert(
      d.stats.map((s: any, idx: number) => ({ workspace_id: workspaceId, key: s.key, label: s.label, value: s.value, delta: s.delta, sort_order: idx }))
    ),
    supabase.from('growth_points').insert(
      d.growth.map((v: number, idx: number) => ({ workspace_id: workspaceId, idx, value: v }))
    ),
    supabase.from('followers_by_country').insert(
      d.byCountry.map((c: any, idx: number) => ({ workspace_id: workspaceId, label: c.label, value: c.value, sort_order: idx }))
    ),
    supabase.from('followers_by_city').insert(
      d.byCity.map((c: any, idx: number) => ({ workspace_id: workspaceId, city: c.city, country: c.country, followers: c.followers, sort_order: idx }))
    ),
    supabase.from('platform_posts').insert(
      d.platformPosts.map((p: any) => ({ workspace_id: workspaceId, platform: p.platform, label: p.label, posts: p.posts, reach: p.reach }))
    ),
    supabase.from('scheduled_posts').insert(
      d.scheduledPosts.map((p: any) => ({ workspace_id: workspaceId, day: p.day, hour: p.hour, time_label: p.time, platform: p.platform, caption: p.caption }))
    ),
    supabase.from('connections').insert(
      d.connections.map((c: any, idx: number) => ({ workspace_id: workspaceId, platform: c.platform, label: c.label, status: c.status, account: c.account, sort_order: idx }))
    ),
    supabase.from('conversations').insert(
      d.conversations.map((c: any) => ({ workspace_id: workspaceId, platform: c.platform, name: c.name, preview: c.preview, time_label: c.time, unread: c.unread, resolved: c.resolved }))
    ),
    supabase.from('smartlinks').insert(
      d.smartlinks.map((l: any, idx: number) => ({ workspace_id: workspaceId, label: l.label, clicks: l.clicks, sort_order: idx }))
    ),
    supabase.from('ads_campaigns').insert(
      d.ads.map((a: any) => ({ workspace_id: workspaceId, channel: a.channel, name: a.name, status: a.status, spend: a.spend, budget: a.budget }))
    ),
    supabase.from('reports').insert(
      d.reports.map((r: any) => ({ workspace_id: workspaceId, name: r.name, kind: r.kind, report_date: r.date, status: r.status }))
    ),
    supabase.from('tracker_sessions').insert(
      d.tracker.map((t: any) => ({ workspace_id: workspaceId, hashtag: t.hashtag, platform: t.platform, status: t.status, started: t.started, mentions: t.mentions }))
    ),
  ];

  const heatmapRows: Array<{ workspace_id: number; day: number; hour: number; value: number }> = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 8; hour <= 19; hour++) {
      heatmapRows.push({ workspace_id: workspaceId, day, hour, value: Number(heat(day, hour).toFixed(4)) });
    }
  }
  inserts.push(supabase.from('heatmap_cells').insert(heatmapRows));

  const results = await Promise.all(inserts);
  for (const { error } of results) {
    if (error) throw error;
  }
}

async function main() {
  const supabaseUserId = await ensureAuthUser();
  const accountId = await ensureAccount();
  await ensureUserRow(accountId, supabaseUserId);

  for (const [i, ws] of workspaces.entries()) {
    const workspaceId = await ensureWorkspace(accountId, ws.key, ws.initials, ws.name, i);
    await seedWorkspaceContent(workspaceId, ws.key);
    console.log(`Seeded ${ws.name}`);
  }

  console.log('\nSeed complete.');
  console.log(`Demo login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
