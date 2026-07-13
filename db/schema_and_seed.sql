-- Fresh install: safe to re-run, drops and recreates every table.
DROP TABLE IF EXISTS tracker_sessions, reports, ads_campaigns, smartlinks, conversation_replies, conversations, connections, scheduled_posts, heatmap_cells, platform_posts, followers_by_city, followers_by_country, growth_points, stat_metrics, workspaces, users, accounts CASCADE;

-- SocialSuite schema — multi-tenant: every account (a signed-up agency team)
-- owns its own workspaces, and every content table is scoped by
-- workspace_id, which is itself scoped by account_id. API routes must always
-- filter workspace lookups by the caller's account_id — that's the tenant
-- isolation boundary.

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspaces (
  id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  initials TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE (account_id, key)
);

CREATE TABLE IF NOT EXISTS stat_metrics (
  id SERIAL PRIMARY KEY,
  workspace_id INT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  delta TEXT,
  timeframe TEXT NOT NULL DEFAULT 'vs last 28 days',
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS growth_points (
  id SERIAL PRIMARY KEY,
  workspace_id INT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  idx INT NOT NULL,
  value INT NOT NULL
);

CREATE TABLE IF NOT EXISTS followers_by_country (
  id SERIAL PRIMARY KEY,
  workspace_id INT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value INT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS followers_by_city (
  id SERIAL PRIMARY KEY,
  workspace_id INT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  followers INT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS platform_posts (
  id SERIAL PRIMARY KEY,
  workspace_id INT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  label TEXT NOT NULL,
  posts INT NOT NULL,
  reach TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS heatmap_cells (
  id SERIAL PRIMARY KEY,
  workspace_id INT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  day INT NOT NULL,
  hour INT NOT NULL,
  value REAL NOT NULL,
  UNIQUE (workspace_id, day, hour)
);

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id SERIAL PRIMARY KEY,
  workspace_id INT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  day INT NOT NULL,
  hour INT NOT NULL,
  time_label TEXT NOT NULL,
  platform TEXT NOT NULL,
  caption TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS connections (
  id SERIAL PRIMARY KEY,
  workspace_id INT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not-connected',
  account TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  workspace_id INT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  name TEXT NOT NULL,
  preview TEXT NOT NULL,
  time_label TEXT NOT NULL,
  unread BOOLEAN NOT NULL DEFAULT true,
  resolved BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_replies (
  id SERIAL PRIMARY KEY,
  conversation_id INT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS smartlinks (
  id SERIAL PRIMARY KEY,
  workspace_id INT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  clicks INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ads_campaigns (
  id SERIAL PRIMARY KEY,
  workspace_id INT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  spend INT NOT NULL DEFAULT 0,
  budget INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  workspace_id INT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  report_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tracker_sessions (
  id SERIAL PRIMARY KEY,
  workspace_id INT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  hashtag TEXT NOT NULL,
  platform TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  started TEXT NOT NULL,
  mentions INT NOT NULL DEFAULT 0
);


BEGIN;

INSERT INTO accounts (name) VALUES ('TechyFuel (demo)');
INSERT INTO users (account_id, email, password_hash)
  SELECT id, 'demo@techyfuel.example', '$2a$10$maQTWiufdY3k0txz4V8CV.mhg9lzU6lYjqqUiphXlT2QFvfUuClc.' FROM accounts WHERE name = 'TechyFuel (demo)';
INSERT INTO workspaces (account_id, key, initials, name, sort_order)
  SELECT id, 'hira-institute', 'HI', 'HIRA Institute', 0 FROM accounts WHERE name = 'TechyFuel (demo)'
  ON CONFLICT (account_id, key) DO UPDATE SET initials=EXCLUDED.initials, name=EXCLUDED.name;
INSERT INTO workspaces (account_id, key, initials, name, sort_order)
  SELECT id, 'hira-kitchen', 'HK', 'HIRA Kitchen', 1 FROM accounts WHERE name = 'TechyFuel (demo)'
  ON CONFLICT (account_id, key) DO UPDATE SET initials=EXCLUDED.initials, name=EXCLUDED.name;
INSERT INTO workspaces (account_id, key, initials, name, sort_order)
  SELECT id, 'al-khalil', 'AK', 'Al Khalil Huffaz School', 2 FROM accounts WHERE name = 'TechyFuel (demo)'
  ON CONFLICT (account_id, key) DO UPDATE SET initials=EXCLUDED.initials, name=EXCLUDED.name;
INSERT INTO workspaces (account_id, key, initials, name, sort_order)
  SELECT id, 'al-rehman', 'AR', 'Al Rehman Academy', 3 FROM accounts WHERE name = 'TechyFuel (demo)'
  ON CONFLICT (account_id, key) DO UPDATE SET initials=EXCLUDED.initials, name=EXCLUDED.name;

DO $$
DECLARE
  ws_id INT;
  acct_id INT;
BEGIN
  SELECT id INTO acct_id FROM accounts WHERE name = 'TechyFuel (demo)';

  SELECT id INTO ws_id FROM workspaces WHERE key = 'hira-institute' AND account_id = acct_id;
  DELETE FROM stat_metrics WHERE workspace_id = ws_id;
  DELETE FROM growth_points WHERE workspace_id = ws_id;
  DELETE FROM followers_by_country WHERE workspace_id = ws_id;
  DELETE FROM followers_by_city WHERE workspace_id = ws_id;
  DELETE FROM platform_posts WHERE workspace_id = ws_id;
  DELETE FROM heatmap_cells WHERE workspace_id = ws_id;
  DELETE FROM scheduled_posts WHERE workspace_id = ws_id;
  DELETE FROM connections WHERE workspace_id = ws_id;
  DELETE FROM conversations WHERE workspace_id = ws_id;
  DELETE FROM smartlinks WHERE workspace_id = ws_id;
  DELETE FROM ads_campaigns WHERE workspace_id = ws_id;
  DELETE FROM reports WHERE workspace_id = ws_id;
  DELETE FROM tracker_sessions WHERE workspace_id = ws_id;
  INSERT INTO stat_metrics (workspace_id, key, label, value, delta, sort_order) VALUES (ws_id, 'followers', 'Followers', '11,400', '+12.4%', 0);
  INSERT INTO stat_metrics (workspace_id, key, label, value, delta, sort_order) VALUES (ws_id, 'profile_views', 'Profile views', '48,210', '+6.1%', 1);
  INSERT INTO stat_metrics (workspace_id, key, label, value, delta, sort_order) VALUES (ws_id, 'website_visits', 'Website visits', '3,982', '-1.8%', 2);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 0, 8400);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 1, 8650);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 2, 8590);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 3, 8900);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 4, 9200);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 5, 9120);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 6, 9450);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 7, 9800);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 8, 10120);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 9, 10380);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 10, 10290);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 11, 10640);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 12, 11050);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 13, 11400);
  INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES (ws_id, 'Pakistan', 46, 0);
  INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES (ws_id, 'United Kingdom', 21, 1);
  INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES (ws_id, 'United States', 15, 2);
  INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES (ws_id, 'United Arab Emirates', 11, 3);
  INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES (ws_id, 'Other', 7, 4);
  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, 'Karachi', 'Pakistan', 18204, 0);
  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, 'Lahore', 'Pakistan', 11982, 1);
  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, 'London', 'United Kingdom', 6340, 2);
  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, 'Dubai', 'UAE', 4110, 3);
  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, 'Birmingham', 'United Kingdom', 2860, 4);
  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, 'Houston', 'United States', 2214, 5);
  INSERT INTO platform_posts (workspace_id, platform, label, posts, reach) VALUES (ws_id, 'instagram', 'Instagram', 18, '42.1K');
  INSERT INTO platform_posts (workspace_id, platform, label, posts, reach) VALUES (ws_id, 'facebook', 'Facebook', 12, '28.6K');
  INSERT INTO platform_posts (workspace_id, platform, label, posts, reach) VALUES (ws_id, 'tiktok', 'TikTok', 9, '61.4K');
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 8, 0.4545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 9, 0.7727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 10, 0.0455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 11, 0.3636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 12, 0.6818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 13, 1.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 14, 0.2727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 15, 0.5909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 16, 0.9091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 17, 0.1818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 18, 0.5000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 19, 0.8182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 8, 0.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 9, 0.3182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 10, 0.6364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 11, 0.9545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 12, 0.2273) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 13, 0.5455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 14, 0.8636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 15, 0.1364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 16, 0.4545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 17, 0.7727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 18, 0.0455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 19, 0.3636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 8, 0.5909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 9, 0.9091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 10, 0.1818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 11, 0.5000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 12, 0.8182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 13, 0.0909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 14, 0.4091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 15, 0.7273) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 16, 0.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 17, 0.3182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 18, 0.6364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 19, 0.9545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 8, 0.1364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 9, 0.4545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 10, 0.7727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 11, 0.0455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 12, 0.3636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 13, 0.6818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 14, 1.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 15, 0.2727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 16, 0.5909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 17, 0.9091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 18, 0.1818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 19, 0.5000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 8, 0.7273) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 9, 0.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 10, 0.3182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 11, 0.6364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 12, 0.9545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 13, 0.2273) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 14, 0.5455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 15, 0.8636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 16, 0.1364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 17, 0.4545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 18, 0.7727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 19, 0.0455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 8, 0.2727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 9, 0.5909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 10, 0.9091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 11, 0.1818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 12, 0.5000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 13, 0.8182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 14, 0.0909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 15, 0.4091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 16, 0.7273) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 17, 0.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 18, 0.3182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 19, 0.6364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 8, 0.8636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 9, 0.1364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 10, 0.4545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 11, 0.7727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 12, 0.0455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 13, 0.3636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 14, 0.6818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 15, 1.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 16, 0.2727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 17, 0.5909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 18, 0.9091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 19, 0.1818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO scheduled_posts (workspace_id, day, hour, time_label, platform, caption) VALUES (ws_id, 1, 9, '9:00 AM', 'instagram', 'Friday khutbah reminder — join us for Jummah at 1:15 PM.');
  INSERT INTO scheduled_posts (workspace_id, day, hour, time_label, platform, caption) VALUES (ws_id, 1, 17, '5:00 PM', 'facebook', 'Registration for the Winter Hifz intensive closes this weekend.');
  INSERT INTO scheduled_posts (workspace_id, day, hour, time_label, platform, caption) VALUES (ws_id, 4, 15, '3:00 PM', 'instagram', 'Open house for prospective families this Friday afternoon.');
  INSERT INTO scheduled_posts (workspace_id, day, hour, time_label, platform, caption) VALUES (ws_id, 5, 10, '10:00 AM', 'facebook', 'Alumni spotlight: Class of 2019 update.');
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'facebook', 'Facebook', 'connected', 'HIRA Institute', 0);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'instagram', 'Instagram', 'connected', '@hira.institute', 1);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'threads', 'Threads', 'not-connected', NULL, 2);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'x', 'X', 'not-connected', NULL, 3);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'bluesky', 'Bluesky', 'not-connected', NULL, 4);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'linkedin', 'LinkedIn', 'connected', 'HIRA Institute', 5);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'pinterest', 'Pinterest', 'not-connected', NULL, 6);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'tiktok', 'TikTok (personal)', 'connected', '@hira.moments', 7);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'tiktok', 'TikTok (business)', 'pending', 'Reconnect required', 8);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'google', 'Google Business Profile', 'connected', 'HIRA Institute — Karachi', 9);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'youtube', 'YouTube', 'connected', 'HIRA Institute', 10);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'twitch', 'Twitch', 'not-connected', NULL, 11);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'facebook', 'Meta Ads', 'connected', 'Ad account 8834', 12);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'google', 'Google Ads', 'not-connected', NULL, 13);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'tiktok', 'TikTok Ads', 'not-connected', NULL, 14);
  INSERT INTO conversations (workspace_id, platform, name, preview, time_label, unread, resolved) VALUES (ws_id, 'instagram', 'Ayesha Raza', 'Assalamu alaikum, what time does registration open tomorrow?', '2m', true, false);
  INSERT INTO conversations (workspace_id, platform, name, preview, time_label, unread, resolved) VALUES (ws_id, 'facebook', 'Bilal Ahmed', 'Is the Hifz program open to transfer students mid-year?', '18m', true, false);
  INSERT INTO conversations (workspace_id, platform, name, preview, time_label, unread, resolved) VALUES (ws_id, 'tiktok', '@sana.k', 'This video made me tear up, jazakAllah khair for sharing', '1h', false, true);
  INSERT INTO conversations (workspace_id, platform, name, preview, time_label, unread, resolved) VALUES (ws_id, 'instagram', 'Umar Farooq', 'Following up on the catering quote for a 40-person iftar', '3h', false, false);
  INSERT INTO conversations (workspace_id, platform, name, preview, time_label, unread, resolved) VALUES (ws_id, 'facebook', 'Zainab Sheikh', 'Thank you for the quick response earlier!', '1d', false, true);
  INSERT INTO smartlinks (workspace_id, label, clicks, sort_order) VALUES (ws_id, 'Enroll for Winter Hifz Intensive', 842, 0);
  INSERT INTO smartlinks (workspace_id, label, clicks, sort_order) VALUES (ws_id, 'HIRA Kitchen catering menu', 610, 1);
  INSERT INTO smartlinks (workspace_id, label, clicks, sort_order) VALUES (ws_id, 'Donate — Ramadan appeal', 1204, 2);
  INSERT INTO smartlinks (workspace_id, label, clicks, sort_order) VALUES (ws_id, 'Alumni newsletter signup', 214, 3);
  INSERT INTO ads_campaigns (workspace_id, channel, name, status, spend, budget) VALUES (ws_id, 'Meta Ads', 'Winter Hifz Intensive — enrollment', 'active', 1240, 2000);
  INSERT INTO ads_campaigns (workspace_id, channel, name, status, spend, budget) VALUES (ws_id, 'Google Ads', 'HIRA Institute — brand search', 'active', 380, 500);
  INSERT INTO ads_campaigns (workspace_id, channel, name, status, spend, budget) VALUES (ws_id, 'TikTok Ads', 'Ramadan appeal awareness', 'paused', 900, 900);
  INSERT INTO ads_campaigns (workspace_id, channel, name, status, spend, budget) VALUES (ws_id, 'Meta Ads', 'Al Rehman Academy open house', 'active', 210, 750);
  INSERT INTO reports (workspace_id, name, kind, report_date, status) VALUES (ws_id, 'HIRA Institute — June performance', 'PDF', 'Jul 02, 2026', 'sent');
  INSERT INTO reports (workspace_id, name, kind, report_date, status) VALUES (ws_id, 'HIRA Institute — Q2 overview', 'PPT', 'Jun 28, 2026', 'draft');
  INSERT INTO reports (workspace_id, name, kind, report_date, status) VALUES (ws_id, 'HIRA Institute — campaign recap', 'PDF', 'Jun 14, 2026', 'sent');
  INSERT INTO tracker_sessions (workspace_id, hashtag, platform, status, started, mentions) VALUES (ws_id, '#HIRAOpenDay', 'Instagram', 'active', '2026-07-01', 312);
  INSERT INTO tracker_sessions (workspace_id, hashtag, platform, status, started, mentions) VALUES (ws_id, '#WinterHifz2026', 'TikTok', 'active', '2026-06-18', 894);
  INSERT INTO tracker_sessions (workspace_id, hashtag, platform, status, started, mentions) VALUES (ws_id, '#RamadanAppeal', 'All platforms', 'completed', '2026-03-10', 2140);

  SELECT id INTO ws_id FROM workspaces WHERE key = 'hira-kitchen' AND account_id = acct_id;
  DELETE FROM stat_metrics WHERE workspace_id = ws_id;
  DELETE FROM growth_points WHERE workspace_id = ws_id;
  DELETE FROM followers_by_country WHERE workspace_id = ws_id;
  DELETE FROM followers_by_city WHERE workspace_id = ws_id;
  DELETE FROM platform_posts WHERE workspace_id = ws_id;
  DELETE FROM heatmap_cells WHERE workspace_id = ws_id;
  DELETE FROM scheduled_posts WHERE workspace_id = ws_id;
  DELETE FROM connections WHERE workspace_id = ws_id;
  DELETE FROM conversations WHERE workspace_id = ws_id;
  DELETE FROM smartlinks WHERE workspace_id = ws_id;
  DELETE FROM ads_campaigns WHERE workspace_id = ws_id;
  DELETE FROM reports WHERE workspace_id = ws_id;
  DELETE FROM tracker_sessions WHERE workspace_id = ws_id;
  INSERT INTO stat_metrics (workspace_id, key, label, value, delta, sort_order) VALUES (ws_id, 'followers', 'Followers', '6,280', '+8.7%', 0);
  INSERT INTO stat_metrics (workspace_id, key, label, value, delta, sort_order) VALUES (ws_id, 'profile_views', 'Profile views', '19,540', '+4.3%', 1);
  INSERT INTO stat_metrics (workspace_id, key, label, value, delta, sort_order) VALUES (ws_id, 'website_visits', 'Website visits', '2,105', '+2.9%', 2);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 0, 4200);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 1, 4310);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 2, 4380);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 3, 4460);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 4, 4590);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 5, 4710);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 6, 4805);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 7, 4920);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 8, 5100);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 9, 5260);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 10, 5410);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 11, 5590);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 12, 5920);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 13, 6280);
  INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES (ws_id, 'Pakistan', 61, 0);
  INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES (ws_id, 'United Kingdom', 14, 1);
  INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES (ws_id, 'United Arab Emirates', 13, 2);
  INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES (ws_id, 'United States', 7, 3);
  INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES (ws_id, 'Other', 5, 4);
  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, 'Karachi', 'Pakistan', 3820, 0);
  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, 'Lahore', 'Pakistan', 1140, 1);
  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, 'Dubai', 'UAE', 610, 2);
  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, 'London', 'United Kingdom', 410, 3);
  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, 'Islamabad', 'Pakistan', 300, 4);
  INSERT INTO platform_posts (workspace_id, platform, label, posts, reach) VALUES (ws_id, 'instagram', 'Instagram', 24, '18.9K');
  INSERT INTO platform_posts (workspace_id, platform, label, posts, reach) VALUES (ws_id, 'facebook', 'Facebook', 15, '9.4K');
  INSERT INTO platform_posts (workspace_id, platform, label, posts, reach) VALUES (ws_id, 'tiktok', 'TikTok', 6, '22.7K');
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 8, 0.4545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 9, 0.7727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 10, 0.0455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 11, 0.3636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 12, 0.6818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 13, 1.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 14, 0.2727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 15, 0.5909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 16, 0.9091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 17, 0.1818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 18, 0.5000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 19, 0.8182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 8, 0.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 9, 0.3182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 10, 0.6364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 11, 0.9545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 12, 0.2273) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 13, 0.5455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 14, 0.8636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 15, 0.1364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 16, 0.4545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 17, 0.7727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 18, 0.0455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 19, 0.3636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 8, 0.5909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 9, 0.9091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 10, 0.1818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 11, 0.5000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 12, 0.8182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 13, 0.0909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 14, 0.4091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 15, 0.7273) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 16, 0.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 17, 0.3182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 18, 0.6364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 19, 0.9545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 8, 0.1364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 9, 0.4545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 10, 0.7727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 11, 0.0455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 12, 0.3636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 13, 0.6818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 14, 1.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 15, 0.2727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 16, 0.5909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 17, 0.9091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 18, 0.1818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 19, 0.5000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 8, 0.7273) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 9, 0.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 10, 0.3182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 11, 0.6364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 12, 0.9545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 13, 0.2273) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 14, 0.5455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 15, 0.8636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 16, 0.1364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 17, 0.4545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 18, 0.7727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 19, 0.0455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 8, 0.2727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 9, 0.5909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 10, 0.9091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 11, 0.1818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 12, 0.5000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 13, 0.8182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 14, 0.0909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 15, 0.4091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 16, 0.7273) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 17, 0.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 18, 0.3182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 19, 0.6364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 8, 0.8636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 9, 0.1364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 10, 0.4545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 11, 0.7727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 12, 0.0455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 13, 0.3636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 14, 0.6818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 15, 1.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 16, 0.2727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 17, 0.5909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 18, 0.9091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 19, 0.1818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO scheduled_posts (workspace_id, day, hour, time_label, platform, caption) VALUES (ws_id, 0, 11, '11:00 AM', 'instagram', 'New menu at HIRA Kitchen: catering trays for community iftars.');
  INSERT INTO scheduled_posts (workspace_id, day, hour, time_label, platform, caption) VALUES (ws_id, 2, 12, '12:00 PM', 'facebook', 'This week’s lunch special is now live — order before 2 PM.');
  INSERT INTO scheduled_posts (workspace_id, day, hour, time_label, platform, caption) VALUES (ws_id, 3, 9, '9:00 AM', 'tiktok', 'Behind the scenes: prepping 300 iftar trays.');
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'facebook', 'Facebook', 'connected', 'HIRA Kitchen', 0);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'instagram', 'Instagram', 'connected', '@hira.kitchen', 1);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'threads', 'Threads', 'not-connected', NULL, 2);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'x', 'X', 'not-connected', NULL, 3);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'bluesky', 'Bluesky', 'not-connected', NULL, 4);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'linkedin', 'LinkedIn', 'not-connected', NULL, 5);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'pinterest', 'Pinterest', 'connected', 'HIRA Kitchen Recipes', 6);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'tiktok', 'TikTok (personal)', 'connected', '@hira.kitchen', 7);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'tiktok', 'TikTok (business)', 'not-connected', NULL, 8);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'google', 'Google Business Profile', 'connected', 'HIRA Kitchen — Karachi', 9);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'youtube', 'YouTube', 'not-connected', NULL, 10);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'twitch', 'Twitch', 'not-connected', NULL, 11);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'facebook', 'Meta Ads', 'connected', 'Ad account 9021', 12);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'google', 'Google Ads', 'not-connected', NULL, 13);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'tiktok', 'TikTok Ads', 'not-connected', NULL, 14);
  INSERT INTO conversations (workspace_id, platform, name, preview, time_label, unread, resolved) VALUES (ws_id, 'instagram', 'Fatima Noor', 'Do you deliver catering trays outside Karachi?', '6m', true, false);
  INSERT INTO conversations (workspace_id, platform, name, preview, time_label, unread, resolved) VALUES (ws_id, 'facebook', 'Hamza Iqbal', 'Can I get a quote for a 40-person iftar next Friday?', '40m', true, false);
  INSERT INTO conversations (workspace_id, platform, name, preview, time_label, unread, resolved) VALUES (ws_id, 'instagram', '@rukhsar.eats', 'The biryani trays were amazing, ordering again!', '2h', false, true);
  INSERT INTO smartlinks (workspace_id, label, clicks, sort_order) VALUES (ws_id, 'Catering menu (PDF)', 610, 0);
  INSERT INTO smartlinks (workspace_id, label, clicks, sort_order) VALUES (ws_id, 'Order this week’s lunch special', 388, 1);
  INSERT INTO smartlinks (workspace_id, label, clicks, sort_order) VALUES (ws_id, 'Community iftar sponsorship', 152, 2);
  INSERT INTO ads_campaigns (workspace_id, channel, name, status, spend, budget) VALUES (ws_id, 'Meta Ads', 'HIRA Kitchen — catering leads', 'active', 420, 800);
  INSERT INTO ads_campaigns (workspace_id, channel, name, status, spend, budget) VALUES (ws_id, 'TikTok Ads', 'Lunch special awareness', 'active', 160, 300);
  INSERT INTO reports (workspace_id, name, kind, report_date, status) VALUES (ws_id, 'HIRA Kitchen — campaign recap', 'PDF', 'Jun 14, 2026', 'sent');
  INSERT INTO reports (workspace_id, name, kind, report_date, status) VALUES (ws_id, 'HIRA Kitchen — catering season wrap', 'PPT', 'May 30, 2026', 'draft');
  INSERT INTO tracker_sessions (workspace_id, hashtag, platform, status, started, mentions) VALUES (ws_id, '#HIRAKitchenIftar', 'Instagram', 'active', '2026-06-25', 168);
  INSERT INTO tracker_sessions (workspace_id, hashtag, platform, status, started, mentions) VALUES (ws_id, '#RamadanAppeal', 'All platforms', 'completed', '2026-03-10', 940);

  SELECT id INTO ws_id FROM workspaces WHERE key = 'al-khalil' AND account_id = acct_id;
  DELETE FROM stat_metrics WHERE workspace_id = ws_id;
  DELETE FROM growth_points WHERE workspace_id = ws_id;
  DELETE FROM followers_by_country WHERE workspace_id = ws_id;
  DELETE FROM followers_by_city WHERE workspace_id = ws_id;
  DELETE FROM platform_posts WHERE workspace_id = ws_id;
  DELETE FROM heatmap_cells WHERE workspace_id = ws_id;
  DELETE FROM scheduled_posts WHERE workspace_id = ws_id;
  DELETE FROM connections WHERE workspace_id = ws_id;
  DELETE FROM conversations WHERE workspace_id = ws_id;
  DELETE FROM smartlinks WHERE workspace_id = ws_id;
  DELETE FROM ads_campaigns WHERE workspace_id = ws_id;
  DELETE FROM reports WHERE workspace_id = ws_id;
  DELETE FROM tracker_sessions WHERE workspace_id = ws_id;
  INSERT INTO stat_metrics (workspace_id, key, label, value, delta, sort_order) VALUES (ws_id, 'followers', 'Followers', '3,940', '+15.2%', 0);
  INSERT INTO stat_metrics (workspace_id, key, label, value, delta, sort_order) VALUES (ws_id, 'profile_views', 'Profile views', '9,880', '+9.6%', 1);
  INSERT INTO stat_metrics (workspace_id, key, label, value, delta, sort_order) VALUES (ws_id, 'website_visits', 'Website visits', '1,240', '+3.1%', 2);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 0, 2100);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 1, 2180);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 2, 2260);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 3, 2340);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 4, 2450);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 5, 2590);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 6, 2710);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 7, 2860);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 8, 3020);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 9, 3180);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 10, 3350);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 11, 3540);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 12, 3760);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 13, 3940);
  INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES (ws_id, 'Pakistan', 58, 0);
  INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES (ws_id, 'United Kingdom', 19, 1);
  INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES (ws_id, 'United Arab Emirates', 12, 2);
  INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES (ws_id, 'Canada', 6, 3);
  INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES (ws_id, 'Other', 5, 4);
  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, 'Lahore', 'Pakistan', 1680, 0);
  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, 'Karachi', 'Pakistan', 640, 1);
  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, 'London', 'United Kingdom', 420, 2);
  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, 'Dubai', 'UAE', 260, 3);
  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, 'Toronto', 'Canada', 130, 4);
  INSERT INTO platform_posts (workspace_id, platform, label, posts, reach) VALUES (ws_id, 'instagram', 'Instagram', 14, '11.2K');
  INSERT INTO platform_posts (workspace_id, platform, label, posts, reach) VALUES (ws_id, 'tiktok', 'TikTok', 11, '19.8K');
  INSERT INTO platform_posts (workspace_id, platform, label, posts, reach) VALUES (ws_id, 'facebook', 'Facebook', 8, '6.1K');
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 8, 0.4545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 9, 0.7727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 10, 0.0455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 11, 0.3636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 12, 0.6818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 13, 1.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 14, 0.2727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 15, 0.5909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 16, 0.9091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 17, 0.1818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 18, 0.5000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 19, 0.8182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 8, 0.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 9, 0.3182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 10, 0.6364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 11, 0.9545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 12, 0.2273) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 13, 0.5455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 14, 0.8636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 15, 0.1364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 16, 0.4545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 17, 0.7727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 18, 0.0455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 19, 0.3636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 8, 0.5909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 9, 0.9091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 10, 0.1818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 11, 0.5000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 12, 0.8182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 13, 0.0909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 14, 0.4091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 15, 0.7273) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 16, 0.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 17, 0.3182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 18, 0.6364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 19, 0.9545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 8, 0.1364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 9, 0.4545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 10, 0.7727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 11, 0.0455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 12, 0.3636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 13, 0.6818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 14, 1.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 15, 0.2727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 16, 0.5909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 17, 0.9091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 18, 0.1818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 19, 0.5000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 8, 0.7273) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 9, 0.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 10, 0.3182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 11, 0.6364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 12, 0.9545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 13, 0.2273) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 14, 0.5455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 15, 0.8636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 16, 0.1364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 17, 0.4545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 18, 0.7727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 19, 0.0455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 8, 0.2727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 9, 0.5909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 10, 0.9091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 11, 0.1818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 12, 0.5000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 13, 0.8182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 14, 0.0909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 15, 0.4091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 16, 0.7273) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 17, 0.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 18, 0.3182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 19, 0.6364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 8, 0.8636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 9, 0.1364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 10, 0.4545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 11, 0.7727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 12, 0.0455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 13, 0.3636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 14, 0.6818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 15, 1.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 16, 0.2727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 17, 0.5909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 18, 0.9091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 19, 0.1818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO scheduled_posts (workspace_id, day, hour, time_label, platform, caption) VALUES (ws_id, 2, 16, '4:00 PM', 'tiktok', 'A day in the life of a Huffaz student at Al Khalil.');
  INSERT INTO scheduled_posts (workspace_id, day, hour, time_label, platform, caption) VALUES (ws_id, 4, 10, '10:00 AM', 'instagram', 'Congratulations to this term’s new Huffaz graduates.');
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'facebook', 'Facebook', 'connected', 'Al Khalil Huffaz School', 0);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'instagram', 'Instagram', 'connected', '@alkhalil.huffaz', 1);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'threads', 'Threads', 'not-connected', NULL, 2);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'x', 'X', 'not-connected', NULL, 3);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'bluesky', 'Bluesky', 'not-connected', NULL, 4);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'linkedin', 'LinkedIn', 'not-connected', NULL, 5);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'pinterest', 'Pinterest', 'not-connected', NULL, 6);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'tiktok', 'TikTok (personal)', 'connected', '@alkhalil.huffaz', 7);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'tiktok', 'TikTok (business)', 'not-connected', NULL, 8);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'google', 'Google Business Profile', 'connected', 'Al Khalil Huffaz School — Lahore', 9);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'youtube', 'YouTube', 'connected', 'Al Khalil Huffaz School', 10);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'twitch', 'Twitch', 'not-connected', NULL, 11);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'facebook', 'Meta Ads', 'pending', 'Reconnect required', 12);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'google', 'Google Ads', 'not-connected', NULL, 13);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'tiktok', 'TikTok Ads', 'not-connected', NULL, 14);
  INSERT INTO conversations (workspace_id, platform, name, preview, time_label, unread, resolved) VALUES (ws_id, 'tiktok', '@huffaz.parent', 'What age does the Huffaz program start from?', '25m', true, false);
  INSERT INTO conversations (workspace_id, platform, name, preview, time_label, unread, resolved) VALUES (ws_id, 'instagram', 'Sara Malik', 'Is there a waiting list for next intake?', '4h', false, false);
  INSERT INTO smartlinks (workspace_id, label, clicks, sort_order) VALUES (ws_id, 'Huffaz program enrollment', 396, 0);
  INSERT INTO smartlinks (workspace_id, label, clicks, sort_order) VALUES (ws_id, 'School calendar 2026', 118, 1);
  INSERT INTO ads_campaigns (workspace_id, channel, name, status, spend, budget) VALUES (ws_id, 'TikTok Ads', 'Huffaz graduate stories', 'active', 140, 400);
  INSERT INTO reports (workspace_id, name, kind, report_date, status) VALUES (ws_id, 'Al Khalil Huffaz School — term summary', 'PDF', 'Jun 20, 2026', 'sent');
  INSERT INTO tracker_sessions (workspace_id, hashtag, platform, status, started, mentions) VALUES (ws_id, '#AlKhalilHuffaz', 'TikTok', 'active', '2026-06-01', 245);

  SELECT id INTO ws_id FROM workspaces WHERE key = 'al-rehman' AND account_id = acct_id;
  DELETE FROM stat_metrics WHERE workspace_id = ws_id;
  DELETE FROM growth_points WHERE workspace_id = ws_id;
  DELETE FROM followers_by_country WHERE workspace_id = ws_id;
  DELETE FROM followers_by_city WHERE workspace_id = ws_id;
  DELETE FROM platform_posts WHERE workspace_id = ws_id;
  DELETE FROM heatmap_cells WHERE workspace_id = ws_id;
  DELETE FROM scheduled_posts WHERE workspace_id = ws_id;
  DELETE FROM connections WHERE workspace_id = ws_id;
  DELETE FROM conversations WHERE workspace_id = ws_id;
  DELETE FROM smartlinks WHERE workspace_id = ws_id;
  DELETE FROM ads_campaigns WHERE workspace_id = ws_id;
  DELETE FROM reports WHERE workspace_id = ws_id;
  DELETE FROM tracker_sessions WHERE workspace_id = ws_id;
  INSERT INTO stat_metrics (workspace_id, key, label, value, delta, sort_order) VALUES (ws_id, 'followers', 'Followers', '5,610', '+5.4%', 0);
  INSERT INTO stat_metrics (workspace_id, key, label, value, delta, sort_order) VALUES (ws_id, 'profile_views', 'Profile views', '14,760', '+3.2%', 1);
  INSERT INTO stat_metrics (workspace_id, key, label, value, delta, sort_order) VALUES (ws_id, 'website_visits', 'Website visits', '2,890', '-0.6%', 2);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 0, 4600);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 1, 4650);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 2, 4710);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 3, 4780);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 4, 4860);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 5, 4920);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 6, 5010);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 7, 5080);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 8, 5170);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 9, 5260);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 10, 5340);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 11, 5430);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 12, 5520);
  INSERT INTO growth_points (workspace_id, idx, value) VALUES (ws_id, 13, 5610);
  INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES (ws_id, 'Pakistan', 52, 0);
  INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES (ws_id, 'United States', 22, 1);
  INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES (ws_id, 'United Kingdom', 13, 2);
  INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES (ws_id, 'United Arab Emirates', 8, 3);
  INSERT INTO followers_by_country (workspace_id, label, value, sort_order) VALUES (ws_id, 'Other', 5, 4);
  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, 'Islamabad', 'Pakistan', 2140, 0);
  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, 'Karachi', 'Pakistan', 780, 1);
  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, 'Houston', 'United States', 610, 2);
  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, 'London', 'United Kingdom', 420, 3);
  INSERT INTO followers_by_city (workspace_id, city, country, followers, sort_order) VALUES (ws_id, 'Dubai', 'UAE', 260, 4);
  INSERT INTO platform_posts (workspace_id, platform, label, posts, reach) VALUES (ws_id, 'facebook', 'Facebook', 16, '20.4K');
  INSERT INTO platform_posts (workspace_id, platform, label, posts, reach) VALUES (ws_id, 'instagram', 'Instagram', 13, '15.8K');
  INSERT INTO platform_posts (workspace_id, platform, label, posts, reach) VALUES (ws_id, 'tiktok', 'TikTok', 4, '8.2K');
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 8, 0.4545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 9, 0.7727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 10, 0.0455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 11, 0.3636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 12, 0.6818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 13, 1.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 14, 0.2727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 15, 0.5909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 16, 0.9091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 17, 0.1818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 18, 0.5000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 0, 19, 0.8182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 8, 0.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 9, 0.3182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 10, 0.6364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 11, 0.9545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 12, 0.2273) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 13, 0.5455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 14, 0.8636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 15, 0.1364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 16, 0.4545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 17, 0.7727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 18, 0.0455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 1, 19, 0.3636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 8, 0.5909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 9, 0.9091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 10, 0.1818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 11, 0.5000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 12, 0.8182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 13, 0.0909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 14, 0.4091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 15, 0.7273) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 16, 0.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 17, 0.3182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 18, 0.6364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 2, 19, 0.9545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 8, 0.1364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 9, 0.4545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 10, 0.7727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 11, 0.0455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 12, 0.3636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 13, 0.6818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 14, 1.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 15, 0.2727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 16, 0.5909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 17, 0.9091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 18, 0.1818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 3, 19, 0.5000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 8, 0.7273) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 9, 0.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 10, 0.3182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 11, 0.6364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 12, 0.9545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 13, 0.2273) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 14, 0.5455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 15, 0.8636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 16, 0.1364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 17, 0.4545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 18, 0.7727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 4, 19, 0.0455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 8, 0.2727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 9, 0.5909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 10, 0.9091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 11, 0.1818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 12, 0.5000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 13, 0.8182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 14, 0.0909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 15, 0.4091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 16, 0.7273) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 17, 0.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 18, 0.3182) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 5, 19, 0.6364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 8, 0.8636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 9, 0.1364) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 10, 0.4545) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 11, 0.7727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 12, 0.0455) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 13, 0.3636) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 14, 0.6818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 15, 1.0000) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 16, 0.2727) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 17, 0.5909) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 18, 0.9091) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO heatmap_cells (workspace_id, day, hour, value) VALUES (ws_id, 6, 19, 0.1818) ON CONFLICT (workspace_id, day, hour) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO scheduled_posts (workspace_id, day, hour, time_label, platform, caption) VALUES (ws_id, 5, 10, '10:00 AM', 'facebook', 'Alumni spotlight: Class of 2019 update from Al Rehman Academy.');
  INSERT INTO scheduled_posts (workspace_id, day, hour, time_label, platform, caption) VALUES (ws_id, 6, 13, '1:00 PM', 'instagram', 'Open house this Sunday — tour the new science lab.');
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'facebook', 'Facebook', 'connected', 'Al Rehman Academy', 0);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'instagram', 'Instagram', 'connected', '@alrehman.academy', 1);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'threads', 'Threads', 'not-connected', NULL, 2);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'x', 'X', 'connected', '@AlRehmanAcademy', 3);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'bluesky', 'Bluesky', 'not-connected', NULL, 4);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'linkedin', 'LinkedIn', 'connected', 'Al Rehman Academy', 5);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'pinterest', 'Pinterest', 'not-connected', NULL, 6);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'tiktok', 'TikTok (personal)', 'not-connected', NULL, 7);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'tiktok', 'TikTok (business)', 'not-connected', NULL, 8);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'google', 'Google Business Profile', 'connected', 'Al Rehman Academy — Islamabad', 9);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'youtube', 'YouTube', 'connected', 'Al Rehman Academy', 10);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'twitch', 'Twitch', 'not-connected', NULL, 11);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'facebook', 'Meta Ads', 'connected', 'Ad account 7743', 12);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'google', 'Google Ads', 'connected', 'Ad account 3390', 13);
  INSERT INTO connections (workspace_id, platform, label, status, account, sort_order) VALUES (ws_id, 'tiktok', 'TikTok Ads', 'not-connected', NULL, 14);
  INSERT INTO conversations (workspace_id, platform, name, preview, time_label, unread, resolved) VALUES (ws_id, 'facebook', 'Nadia Farooqi', 'What documents are needed for admission next term?', '12m', true, false);
  INSERT INTO conversations (workspace_id, platform, name, preview, time_label, unread, resolved) VALUES (ws_id, 'instagram', 'Ahsan Raza', 'Do you offer transport from Bahria Town?', '1h', false, false);
  INSERT INTO conversations (workspace_id, platform, name, preview, time_label, unread, resolved) VALUES (ws_id, 'facebook', 'Mariam Yousaf', 'Thank you for the open house invite, we’ll attend.', '5h', false, true);
  INSERT INTO smartlinks (workspace_id, label, clicks, sort_order) VALUES (ws_id, 'Open house RSVP', 318, 0);
  INSERT INTO smartlinks (workspace_id, label, clicks, sort_order) VALUES (ws_id, 'Admissions 2026 — apply now', 704, 1);
  INSERT INTO smartlinks (workspace_id, label, clicks, sort_order) VALUES (ws_id, 'Alumni newsletter signup', 96, 2);
  INSERT INTO ads_campaigns (workspace_id, channel, name, status, spend, budget) VALUES (ws_id, 'Meta Ads', 'Al Rehman Academy open house', 'active', 210, 750);
  INSERT INTO ads_campaigns (workspace_id, channel, name, status, spend, budget) VALUES (ws_id, 'Google Ads', 'Al Rehman Academy — brand search', 'active', 190, 300);
  INSERT INTO reports (workspace_id, name, kind, report_date, status) VALUES (ws_id, 'Al Rehman Academy — Q2 overview', 'PPT', 'Jun 28, 2026', 'draft');
  INSERT INTO reports (workspace_id, name, kind, report_date, status) VALUES (ws_id, 'Al Rehman Academy — admissions funnel', 'PDF', 'Jun 05, 2026', 'sent');
  INSERT INTO tracker_sessions (workspace_id, hashtag, platform, status, started, mentions) VALUES (ws_id, '#AlRehmanAlumni', 'Facebook', 'completed', '2026-05-02', 156);
  INSERT INTO tracker_sessions (workspace_id, hashtag, platform, status, started, mentions) VALUES (ws_id, '#AlRehmanOpenHouse', 'Instagram', 'active', '2026-07-05', 88);
END $$;

COMMIT;
