# Verification — 2026-10-15

- `npm run build`: passed (TypeScript + Vite production build).
- `npm run lint`: passed; no ESLint errors or warnings.
- `npm test`: 12 passed, 0 failed, 0 skipped. Duration: 11.1 minutes.
- 73 screenshots retained in `docs/evidence/`.
- Seven requested viewport sizes, six scroll positions each: no horizontal overflow.
- Hero, Design & Code, project masks and About word color: actual computed values change on scroll.
- Design & Code: reverse-scroll matrices return to their starting values within the asserted tolerance.
- Thirteen feeds: all temporal screenshot hashes differ; expansion, Escape dismissal and focus restoration pass.
- Eleven project dialogs, nine FAQ entries, six library demos, search, category filters, empty state and clipboard: pass.
- Mobile navigation, keyboard skip link, reduced-motion behavior and offscreen renderer disposal: pass.
- Browser console/page-error assertions: no critical errors.
- Production smoke test: `/`, `/library`, `/prompts/ai-status-orb`, `/legal`, `/privacy` return HTTP 200 and render their headings without console errors.

## Practical limits

Tests ran in Linux Chromium with software WebGL. This does not establish performance on every physical GPU, browser or phone. No reference comparison was possible because louisraille.fr was inaccessible. The visuals are original procedural studies, not filmed videos. The repository is ready to run or deploy to a static SPA host; no public website deployment is claimed.
