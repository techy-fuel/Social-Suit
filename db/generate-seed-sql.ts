// Generates a single, self-contained SQL file (schema + seed data) that can
// be pasted directly into the Supabase SQL Editor — no DB connection needed
// to produce it, since the sandbox this runs in has no raw Postgres/TCP
// egress (HTTPS-only network policy).
//
// NOTE: this only seeds the demo *content* (accounts/workspaces/stats/etc).
// The demo *login* (Supabase Auth user + its `users` row) is created
// separately by db/seed-via-api.ts, since credentials now live in Supabase
// Auth and can't be inserted with raw SQL.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { workspaces, data, heat, DEMO_ACCOUNT_NAME } from './seed-data';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function esc(v: unknown): string {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return `'${String(v).replace(/'/g, "''")}'`;
}

const out: string[] = [];
out.push('-- Fresh install: safe to re-run, drops and recreates every table.');
out.push('DROP TABLE IF EXISTS tracker_sessions, reports, ads_campaigns, smartlinks, conversation_replies, conversations, connections, scheduled_posts, heatmap_cells, platform_posts, followers_by_city, followers_by_country, growth_points, stat_metrics, workspaces, users, accounts CASCADE;\n');
out.push(readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
out.push('\nBEGIN;\n');

out.push(`INSERT INTO accounts (name) VALUES (${esc(DEMO_ACCOUNT_NAME)}) ON CONFLICT DO NOTHING;`);
out.push('-- The demo login itself (Supabase Auth user + users row) is created by');
out.push('-- db/seed-via-api.ts, not here — this file only seeds workspace content.');

for (const [i, ws] of workspaces.entries()) {
  out.push(`INSERT INTO workspaces (account_id, key, initials, name, sort_order)
  SELECT id, ${esc(ws.key)}, ${esc(ws.initials)}, ${esc(ws.name)}, ${i} FROM accounts WHERE name = ${esc(DEMO_ACCOUNT_NAME)}
  ON CONFLICT (account_id, key) DO UPDATE SET initials=EXCLUDED.initials, name=EXCLUDED.name;`);
}

out.push(`
DO $$
DECLARE
  ws_id INT;
  acct_id INT;
BEGIN
  SELECT id INTO acct_id FROM accounts WHERE name = ${esc(DEMO_ACCOUNT_NAME)};`);

for (const ws of workspaces) {
  const d = data[ws.key];
  out.push(`\n  SELECT id INTO ws_id FROM workspaces WHERE key = ${esc(ws.key)} AND account_id = acct_id;`);
  for (const table of ['stat_metrics', 'growth_points', 'followers_by_country', 'followers_by_city', 'platform_posts', 'heatmap_cells', 'scheduled_posts', 'connections', 'conversations', 'smartlinks', 'ads_campaigns', 'reports', 'tracker_sessions']) {
    out.push(`  DELETE FROM ${table} WHERE workspace_id = ws_id;`);
  }

  for (const [idx, s] of d.stats.entries()) {
    out.push(`  INSERT INTO stat_metrics (workspace_id, key, label, value, delta, sort_order) VALUES (ws_id, ${esc(s.key)}, ${esc(s.label)}, ${esc(s.value)}, ${esc(s.delta)}, ${idx});`);
  }
  for (const [idx, v] of d.growth.entries()) {
    out.push(`  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, ${idx}, ${v});`);
  }
  for (const [idx, c] of d.byCountry.entries()) {
    out.push(`  INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES (ws_id, ${esc(c.label)}, ${c.value}, ${idx});`);
  }
  for (const [idx, c] of d.byCity.entries()) {
    out.push(`  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, ${esc(c.city)}, ${esc(c.country)}, ${c.followers}, ${idx});`);
  }
  for (const p of d.platformPosts) {
    out.push(`  INSERT INTO platform_posts (workspace_id, platform, label, posts, reach) VALUES (ws_id, ${esc(p.platform)}, ${esc(p.label)}, ${p.posts}, ${esc(p.reach)});`);
  }
  for (let day = 0; day < 7; day++) {
    for (let hour = 8; hour <= 19; hour++) {
      out.push(`  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, ${day}, ${hour}, ${heat(day, hour).toFixed(4)}) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;`);
    }
  }
  for (const p of d.scheduledPosts) {
    out.push(`  INSERT INTO scheduled_posts (workspace_id, day, hour, time_label, platform, caption) VALUES (ws_id, ${p.day}, ${p.hour}, ${esc(p.time)}, ${esc(p.platform)}, ${esc(p.caption)});`);
  }
  for (const [idx, c] of d.connections.entries()) {
    out.push(`  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, ${esc(c.platform)}, ${esc(c.label)}, ${esc(c.status)}, ${esc(c.account)}, ${idx});`);
  }
  for (const c of d.conversations) {
    out.push(`  INSERT INTO conversations (workspace_id, platform, name, preview, time_label, unread, resolved) VALUES (ws_id, ${esc(c.platform)}, ${esc(c.name)}, ${esc(c.preview)}, ${esc(c.time)}, ${esc(c.unread)}, ${esc(c.resolved)});`);
  }
  for (const [idx, l] of d.smartlinks.entries()) {
    out.push(`  INSERT INTO smartlinks (workspace_id, label, clicks, sort_order) VALUES (ws_id, ${esc(l.label)}, ${l.clicks}, ${idx});`);
  }
  for (const a of d.ads) {
    out.push(`  INSERT INTO ads_campaigns (workspace_id, channel, name, status, spend, budget) VALUES (ws_id, ${esc(a.channel)}, ${esc(a.name)}, ${esc(a.status)}, ${a.spend}, ${a.budget});`);
  }
  for (const r of d.reports) {
    out.push(`  INSERT INTO reports (workspace_id, name, kind, report_date, status) VALUES (ws_id, ${esc(r.name)}, ${esc(r.kind)}, ${esc(r.date)}, ${esc(r.status)});`);
  }
  for (const t of d.tracker) {
    out.push(`  INSERT INTO tracker_sessions (workspace_id, hashtag, platform, status, started, mentions) VALUES (ws_id, ${esc(t.hashtag)}, ${esc(t.platform)}, ${esc(t.status)}, ${esc(t.started)}, ${t.mentions});`);
  }
}

out.push('END $$;\n\nCOMMIT;\n');

const outPath = path.join(__dirname, 'schema_and_seed.sql');
writeFileSync(outPath, out.join('\n'));
console.log(`Wrote ${outPath}`);
