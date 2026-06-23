# Changelog

## 2026-06-23

- Renamed the dashboard page title to `대시보드_AI_작업현황`.
- Reworked home information architecture around scoped project filters.
- Added `전체`, project chip, and `팀 운영` filtering.
- Replaced fixed `grid-area` home layout with card array rendering and size classes.
- Added scoped client helpers for open threads, sessions, TODOs, updates, deliverables, and briefing items.
- Split detail pages by card type and kept detail headers fixed while body content scrolls.
- Added browser back support for detail -> home navigation.
- Hardened `localStorage` access for fallback contexts.
- Fixed `npm run serve` for the current Node runtime and made 404 handling non-crashing.
- Added GitHub-oriented handoff docs:
  - `AI_HANDOFF.md`
  - `LESSONS_AND_NEXT_STEPS.md`
  - `STATUS_SNAPSHOT.md`
- Changed `.gitignore` so `dist/data.json` is committed as a public status snapshot while secrets remain excluded.
- Published to GitHub as `dashboard-ai-work-status`; the requested Korean title is kept in the dashboard and documentation.

## 2026-06-18 ~ 2026-06-19

- Created the original dashboard project.
- Added `generate.mjs` to aggregate whitelisted markdown and project files into `dist/data.json`.
- Added mobile-first static UI in `dist/index.html`.
- Added Cloudflare Pages deployment flow.
- Added project TODO support under `data/todos/`.
