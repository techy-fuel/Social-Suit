import { sql } from './_db.js';

export type NotificationType = 'publish_success' | 'publish_failed' | 'new_message' | 'new_comment' | 'connection_issue';

// Best-effort — a notification failing to write should never take down the
// actual operation (a publish, an inbound webhook) it's reporting on.
export async function notify(workspaceId: number, type: NotificationType, title: string, description?: string) {
  try {
    await sql`INSERT INTO notifications (workspace_id, type, title, description) VALUES (${workspaceId}, ${type}, ${title}, ${description || null})`;
  } catch (err) {
    console.error('Failed to write notification:', err);
  }
}
