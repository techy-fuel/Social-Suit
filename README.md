# SocialSuite by TechyFuel

An internal social media management tool for a digital agency managing multiple
Islamic educational institution clients (HIRA Institute, HIRA Kitchen, Al Khalil
Huffaz School, Al Rehman Academy) — scheduling, analytics, ads, inbox, and client
reporting in one multi-tenant workspace.

This is a real React + TypeScript + Vite implementation of the `SocialSuite Design
System` produced in Claude Design, with a Postgres-backed API. The original design
handoff bundle (chat transcripts, tokens, component prototypes) lives under
[`design/`](./design) for reference.

## Screens

Analytics (flagship), Planning calendar, Post composer, Connections, Unified
inbox, SmartLinks, Ads, Reporting, Hashtag tracker — each has its own URL and is
reachable from the sidebar, with a workspace switcher (top-right) to flip between
the four client workspaces. Data is real, per-workspace, and persisted in
Postgres. Several actions are functionally wired, not just visual: scheduling a
post from Post composer, connecting/reconnecting a platform, replying to an inbox
conversation, adding a SmartLink, creating a report, and starting a hashtag
tracking session all write to the database.

## Stack

React 18 + TypeScript + Vite, `react-router-dom` for navigation. Vercel
serverless functions under `api/` talk to Postgres via `@neondatabase/serverless`.
Auth is a single shared agency login (bcrypt-hashed password + signed session
cookie) — see below. Icons via `lucide-react`. Unit tests via Vitest +
React Testing Library; CI runs build/typecheck/tests on every push (see
`.github/workflows/ci.yml`).

## Setting up the database

1. In the Vercel dashboard, open the project → **Storage** → **Create Database** → **Postgres** (Neon), then **Connect** it to this project. This auto-injects `DATABASE_URL`/`POSTGRES_URL` on the Vercel project.
2. Copy `.env.example` to `.env.local` and fill in the same connection string (Storage → your database → `.env.local` tab).
3. `npm install && npm run seed` — creates the schema and seeds all 4 workspaces with realistic starting data.

## Setting up login

The app is gated behind a single shared username/password for the agency team (not per-user accounts).

1. `npm run hash-password -- 'your-shared-password'` — prints a bcrypt hash.
2. Set these as environment variables (locally in `.env.local`, and on the Vercel project under Settings → Environment Variables):
   - `AGENCY_USERNAME` — e.g. `techyfuel`
   - `AGENCY_PASSWORD_HASH` — the hash from step 1
   - `SESSION_SECRET` — any long random string, e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Getting started

```bash
npm install
npm run dev              # http://localhost:5173 (needs env vars above)
npm run build             # typecheck + production build
npm run typecheck:api     # typecheck the serverless API routes
npm test                  # unit tests
npm run seed               # (re)seed the database
```

## Structure

- `src/styles/` — design tokens (colors, typography, spacing, effects) and base resets, plus `responsive.css` for the mobile sidebar/grid breakpoints.
- `src/components/{core,forms,feedback,navigation,data}/` — 27 reusable primitives.
- `src/screens/` — the 9 product screens plus `LoginScreen`.
- `src/App.tsx` — shell: sidebar + top bar + workspace switcher + routed screens.
- `src/AuthContext.tsx`, `src/WorkspaceContext.tsx`, `src/ToastContext.tsx` — app-level state.
- `src/api.ts`, `src/hooks.ts` — typed API client and a small `useApi` data-fetching hook.
- `api/` — Vercel serverless functions (one per resource), `_db.ts` (Postgres client) and `_auth.ts` (session cookie helpers) are shared, not deployed as routes.
- `db/schema.sql`, `db/seed.ts` — database schema and seed data.
- `design/` — the original Claude Design handoff bundle (chat transcripts, tokens, prototype JSX, guidelines) this app was built from.

## Known gaps

- No real social platform integration (Meta/TikTok/Google APIs) — this manages its own data, it doesn't publish anywhere.
- No per-user accounts — one shared login for the whole agency team.
- No end-to-end/browser tests in CI (manual verification only); unit tests cover components, hooks, the API client, and session-token logic.
