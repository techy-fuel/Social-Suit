-- SocialSuite schema. Every content table is scoped by workspace_id so the
-- workspace switcher in the UI drives real, per-client data.

CREATE TABLE IF NOT EXISTS workspaces (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  initials TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
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
