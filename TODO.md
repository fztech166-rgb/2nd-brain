# UI / Encoding / i18n Fix — Task List

## Goal
Fix 3 critical issues without breaking existing functionality:
1. **Encoding** — remove mojibake (à¦…) in index.html, ensure UTF-8 + Bangla font support.
2. **Text visibility** — fix white-on-light text in dashboard when a light appearance template is combined with dark theme.
3. **English/Bangla translation** — complete, ready-to-use translation system (dictionary + toggle).

## Steps

- [x] Step 0 — Analyze project files (read index.html, css/*, js/language.js, js/app.js, renderers).
- [ ] Step 1 — Rewrite `js/language.js` with complete EN/BN dictionary + MutationObserver + icon-safe translation.
- [ ] Step 2 — Update `css/base.css`: add `--text/--text2/--text3` to each light appearance template (white-on-white fix), add `.lang-toggle` pill button styles, add contrast guards.
- [ ] Step 3 — Update `css/dashboard.css`: contrast safety for `.brain-greeting span`, `.brain-time-label`, etc.
- [ ] Step 4 — Rewrite `index.html`: fix all mojibake → correct UTF-8 Bangla, wrap text in `<span data-i18n-key>`, add `data-i18n-placeholder/title/aria-label`, keep every ID / data-attribute / script intact.
- [ ] Step 5 — Update dynamic renderers to use `translateText()`:
  - `js/notes.js` (empty states, buttons)
  - `js/tasks.js` (empty states, buttons)
  - `js/dashboard-previews.js` (empty states)
  - `js/community.js` (empty states)
  - `js/ui.js` (chapter list empty state)
  - `js/settings.js` (status text)
- [ ] Step 6 — Verify no broken IDs/handlers; test in browser (toggle language, light+dark contrast).

