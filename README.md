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

## Known gaps

- No real social platform integration (Meta/TikTok/Google APIs) — this manages its own data, it doesn't publish anywhere.
- One user per account — no team invites/multiple users per tenant yet.
- No billing/subscription system — every account has unlimited access.
- No pagination — list endpoints (conversations, scheduled posts, etc.) return everything for a workspace in one call.
- No rate limiting on login/signup.
- `/terms` and `/privacy` are placeholder template text, not reviewed legal copy — replace before relying on them.
- No end-to-end/browser tests in CI (manual verification only); unit tests cover components, hooks, the API client, and session-token logic.
