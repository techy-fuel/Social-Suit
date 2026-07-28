-- Adds a real calendar date to scheduled_posts. Previously only day-of-week
-- (0-6) + hour existed, which is fine for the "best time to post" heatmap
-- but can't represent an actual one-time scheduled date. Safe to run on the
-- live database — additive only, no data loss.
ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS scheduled_date DATE;
