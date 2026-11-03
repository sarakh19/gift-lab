# Work Day 03 — 3 November 2026

## Work completed and assignment checkpoint

The checkpoint was completing the Software Engineering assignment: an audit, architecture, quality tooling, cleanup, documentation and submission to GitHub.

1. **Audit** of every file, the configuration, the hooks, the assets and the documentation against the instructor's checklist.
2. **Architecture.** Extracted `modules/filters/` (types, logic and UI), `products.mapper.ts`, and `modules/notifications/` (moved from `shared/ui/announcer.ts`). `main.ts` connects filters, products and cart through callbacks. A scripted check over all 23 source files found 0 circular imports.
3. **TypeScript linting:**
   - Added typescript-eslint with type-aware rules for `src/`.
   - Assertions (`as`), non-null `!`, explicit `any` and all `@ts-*` directives are errors.
   - lint-staged now lints and formats `.ts` files, and the pre-commit hook also runs `npm run typecheck`.
4. **TypeScript version.** typescript-eslint 8 supports TypeScript below 6.1, and TypeScript 7 has no JavaScript compiler API, so Sara chose to switch TypeScript 7.0.2 → 6.0.3 (pinned `~6.0.3`).
5. **Cleanup (approved by Sara):**
   - Removed `CODEX-PROMPT.txt`, 15 stock photos, 4 SVGs, and 8 unused font files with their 3 licenses.
   - Recompressed the 8 used brand photos from about 2.3 MB to 1.1 MB.
   - The 12 unused store product photos are kept pending a decision.
6. **Fixes:**
   - The search hint now matches the API catalog.
   - Each out-of-stock button has its own accessible name.
   - An inline favicon removes a 404 console error.
   - The toast radius now matches the other panels.
7. **Documentation:**
   - Rewrote `README.md`, `DESIGN.md` (with measured values) and `AGENTS.md` (with three AI-mistake rules approved by Sara).
   - Translated `debugging-log.md`, `docs/day-01.md` and `docs/image-sources.md` to English.

## Files created or changed

**Created:**

- `src/modules/filters/*`
- `src/modules/products/products.mapper.ts`
- `src/modules/notifications/notifications.ui.ts`
- `docs/day-02.md` and `docs/day-03.md`

**Changed:**

- `src/main.ts`, `products.*`, `cart.ui.ts`, `select-picker.ts` and `home.ui.ts`
- `eslint.config.js`, `package.json`, `.husky/pre-commit` and `.gitignore`
- `index.html` and `styles.css`
- All documentation files

## Important changes and how they work

- **The `unbound-method` lint errors.** Type-aware linting found that interface _methods_ such as `filters.read` were passed as detached callbacks; a method may depend on `this`. Declaring those members as function properties (`read: () => ProductFilters`) states that they don't use `this`.
- **The hook really blocks commits.** A probe file containing `any` was staged and a commit attempted. Husky → lint-staged → ESLint rejected it and no commit was created. The probe was then removed.
- **Lighthouse** (production build, `vite preview`): Accessibility 100, Best Practices 100, SEO 92, Performance 82.
  - SEO loses points for `robots.txt`: the preview server returns `index.html` for that path.
  - Performance is limited by the hero image's LCP on simulated mobile.

## Concepts learned

- Type-aware linting compared with type checking.
- Why pre-commit hooks make the rules automatic.
- Peer-dependency compatibility between tools.
- Verifying cleanup by searching for asset references instead of guessing.

## How to run and check

```bash
npm ci
npm run typecheck && npm run lint && npm run format:check && npm test && npm run build
npm run dev   # in another terminal: node scripts/browser-check.mjs
```

## Known issues and open decisions

- The 12 unused store product photos: keep them or delete them (Sara's decision).
- The customization section copy describes product options that the API doesn't provide.
- `npm audit`: 11 moderate issues in dev-only tooling (`minimatch`); 0 in production dependencies.
- `styles.css` contains layered overrides from earlier iterations. The rendered result is consistent, but the source could be consolidated.
- No `robots.txt`, and no real screen-reader or real-phone test.

## Suggested next step

Decide what to do about product photography for API products and the customization copy. Then consolidate `styles.css`, using the Chrome QA screenshots as a regression check.
