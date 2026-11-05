# Debugging Log

This log records issues that were actually observed, based on real command output, tests and browser checks. It contains no hypothetical errors.

- **1 November 2026:** diagnosis and fixes by the Codex AI assistant.
- **2–5 November 2026:** diagnosis and fixes by Claude Code.

It was translated from Arabic to English on 3 November 2026.

On 5 November 2026, following the instructor's review of Task 2, entries about the AI tool's own environment (PowerShell execution policy, sandbox permissions, disk space, Git folder ownership, busy ports, blocked websites) were removed. They were not errors in the project's code. The log now keeps only bugs in the code, the tests and the design. The removed entries remain in the Git history.

## Day 1 — 1 November 2026

| Observed issue                                        | How it was discovered                  | Cause                                                                                                                         | Action and result                                                                                              |
| ----------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Image test failed before loading finished             | Assertion on `complete`/`naturalWidth` | The test checked off-screen `loading=lazy` images too early                                                                   | The QA tool requests `eager` and then waits for the images. All passed; there was no broken image link         |
| Adding a product after reload found a `null` element  | Exception inside the QA tool           | Waiting on the card count saw the old document before it was replaced                                                         | Mark the old document and wait for it to disappear and for the new document's cards to appear                  |
| Focus check after Escape did not find the cart button | Assertion on `activeElement`           | Opening the dialog programmatically in the test did not focus the opener; the code relied only on the browser restoring focus | Explicitly refocus the cart and account buttons on `close`. The check passed after waiting for the close event |

Final verification covered the logic tests, the real Chrome check, the production build, formatting and ESLint (details in `docs/day-01.md`). Passing these does not mean business policies are approved, or that a full screen-reader check was done.

## Design refinement — 1 November 2026 (follow-up)

Codex did the review with terminal tools and Chrome. These issues came from the actual work:

| Observed                                                                          | Discovery and cause                                                                                                                   | Fix and verification                                                                                                                                                                        |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Price wrapped and cart buttons changed size in the first screenshots              | Reviewing the 1280px screenshots; a CSS replacement had targeted the `input`/`select` part of a shared rule that starts with `button` | Restored the shared `font: inherit` rule, limited field widths to `input`/`select`, and stopped the price group from shrinking. Re-taken screenshots showed the price and buttons correctly |
| First mobile screenshots showed empty image frames although the images had loaded | CDP screenshot taken right after resizing and scrolling                                                                               | Wait for a repaint before screenshots. The images appeared in the final screenshots without changing any image links                                                                        |
| First welcome image had too much empty space                                      | Visual review                                                                                                                         | Replaced it with a photo that shows the gift box clearly, and deleted only the unused download                                                                                              |

Result: the functional Chrome check and the final screenshots passed, with the original product data preserved. No Lighthouse score is claimed for this follow-up.

## Alexandria, menus and motion follow-up

| Actual issue                                               | Discovery and cause                                                                                                                                     | Fix and verification                                                                                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| SyntaxError in the new QA tool                             | Prettier found clashing selector quotes inside a `Runtime.evaluate` string while generating part of a test                                              | Unified the selector quotes; Prettier and ESLint then passed                                                                            |
| Arrow keys moved focus but Enter did not commit the choice | A Chrome test showed focus on the "مباخر" option while the `category` value stayed empty                                                                | Explicit Enter and Space handling that prevents double default activation; real selection and adding a customization to the cart passed |
| Waiting for images failed once on the dev server           | Image-load wait timed out. The new image file itself was valid and returned HTTP 200. The exact cause was not proven; file rewrites and HMR were active | Request `eager` during the wait loop, and use `preview` for a static production build; all images passed                                |

Codex did the diagnosis and fixes. The final check proved the menus, chips, customization, reduced motion and storage work. `--no-verify` and check bypasses were not used.

**Lighthouse 13.6.0** accessibility reached 100/100:

- **First run:** the audit reported `label-content-name-mismatch` on the logo link, because the visible text "GIFT LAB" was missing from the Arabic `aria-label`.
- **Fix:** the visible text was added alongside the Arabic label.
- **Re-measure:** after rebuilding, the audit passed, and the final result was 100/100 with no applicable audit below 1.
- **Side note:** the first attempt reported that it could not delete a Lighthouse temp folder, but the report completed and the tool exited successfully. No user files were deleted to deal with it.

## Adding the store photos

**Observation:** some attached image file names described a "glass box", while the photo actually showed an incense burner or a set of giveaways.

This was discovered by visually reviewing the attachments. Images were mapped to products by their content, not their names, and `alt` text matching what is visible was added. Codex organized the assets, mapped them and verified the result.

No new runtime errors appeared in the final check: all 20 photos loaded from distinct local paths, and the cart, filtering and customization kept working. The assets were not edited, no new images were generated and no products were recolored; only web JPEG copies were prepared.

## Applying the pink identity from the new design file

**Leftover terracotta colors:**

- **Found:** a source check found terracotta and brown shades hard-coded in rules, gradients, shadows and the search-clear icon, plus the old palette variables.
- **Fix:** they were replaced with the new palette variables and their derivatives. The clear icon became a mask that takes its color from the same variable instead of a fixed color inside it.

**Low contrast:**

- **Found:** a contrast calculation showed the primary pink on the new pink background reaches 4.18:1, below the appropriate threshold for small text.
- **Fix:** the darker shade approved in the design document is used for those links and texts. The primary pink stays for buttons with white text and for focus.

Lighthouse passed the final measurement at 100/100. Codex did the diagnosis, implementation and verification; the colors of the product photos themselves were not edited.

## Banner overlap and sticky navigation

**Observed:**

- The banner photo was absolutely positioned behind the content.
- A gradient and a bottom strip covered part of it.
- The header scrolled off the screen.

These were found by visual review and by reading the source.

**Fix:**

- The banner was rebuilt as a responsive grid with a complete `contain` image.
- A sticky header wrapper was added, with scroll padding for anchor links.

Chrome confirmed the header stays visible, there is no overflow at the three widths, and the footer links are correct. Codex did the implementation, diagnosis and verification.

## Correcting the banner-width misunderstanding

Sara clarified that the photo itself must span the full screen width; the previous change had made the section full-width while the photo stayed limited beside the text.

Codex corrected the implementation to a `cover` photo that fills the banner. It also added a browser assertion that measures the width of the photo element itself, instead of relying on the section width. The check passed at all three widths, along with the occasion circles.

> This is the source of AI rule 1 in `AGENTS.md`.

## Removing the visual split inside the hero

A screenshot review showed the pink bottom strip looked separate from the banner photo, the previous gradient was heavy and the height was too large.

Codex made the strip and its text transparent, lightened the gradient, and adjusted the banner height and photo position without changing the rest of the page. The revised version passed the Chrome check and was reviewed visually on mobile and desktop.

## TypeScript modules and products API — 2 November 2026

| Observed issue                                                                                                                      | How it was discovered                            | Cause                                                                                                                             | Action and result                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The task assumed the TypeScript migration was complete, but `typecheck` reported 196 errors and `index.html` still loaded `main.js` | Ran `npm run typecheck` and grep before starting | The files had only been renamed                                                                                                   | Wrote the new modules with strict types; 0 errors                                                                                                                         |
| API fields differ from the Gift Lab model                                                                                           | A real `curl` request                            | The API sends only `title`, `category_name`, `price_cents` and `in_stock`: no images, description, occasions, options or currency | The mapper renames fields and invents nothing: image placeholder, empty occasions, price without currency, and direct add to cart without customization (Sara's decision) |
| `Array.isArray` turns `unknown` into `any[]`                                                                                        | Code review                                      | Standard library type definition                                                                                                  | Assign to `readonly unknown[]` before iterating                                                                                                                           |
| First migration draft used `as const` and `querySelectorAll<HTMLElement>()`, both unchecked casts, despite the "no `as`" rule       | Self-review before reporting                     | The AI treated these as "safe" shortcuts                                                                                          | Replaced with `instanceof` narrowing. This is the source of AI rule 3 in `AGENTS.md`                                                                                      |

Claude Code did the diagnosis and implementation. Typecheck, the 7 tests, ESLint and the build passed. The updated Chrome check passed every item, including the error state when the API is blocked and the retry.

## Quality tooling and cleanup — 3 November 2026

| Observed issue                                                                                                                                        | How it was discovered                                                                                                                     | Cause                                                                                                                 | Action and result                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `npm run lint` passed, but linted no `.ts` file                                                                                                       | Reading `eslint.config.js` during the audit                                                                                               | The config only used `@eslint/js`, which parses JavaScript only                                                       | Added typescript-eslint with type-aware rules for `src/`                                                                            |
| typescript-eslint cannot use TypeScript 7.0.2                                                                                                         | `npm view typescript-eslint peerDependencies` → `typescript <6.1.0`; `node_modules/typescript` contains only `tsc.js` and no compiler API | TypeScript 7 is the native compiler and does not ship the JavaScript API                                              | Sara chose TypeScript 6.0.3 (pinned `~6.0.3`); typecheck still passes                                                               |
| Type-aware lint reported 5 `unbound-method` errors and 1 `no-redundant-type-constituents`                                                             | `npm run lint`                                                                                                                            | Interface methods (e.g. `filters.read`) were passed as detached callbacks; `Category \| ''` where `Category = string` | Declared callback members as function properties and removed the redundant `''`; 0 lint errors                                      |
| Need proof the rules block shortcuts                                                                                                                  | Probe file containing `any`, `!`, `as` and `@ts-ignore`                                                                                   | —                                                                                                                     | ESLint reported all four rules. A probe commit containing `any` was blocked by the Husky pre-commit hook, and the probe was removed |
| 43 tracked files unused by the app (15 stock photos, 4 SVGs, 8 font files of 3 unused families with their 3 licenses, a prompt file, 12 store photos) | Scripted search for every `public/` path in `src/` and `index.html`                                                                       | Leftovers from earlier iterations and the switch to the API catalog                                                   | With Sara's approval, deleted all except the 12 store photos, which are kept pending her decision                                   |
| Lighthouse Best Practices 96                                                                                                                          | Lighthouse 13.6.0 on `vite preview`                                                                                                       | `/favicon.ico` 404 logged as a console error                                                                          | Inline SVG favicon reusing the existing ✧ mark; Best Practices 100, Accessibility 100                                               |
| Toast radius 7px while all other panels are 8px                                                                                                       | Computed styles measured in Chrome for DESIGN.md                                                                                          | Leftover value from an earlier iteration                                                                              | Set to 8px                                                                                                                          |

Claude Code did the diagnosis and fixes, and Sara made the decisions on the TypeScript version, deletions and AI rules.

## API loading states and toasts — 4 November 2026

| Observed issue                                                               | How it was discovered                                                                  | Cause                                                                                                                                            | Action and result                                                                             |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| New toast animation would ignore reduced motion                              | Reading the cascade while adding the styles                                            | The new `.toast { animation }` rule was appended after the existing `prefers-reduced-motion` block, and the later rule wins at equal specificity | Moved the toast and skeleton reduced-motion overrides to a block at the end of `styles.css`   |
| QA script SyntaxError                                                        | Prettier parse error at line 619                                                       | Single-quoted JS string containing single-quoted selectors                                                                                       | Switched those expressions to template literals                                               |
| Toast screenshot looked faded                                                | Visual review of `test-results/toasts.png`                                             | Captured during the 200ms entrance animation                                                                                                     | Added a 300ms pause before that screenshot; the re-taken screenshot shows fully opaque toasts |
| One intermittent QA timeout in the existing "blocked API → error state" step | 1 of 4 full runs timed out after 8s waiting for `[data-retry]`; the next 3 runs passed | Not proven; it did not recur                                                                                                                     | Not masked (the timeout budget is unchanged); recorded here for follow-up                     |

Claude Code did the diagnosis and implementation. Typecheck, ESLint, Prettier, 9 unit tests and the build passed. The Chrome QA script passed all 13 groups, including slow, HTTP 500, empty and retry API scenarios intercepted with the Chrome Fetch domain.

## Cart fixes from the instructor's review — 5 November 2026

| Observed issue                                             | How it was discovered                           | Cause                                                                                                                                        | Action and result                                                                                                                                                    |
| ---------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The "−" button does nothing at quantity 1                  | Instructor's review of Task 2                   | `cartRowHTML` added `disabled` when `quantity === 1` so the quantity could never reach 0, which left "حذف" as the only way to remove an item | Added `store.decrease()`: it lowers the quantity, and at 1 it removes the product. The button stays enabled, and its accessible name says it removes the item at 1   |
| No way to empty the cart in one step                       | Instructor's review of Task 2                   | The feature was never built; the store had no `clear()`                                                                                      | Added `store.clear()` and a "تفريغ السلة" button that only shows when the cart has items. It saves the empty cart, shows a toast and moves focus to the close button |
| The browser check passed even though "−" was disabled at 1 | Re-reading the cart part of `browser-check.mjs` | The check only pressed "−" at quantity 2, so it never covered quantity 1                                                                     | The check now asserts "−" is enabled at quantity 1, that pressing it removes the row, and that "تفريغ السلة" empties the cart and `localStorage`                     |

Claude Code made the fixes. Typecheck, ESLint, Prettier, 10 unit tests (one new cart test), the build and the full Chrome QA script passed.
