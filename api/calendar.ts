import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getWorkspaceId, badRequest } from './_db.js';
import { withAuth, Session } from './_auth.js';
import { getSupabaseAdmin } from './_supabase.js';
import { publishPhotoToPage, publishPhotoToInstagram, publishVideoToPage, publishVideoToInstagram, finishInstagramVideo } from './_meta.js';
import { refreshGoogleAccessToken, uploadVideoToYouTube, deleteYouTubeVideo } from './_google.js';
import { refreshTikTokAccessToken, publishVideoToTikTok, finishTikTokPublish } from './_tiktok.js';
import { refreshLinkedInAccessToken, publishToLinkedIn } from './_linkedin.js';
import { refreshThreadsAccessToken, publishToThreads, finishThreadsPublish } from './_threads.js';
import { refreshPinterestAccessToken, publishToPinterest } from './_pinterest.js';
import { refreshXAccessToken, publishToX } from './_x.js';
import { createUploadUrl, deleteObject as deleteR2Object } from './_r2.js';
import { notify } from './_notify.js';

const MEDIA_BUCKET = 'post-media';

// YouTube access tokens expire hourly, unlike Meta's long-lived Page
// tokens — refresh (and persist the new token) whenever it's expired or
// about to be.
async function getValidYouTubeAccessToken(connId: number, accessToken: string, refreshToken: string | null, expiresAt: string | null): Promise<string> {
  const expiringSoon = !expiresAt || new Date(expiresAt).getTime() < Date.now() + 60_000;
  if (!expiringSoon) return accessToken;
  if (!refreshToken) throw new Error("This YouTube connection can't refresh its token — reconnect it on the Connections page.");
  const refreshed = await refreshGoogleAccessToken(refreshToken);
  await sql`UPDATE connections SET access_token = ${refreshed.accessToken}, token_expires_at = ${refreshed.expiresAt.toISOString()} WHERE id = ${connId}`;
  return refreshed.accessToken;
}

// TikTok access tokens are also short-lived (~24h), and unlike Google, every
// refresh rotates the refresh_token too — the new one must be persisted or
// the connection becomes unrefreshable after the next refresh.
async function getValidTikTokAccessToken(connId: number, accessToken: string, refreshToken: string | null, expiresAt: string | null): Promise<string> {
  const expiringSoon = !expiresAt || new Date(expiresAt).getTime() < Date.now() + 60_000;
  if (!expiringSoon) return accessToken;
  if (!refreshToken) throw new Error("This TikTok connection can't refresh its token — reconnect it on the Connections page.");
  const refreshed = await refreshTikTokAccessToken(refreshToken);
  await sql`UPDATE connections SET access_token = ${refreshed.accessToken}, refresh_token = ${refreshed.refreshToken}, token_expires_at = ${refreshed.expiresAt.toISOString()} WHERE id = ${connId}`;
  return refreshed.accessToken;
}

// LinkedIn access tokens last ~60 days. Self-serve apps generally aren't
// granted a refresh token at all (that's a separately-approved product), so
// most LinkedIn connections will hit the "reconnect" branch here once the
// token expires rather than silently refreshing — same shape as the other
// platforms' missing-refresh-token case, just expected to happen more often.
async function getValidLinkedInAccessToken(connId: number, accessToken: string, refreshToken: string | null, expiresAt: string | null): Promise<string> {
  const expiringSoon = !expiresAt || new Date(expiresAt).getTime() < Date.now() + 60_000;
  if (!expiringSoon) return accessToken;
  if (!refreshToken) throw new Error("This LinkedIn connection can't refresh its token — reconnect it on the Connections page.");
  const refreshed = await refreshLinkedInAccessToken(refreshToken);
  await sql`UPDATE connections SET access_token = ${refreshed.accessToken}, refresh_token = ${refreshed.refreshToken}, token_expires_at = ${refreshed.expiresAt.toISOString()} WHERE id = ${connId}`;
  return refreshed.accessToken;
}

// Threads has no separate refresh_token — the long-lived access token
// itself gets extended in place, so there's nothing to fall back to if this
// fails (unlike the others, which distinguish "no refresh token" from "the
// refresh call failed"); either way it surfaces as a normal publish error.
async function getValidThreadsAccessToken(connId: number, accessToken: string, expiresAt: string | null): Promise<string> {
  const expiringSoon = !expiresAt || new Date(expiresAt).getTime() < Date.now() + 60_000;
  if (!expiringSoon) return accessToken;
  const refreshed = await refreshThreadsAccessToken(accessToken);
  await sql`UPDATE connections SET access_token = ${refreshed.accessToken}, token_expires_at = ${refreshed.expiresAt.toISOString()} WHERE id = ${connId}`;
  return refreshed.accessToken;
}

// Pinterest access tokens last 30 days; refresh tokens rotate on every use
// (like TikTok's), so the new one must be persisted or the connection
// becomes unrefreshable after the next refresh.
async function getValidPinterestAccessToken(connId: number, accessToken: string, refreshToken: string | null, expiresAt: string | null): Promise<string> {
  const expiringSoon = !expiresAt || new Date(expiresAt).getTime() < Date.now() + 60_000;
  if (!expiringSoon) return accessToken;
  if (!refreshToken) throw new Error("This Pinterest connection can't refresh its token — reconnect it on the Connections page.");
  const refreshed = await refreshPinterestAccessToken(refreshToken);
  await sql`UPDATE connections SET access_token = ${refreshed.accessToken}, refresh_token = ${refreshed.refreshToken}, token_expires_at = ${refreshed.expiresAt.toISOString()} WHERE id = ${connId}`;
  return refreshed.accessToken;
}

// X refresh tokens rotate on every use too — persist the new one or the
// connection becomes unrefreshable after the next refresh.
async function getValidXAccessToken(connId: number, accessToken: string, refreshToken: string | null, expiresAt: string | null): Promise<string> {
  const expiringSoon = !expiresAt || new Date(expiresAt).getTime() < Date.now() + 60_000;
  if (!expiringSoon) return accessToken;
  if (!refreshToken) throw new Error("This X connection can't refresh its token — reconnect it on the Connections page.");
  const refreshed = await refreshXAccessToken(refreshToken);
  await sql`UPDATE connections SET access_token = ${refreshed.accessToken}, refresh_token = ${refreshed.refreshToken}, token_expires_at = ${refreshed.expiresAt.toISOString()} WHERE id = ${connId}`;
  return refreshed.accessToken;
}

async function deleteMedia(path: string | null, storage: string | null) {
  if (!path) return;
  try {
    if (storage === 'r2') await deleteR2Object(path);
    else await getSupabaseAdmin().storage.from(MEDIA_BUCKET).remove([path]);
  } catch (err) {
    console.error('Failed to clean up media:', err);
  }
}

async function uploadMedia(req: VercelRequest, res: VercelResponse, session: Session) {
  const { workspace, filename, contentType, dataBase64 } = req.body || {};
  if (!workspace || !filename || !contentType || !dataBase64) {
    return badRequest(res, 'workspace, filename, contentType, dataBase64 are required');
  }
  await getWorkspaceId(workspace, session.accountId);

  const buffer = Buffer.from(dataBase64, 'base64');
  if (buffer.length > 8 * 1024 * 1024) {
    return badRequest(res, 'File is too large (8MB max for images — use video upload for larger files).');
  }
  const safeName = String(filename).replace(/[^a-zA-Z0-9_.-]/g, '_');
  const path = `${session.accountId}/${workspace}/${Date.now()}-${safeName}`;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, buffer, { contentType, upsert: false });
  if (error) throw new Error(`Media upload failed: ${error.message}`);

  const { data: pub } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  res.status(201).json({ url: pub.publicUrl, path, storage: 'supabase', mediaType: 'image' });
}

// Video files skip our backend entirely for the actual bytes — we only hand
// back a short-lived presigned URL, and the browser PUTs the file straight
// to R2. Routing large files through a Vercel function would hit its
// request body limit long before hitting anything R2/Supabase impose.
async function videoUploadUrl(req: VercelRequest, res: VercelResponse, session: Session) {
  const { workspace, filename, contentType } = req.body || {};
  if (!workspace || !filename || !contentType) {
    return badRequest(res, 'workspace, filename, contentType are required');
  }
  await getWorkspaceId(workspace, session.accountId);

  const safeName = String(filename).replace(/[^a-zA-Z0-9_.-]/g, '_');
  const path = `${session.accountId}/${workspace}/${Date.now()}-${safeName}`;
  const { uploadUrl, publicUrl } = await createUploadUrl(path, contentType);
  res.status(201).json({ uploadUrl, publicUrl, path, storage: 'r2', mediaType: 'video' });
}

async function discardMedia(req: VercelRequest, res: VercelResponse, session: Session) {
  const { path, storage } = req.body || {};
  if (!path) return badRequest(res, 'path is required');
  // Paths are namespaced by accountId, so this also stops one tenant from
  // deleting another's file by guessing a path.
  if (!String(path).startsWith(`${session.accountId}/`)) {
    return res.status(403).json({ error: 'Not your file.' });
  }
  await deleteMedia(path, storage || null);
  res.status(200).json({ ok: true });
}

async function publishPost(req: VercelRequest, res: VercelResponse, session: Session) {
  const { id } = req.body || {};
  if (!id) return badRequest(res, 'id is required');

  const rows = await sql`
    SELECT sp.id, sp.platform, sp.connection_id, sp.caption, sp.media_url, sp.media_path, sp.media_type, sp.media_storage, sp.platform_post_id, sp.publish_status, w.id AS workspace_id
    FROM scheduled_posts sp
    JOIN workspaces w ON w.id = sp.workspace_id
    WHERE sp.id = ${id} AND w.account_id = ${session.accountId}`;
  const post = rows[0];
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  if (!post.media_url) return badRequest(res, 'This post has no media attached — publishing requires an image or video for now.');
  if (post.platform !== 'facebook' && post.platform !== 'instagram' && post.platform !== 'youtube' && post.platform !== 'tiktok' && post.platform !== 'linkedin' && post.platform !== 'threads' && post.platform !== 'pinterest' && post.platform !== 'x') {
    return badRequest(res, `Publishing isn't wired up for "${post.platform}" yet.`);
  }
  if (post.platform === 'youtube' && post.media_type !== 'video') {
    return badRequest(res, 'YouTube only accepts video — attach a video to this post.');
  }
  if (post.platform === 'tiktok' && post.media_type !== 'video') {
    return badRequest(res, 'TikTok only accepts video — attach a video to this post.');
  }
  if (post.platform === 'pinterest' && post.media_type !== 'image') {
    return badRequest(res, "Pinterest only accepts images right now — video Pins need a cover image this app can't generate yet. Attach an image instead.");
  }
  if (!post.connection_id) return badRequest(res, 'This post has no connected account attached.');

  const conns = await sql`SELECT access_token, refresh_token, platform_account_id, token_expires_at FROM connections WHERE id = ${post.connection_id} AND workspace_id = ${post.workspace_id} AND status = 'connected'`;
  const conn = conns[0];
  if (!conn || !conn.access_token || !conn.platform_account_id) {
    return badRequest(res, `That account isn't connected anymore — reconnect it on the Connections page.`);
  }

  try {
    let platformPostId: string;

    if (post.platform === 'instagram' && post.media_type === 'video') {
      // A previous attempt may have already created the container and timed
      // out waiting for Instagram to finish processing it — resume that
      // instead of uploading again.
      const result = post.publish_status === 'processing' && post.platform_post_id
        ? await finishInstagramVideo(post.platform_post_id, conn.platform_account_id, conn.access_token)
        : await publishVideoToInstagram(conn.platform_account_id, conn.access_token, post.media_url, post.caption);

      if (result.status === 'processing') {
        await sql`UPDATE scheduled_posts SET publish_status = 'processing', platform_post_id = ${result.containerId}, publish_error = NULL WHERE id = ${id}`;
        return res.status(202).json({ ok: true, processing: true });
      }
      platformPostId = result.platformPostId;
    } else if (post.platform === 'youtube') {
      const accessToken = await getValidYouTubeAccessToken(post.connection_id, conn.access_token, conn.refresh_token, conn.token_expires_at);
      const title = post.caption.split('\n')[0].slice(0, 100) || 'New video';
      platformPostId = await uploadVideoToYouTube(accessToken, post.media_url, title, post.caption);
    } else if (post.platform === 'tiktok') {
      const accessToken = await getValidTikTokAccessToken(post.connection_id, conn.access_token, conn.refresh_token, conn.token_expires_at);
      // A previous attempt may have already uploaded the video and timed out
      // waiting for TikTok to finish processing it — resume that instead of
      // uploading again.
      const result = post.publish_status === 'processing' && post.platform_post_id
        ? await finishTikTokPublish(post.platform_post_id, accessToken)
        : await publishVideoToTikTok(accessToken, post.media_url, post.caption);

      if (result.status === 'processing') {
        await sql`UPDATE scheduled_posts SET publish_status = 'processing', platform_post_id = ${result.publishId}, publish_error = NULL WHERE id = ${id}`;
        return res.status(202).json({ ok: true, processing: true });
      }
      platformPostId = result.platformPostId;
    } else if (post.platform === 'linkedin') {
      const accessToken = await getValidLinkedInAccessToken(post.connection_id, conn.access_token, conn.refresh_token, conn.token_expires_at);
      platformPostId = await publishToLinkedIn(accessToken, conn.platform_account_id, post.caption, post.media_url, post.media_type);
    } else if (post.platform === 'threads') {
      const accessToken = await getValidThreadsAccessToken(post.connection_id, conn.access_token, conn.token_expires_at);
      // A previous attempt may have already created the container and timed
      // out waiting for Threads to finish processing it — resume that
      // instead of uploading again.
      const result = post.publish_status === 'processing' && post.platform_post_id
        ? await finishThreadsPublish(post.platform_post_id, conn.platform_account_id, accessToken)
        : await publishToThreads(accessToken, conn.platform_account_id, post.caption, post.media_url, post.media_type);

      if (result.status === 'processing') {
        await sql`UPDATE scheduled_posts SET publish_status = 'processing', platform_post_id = ${result.containerId}, publish_error = NULL WHERE id = ${id}`;
        return res.status(202).json({ ok: true, processing: true });
      }
      platformPostId = result.platformPostId;
    } else if (post.platform === 'pinterest') {
      const accessToken = await getValidPinterestAccessToken(post.connection_id, conn.access_token, conn.refresh_token, conn.token_expires_at);
      platformPostId = await publishToPinterest(accessToken, conn.platform_account_id, post.caption, post.media_url);
    } else if (post.platform === 'x') {
      const accessToken = await getValidXAccessToken(post.connection_id, conn.access_token, conn.refresh_token, conn.token_expires_at);
      platformPostId = await publishToX(accessToken, post.caption, post.media_url, post.media_type);
    } else if (post.platform === 'facebook' && post.media_type === 'video') {
      platformPostId = await publishVideoToPage(conn.platform_account_id, conn.access_token, post.media_url, post.caption);
    } else if (post.platform === 'facebook') {
      platformPostId = await publishPhotoToPage(conn.platform_account_id, conn.access_token, post.media_url, post.caption);
    } else {
      platformPostId = await publishPhotoToInstagram(conn.platform_account_id, conn.access_token, post.media_url, post.caption);
    }

    await sql`UPDATE scheduled_posts SET publish_status = 'published', platform_post_id = ${platformPostId}, publish_error = NULL WHERE id = ${id}`;

    // The platform now hosts its own copy — free up our storage instead of
    // keeping every published file around indefinitely.
    await deleteMedia(post.media_path, post.media_storage);

    const platformLabel = post.platform[0].toUpperCase() + post.platform.slice(1);
    await notify(post.workspace_id, 'publish_success', 'Post published', `Your ${platformLabel} post went live.`);

    res.status(200).json({ ok: true, platformPostId });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await sql`UPDATE scheduled_posts SET publish_status = 'failed', publish_error = ${message} WHERE id = ${id}`;

    // A token/auth failure means the connection itself needs attention, not
    // just this one post — worth flagging distinctly from an ordinary
    // publish failure (bad file, platform rejection, etc).
    const isAuthIssue = /reconnect it on the Connections page|OAuthException|Error validating access token|Session has expired|invalid_grant/i.test(message);
    const platformLabel = post.platform[0].toUpperCase() + post.platform.slice(1);
    await notify(
      post.workspace_id,
      isAuthIssue ? 'connection_issue' : 'publish_failed',
      isAuthIssue ? `${platformLabel} connection needs attention` : 'Post failed to publish',
      message
    );

    res.status(502).json({ error: message });
  }
}

async function handler(req: VercelRequest, res: VercelResponse, session: Session) {
  const action = String(req.query.action || '');

  if (req.method === 'DELETE') {
    const id = req.query.id;
    if (!id) return badRequest(res, 'id is required');

    const rows = await sql`
      SELECT sp.id, sp.platform, sp.connection_id, sp.media_path, sp.media_storage, sp.platform_post_id, sp.publish_status
      FROM scheduled_posts sp
      JOIN workspaces w ON w.id = sp.workspace_id
      WHERE sp.id = ${id} AND w.account_id = ${session.accountId}`;
    const post = rows[0];
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    // Deleting a scheduled_posts row only ever removed it from our own
    // planner — if it was already published, the copy on the platform
    // stayed live. Only YouTube reliably supports deleting via API: Meta's
    // Graph API rejects DELETE on Page photo/video posts with "Unsupported
    // delete request" (subcode 33) regardless of permissions — a platform
    // restriction, not something fixable here — and Instagram/TikTok don't
    // expose deletion to third-party apps at all. Those are left alone and
    // reported back as "unsupported" so the UI can say so instead of
    // attempting (and always failing) or implying it worked.
    let platformResult: 'deleted' | 'unsupported' | 'failed' | 'skipped' = 'skipped';
    let platformError: string | undefined;

    if (post.publish_status === 'published' && post.platform_post_id && post.connection_id) {
      if (post.platform === 'youtube') {
        try {
          const conns = await sql`SELECT access_token, refresh_token, token_expires_at FROM connections WHERE id = ${post.connection_id}`;
          const conn = conns[0];
          if (!conn || !conn.access_token) {
            throw new Error("That account isn't connected anymore — removed here, but it may still be live on the platform.");
          }
          const accessToken = await getValidYouTubeAccessToken(post.connection_id, conn.access_token, conn.refresh_token, conn.token_expires_at);
          await deleteYouTubeVideo(accessToken, post.platform_post_id);
          platformResult = 'deleted';
        } catch (err) {
          platformResult = 'failed';
          platformError = err instanceof Error ? err.message : String(err);
        }
      } else {
        platformResult = 'unsupported';
      }
    }

    await sql`DELETE FROM scheduled_posts WHERE id = ${id}`;
    await deleteMedia(post.media_path, post.media_storage);
    return res.status(200).json({ ok: true, platformResult, platformError });
  }

  if (req.method === 'POST' && action === 'upload-media') return uploadMedia(req, res, session);
  if (req.method === 'POST' && action === 'video-upload-url') return videoUploadUrl(req, res, session);
  if (req.method === 'POST' && action === 'discard-media') return discardMedia(req, res, session);
  if (req.method === 'POST' && action === 'publish') return publishPost(req, res, session);

  const workspace = String(req.query.workspace || (req.body && req.body.workspace) || '');
  if (!workspace) return badRequest(res, 'workspace is required');
  const workspaceId = await getWorkspaceId(workspace, session.accountId);

  if (req.method === 'POST') {
    const { day, hour, time, platform, connectionId, caption, status, mediaUrl, mediaPath, mediaType, mediaStorage, scheduledDate } = req.body || {};
    if (day == null || hour == null || !time || !platform || !caption) {
      return badRequest(res, 'day, hour, time, platform, caption are required');
    }
    if (connectionId != null) {
      // Confirms the connection actually belongs to this workspace before
      // tying a post to it — an id from another tenant's workspace must
      // fail loudly here, not silently attach.
      const owned = await sql`SELECT id FROM connections WHERE id = ${connectionId} AND workspace_id = ${workspaceId}`;
      if (owned.length === 0) return badRequest(res, 'Unknown connection.');
    }
    const postStatus = status === 'draft' ? 'draft' : 'scheduled';
    const rows = await sql`
      INSERT INTO scheduled_posts (workspace_id, day, hour, time_label, platform, connection_id, caption, status, media_url, media_path, media_type, media_storage, scheduled_date)
      VALUES (${workspaceId}, ${day}, ${hour}, ${time}, ${platform}, ${connectionId || null}, ${caption}, ${postStatus}, ${mediaUrl || null}, ${mediaPath || null}, ${mediaType || null}, ${mediaStorage || null}, ${scheduledDate || null})
      RETURNING id, day, hour, time_label AS time, platform, connection_id AS "connectionId", caption, status, media_url AS "mediaUrl", to_char(scheduled_date, 'YYYY-MM-DD') AS "scheduledDate", publish_status AS "publishStatus"`;
    return res.status(201).json(rows[0]);
  }

  const [posts, heat] = await Promise.all([
    sql`
      SELECT sp.id, sp.day, sp.hour, sp.time_label AS time, sp.platform, sp.connection_id AS "connectionId", c.account AS "connectionAccount", sp.caption, sp.status, sp.media_url AS "mediaUrl", sp.media_type AS "mediaType", to_char(sp.scheduled_date, 'YYYY-MM-DD') AS "scheduledDate", sp.publish_status AS "publishStatus", sp.publish_error AS "publishError"
      FROM scheduled_posts sp
      LEFT JOIN connections c ON c.id = sp.connection_id
      WHERE sp.workspace_id = ${workspaceId} ORDER BY COALESCE(sp.scheduled_date, CURRENT_DATE), sp.day, sp.hour`,
    sql`SELECT day, hour, value FROM heatmap_cells WHERE workspace_id = ${workspaceId}`,
  ]);

  res.status(200).json({ scheduledPosts: posts, heatmap: heat });
}

export default withAuth(handler);
