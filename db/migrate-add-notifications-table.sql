-- Adds the notifications table (post published/failed, new inbox message,
-- connection needs reconnecting). Safe to re-run.
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  workspace_id INT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_workspace_idx ON notifications (workspace_id, created_at DESC);
