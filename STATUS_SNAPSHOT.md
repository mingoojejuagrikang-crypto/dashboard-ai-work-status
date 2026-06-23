# Status Snapshot

Generated from the current dashboard data on 2026-06-23.

For machine-readable detail, see `dist/data.json`.

## Projects

### survey-011

- Current version: `0.17.0`
- Sessions: 15
- Open threads: 9
- TODO: 8 done / 1 in progress / 0 pending
- Known issues: 37 fixed / 29 watching / 2 not applicable
- Latest changelog entry: `v0.17.0` on `2026-06-23`
- Current in-progress TODO:
  - `v0.16.0 + v0.17.0 실기기 검증 대기`

Most important next context:

- Verify `v0.16.0` decimal clip behavior in real-device logs.
- Verify `v0.17.0` A-hero input-tab readability and correction display.
- Continue tracking safe-area, auth retry, pause/resume voice control, trend popup duplication, session name uniqueness, barge-in behavior, and clip loss.

### 팀 운영

- Sessions: 4
- Open threads: 3
- Deliverables: 16
- Current open context:
  - Decide whether shared vault trap/knowledge notes should be published to a private GitHub repo.
  - Review unverified KNOWN-ISSUES items.
  - Convert watch items such as `STT-2/4` into survey-011 regression tests.

## Dashboard Project State

- Page title: `대시보드_AI_작업현황`
- Home layout: no-scroll card dashboard with scoped project filters.
- Detail navigation: home button and browser back both work.
- GitHub target repository: `대시보드_AI_작업현황`
- Public snapshot policy: commit `dist/data.json`, exclude secrets.

## Last Verification

- `npm run build` passed.
- `npm run serve` passed at `http://127.0.0.1:8899`.
- Browser smoke checks passed for 390x844, 1280x800, and 1440x900.
