
# SocialSuite by TechyFuel — Design System

## What this is

SocialSuite is an internal social media management tool built by TechyFuel for its own
digital-agency team. The agency manages several Islamic educational institution clients —
**HIRA Institute**, **HIRA Kitchen**, **Al Khalil Huffaz School**, **Al Rehman Academy** — and
SocialSuite is the single workspace where the team schedules posts, reads analytics, replies
to DMs/comments, runs ads, and produces client reports, switching between client workspaces
without logging out.

Functionally SocialSuite is in the same category as tools like Metricool, but it is **not** a
reskin of one — this system defines SocialSuite's own visual identity: a confident, mono-blue
B2B product with an agency-first "workspace switcher" as its signature interaction (see
Visual Foundations). No sources (Figma, codebase, decks) were attached for this project — the
system below is built directly from the brand brief provided in chat. There is nothing else to
link back to; if a Figma file or codebase becomes available later, this system should be
reconciled against it.

## Products / surfaces covered

One product, nine core surfaces (see `ui_kits/socialsuite/`):

1. **Analytics / Page Overview** — flagship screen. Growth chart, followers-by-country donut,
   followers-by-city table, posts-published stats.
2. **Planning Calendar** — weekly grid, best-time-to-post heatmap, scheduled post cards.
3. **Post Composer** — multi-platform composer, post type selector, caption editor, presets,
   auto-publish toggle, live device preview (mobile/desktop).
4. **Brand Settings / Connections** — grid of connectable platforms.
5. **Unified Inbox** — conversation list + thread view across platforms.
6. **SmartLinks** — link-in-bio builder with phone preview + click analytics.
7. **Ads** — Meta/Google/TikTok Ads campaigns side by side.
8. **Reporting** — PDF/PPT report generation, dashboards, custom chart builder.
9. **Hashtag Tracker** — tracking session form + session table.

## Index

- `readme.md` — this file.
- `SKILL.md` — Claude-Code-portable skill wrapper for this system.
- `styles.css` — root stylesheet; imports everything under `tokens/`.
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `effects.css` (shadow/motion), `base.css` (resets/global element styles).
- `assets/logo/` — `tf-mark.svg` (mark only), `socialsuite-wordmark.svg` (mark + wordmark). No other imagery was provided; do not add photography without a source.
- `guidelines/` — foundation specimen cards (`@dsCard`) for colors, type, spacing, elevation, iconography, logo.
- `components/` — reusable primitives, grouped by concern:
  - `components/core/` — Button, IconButton, Badge, Tag, Card, Avatar
  - `components/forms/` — Input, Select, Checkbox, Radio, Switch, Textarea
  - `components/feedback/` — Tooltip, Toast, Dialog, ProgressBar, EmptyState
  - `components/navigation/` — Sidebar, TopBar, WorkspaceSwitcher, Tabs
  - `components/data/` — StatCard, DonutChart, LineChart, HeatmapCell, Table, PlatformIcon
- `ui_kits/socialsuite/` — the interactive app recreation:
  - `index.html` — entry point; click through the sidebar to reach all 9 screens, switch client workspaces via the top-right pill.
  - `App.jsx` — shell: Sidebar + TopBar + WorkspaceSwitcher + screen router.
  - `screens/` — `AnalyticsScreen.jsx` (flagship), `CalendarScreen.jsx`, `ComposerScreen.jsx`, `ConnectionsScreen.jsx`, `InboxScreen.jsx`, `SmartLinksScreen.jsx`, `AdsScreen.jsx`, `ReportingScreen.jsx`, `TrackerScreen.jsx`.
  - `mock-data.js` — fake data for the four client workspaces (HIRA Institute, HIRA Kitchen, Al Khalil Huffaz School, Al Rehman Academy).

## Intentional additions

No existing component library or codebase was provided, so a standard primitive set was
authored from scratch (per the "no source defines components" path). Additions worth calling
out:
- **WorkspaceSwitcher** — not a generic primitive; it's SocialSuite's signature multi-tenant
  affordance described in the brief, built as its own navigation component.
- **HeatmapCell** — a small data primitive for the best-time-to-post grid; not a standard
  kit component, but reused across the Calendar screen's 7×24 grid.
- **PlatformIcon** — thin wrapper mapping a platform name to its Lucide glyph + brand-tinted
  chip, used everywhere a platform badge appears (Composer, Connections, Ads, Inbox).

## Sources

None attached. This system was authored directly from the written brand brief supplied in
chat (colors, type, tone, functional scope, signature element, logo description). If a Figma
file, GitHub repo, or existing marketing site for TechyFuel/SocialSuite exists, attach it and
this system should be reconciled against it as ground truth.

## Content fundamentals

Voice is written for **agency operators managing other people's brands**, not for a single
brand's own social team — so copy stays neutral and workmanlike rather than cheerleading.

- **Person:** second person for instructions and empty states ("Connect a platform to start
  scheduling"), first-person plural only in system/agency-level chrome ("Your workspaces").
  Never refers to "you" as the end client — the client is always named explicitly (HIRA
  Institute, Al Rehman Academy, …) since one login manages several brands at once.
- **Casing:** sentence case everywhere — buttons, nav labels, headings, table headers. Never
  Title Case, never all-caps except for small overline labels (e.g. section eyebrows) at
  `--text-2xs` with `--tracking-widest`.
  - Good: "Best time to post", "Add a connection", "Start tracking"
  - Avoid: "Add A Connection", "ADD CONNECTION"
- **Tone:** plain, operational, confident — describes what will happen, not how great it is.
  "Auto-publish is on — this post goes live at the scheduled time" rather than "You're all set!
  🎉". No exclamation points in system copy; reserve enthusiasm for nothing — this is a tool
  agency staff live in for 8 hours a day.
  - "3 accounts disconnected — reconnect to resume scheduling" (not "Uh oh! Something went
    wrong 😬")
  - "Report ready to send" (not "Your report is ready to rock!")
- **Numbers & data:** every metric is precise and labeled with its unit/timeframe inline
  ("+12.4% vs last 28 days"), never a bare number without comparison context. Dates/times use
  IBM Plex Mono to visually separate "data" from "prose".
- **Emoji:** never used in product chrome, empty states, errors, or notifications. Platform
  names are always the proper noun + wordmark-style capitalization (Instagram, not IG, in
  first reference; TikTok not Tiktok).
- **Errors/validation:** state the fact, then the fix, in one line: "Caption exceeds
  Instagram's 2,200-character limit — trim by 84 characters." Never blame the user ("You
  entered an invalid caption").
- **Client-facing surfaces** (Reporting exports, SmartLinks pages) shift slightly warmer/more
  polished than internal chrome, since these are seen by the institution's own stakeholders —
  but still no emoji, still sentence case.

## Visual foundations

- **Color:** a strict mono-blue system. Deep Blue `#214DD8` is reserved for dark surfaces
  (sidebar, top nav); Royal Blue `#2C52EF` is the one primary action color (buttons, active nav
  state, logo, links-as-CTA); Sky Blue `#058FE2` is the secondary accent and — deliberately —
  stands in everywhere a product would normally reach for green: positive deltas, "connected"
  states, success toasts, completion bars. Amber `#D97706` is warning/pending only; Red
  `#DC2626` is error/negative only. Green never appears, including inside chart series,
  status dots, or toggle "on" states (toggles use Royal Blue when on, not blue-for-off/
  green-for-on). Multi-series charts (e.g. followers by country) stay inside the blue ramp
  (`--blue-950`…`--blue-100`) plus slate for "other," so density comes from value/saturation
  steps rather than hue variety.
- **Type:** Space Grotesk for headings and any large display number (stat card figures, growth
  chart deltas) — it's geometric and a little techy, which reads as "dashboard," not "editorial."
  Inter for all body copy, labels, table cells, buttons. IBM Plex Mono for anything that is
  literally data: timestamps, percentages inside the heatmap, campaign IDs, hashtag counts,
  spend figures. Mixing all three on one screen is intentional and expected (e.g. a stat card:
  Space Grotesk number, Inter label, Plex Mono delta/timeframe).
- **Spacing:** 4px base unit, scale at 4/8/12/16/20/24/32/40/48/64/80. Card interior padding is
  20–24px; page gutters 24–32px. Dense data tables tighten to 12px vertical rhythm; marketing-
  weight surfaces (SmartLinks preview, empty states) loosen to 32–48px.
- **Backgrounds:** flat `--bg` (`#F8FAFC`) page canvas, flat white cards — no gradients on
  surfaces, no textures, no photography as chrome. The *only* gradient in the whole system is
  the Royal→Sky logo mark and its direct reuses (loading bars on brand-forward surfaces like
  SmartLinks preview header). Using it elsewhere would dilute the one signature moment, so it's
  intentionally rationed.
- **Animation:** short and functional only — 120ms for hover/press feedback, 180ms for
  panel/dropdown open, 280ms for page-level transitions, all `cubic-bezier(0.4,0,0.2,1)`
  (standard ease-out-ish, no bounce/overshoot ever — this is a data tool, not a consumer app).
  Charts animate in once on mount (draw-in), never loop. No parallax, no decorative motion.
- **Hover states:** buttons and nav items darken by one step (Royal → `--accent-primary-hover`,
  a ~6% darker blue) rather than lightening or adding opacity haze; ghost/tertiary buttons gain
  a flat `--surface-sunken` fill on hover. Table rows get `--surface-sunken` on hover. Links
  underline on hover (never colored-underline-by-default).
- **Press/active states:** one step further ("active" token, ~12% darker than base) plus no
  scale/shrink transform — this system never scales elements on press; it only re-colors.
- **Borders:** hairline `1px solid var(--border)` (`#E5E7EB`) on virtually every card/input/
  divider; `--border-strong` reserved for focused/active outlines. No double borders, no inset
  borders-as-decoration.
- **Shadows:** very restrained — `--shadow-xs`/`--shadow-sm` on resting cards (barely visible,
  mostly there to lift cards a hair off the page background), `--shadow-md` on popovers/
  dropdowns, `--shadow-lg` reserved for modals only. No colored/glow shadows.
- **Corner radii:** `--radius-md` (10px) is the workhorse for cards, inputs, buttons;
  `--radius-sm` (6px) for small chips/badges/checkboxes; `--radius-lg` (14px) for large feature
  cards (phone preview frame, composer panel); `--radius-full` for pills (workspace switcher,
  status badges, avatars). Never sharp corners on interactive elements.
- **Cards:** white fill, 1px `--border`, `--radius-md`, `--shadow-xs`, no left-border accent
  strip (explicitly avoided — reads as generic AI-dashboard-slop). Section headers inside a
  card are Inter semibold at `--text-sm`, not full headings.
- **Transparency/blur:** used exactly once, functionally — the modal/dialog scrim
  (`--surface-overlay`, translucent slate, no blur) so background context stays legible. No
  frosted-glass panels, no blurred nav bars.
- **Layout:** fixed left sidebar (`--sidebar-w` 232px, Deep Blue) + fixed top bar
  (`--topbar-h` 64px, white) framing a scrollable content region capped at
  `--container-max` (1440px) on very wide screens. The workspace switcher pill always lives
  top-right of the top bar; primary page actions live top-right of the content area, never in
  the sidebar.
- **Imagery:** none provided or invented. Institution avatars are letter-mark circles (initials
  on a blue tint), matching the workspace-switcher pattern — see Iconography below for why no
  photography is used anywhere in this system.

## Iconography

No icon font or SVG sprite was provided with the brief, so this system standardizes on
**Lucide** (stroke-based, 1.5–2px stroke, rounded joins) loaded via CDN
(`https://unpkg.com/lucide@latest`) and instantiated as `<i data-lucide="name">` +
`lucide.createIcons()`. Lucide was chosen because its geometric, slightly technical stroke
style matches Space Grotesk's character and avoids the rounded-filled-icon "AI dashboard"
look. This is a **substitution** — flag it to the user if TechyFuel has an existing icon set.

- Platform marks (Facebook, Instagram, TikTok, etc.) are represented as Lucide's generic
  equivalents where available and simple monochrome letter-in-circle fallbacks otherwise —
  never hand-drawn brand logos, to avoid misrepresenting third-party marks.
- Client/workspace avatars are two-letter initials on a `--blue-100`/`--blue-700` tint circle
  (e.g. "HI" for HIRA Institute), not photography or icons — this is the same pattern as the
  signature workspace-switcher.
- No emoji anywhere in the UI (see Content Fundamentals).
- No unicode-character icons; every glyph is a real Lucide icon at 16/18/20px depending on
  density.

## Fonts — substitution flag

Space Grotesk, Inter, and IBM Plex Mono are loaded live from Google Fonts
(`tokens/typography.css`) since no font files were supplied. These are the exact families
named in the brief (not a substitution) — flagging only that they are CDN-loaded rather than
self-hosted; if offline/self-hosted delivery is required, supply the licensed font files and
this system will switch to local `@font-face`.
