# Debugging Log

This log records issues that were actually observed, based on real command output, tests and browser checks. It contains no hypothetical errors.

- **1 November 2026:** diagnosis and fixes by the Codex AI assistant.
- **2–3 November 2026:** diagnosis and fixes by Claude Code.

It was translated from Arabic to English on 3 November 2026.

## Day 1 setup — 1 November 2026

| Observed issue                                                    | How it was discovered                                       | Cause                                                                                                                         | Action and result                                                                                                                                           |
| ----------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm` does not run in PowerShell                                  | `npm --version` returned a SecurityError                    | The execution policy blocks `npm.ps1`                                                                                         | Used `npm.cmd`; the machine policy was not changed                                                                                                          |
| Dependency install made no progress in the sandbox                | No output and no `node_modules` during install              | Most likely a sandbox/access restriction; no more precise network cause was proven                                            | Stopped the attempt and reinstalled with the right permission; it succeeded                                                                                 |
| Husky could not set up hooks and Git could not write `index.lock` | Output of `prepare` and `git add`                           | `.git` was not writable inside the sandbox                                                                                    | Ran the approved commands outside it                                                                                                                        |
| Git rejected folder ownership                                     | "dubious ownership" message                                 | Git was initialized by the sandbox user, then run by the machine user                                                         | Temporary `safe.directory` through process variables for this path only, with no global change                                                              |
| ESLint 9 deprecation warning and five audit warnings              | `npm install` and `npm audit` output                        | Outdated version, and `minimatch` inside the lint tooling                                                                     | Upgraded ESLint to 10 and Vite to 8. The ESLint 9 warning went away, but five related moderate warnings remain, left pending without `--force`              |
| Chrome connection did not respond in the sandbox                  | `Runtime.enable` timed out with "unsettled top-level await" | Process/connection limits, plus the CDP tool needing to keep the event loop alive                                             | Added a keep-alive timer and a per-command timeout, then ran QA with the right permission; the connection worked                                            |
| Image test failed before loading finished                         | Assertion on `complete`/`naturalWidth`                      | The test checked off-screen `loading=lazy` images too early                                                                   | The QA tool requests `eager` and then waits for the images. All passed; there was no broken image link                                                      |
| Adding a product after reload found a `null` element              | Exception inside the QA tool                                | Waiting on the card count saw the old document before it was replaced                                                         | Mark the old document and wait for it to disappear and for the new document's cards to appear                                                               |
| Focus check after Escape did not find the cart button             | Assertion on `activeElement`                                | Opening the dialog programmatically in the test did not focus the opener; the code relied only on the browser restoring focus | Explicitly refocus the cart and account buttons on `close`. The check passed after waiting for the close event                                              |
| Lighthouse download failed                                        | `ENOSPC` from npm                                           | Not enough free disk space                                                                                                    | Deleted only that attempt's npx folder and the test Chrome profile, after checking the paths. No Lighthouse score was available at that point               |
| QA tool became empty while saving an edit                         | `Set-Content` failed, then the file length was 0            | The disk filled up during the write                                                                                           | Restored the QA tool from the actual work after cleaning our own test temp files. It passed fully; reduced the cache and clean up the profile when finished |

Final verification covered the logic tests, the real Chrome check, the production build, formatting and ESLint (details in `docs/day-01.md`). Passing these does not mean business policies are approved, or that a full screen-reader check was done.

### Commit hook result

lint-staged printed "could not find any valid configuration" even though the config existed.

- **Discovery:** running lint-staged with `--debug` showed it rejected the JSON because of a BOM that PowerShell's `Set-Content` added with UTF-8 encoding.
- **Fix:** `package.json` was rewritten as UTF-8 without a BOM.
- **Result:** Prettier then completed and ESLint rejected the test file with `no-unused-vars`, so Husky blocked the commit as intended. The temporary file was removed afterwards.

Codex did the diagnosis and fix. The hook was not bypassed with `--no-verify`.

### Vite watcher note during Git operations

When the dev server was stopped, its log showed an HMR warning (it could not reload the CSS) and an `EBUSY` error while watching `.gitattributes`. This happened while lint-staged restored files from its backup and formatting completed.

This is an observed coincidence and does not prove a CSS error. The server was stopped and the production build re-run to confirm the final source was sound. Restart `dev` if the watcher stalls during Git operations on Windows.

## Design refinement — 1 November 2026 (follow-up)

Codex did the review with terminal tools and Chrome. These issues came from the actual work:

| Observed                                                                               | Discovery and cause                                                                                                                   | Fix and verification                                                                                                                                                                         |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Drive C had 0 bytes free                                                               | `Get-PSDrive` while preparing images                                                                                                  | Told the user. The user freed space (about 3.3 GB), and saving resumed without deleting any user files                                                                                       |
| Image source could not be reached from the sandbox                                     | `curl` returned "Failed to connect"                                                                                                   | Re-downloaded with the right permission; the sources responded and the images were saved locally                                                                                             |
| Arabic `alt` text became question marks and the customization section was not inserted | Reviewing `git diff` after piping text from PowerShell to Node                                                                        | The default stdin encoding did not carry Arabic correctly. Set `OutputEncoding` to UTF-8, rewrote the text and fixed the HTML replacements; Chrome confirmed the Arabic text and the section |
| Price wrapped and cart buttons changed size in the first screenshots                   | Reviewing the 1280px screenshots; a CSS replacement had targeted the `input`/`select` part of a shared rule that starts with `button` | Restored the shared `font: inherit` rule, limited field widths to `input`/`select`, and stopped the price group from shrinking. Re-taken screenshots showed the price and buttons correctly  |
| First mobile screenshots showed empty image frames although the images had loaded      | CDP screenshot taken right after resizing and scrolling                                                                               | Wait for a repaint before screenshots. The images appeared in the final screenshots without changing any image links                                                                         |
| First welcome image had too much empty space                                           | Visual review                                                                                                                         | Replaced it with a photo that shows the gift box clearly, and deleted only the unused download                                                                                               |
| Port 5173 already in use                                                               | Vite startup log                                                                                                                      | Used 5174, and extended the QA tool to pick the server URL from an environment variable                                                                                                      |

Result: the functional Chrome check and the final screenshots passed, with the original product data preserved. No Lighthouse score is claimed for this follow-up.

## Banner, fonts and Saudi dialect review

- **TikTok account:** an attempt to open the shop's `glab_sa` account was blocked by the web tool, and a direct download returned a small HTML protection page.
  - The cause is restricted access to the site's content.
  - The account's videos were not extracted or reviewed.
  - The user was told, and the authorized work continued using the available requirements. Results from other stores are not confirmed to be linked to this account.
- **Banner position:** in visual review, the gift sat too close to the banner edge after the photo was enlarged to a full background. `object-position` was set to center on mobile and toward the bottom on larger screens, and the Chrome screenshots were re-taken successfully.
- **Credit and verification:** Codex diagnosed and changed these. The build, functional check and responsive check passed. There is no claim of having seen the TikTok account or matched its actual products.

## Alexandria, menus and motion follow-up

| Actual issue                                               | Discovery and cause                                                                                                                                     | Fix and verification                                                                                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| SyntaxError in the new QA tool                             | Prettier found clashing selector quotes inside a `Runtime.evaluate` string while generating part of a test                                              | Unified the selector quotes; Prettier and ESLint then passed                                                                            |
| Arrow keys moved focus but Enter did not commit the choice | A Chrome test showed focus on the "مباخر" option while the `category` value stayed empty                                                                | Explicit Enter and Space handling that prevents double default activation; real selection and adding a customization to the cart passed |
| Waiting for images failed once on the dev server           | Image-load wait timed out. The new image file itself was valid and returned HTTP 200. The exact cause was not proven; file rewrites and HMR were active | Request `eager` during the wait loop, and use `preview` for a static production build; all images passed                                |

Codex did the diagnosis and fixes. The final check proved the menus, chips, customization, reduced motion and storage work. `--no-verify` and check bypasses were not used.

**Lighthouse 13.6.0** completed once disk space was available. Accessibility reached 100/100:

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
| `curl` failed once with code 35                                                                                                     | Command output                                   | Transient TLS connection error                                                                                                    | Retrying worked. The app itself shows an error state with a retry button                                                                                                  |
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
