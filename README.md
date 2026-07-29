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

## Real platform integration (Meta, YouTube, TikTok)

`api/oauth.ts` is a single consolidated OAuth handler for every provider
(`?provider=meta|google|tiktok&action=start|callback`) — deliberately not one
file per provider, since Vercel's Hobby plan caps a deployment at 12
serverless functions and this project is already at that cap. Add new
platforms as another `provider` branch here, not a new top-level file.

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

## Known gaps

- LinkedIn, Threads, X, and other platforms still just flip a status flag on Connections — no real integration.
- TikTok posts are private (SELF_ONLY) until the app passes TikTok's audit — see "Real platform integration" above.
- TikTok video uploads are capped at 64MB (no multi-chunk upload implemented).
- One user per account — no team invites/multiple users per tenant yet.
- No billing/subscription system — every account has unlimited access.
- No pagination — list endpoints (conversations, scheduled posts, etc.) return everything for a workspace in one call.
- No rate limiting on login/signup.
- `/terms` and `/privacy` are placeholder template text, not reviewed legal copy — replace before relying on them.
- No end-to-end/browser tests in CI (manual verification only); unit tests cover components, hooks, the API client, and session-token logic.
