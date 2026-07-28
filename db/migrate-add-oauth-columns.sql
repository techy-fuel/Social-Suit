-- Adds real-OAuth token storage to connections. Safe to run on the live
-- database — additive only, no data loss.
ALTER TABLE connections ADD COLUMN IF NOT EXISTS access_token TEXT;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS platform_account_id TEXT;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ;
