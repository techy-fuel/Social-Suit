import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getWorkspaceId, badRequest } from './_db.js';
import { withAuth, Session } from './_auth.js';
import { getSupabaseAdmin } from './_supabase.js';
import { publishPhotoToPage, publishPhotoToInstagram } from './_meta.js';

const MEDIA_BUCKET = 'post-media';

async function uploadMedia(req: VercelRequest, res: VercelResponse, session: Session) {
  const { workspace, filename, contentType, dataBase64 } = req.body || {};
  if (!workspace || !filename || !contentType || !dataBase64) {
    return badRequest(res, 'workspace, filename, contentType, dataBase64 are required');
  }
  await getWorkspaceId(workspace, session.accountId);

  const buffer = Buffer.from(dataBase64, 'base64');
  if (buffer.length > 8 * 1024 * 1024) {
    return badRequest(res, 'File is too large (8MB max).');
  }
  const safeName = String(filename).replace(/[^a-zA-Z0-9_.-]/g, '_');
  const path = `${session.accountId}/${workspace}/${Date.now()}-${safeName}`;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, buffer, { contentType, upsert: false });
  if (error) throw new Error(`Media upload failed: ${error.message}`);

  const { data: pub } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  res.status(201).json({ url: pub.publicUrl, path });
}

async function discardMedia(req: VercelRequest, res: VercelResponse, session: Session) {
  const { path } = req.body || {};
  if (!path) return badRequest(res, 'path is required');
  // Paths are namespaced by accountId, so this also stops one tenant from
  // deleting another's file by guessing a path.
  if (!String(path).startsWith(`${session.accountId}/`)) {
    return res.status(403).json({ error: 'Not your file.' });
  }
  const { error } = await getSupabaseAdmin().storage.from(MEDIA_BUCKET).remove([path]);
  if (error) throw new Error(`Media delete failed: ${error.message}`);
  res.status(200).json({ ok: true });
}

async function publishPost(req: VercelRequest, res: VercelResponse, session: Session) {
  const { id } = req.body || {};
  if (!id) return badRequest(res, 'id is required');

  const rows = await sql`
    SELECT sp.id, sp.platform, sp.caption, sp.media_url, sp.media_path, w.id AS workspace_id
    FROM scheduled_posts sp
    JOIN workspaces w ON w.id = sp.workspace_id
    WHERE sp.id = ${id} AND w.account_id = ${session.accountId}`;
  const post = rows[0];
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  if (!post.media_url) return badRequest(res, 'This post has no image attached — publishing requires media for now.');

  const label = post.platform === 'facebook' ? 'Facebook' : post.platform === 'instagram' ? 'Instagram' : null;
  if (!label) return badRequest(res, `Publishing isn't wired up for "${post.platform}" yet.`);

  const conns = await sql`SELECT access_token, platform_account_id FROM connections WHERE workspace_id = ${post.workspace_id} AND platform = ${post.platform} AND label = ${label} AND status = 'connected'`;
  const conn = conns[0];
  if (!conn || !conn.access_token || !conn.platform_account_id) {
    return badRequest(res, `Connect ${label} first (Connections page) before publishing to it.`);
  }

  try {
    const platformPostId = post.platform === 'facebook'
      ? await publishPhotoToPage(conn.platform_account_id, conn.access_token, post.media_url, post.caption)
      : await publishPhotoToInstagram(conn.platform_account_id, conn.access_token, post.media_url, post.caption);

    await sql`UPDATE scheduled_posts SET publish_status = 'published', platform_post_id = ${platformPostId}, publish_error = NULL WHERE id = ${id}`;

    // The platform now hosts its own copy — free up our storage instead of
    // keeping every published image around indefinitely.
    if (post.media_path) {
      await getSupabaseAdmin().storage.from(MEDIA_BUCKET).remove([post.media_path]).catch((err) => {
        console.error('Failed to clean up published media:', err);
      });
    }

    res.status(200).json({ ok: true, platformPostId });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await sql`UPDATE scheduled_posts SET publish_status = 'failed', publish_error = ${message} WHERE id = ${id}`;
    res.status(502).json({ error: message });
  }
}

async function handler(req: VercelRequest, res: VercelResponse, session: Session) {
  const action = String(req.query.action || '');

  if (req.method === 'DELETE') {
    const id = req.query.id;
    if (!id) return badRequest(res, 'id is required');
    const rows = await sql`
      DELETE FROM scheduled_posts
      WHERE id = ${id} AND workspace_id IN (SELECT id FROM workspaces WHERE account_id = ${session.accountId})
      RETURNING id, media_path`;
    if (rows.length === 0) return res.status(404).json({ error: 'Post not found.' });
    if (rows[0].media_path) {
      await getSupabaseAdmin().storage.from(MEDIA_BUCKET).remove([rows[0].media_path]).catch((err) => {
        console.error('Failed to clean up deleted post media:', err);
      });
    }
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'POST' && action === 'upload-media') return uploadMedia(req, res, session);
  if (req.method === 'POST' && action === 'discard-media') return discardMedia(req, res, session);
  if (req.method === 'POST' && action === 'publish') return publishPost(req, res, session);

  const workspace = String(req.query.workspace || (req.body && req.body.workspace) || '');
  if (!workspace) return badRequest(res, 'workspace is required');
  const workspaceId = await getWorkspaceId(workspace, session.accountId);

  if (req.method === 'POST') {
    const { day, hour, time, platform, caption, status, mediaUrl, mediaPath } = req.body || {};
    if (day == null || hour == null || !time || !platform || !caption) {
      return badRequest(res, 'day, hour, time, platform, caption are required');
    }
    const postStatus = status === 'draft' ? 'draft' : 'scheduled';
    const rows = await sql`
      INSERT INTO scheduled_posts (workspace_id, day, hour, time_label, platform, caption, status, media_url, media_path)
      VALUES (${workspaceId}, ${day}, ${hour}, ${time}, ${platform}, ${caption}, ${postStatus}, ${mediaUrl || null}, ${mediaPath || null})
      RETURNING id, day, hour, time_label AS time, platform, caption, status, media_url AS "mediaUrl", publish_status AS "publishStatus"`;
    return res.status(201).json(rows[0]);
  }

  const [posts, heat] = await Promise.all([
    sql`SELECT id, day, hour, time_label AS time, platform, caption, status, media_url AS "mediaUrl", publish_status AS "publishStatus", publish_error AS "publishError" FROM scheduled_posts WHERE workspace_id = ${workspaceId} ORDER BY day, hour`,
    sql`SELECT day, hour, value FROM heatmap_cells WHERE workspace_id = ${workspaceId}`,
  ]);

  res.status(200).json({ scheduledPosts: posts, heatmap: heat });
}

export default withAuth(handler);
