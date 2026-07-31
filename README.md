# SocialSuite by TechyFuel

A multi-tenant SaaS social media management tool — scheduling, analytics, ads,
inbox, and client reporting, organized by client workspace. Any agency can
sign up and get their own account; the seeded demo account shows it populated
with four Islamic educational institution clients (HIRA Institute, HIRA
Kitchen, Al Khalil Huffaz School, Al Rehman Academy) as a worked example.

This is a real React + TypeScript + Vite implementation of the `SocialSuite Design
System` produced in Claude Design, with a Postgres-backed API. The original design
handoff bundle (chat transcripts, tokens, component prototypes) lives under
[`design/`](./design) for reference.

## Screens

Analytics (flagship), Planning calendar, Post composer, Connections, Unified
inbox, SmartLinks, Ads, Reporting, Hashtag tracker — each has its own URL and is
reachable from the sidebar, with a workspace switcher (top-right) to flip between
a signed-in account's client workspaces, plus an "Add workspace" action to create
more. Data is real, per-workspace, and persisted in Postgres, scoped to the
signed-in account — one tenant can never see another's data. Several actions are
functionally wired, not just visual: scheduling a post from Post composer,
connecting/reconnecting a platform, replying to an inbox conversation, adding a
SmartLink, creating a report, and starting a hashtag tracking session all write
to the database — and each of those has a matching delete/disconnect action
(scheduled posts, SmartLinks, reports, tracker sessions, connections, and whole
workspaces can all be removed from the UI, not just created).

## Stack

React 18 + TypeScript + Vite, `react-router-dom` for navigation. Vercel
serverless functions under `api/` talk to Postgres (hosted on Supabase) via
plain `pg`. Credentials live in **Supabase Auth**, not our own tables — signup
and login call Supabase's Admin/Auth API server-side, and our own signed
session cookie (`api/_auth.ts`) is what the app actually checks on each
request. Every signup creates its own `account` (tenant), a `users` row
mapping the Supabase auth user to that account, and an empty workspace list to
populate; see below. Password reset is Supabase's built-in email flow. Icons
via `lucide-react`. Unit tests via Vitest + React Testing Library; CI runs
build/typecheck/tests on every push (see `.github/workflows/ci.yml`).

## Setting up the database

1. Create a Postgres database on Supabase (or use Vercel Storage's Supabase integration), then set `DATABASE_URL`/`POSTGRES_URL` on the Vercel project to its connection string.
2. Paste the contents of `db/schema_and_seed.sql` into Supabase's SQL Editor and run it — this drops/recreates every table and seeds four example workspaces under one demo `account` (no login yet, since credentials aren't raw SQL rows anymore). Regenerate this file with `npx tsx db/generate-seed-sql.ts` if `db/seed-data.ts` changes.
3. To also create the demo *login* (and reseed the same content over HTTPS instead of SQL), run `SUPABASE_SERVICE_ROLE_KEY=... npx tsx db/seed-via-api.ts` from a machine with normal internet access — it uses Supabase's Admin API (`auth.admin.createUser`) plus PostgREST, so it needs no raw Postgres/TCP access, only HTTPS to `*.supabase.co`. Prints the demo email/password on success. This step is optional — real users can just sign up from the app instead.
4. Copy `.env.example` to `.env.local` and fill in the connection string, for local dev.

## Setting up auth

Auth is fully backed by Supabase Auth. Environment variables needed:

- `SESSION_SECRET` — any long random string, e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. This signs our own app-session cookie (separate from Supabase's own session).
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase dashboard → Settings → API → `service_role` key. Used server-side only (`api/_supabase.ts`) to create/delete auth users on signup; never expose this to the client.

Set both locally in `.env.local` and on the Vercel project under Settings → Environment Variables.

In the Supabase dashboard, under **Authentication → URL Configuration**, set the Site URL and add a Redirect URL for `<your-deployed-domain>/reset-password` — this is where Supabase's password-recovery email link sends the user, and `src/screens/ResetPasswordScreen.tsx` picks up the `PASSWORD_RECOVERY` event from there.

## Getting started

```bash
npm install
npm run dev              # http://localhost:5173 (needs SESSION_SECRET + DATABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
npm run build             # typecheck + production build
npm run typecheck:api     # typecheck the serverless API routes
npm test                  # unit tests
npm run seed               # create the demo login + reseed content over HTTPS (needs SUPABASE_SERVICE_ROLE_KEY)
```

## Structure

- `src/styles/` — design tokens (colors, typography, spacing, effects) and base resets, plus `responsive.css` for the mobile sidebar/grid breakpoints.
- `src/components/{core,forms,feedback,navigation,data}/` — 27 reusable primitives.
- `src/screens/` — the 9 product screens plus `LoginScreen`, `SignupScreen`, `AuthGate`.
- `src/App.tsx` — shell: sidebar + top bar + workspace switcher + routed screens; also handles the zero-workspace onboarding state for a fresh signup.
- `src/AuthContext.tsx`, `src/WorkspaceContext.tsx`, `src/ToastContext.tsx` — app-level state.
- `src/api.ts`, `src/hooks.ts` — typed API client and a small `useApi` data-fetching hook.
- `api/` — Vercel serverless functions (one per resource), `_db.ts` (Postgres client), `_supabase.ts` (Supabase admin/anon clients), and `_auth.ts` (session cookie + `withAuth`/tenant-scoping helpers) are shared, not deployed as routes. **Vercel's Hobby plan caps a deployment at 12 serverless functions** — `auth.ts` deliberately dispatches login/signup/logout/me/request-password-reset via `?action=` instead of one file each, to leave headroom. Keep this in mind before adding new top-level files here; prefer adding an `?action=` branch to an existing route over a new file if you're close to the limit (`ls api/*.ts | grep -v '^_'` to count).
- `db/schema.sql`, `db/seed-data.ts` — database schema and the shared seed dataset (four example workspaces).
- `db/generate-seed-sql.ts` — emits `db/schema_and_seed.sql`, a plain `.sql` file to paste into Supabase's SQL Editor (schema + workspace content only, no login).
- `db/seed-via-api.ts` — creates the demo Supabase Auth login and reseeds the same content over HTTPS (Admin API + PostgREST), for environments without raw Postgres access.
- `design/` — the original Claude Design handoff bundle (chat transcripts, tokens, prototype JSX, guidelines) this app was built from.

## Real platform integration (Meta, YouTube, TikTok, LinkedIn, Threads, Pinterest, X)

`api/oauth.ts` is a single consolidated OAuth handler for every provider
(`?provider=meta|google|tiktok|linkedin|threads|pinterest|x&action=start|callback`)
— deliberately not one file per provider, since Vercel's Hobby plan caps a
deployment at 12 serverless functions and this project is already at that
cap. Providers are registered in the `PROVIDERS` array and the
`AUTHORIZE_URL`/`CALLBACKS` lookup tables at the top of the file — add a new
platform there (plus its own callback function), not a new top-level file.
X is the one exception to the `AUTHORIZE_URL` table (see its section below —
PKCE needs extra values threaded through that don't fit the other
providers' plain `(redirectUri, state) => url` shape).

### Meta (Facebook Pages + Instagram)

Facebook Pages and Instagram Business accounts connect via a real Meta Graph
API OAuth flow (`api/_meta.ts`). One OAuth grant connects **every** Page the authorizing user manages
(plus each Page's linked Instagram account) as its own `connections` row,
upserted by `platform_account_id` — so a workspace can have several Facebook
Pages connected at once, not just one. The Connections page's "Connect a
Facebook Page" button is the entry point both for the first connection and
for adding more later (re-authorizing just re-syncs the full set Meta
returns). Post composer lets you multi-select target accounts (any mix of
connected Facebook Pages/Instagram accounts) and attach one image or one
video, then either publish to all of them at once ("Publish now" — creates
one `scheduled_posts` row per target, each tied to its `connection_id`, and
publishes each independently so one failing doesn't block the rest) or leave
them saved for manual publish later from Planning calendar. There is **no
cron/queue publishing posts at their scheduled day/time** — `scheduled_date`
+ `hour` are stored, so the data model can support it, but nothing polls for
due posts yet; add a Vercel Cron job (Hobby plan only runs cron once/day, so
exact-time publishing needs a Pro plan or an external pinger) if that's
needed. `META_SCOPES` includes `pages_manage_posts`, `pages_manage_engagement`,
etc. — several of these are gated behind separate "use cases" in Meta's app
dashboard (Use cases → Content management) that must be added there before
an OAuth attempt requesting them will succeed; existing connections made
before a scope was added need to be reconnected to actually be granted it.

### YouTube

Connects via standard Google OAuth (`api/_google.ts`), scoped to
`youtube.upload` + `youtube.readonly`. Unlike Meta (which just gives Google/Meta
a URL to fetch), the YouTube Data API's `videos.insert` needs the actual
bytes streamed through an authenticated resumable upload session — our
backend fetches the video from wherever it's hosted (R2/Supabase) and pipes
it straight into that session without buffering the whole file, but it's
still bounded by the Vercel function's execution time budget, so very large
or slow-to-fetch videos may not finish in one request. YouTube access tokens
expire hourly; `refresh_token` is stored per connection and
`getValidYouTubeAccessToken()` in `api/calendar.ts` refreshes automatically
before each publish. Requires `access_type=offline` + `prompt=consent` on
the authorize URL to actually receive a refresh token — Google won't return
one on a repeat consent otherwise, which is treated as a connection failure
rather than silently creating an unrefreshable connection. Only publishes
video (YouTube has no photo-post concept); connections page shows one
"YouTube" row (a channel manages one upload target, unlike Meta's several
Pages).

### TikTok

Connects via TikTok's Login Kit OAuth (`api/_tiktok.ts`), scoped to
`user.info.basic,video.publish` (Direct Post). Two things make this
different from Meta/YouTube:

- **Unaudited apps can only post privately.** TikTok always returns which
  `privacy_level` options are actually available for the connected account
  via a required `creator_info/query` call made right before every publish
  — for an app that hasn't been through TikTok's audit, that list only ever
  contains `SELF_ONLY`, so uploaded videos are visible only to the account
  owner (they show up on the profile as private) until TikTok approves the
  app for public posting. `publishVideoToTikTok()` always picks the most
  public option available, so this fixes itself automatically once audited
  — no code change needed later.
- **Only single-chunk uploads (≤64MB) are implemented.** TikTok's Content
  Posting API wants the upload declared as fixed-size chunks up front;
  we only support sending the whole file as one chunk, which the API caps
  at 64MB. Larger videos are rejected with a clear error rather than
  attempting a multi-chunk upload (not built — most short TikTok clips fit
  well under this).

TikTok access tokens expire in ~24h like YouTube's, but unlike Google, every
refresh **rotates the refresh token too** — `getValidTikTokAccessToken()` in
`api/calendar.ts` persists both the new access and refresh token on every
refresh, not just the access token. Only publishes video (no photo-post
support yet).

### LinkedIn

Connects via LinkedIn's OAuth (OpenID Connect for identity + "Share on
LinkedIn" for posting — both products have to be added to the app
separately), scoped to `openid profile email w_member_social`
(`api/_linkedin.ts`). Publishes text, one image, or one video to the
connected member's personal profile via the Posts API (`POST /rest/posts`);
every request needs an `LinkedIn-Version` header (`LINKEDIN_VERSION`
constant — bump periodically) or LinkedIn rejects it outright.

- **Image upload is one PUT**; **video upload is multi-part**: LinkedIn's
  `initializeUpload` hands back one or more byte ranges (each its own
  `uploadUrl`), we PUT each range (fetched from wherever the video's hosted
  via an HTTP `Range` request, so only one part is ever in memory) and
  collect the `ETag` from each response, then send all of them to
  `finalizeUpload`. No polling for "video ready" afterward — LinkedIn's own
  feed handles a still-processing video gracefully, unlike Instagram.
- **Refresh tokens usually aren't available.** Self-serve apps aren't
  granted one unless separately approved for LinkedIn's "Programmatic
  refresh tokens" product — most LinkedIn connections will just need
  reconnecting every ~60 days when the access token expires, same code path
  as any other missing-refresh-token case (`getValidLinkedInAccessToken()`
  in `api/calendar.ts`).
- The created post's id comes back in the `x-restli-id` **response header**,
  not the JSON body — a REST.li quirk specific to this API.

### Threads

Reuses the **same Meta App ID/Secret** as Facebook/Instagram (`api/_meta.ts`'s
`META_APP_ID` + `META_APP_SECRET`) — Threads is just another "use case"
added to that same Meta app in the dashboard, not a separate app or
credentials (`api/_threads.ts`). OAuth happens on different hosts though
(`threads.net`/`graph.threads.net`, not `facebook.com`/`graph.facebook.com`),
and token exchange is a two-hop dance: short-lived token first, then
exchanged again for a 60-day long-lived one (`th_exchange_token`). Unlike
every other platform here, there's no separate refresh_token — the same
long-lived access token gets extended in place via `th_refresh_token`, so
`connections.refresh_token` stays `NULL` for Threads rows.

Publishing is two-step like Instagram (create a container, poll its
`status`, then publish it) since Threads is built on the same underlying
Graph API infra — `publishToThreads()` reuses that same
processing/resume shape (`PublishResult`) as Instagram/TikTok, so a video
that outlasts one request's time budget resumes on the next "Publish now"
instead of re-uploading.

### Pinterest

Connects via Pinterest API v5's OAuth (`api/_pinterest.ts`), scoped to
`boards:read,pins:write,pins:read,user_accounts:read`. New apps get **Trial
access** by default: Pins created are visible only to the creator until
Pinterest approves an upgrade to Standard access (their own video-demo
review process, same shape as TikTok's audit) — same "works now privately,
goes public once approved, no code change needed" story as TikTok.

- **A Pin always belongs to one board**, so — same reasoning as Facebook's
  multiple Pages — connecting Pinterest fetches every board the account has
  and creates one `connections` row per board (all sharing the same
  account-level access/refresh token). The composer's account picker is
  really a board picker for Pinterest.
- **Video Pins aren't supported.** Pinterest requires a separate
  `cover_image_url` (a still-frame thumbnail) for video Pins, and this app
  has no video-thumbnail generation anywhere — sending the video URL itself
  as the cover image fails outright. Only text/image Pins are implemented;
  `publishPost()` in `api/calendar.ts` rejects video for this platform with
  a clear message rather than attempting and failing.
- Image Pins are simpler than every other platform here: `media_source` in
  the Create Pin call just takes the image URL directly
  (`source_type: 'image_url'`) — no separate upload step at all.
- Access tokens last 30 days; refresh tokens **rotate on every refresh**
  like TikTok's — the new one has to be persisted or the connection becomes
  unrefreshable after the next refresh (`getValidPinterestAccessToken()` in
  `api/calendar.ts`).

### X

**X's API is pay-per-use, not free** (~$0.015/post, ~$0.20 if it contains a
link, no free tier for new developer accounts as of Feb 2026) — the account
running this needs billing set up in the X Developer Portal. OAuth 2.0 with
PKCE is mandatory here (`api/_x.ts`), unlike every other platform in this
project: the code verifier is generated in `oauth.ts`'s `oauthStart()`,
embedded in the signed `state` (there's no server-side session to hold it
across the redirect to X and back), and pulled back out in `xCallback()` —
that's also why X is the one provider that doesn't fit the `AUTHORIZE_URL`
lookup table.

- **Media upload is the least-verified part of this whole integration.**
  X's chunked upload (`initialize` → `append` per ≤4MB chunk, fetched via
  HTTP Range requests so only one chunk is ever in memory → `finalize` →
  poll if still processing) is implemented from documentation and community
  reports rather than a confirmed working reference — if connecting works
  but publishing a post with media doesn't, this is the first place to
  check (compare against `https://docs.x.com/x-api/media` for the current
  exact endpoint shapes).
- Refresh tokens **rotate on every refresh** like TikTok/Pinterest's.
- Text-only posts (no attached image/video) aren't reachable from this
  app's UI today — `publishPost()` in `api/calendar.ts` requires media for
  every platform, X included, even though X's API itself doesn't need it.

**Media storage is split across two backends** (`api/calendar.ts`):
images (≤8MB) go through our own function to a Supabase Storage bucket
`post-media` (must be created manually, set **public**); videos (≤200MB) skip
our backend entirely — the browser gets a presigned URL (`api/_r2.ts`) and
uploads straight to a Cloudflare R2 bucket, avoiding Vercel's function body
size limit. Env vars needed for R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
`R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` (the bucket's public
`r2.dev` URL or a custom domain — must also have public access enabled on the
bucket itself). Files are deleted from whichever backend hosted them as soon
as they're no longer needed (published, post deleted, or removed from the
composer before scheduling) — see `deleteMedia()` in `api/calendar.ts` — so
storage usage tracks what's in flight rather than growing forever. Instagram
video publishing is two-step (create a container, then publish it) and
Instagram's own processing can outlast a single request's time budget; if so
the post is left in a `processing` state with the container id saved, and
the next "Publish now" click resumes and finishes it rather than
re-uploading.

## Real inbox (Meta webhooks)

Facebook/Instagram DMs and comments arrive through a real Meta webhook
(`api/webhooks.ts`, our 12th and last function under the Hobby plan's cap —
consolidate an existing route via `?action=` before adding another). It has
no session/cookie (Meta calls it server-to-server), so authenticity is a
shared secret baked into the registered callback URL itself
(`?provider=meta&secret=...`), checked on every request. Setup:

1. Generate a random secret and set it as `META_WEBHOOK_SECRET`.
2. Meta App dashboard → add the **Webhooks** product → Page/Instagram
   subscription → Callback URL: `https://<your-domain>/api/webhooks?provider=meta&secret=<that secret>`, Verify Token: the same secret.
3. Subscribe to `messages` and `feed` (Page) / `messages` and `comments`
   (Instagram) fields.
4. Reconnect Facebook/Instagram from the Connections page — the OAuth scope
   now includes `pages_messaging`, `pages_manage_engagement`,
   `instagram_manage_messages`, `instagram_manage_comments`, none of which
   existing connections were granted before this.

Replying in the Unified inbox calls the real Send/comment-reply API
(`api/conversations.ts`) using the connected account's token; if that call
fails the reply still saves locally but the response includes a
`deliveryError` so the UI can say so instead of claiming it sent.
Conversations seeded before this feature (demo data) have no `sender_id`,
so replying to those only saves locally — same as before, no crash.

## Notifications

The bell icon in the top bar is a real per-workspace notification feed
(`notifications` table, written via `notify()` in `api/_notify.ts`), not a
placeholder. Three things write to it: `api/calendar.ts` on every publish
attempt (`publish_success` / `publish_failed`, or `connection_issue`
specifically when the failure looks auth-related — see the regex in
`publishPost()`), and `api/webhooks.ts` on every inbound DM/comment
(`new_message` / `new_comment`). `notify()` swallows its own errors so a
failed notification write never breaks the operation it's reporting on.
Read via `?action=notifications` and `?action=notifications-read` on
`api/workspaces.ts` (not a new function — already at the Hobby plan's
12-function cap). No push/realtime: the frontend polls every 60s
(`App.tsx`) rather than the backend pushing anything.

## Known gaps

- Bluesky still just flips a status flag on Connections — no real integration.
- Pinterest video Pins aren't supported (needs a cover-image thumbnail this app doesn't generate) — image and text only.
- Pinterest Pins are private (Trial access) until the app passes Pinterest's Standard access review — see "Real platform integration" above.
- X requires a paid (pay-per-use) API plan — see "Real platform integration" above. Its media upload path is also the least-verified integration here; may need a follow-up fix once actually exercised.
- X posting always requires attaching media (this app's own constraint, not X's) since `publishPost()` requires media for every platform.
- TikTok posts are private (SELF_ONLY) until the app passes TikTok's audit — see "Real platform integration" above.
- LinkedIn posting only targets the connected member's personal profile — no company/organization Page posting (that needs a separate, harder-to-get scope: `w_organization_social`).
- TikTok video uploads are capped at 64MB (no multi-chunk upload implemented).
- Deleting an already-published post only deletes it on the platform for YouTube. Meta's Graph API rejects DELETE on Page photo/video posts outright ("Unsupported delete request", subcode 33 — a platform restriction, not a permissions issue), and Instagram/TikTok don't expose deletion to third-party apps at all; for those three, deleting in-app only removes it from the planner and the published content stays live.
- One user per account — no team invites/multiple users per tenant yet.
- No billing/subscription system — every account has unlimited access.
- No pagination — list endpoints (conversations, scheduled posts, etc.) return everything for a workspace in one call.
- No rate limiting on login/signup.
- `/terms` and `/privacy` are placeholder template text, not reviewed legal copy — replace before relying on them.
- No end-to-end/browser tests in CI (manual verification only); unit tests cover components, hooks, the API client, and session-token logic.
