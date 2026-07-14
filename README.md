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
serverless functions under `api/` talk to Postgres via `@neondatabase/serverless`.
Auth is real signup/login (bcrypt-hashed password + signed session cookie) — every
signup creates its own `account` (tenant) and gets an empty workspace list to
populate; see below. Icons via `lucide-react`. Unit tests via Vitest +
React Testing Library; CI runs build/typecheck/tests on every push (see
`.github/workflows/ci.yml`).

## Setting up the database

1. In the Vercel dashboard, open the project → **Storage** → **Create Database** → **Postgres**, then **Connect** it to this project. This auto-injects `DATABASE_URL`/`POSTGRES_URL` on the Vercel project.
2. Run `npm run seed` locally against that connection string (needs raw Postgres/TCP network access), **or** — if your network only allows HTTPS (e.g. a sandboxed environment) — run `npx tsx db/generate-seed-sql.ts` to produce `db/schema_and_seed.sql`, then paste its contents into your Postgres provider's SQL editor (e.g. Supabase → SQL Editor) and run it. Either path creates the schema plus a demo account/login populated with the four example workspaces.
3. Copy `.env.example` to `.env.local` and fill in the connection string, for local dev.

## Setting up auth

No separate credentials to configure — anyone can sign up from the app itself (Sign in screen → "Sign up"). You only need one environment variable:

- `SESSION_SECRET` — any long random string, e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Set it locally in `.env.local` and on the Vercel project under Settings → Environment Variables.

The demo account seeded in step 2 above logs in with the credentials documented at the top of `db/generate-seed-sql.ts`.

## Getting started

```bash
npm install
npm run dev              # http://localhost:5173 (needs SESSION_SECRET + DATABASE_URL)
npm run build             # typecheck + production build
npm run typecheck:api     # typecheck the serverless API routes
npm test                  # unit tests
npm run seed               # (re)seed the database — needs raw Postgres network access
```

## Structure

- `src/styles/` — design tokens (colors, typography, spacing, effects) and base resets, plus `responsive.css` for the mobile sidebar/grid breakpoints.
- `src/components/{core,forms,feedback,navigation,data}/` — 27 reusable primitives.
- `src/screens/` — the 9 product screens plus `LoginScreen`, `SignupScreen`, `AuthGate`.
- `src/App.tsx` — shell: sidebar + top bar + workspace switcher + routed screens; also handles the zero-workspace onboarding state for a fresh signup.
- `src/AuthContext.tsx`, `src/WorkspaceContext.tsx`, `src/ToastContext.tsx` — app-level state.
- `src/api.ts`, `src/hooks.ts` — typed API client and a small `useApi` data-fetching hook.
- `api/` — Vercel serverless functions (one per resource), `_db.ts` (Postgres client) and `_auth.ts` (session cookie + `withAuth`/tenant-scoping helpers) are shared, not deployed as routes. **Vercel's Hobby plan caps a deployment at 12 serverless functions** — `auth.ts` deliberately dispatches login/signup/logout/me via `?action=` instead of one file each, to leave headroom. Keep this in mind before adding new top-level files here; prefer adding an `?action=` branch to an existing route over a new file if you're close to the limit (`ls api/*.ts | grep -v '^_'` to count).
- `db/schema.sql`, `db/seed.ts` — database schema and seed data (needs raw Postgres network access to run).
- `db/generate-seed-sql.ts` — same schema/seed data, but emits a plain `.sql` file you can paste into a SQL editor when raw Postgres access isn't available.
- `design/` — the original Claude Design handoff bundle (chat transcripts, tokens, prototype JSX, guidelines) this app was built from.

## Known gaps

- No real social platform integration (Meta/TikTok/Google APIs) — this manages its own data, it doesn't publish anywhere.
- No email verification or password reset flow — signup is instant, and there's no way to recover a forgotten password yet.
- One user per account — no team invites/multiple users per tenant yet.
- No billing/subscription system — every account has unlimited access.
- No pagination — list endpoints (conversations, scheduled posts, etc.) return everything for a workspace in one call.
- No rate limiting on login/signup.
- `/terms` and `/privacy` are placeholder template text, not reviewed legal copy — replace before relying on them.
- No end-to-end/browser tests in CI (manual verification only); unit tests cover components, hooks, the API client, and session-token logic.
