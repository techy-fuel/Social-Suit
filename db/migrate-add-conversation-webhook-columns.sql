-- Tracks enough platform-side identity to receive real webhook events and
-- send real replies back. Safe to run on the live database — additive only.
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS sender_id TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'dm';
-- One conversation row per platform thread/comment per workspace — webhook
-- deliveries can arrive more than once, this makes re-processing idempotent.
CREATE UNIQUE INDEX IF NOT EXISTS conversations_workspace_external_id_idx ON conversations (workspace_id, external_id) WHERE external_id IS NOT NULL;
