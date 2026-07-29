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

-- Credentials live in Supabase Auth (auth.users), not here — this table
-- just maps a Supabase auth user to our own tenant (account).
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  supabase_user_id UUID UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
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

CREATE TABLE IF NOT EXISTS connections (
  id SERIAL PRIMARY KEY,
  workspace_id INT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not-connected',
  account TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  -- Populated once a real OAuth connection (e.g. Meta) is completed. A
  -- workspace can have several connected rows for the same platform (e.g.
  -- multiple Facebook Pages) — platform_account_id is what's actually
  -- unique per connected account, not platform+label.
  access_token TEXT,
  platform_account_id TEXT,
  token_expires_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS connections_workspace_platform_account_idx
  ON connections (workspace_id, platform_account_id) WHERE platform_account_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id SERIAL PRIMARY KEY,
  workspace_id INT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  day INT NOT NULL,
  hour INT NOT NULL,
  time_label TEXT NOT NULL,
  scheduled_date DATE,
  platform TEXT NOT NULL,
  -- Which specific connected account (e.g. which of several Facebook Pages)
  -- this post targets. Nullable: drafts/legacy rows may not have one yet.
  connection_id INT REFERENCES connections(id) ON DELETE SET NULL,
  caption TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  media_url TEXT,
  media_path TEXT,
  media_type TEXT,
  media_storage TEXT,
  publish_status TEXT NOT NULL DEFAULT 'unpublished',
  platform_post_id TEXT,
  publish_error TEXT
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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Set once a real webhook-sourced message/comment lands here.
  external_id TEXT,
  sender_id TEXT,
  kind TEXT NOT NULL DEFAULT 'dm'
);
CREATE UNIQUE INDEX IF NOT EXISTS conversations_workspace_external_id_idx ON conversations (workspace_id, external_id) WHERE external_id IS NOT NULL;

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
