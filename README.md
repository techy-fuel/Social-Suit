# SocialSuite by TechyFuel

An internal social media management tool for a digital agency managing multiple
Islamic educational institution clients (HIRA Institute, HIRA Kitchen, Al Khalil
Huffaz School, Al Rehman Academy) — scheduling, analytics, ads, inbox, and client
reporting in one multi-tenant workspace.

This is a real React + TypeScript + Vite implementation of the `SocialSuite Design
System` produced in Claude Design. The original design handoff bundle (chat
transcripts, tokens, component prototypes) lives under [`design/`](./design) for
reference.

## Screens

Analytics (flagship), Planning calendar, Post composer, Connections, Unified
inbox, SmartLinks, Ads, Reporting, Hashtag tracker — all reachable from the
sidebar, with a workspace switcher (top-right) to flip between the four client
workspaces. Data is in-memory mock data (`src/mock-data.ts`); there is no backend.

## Stack

React 18 + TypeScript + Vite. No routing library — screen navigation is local
component state, matching the original prototype. Icons via `lucide-react`.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build
```

## Structure

- `src/styles/` — design tokens (colors, typography, spacing, effects) and base resets.
- `src/components/{core,forms,feedback,navigation,data}/` — 27 reusable primitives.
- `src/screens/` — the 9 product screens.
- `src/App.tsx` — shell: sidebar + top bar + workspace switcher + screen router.
- `src/mock-data.ts` — fake data for the four client workspaces.
- `design/` — the original Claude Design handoff bundle (chat transcripts, tokens,
  prototype JSX, guidelines) this app was built from.
