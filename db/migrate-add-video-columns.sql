-- Adds video support tracking to scheduled_posts. Safe to run on the live
-- database — additive only, no data loss.
ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS media_type TEXT;
ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS media_storage TEXT;

-- Backfill existing rows: any media uploaded before this migration went
-- through Supabase Storage and was always an image.
UPDATE scheduled_posts SET media_type = 'image', media_storage = 'supabase' WHERE media_url IS NOT NULL AND media_type IS NULL;
