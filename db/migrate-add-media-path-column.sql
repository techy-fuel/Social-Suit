-- Tracks the storage object path (not just the public URL) so a published
-- post's image can be deleted from storage afterward to save space.
ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS media_path TEXT;
