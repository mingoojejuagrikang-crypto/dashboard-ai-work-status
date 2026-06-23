# 시행착오와 다음 작업

Last updated: 2026-06-23

## 시행착오

- `npm run serve` originally used `node --watch-path=. -e ...`. Current Node rejects `--watch` with `--eval`, so the serve script now uses a plain static server.
- The first ad hoc static server wrote `200` headers before checking file existence, then crashed on missing assets such as `/favicon.ico`. The fixed server checks `existsSync()` before writing headers.
- `localStorage` access can fail in some browser/file contexts. `savedProjectId()` and `saveProjectId()` wrap it in `try/catch` so `SAMPLE` fallback still renders.
- Fixed grid-area cards made priority changes brittle. Home now renders a card array with size classes: `primary`, `wide`, `compact`, `tall`, `status-card`.
- Project status initially looked cramped on mobile. It now gets taller layout space and separates project name from status text.
- Compact TODO cards lost detail when the status card became taller. TODO is now compressed with `todo-mini` so progress and complete/in-progress/pending counts remain visible.
- Detail navigation originally only had a visible home button. It now also supports browser back through history state.

## Next Improvements

- Add a tiny favicon or ignore the 404 visually; the static server no longer crashes, but the browser still requests `/favicon.ico`.
- Consider a generated `docs/status-snapshot.md` if future AI readers should consume a human-readable status summary without parsing `dist/data.json`.
- Consider adding a small automated browser check script to the repo instead of keeping the Chrome DevTools Protocol verification as one-off terminal code.
- If the GitHub repository must stay public, periodically audit `dist/data.json` for sensitive project/task wording even though tokens and emails are redacted.
- If Cloudflare Pages should be genuinely private, add Cloudflare Access instead of relying on a hard-to-guess URL and `X-Robots-Tag`.
- The dashboard still has no formal test runner. For future larger UI changes, add a minimal smoke test around no-scroll home, filter scoping, detail routing, and fallback rendering.

## Current Follow-Up Candidates

- Improve visual density of `최근 활동` in compact mobile cards.
- Add a date/version badge to the hero that is easier to scan than the current long meta line.
- Decide whether `팀 운영` should keep showing TODO as `0%` or display `TODO 없음`.
- Consider grouping updates by project in detail when project count grows beyond three.
