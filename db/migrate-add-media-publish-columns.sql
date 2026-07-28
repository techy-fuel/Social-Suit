-- Adds media attachments and real-publish tracking to scheduled_posts. Safe
-- to run on the live database — additive only, no data loss.
ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS publish_status TEXT NOT NULL DEFAULT 'unpublished';
ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS platform_post_id TEXT;
ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS publish_error TEXT;
