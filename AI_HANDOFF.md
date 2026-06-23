# AI Handoff — 대시보드_AI_작업현황

Last updated: 2026-06-23

## Purpose

This project is a lightweight status dashboard for AI-assisted work. It gathers local markdown sources into `dist/data.json`, then renders a static single-page dashboard from `dist/index.html`.

The repository is intended to help future AI models and human operators understand:

- What projects are active.
- What changed recently.
- What is blocked or awaiting verification.
- What should be picked up next.
- Which implementation constraints matter.

## Current Architecture

- `generate.mjs` reads whitelisted local sources and writes `dist/data.json`.
- `dist/index.html` fetches `./data.json` with `cache: no-store`, falls back to embedded `SAMPLE`, and renders everything client-side.
- `data/todos/<project>.md` contains manually maintained TODO state.
- `dist/data.json` is committed as a public snapshot so future AI readers can see the current state without running local private paths.
- Secrets are excluded through `.gitignore`: `.cloudflare.env`, `.env*`, `.wrangler/`.

## Current UI State

The June 23, 2026 information-architecture pass changed the home page from fixed grid areas to a scoped card system:

- Top filter: `전체`, project chips, and `팀 운영`.
- Active scope state: `activeProjectId`, persisted in localStorage when available.
- Home cards:
  - `지금 이어받을 작업`
  - `업데이트 내역`
  - `미해결 / 검증 대기`
  - `TODO 진행`
  - `최근 활동`
  - `프로젝트 상태`
  - `산출물`
- Detail pages are split by card type and avoid repeating large summary numbers from home.
- Browser back returns from detail to home via `history.pushState` / `popstate`.

## Important Functions

In `dist/index.html`:

- `selectedProjects()`
- `scopedOpen(projects)`
- `scopedSessions(projects)`
- `scopedTodos(projects)`
- `scopedUpdates(projects)`
- `scopedDeliverables(projects)`
- `openDetail(type, push)`
- `goHomeFromDetail()`

## Verification Baseline

Last verified on 2026-06-23:

- `npm run build` passes.
- `npm run serve` serves `http://127.0.0.1:8899`.
- Home remains no-scroll at:
  - `390x844`
  - `1280x800`
  - `1440x900`
- Scope filtering works for:
  - `전체`
  - `survey-011`
  - `팀 운영`
- Latest update card prioritizes `survey-011 v0.17.0 · 2026-06-23`.
- Detail header stays fixed while detail body scrolls.
- Browser back returns detail -> home.
- `file://` fetch failure uses embedded `SAMPLE`.
- Escaping allows only generated `<strong>` and treats arbitrary HTML as text.

## Operational Rules

- Do not change `data.json` schema unless there is a strong reason.
- Prefer deriving new dashboard views from existing `projects[]` data.
- Keep home no-scroll. Move deep content into detail pages.
- Keep `generate.mjs` dependency-free unless the parser becomes materially unsafe or unmaintainable.
- Never commit `.cloudflare.env`, `.env*`, or `.wrangler/`.

## Useful Commands

```bash
npm run build
npm run serve
npm run publish
```

## Public Data Caveat

`dist/data.json` is now committed to GitHub to make project status readable by future AI agents. It is generated with redaction, but it still exposes project status, task titles, and summarized history. Review it before pushing if privacy requirements change.
