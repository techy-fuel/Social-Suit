-- Lets a workspace connect more than one Facebook Page / Instagram account,
-- and ties each scheduled post to the specific connection it should publish
-- through (instead of guessing "the" Facebook connection by label). Safe to
-- run on the live database — additive only, no data loss.
CREATE UNIQUE INDEX IF NOT EXISTS connections_workspace_platform_account_idx
  ON connections (workspace_id, platform_account_id) WHERE platform_account_id IS NOT NULL;

ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS connection_id INT REFERENCES connections(id) ON DELETE SET NULL;
