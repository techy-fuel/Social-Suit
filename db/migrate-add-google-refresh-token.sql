-- YouTube (and other refresh-token-based OAuth) access tokens expire in
-- about an hour, unlike Meta's long-lived Page tokens, so we need the
-- refresh token to mint new ones without re-prompting the user. Safe to run
-- on the live database — additive only, no data loss.
ALTER TABLE connections ADD COLUMN IF NOT EXISTS refresh_token TEXT;
