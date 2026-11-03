# Work Day 01 — 1 November 2026

> Translated from Arabic to English on 3 November 2026. This note describes Day 1 as it happened. File names such as `src/data.js` and `src/ui.js` refer to the JavaScript version of that day. They were later replaced by the TypeScript modules described in `docs/day-02.md`.

## Work completed and assignment checkpoint

The requirements of the first and second lectures were implemented in one session, inside the then-empty project folder.

- **Read first:** `AGENTS.md`, `DESIGN.md` and `docs/client-requirements.md` from the setup bundle were read before implementation, and their copies were kept unchanged.
- **Scope:** `CODEX-PROMPT.txt` was a reference document; the scope came from the user's explicit request.
- **Publishing:** there was no publishing and no remote repository.

## Files and important changes

The full file map was in `README.md`.

- **`index.html`:**
  - Defines the `header`, `nav`, `main`, `section` and `footer` landmarks, one `h1`, and forms with associated `label` elements.
  - The account dialog uses `required`, `minlength`, `type=email`, `type=password` and native validation. It does not create an account.
  - On success it clears the values and states that it is a learning exercise.
- **`src/styles.css`:**
  - Applied an `#FAF8F4` background and `#F1E8DC` cream, with a darker terracotta for text and buttons to help contrast. This was an initial implementation, not approval of a new identity.
  - Fonts: local Tahoma and Arial for Arabic text, and Georgia for Latin elements and for headings with an Arabic fallback. No external fonts were downloaded.
  - Mobile-first layout: one product column, two at `min-width: 768px` and three at `min-width: 1280px`.
  - Flexbox for the header and for the quantity and total rows; Grid for the product grid, filters and occasions.
  - No `!important`, no max-width queries, and no blanket hiding of horizontal overflow to mask defects.
- **`public/`:** contained local SVG illustrations of gifts, a perfume, an incense burner and a welcome scene, marked as placeholder art and given `alt` text. Local art kept the page self-contained without broken image links. It did not represent the approved products or their colors.
- **`data.js`:** contained 12 demo products with categories, occasions, prices and product-specific options.
- **`logic.js`:**
  - Applied search after normalizing hamza forms and diacritics.
  - Combined search, type and occasion with `filter`.
  - Sorted the new result without changing the source.
- **`ui.js` (rendering):** turned the results into cards with `map` and `join`, and showed the empty state and the result count.
- **`state.js`:**
  - Held the cart, using `JSON.parse` and `JSON.stringify`. On load it re-validated the product ID, options and quantity, rebuilt only the allowed fields, and never trusted a saved price; totals came from `data.js`.
  - Each item's key combined the ID with the sorted options. Identical options therefore merged even if their key order differed, and different choices stayed separate.
  - JSON errors and blocked or full storage did not stop the cart within the session.
- **`ui.js` (DOM and events):**
  - It was the only application code that read or wrote the DOM and bound events; `main.js` only started the app.
  - A delegated listener on the products container and delegated listeners on the cart container served buttons and fields added later.
  - The form showed the selected product's own options, then sent them to the state.
  - Variable text was escaped before being inserted into HTML.
  - Native dialogs had labeled close buttons, and Escape returned focus to the cart button. There was visible focus, a skip link and `status` messages.

## Concepts applied

- **Lecture 1:** semantic HTML, heading order, form labels and native validation, RTL direction, Flexbox and Grid, mobile-first breakpoints, and code-quality tools.
- **Lecture 2:**
  - ES modules, and data as objects and arrays.
  - `map`, `join`, `filter`, `sort` and `reduce`, and pure functions.
  - Separating rendering from state, and event delegation.
  - `FormData`, and local storage with JSON serialization and data validation.
- **Quality tools:**
  - Prettier fixes formatting and ESLint catches code problems.
  - Husky ties checks to commits, and lint-staged runs the tools on staged files.
  - These tools complement tests; on their own they do not prove the app's logic is correct.

## Actual verification

- **Tests:** `node --test` / `npm.cmd test`: four passing tests covering filters, source non-mutation, customizations, totals, persistence, corrupt storage and quantity limits.
- **Tooling:** `npm.cmd run lint`, `npm.cmd run format:check` and `npm.cmd run build` all passed, using Vite 8.3.5.
- **Dev server:** `npm.cmd run dev` started, and http://127.0.0.1:5173 responded with HTTP 200.
- **Headless Chrome — structure and layout:** 12 cards, one `h1`, RTL, local images loaded, every `input`/`select` labeled, and `scrollWidth` within the viewport at 360, 768 and 1280.
- **Chrome — catalog and cart:**
  - Search, type, occasion and price sort working together, plus empty results and reset.
  - Merging identical customizations and separating different ones.
  - Changing quantities with the buttons and the field, removal, totals, and the cart surviving a reload.
- **Chrome — form and storage:**
  - `required` and invalid email handling.
  - The password cleared and absent from `localStorage`, and the account learning message.
  - Escape and focus restore.
  - Recovery from corrupt JSON with no unhandled JavaScript exceptions.
- **Screenshots** were taken at the three widths in `test-results`, and the 360 and 1280 screenshots were reviewed visually. They cover the first screen only; this is not a claim of visually reviewing every state.
- **Lighthouse could not run:** its download failed with `ENOSPC`. No score of 90+ or any other value was claimed. No real screen-reader test, real phone test, or Safari/Firefox test was done.
- **`npm audit`:** five related moderate warnings in the ESLint tooling, rooted in `minimatch` 10.2.6 according to the observed result. Upgrading ESLint to 10 did not remove them. No incompatible major version was forced; a compatible update is needed later.

## Running and checking manually

1. Run `npm.cmd ci`, then `npm.cmd run dev`, and open the Vite URL.
2. Search for «مبخرة», choose «مباخر» and «رمضان», and sort descending. You should see دفء, then لطف.
3. Clear the filters. Add مبخرة لطف twice in the sand color and once in ivory: the cart shows two lines and three pieces.
4. Refresh the page and check the cart.
5. In the account form, try an invalid email, then valid fake data. The message does not claim an account was created.

## Issues and open decisions

The following are not approved: details of prices, taxes, shipping, payment, cancellation, stock, preparation times, quantity limits, customizations, and the conditions for showing products to accounts. There is no default policy for any of these.

Each product's amount and options are replaceable learning examples, and the 99 limit is technical only. Real photos, the logo and the final font need client review.

## Suggested next step

1. Approve the product photos and list, their options, prices and quantity rules.
2. Then connect a backend for accounts and orders once the requirements are set.
3. Re-measure Lighthouse when enough disk space is available, and update the lint dependencies when a compatible fix exists.

## Commit-tool verification

Husky and lint-staged were actually tested with a temporary file containing an unused variable:

- **Result:** the hook ran Prettier, then ESLint rejected the commit with `no-unused-vars`. The test file was removed and no failed commit was saved.
- **BOM bug:** the test first revealed a BOM in `package.json` that stopped lint-staged from reading its config. This was fixed by writing UTF-8 without a BOM.
- **Line endings:** `.gitattributes` was added to keep LF for Husky hooks on Windows checkouts.
- **Commits:** the instructions were saved in their own Git checkpoint, then the app and documentation were saved in a later local checkpoint, with no remote and no push.

The Vite server was started for checks during the session and stopped afterwards; restart it with the command in the README when needed.

## Same-day follow-up — design improvement after review

### Scope and inspection before implementation

`AGENTS.md`, `DESIGN.md` and the client requirements were re-read, and the page, styles, data, rendering and Chrome tool files were inspected. The Git tree was clean.

CSS controlled the fonts, sizes and grid, and `ui.js` built the illustrations from the `art` and `tone` fields in `data.js`. No new project was started, and no original feature or data was deleted.

### Changes made

- **`src/styles.css`:**
  - Local Readex Pro font (weights 400, 500 and 600), smaller headings with a clearer hierarchy, and a calmer header.
  - Less spacing, and cards without a surrounding border or shadow.
  - Grid of two columns at 360, three at 768 and four at 1280.
  - A uniform image frame at 1:1.1 with `contain` so products are not cropped.
  - The base colors stayed off-white and cream, with a light terracotta welcome button and dark text.
- **`src/data.js`:** added `image.src` and `image.alt` to every product, and `homeImages` for the welcome and customization images. All earlier fields stayed as they were, including the old `art` and `tone`, which were no longer used for rendering. No prices, options or IDs changed.
- **`src/ui.js`:** rendered the photographs from the data, bound the page images, and turned the occasions from large icons into text options. The filter, cart, account and customization events did not change.
- **`index.html`:** a real welcome photo, a link to customization, and a photographed customization section after the products. The store information section and all dialogs and forms remained. The top strip noted that the images and data were temporary.
- **`public/images/`:** 14 distinct local photos, 12 for the cards and two for welcome and customization. The earlier SVG files were kept but not displayed.
- **`public/fonts/`:** the font files and their license.
- **Docs:** `docs/image-sources.md` documented the photographers, sources and how to replace the images. `DESIGN.md` was updated with the requested direction, and `README.md` with the current state.
- **`scripts/browser-check.mjs`:** the existing check tool was extended to:
  - Accept a URL through `GIFTLAB_QA_URL`.
  - Check the font, the image count and the grid columns.
  - Capture the catalog and customization at the three widths.

  No new libraries were added.

### Actual verification

The four Node tests, ESLint and the Vite build passed. All earlier product data was compared with the Git version, excluding only the added `image` field: names, prices, options, descriptions, occasions and categories matched. `logic.js`, `state.js`, `main.js`, the logic tests and the tool configuration were not changed.

**Chrome checks.** The site ran on http://127.0.0.1:5174 because 5173 was in use.

- Chrome passed loading 14 distinct images and the local font, two/three/four columns at 360/768/1280, and no horizontal overflow.
- The welcome and catalog screenshots for mobile and wide screens, and the customization section, were reviewed visually.
- The price and button display was fixed based on the screenshots, and the first welcome photo was replaced because it had too much empty space.

**Re-checked functionality:**

- Search, type, occasion and sort combined, plus reset and empty results.
- Different and identical customizations, quantities, removal, totals, and persistence after refresh.
- Native form validation and the password not being saved.
- Recovery from corrupt JSON.

These passed with no unhandled JavaScript exceptions. QA screenshots are in the untracked `test-results`. The check finished and this follow-up's dev server was stopped.

There was no new Lighthouse result and no real-device or screen-reader test; this was a design and functional check in local Chrome.

### Issues and concepts

- **Full disk:** saving paused because the disk was full. The user was told and freed space; none of their files were deleted.
- **Arabic encoding:** writing through stdin to Node broke the Arabic encoding in PowerShell, so UTF-8 was set explicitly before saving again.

Error details are in `debugging-log.md`.

**Concepts:**

- Separating image content from rendering, and self-hosting fonts and images.
- `font-display: swap`, aspect ratios and `object-fit`, and tuning the type scale.
- Improving an existing design while testing that data did not change.
- Comparing automated checks with visual screenshots.

### Manual check and next step

1. Run `npm.cmd run dev` and open the printed URL.
2. Check the 360 and 1280 widths, and try filtering, customization and the cart.
3. To repeat QA on a different port in PowerShell, set `$env:GIFTLAB_QA_URL='http://127.0.0.1:5174'` and run `node scripts/browser-check.mjs`.

The next step was to approve the real photos and match them to each product's content; replacing them happened only in `data.js`. The photos, prices and options were still unapproved examples, and the open business decisions did not change.

## Additional follow-up — full-width banner and Saudi dialect

The user asked for:

- A more premium feel and better fonts.
- A full-width header image with the text on the right.
- Saudi wording.
- Taking inspiration from the shop's TikTok account `glab_sa`.

### What was implemented, by file

- **`index.html`:**
  - The welcome area was rebuilt inside a full-width section instead of the split `hero.wrap`. The image sat behind the section, and the text in an RTL container on the right.
  - The phrases «هدايا تليق بغلاهم» and «خلّيها على ذوقك» were added.
  - The occasion, product and customization headings and the main texts were updated in a calm Saudi tone.
  - No sections or dialogs were removed.
- **`src/styles.css`:**
  - IBM Plex Sans Arabic for text, forms and cards, and Noto Naskh Arabic for headings. Both fonts were local with `swap`.
  - A header with a centered logo on larger screens.
  - A banner running edge to edge, with a gradient for text legibility and an image position suited to the gift.
  - Cards and occasions were styled more calmly, keeping the 2/3/4 columns.
- **`src/ui.js`:** the empty-cart, no-results and add messages were updated to Saudi dialect, without changing the event handlers or the customization and cart logic.
- **`public/fonts/`:** added both fonts with their weights and two OFL licenses. The previous font was kept but no longer loaded. There were no new dependencies and no generated images.
- **`scripts/browser-check.mjs`:**
  - Updated the font check.
  - Added checks that the hero width equals the page width at the three sizes and that the text direction starts from the right.

  `DESIGN.md`, `README.md`, `docs/image-sources.md` and the debugging log were updated to match.

### Review and verification result

Vite ran on 5175 during this follow-up.

- **Tooling:** the build, ESLint, formatting and the four Node tests passed.
- **Banner and layout:** the Chrome check passed for the full-width banner, text alignment, fonts, 14 distinct local images, and no horizontal overflow at 360, 768 and 1280.
- **Visual review:** the home screenshots at 360 and 1280 and the catalog at 1280 were reviewed, and the image position was adjusted after the review.
- **Existing checks:** filters, customizations, quantities, removal, totals, persistence after reload, native account-form validation, and recovery from corrupt JSON also passed.
- **Unchanged:** `data.js`, `logic.js`, `state.js` and `main.js`.

The TikTok account could not actually be reviewed: the browsing tool reported a block, and a direct request returned only a protection page.

- No products, colors or images were attributed to the account without seeing them.
- The current images were still temporary. Accessible reference photos of the shop's products would be needed to match its real arrangements later.
- There was no new Lighthouse result and no real-phone review.

### Concepts and next step

**Concepts:**

- The difference between a constrained container and an edge-to-edge section.
- Isolating the image, gradient and text layers with `isolation` and `z-index`.
- Using a naskh font for headings with a clear UI font for text.
- Adjusting `object-position` per breakpoint.
- Adapting the language style to the audience without inventing business policies.

To preview, run `npm.cmd run dev` and open the printed URL; the checks temporarily used 5175. The next step was to match the header and giveaway photos with real available shop photos, without changing product data or prices until approved.

## Additional follow-up — Alexandria, interaction consistency and motion

### Request and inspection

`AGENTS.md`, `DESIGN.md` and `docs/client-requirements.md` were read before implementation, and the UI, styles, QA tool and the clean Git tree were inspected.

The user asked to:

- Unify the font to Alexandria.
- Tune the colors and interactive states.
- Shrink the cards.
- Improve the menus and filters.
- Add light motion that respects reduced-motion settings, while preserving the data and features.

### What changed and file responsibilities

- **`src/styles.css`:**
  - Local Alexandria (weights 400, 500 and 600) across the whole site, and darker header links at weight 500.
  - The heading scale was unified and the card frames shrunk to a square instead of the tall ratio.
  - The palette included off-white, cream and terracotta. It explicitly styled visited links, focus while typing, caret, selection, hover states, search and autofill.
  - Styles were added for the enhanced menus, selected filters, messages and short animations.
  - The banner stayed full-width with the text on the right.
- **`src/ui.js`:**
  - The new functions `createPickers` and `createMotion` lived in the same DOM module.
  - The enhanced menus show labeled buttons and a `listbox` with `aria-selected` and `aria-expanded`.
  - Keyboard behavior: arrows and Home/End move focus, Enter/Space commit the choice, Escape closes the menu first, and Tab leaves it without trapping. Clicking outside closes it.
  - The hidden native `select` value remains the `FormData` source, and the native `select` stays as a fallback if the enhancement does not run.
  - The mechanism applies to the catalog filters and to the customization options inside the dialog.
- **Filter chips:**
  - Filter choices appear as removable chips. Each removal clears only its own filter and returns focus to the field or menu button.
  - Sort, search, type and occasion keep working together.
  - Active fields carry a color and border that show the choice, and the result count stays in a `status` region.
- **`index.html`:** added a labeled region for the selected filters and a clearer label for the search form, without removing sections, forms or cart features.
- **`src/data.js`:** changed only the image and image description of مبخرة دار (p11), from a shot containing a candle to a local brass incense shot. All other product fields, prices, options, categories and occasions were preserved. `logic.js`, `state.js`, `main.js` and the logic tests did not change.
- **Assets:**
  - `public/fonts/` gained Alexandria and its license.
  - `public/images/incense-brass.jpg` was added as a replacement photo.
  - 14 distinct images were displayed, with no SVG or external links. The old font files and image were kept but not displayed.
- **`scripts/browser-check.mjs`:** the existing check was extended to test, in addition to the original checks:
  - The menus actually working with the keyboard.
  - The chips and their removal, the focus colors and the caret.
  - The customization options with Escape and Space.
  - Reduced-motion mode.

  `DESIGN.md`, `README.md`, `docs/image-sources.md` and the debugging log were updated.

### How the motion works

**CSS handles the purely visual effects; no JavaScript is involved:**

- Color changes on buttons and fields take 140ms.
- Menus appear over 130ms.
- The dialog and the add message open over 160ms.

**JavaScript handles motion that responds to state or scrolling:**

- `IntersectionObserver` watches section headings, the customization section and the store information enter the screen. It plays one 240ms reveal, then stops observing that element.
- After a filter change, the results update immediately, then fade in lightly over 140ms.
- When a product is added, the cart counter makes a small 200ms movement.

**Safeguards:**

- Elements are visible by default. There is no waiting to remove `opacity: 0`, and buttons are never disabled during motion.
- `matchMedia` checks `prefers-reduced-motion` before any Web Animation, and cancels running animations if the setting changes. In that mode CSS stops transitions and animations, and programmatic smooth scrolling is turned off.
- If `IntersectionObserver` or `animate` is missing, the content and interaction still work without the motion. No extra dependencies were added.

### Actual verification

- **Tooling:** `npm.cmd run lint` and `npm.cmd test` (four tests) passed, and the Vite build passed.
- **Servers:** the dev server ran on 5176, then a `preview` of the production build ran on 4176 to isolate hot updates during QA.
- **Layout:** Chrome passed image and font loading, RTL, the single `h1` and the field labels, and two/three/four columns at 360/768/1280 without horizontal overflow. The banner width stayed equal to the page width.
- **Keyboard menus:**
  - The «مباخر» filter was chosen with the arrow keys and Enter, and its chip appeared and was removed successfully.
  - Escape, Tab, the focus colors and the caret were tested; they were rgb(152,84,62), not the browser's blue.
  - Inside customization, Escape closed only the menu and the dialog stayed open. Ivory was chosen with End/Space and then added to the cart successfully.
- **Functionality:** these passed with no unhandled JavaScript exceptions:
  - Combined filters, reset and empty results.
  - Merging and separating customizations, quantities, removal, totals and persistence after reload.
  - Native account validation and the password not being stored.
  - Recovery from corrupt storage.
- **Reduced motion:** with `prefers-reduced-motion` emulated, the menus and dialog had no animation, product updates had no Web Animations, and the content was visible.
- **Visual review:** the home page on mobile and large screens, the catalog and the open menu were reviewed. Images and screenshots are in the untracked `test-results`.
- **Not covered:** a real screen reader or a real phone; the later Lighthouse measurement is documented at the end of this follow-up. The images, prices and options remained learning data, not approved.

### Concepts and next step

**Concepts:**

- Progressive enhancement of menus while keeping the form data.
- Focus management and ARIA, and verifying keyboard use instead of only clicking.
- Showing each filter's state and removing filters individually.
- Separating simple CSS motion from JavaScript that responds to state or to elements entering the screen.

**Running:** use `npm.cmd run dev`. For the production version, run `npm.cmd run build`, then `npm.cmd run preview`. For repeated checks, use `GIFTLAB_QA_URL` for the server address.

The next step was a real screen-reader test and approval of the real Gift Lab photos, with the open business decisions left as they were.

### Accessibility measurement after the changes

Lighthouse 13.6.0 ran successfully on the local production build of the home page. **Accessibility was 100/100** on 1 November 2026 (report time 09:28:43 UTC). The full report was saved in the Git-ignored `test-results/lighthouse-alexandria.json`.

- **First run:** the logo link's accessible name did not include the visible text "GIFT LAB".
- **Fix:** the `aria-label` was corrected, then the build and measurement were re-run, and `label-content-name-mismatch` also passed.
- **Limits:** this is an automated result for the home page, not a certificate for every state or a substitute for a real screen reader. The final result showed no applicable audits with a score below 1.

## Follow-up — removing learning-demo wording on explicit request

The words «تعليمي» (educational), «تجريبي» (demo) and «مؤقت» (temporary) and their badges were removed from the interface. This covered the screen's meta description, the top strip, cards, prices, cart, customization, footer, image alt text and the account form. The unused badge styles were deleted, and five product descriptions were cleaned of those words without changing prices, options or product IDs.

The user's explicit change took priority over the earlier instructions to show those labels in the design; the implementation limits remained in the README and project documents.

- **Form wording:** the form title is «بيانات الحساب», its button «تحقق من البيانات», and its result «البيانات مكتملة وصيغتها صحيحة.»
- **No false claims:** nothing claims an account was created or an order sent.
- **Nothing invented:** no backend was added, no passwords were stored, and no policies were invented.

**Files changed:** `index.html`, `src/ui.js`, `src/data.js`, `src/styles.css` and the expected validation message in `scripts/browser-check.mjs`, with the decision documented in `DESIGN.md`.

**Verification:**

- Prettier, ESLint and the Vite build passed.
- A text search found none of the specified demo words in the UI files.
- The existing interactive check passed on the local production build on port 4177, including the cart, filters, native form validation, the password not being saved, the menus, reduced motion and the three widths.

To preview, run `npm.cmd run dev`. The images did not change in this follow-up, and adding the shop photos was still waiting on the user to send them. No new runtime errors were observed, and there was no new Lighthouse measurement for this text change.

## Follow-up — adding the attached shop photos

### Completed

The project instructions, design and client requirements were read, and the data, styles and local state were inspected before editing.

**The photo set:**

- The set of 20 photos provided across two messages was used. The last message repeated 18 of them, and the two extra photos were still available from the previous message.
- The photo contents were checked visually. Some "glass box" file names did not match their content, so the selection followed the actual content.

**Web copies:**

- Local JPEG copies were prepared at quality 92 and the original dimensions, without cropping, recoloring fabrics, generating products or removing text from them.
- The original PNG files in Downloads were not touched. Total size dropped from 44,020,003 to 5,703,204 bytes, about 87%.
- Windows' built-in image encoding was used to prepare the delivery copies. There was no new dependency and no creative transformation of image details.

### Distribution and files

- **`public/images/store/`:** the 20 photos with descriptive Latin file names.
- **`src/data.js`:**
  - Updated only each product's image and its alt text.
  - Chose the lavender giveaway tray photo for the banner, and the peach incense-burner set for customization.
  - Added `arrangementImages` for six extra shots: the tiered stand, the perfume-and-oud pocket, the name trays, the lavender giveaways, the perfume tray and the peach envelope.
- **`src/ui.js`:** rendered the remaining six with `map` and `join` as arrangement photos with a description and caption, inside the customization section. There were still 12 products, and the filtering, pricing and cart logic did not change.
- **`index.html`:** a labeled gallery container under customization, with the declared image dimensions adjusted for the square assets. No commercial section or new order form.
- **`src/styles.css`:**
  - `contain` for the banner, cards and customization so the whole composition is protected, with consistent off-white backgrounds.
  - Positioning that suits text on the right on large screens and above the image on mobile.
  - The extra gallery uses two columns on mobile, three on tablet and six on large screens.
- **Docs:**
  - `docs/store-images.json` records each file's source, copy name, path, dimensions, and original and web sizes.
  - `docs/image-sources.md` explained the current source and kept the old record.
- **`scripts/browser-check.mjs`:** checks 20 distinct images with paths under `store`, instead of the earlier count of 14. `DESIGN.md` and `README.md` were updated with what was done.

### Actual verification

Prettier, ESLint, the four Node tests and the production build passed. All original product data was compared with Git, excluding only the `image` field: all names, IDs, descriptions, prices, options, categories and occasions matched. `logic.js`, `state.js` and `main.js` were not changed.

**Chrome checks.** A `preview` of the production build ran on http://127.0.0.1:4178.

- Chrome passed loading all 20 local images with no duplicate path, and confirmed every displayed image path is under `/images/store/`.
- Product columns stayed 2/3/4 at 360/768/1280 without horizontal overflow, and the banner stayed full-width.
- The home page at 360 and 1280, the catalog, the customization section and the gallery were reviewed visually. Images are not cropped inside the cards; incense burners, fabrics and glass show in full.

The existing check passed with no unhandled JavaScript exceptions for:

- Combined filters, the keyboard menus and the selection chips.
- Customization, the cart, quantities, removal and persistence after refresh.
- Native form validation and reduced motion.

Lighthouse was not re-run for this follow-up, so the earlier result is not a new measurement for the current photos. No real phone or screen reader was tested.

### Notes, concepts and next step

**Notes:**

- The earlier external photos were kept as historical, non-displayed files.
- No learning or demo wording was added to the interface.
- Attaching the photos does not mean prices or policies are approved; the open business details stayed in the documentation only.
- Some photos show sets or trays; no sales quantity or minimum should be inferred from them.

**Concepts applied:**

- Organizing local assets under stable names, and separating the image source from rendering.
- Compressing delivery copies while keeping the originals.
- `object-fit` and `object-position` for responsiveness.
- Alt text that describes what is visible.
- Gallery data kept separate from the product catalog.

To run, use `npm.cmd run dev`. To replace photos later, edit `image` in the product, or `homeImages` or `arrangementImages`, in `data.js`. The next step was to review the product names and their business match to the photos with the shop owner once approved data is available, without inventing new names or prices now.

## Follow-up — applying the new DESIGN.md and the pink identity

`DESIGN.md` was replaced with the user's copy from Downloads, without adding to or editing its content. The SHA-256 fingerprints of the two files matched: `3153F379C93B0E88B3EC3752E77B1266D31CF722A189304A0C5CCAB9DF8DDEC8`. The old version is kept in Git history.

Only the old design-reference line in `AGENTS.md` was edited to match the new file's direction instead of terracotta; the rest of its instructions stayed as they were.

### Implementation

- **`src/styles.css` — the palette:**
  - The palette is defined once in `:root`:

    | Role               | Value     |
    | ------------------ | --------- |
    | Page background    | `#EBDADD` |
    | Photo backgrounds  | `#FAF8F4` |
    | Ivory surfaces     | `#FFFDF9` |
    | Pale pink          | `#F5EBED` |
    | Primary action     | `#985266` |
    | Darker interaction | `#7D4053` |
    | Dark text          | `#352A30` |
    | Secondary text     | `#6C535D` |
    | Borders            | `#D8BBC3` |

  - All earlier colors, gradients and shadows were converted to these variables or to `color-mix` derivatives of them. No terracotta values remain in the CSS.
- **Interactive states:**
  - Primary and add buttons are deep pink with white text and a darker hover/pressed state.
  - Small links on the page background use the darker pink for contrast.
  - Focus, caret, selection, menus, chips, active states, autofill, messages and the dialog backdrop were unified.
- **Photos:** the original photos were not recolored or edited. Gold, peach or blue inside the products comes from the attached photos and is allowed by the new document. The deeper page background makes the light frames stand out, and the cards and form surfaces are ivory with light borders and calm corners.
- **Typography:**
  - Alexandria stayed local, at weight 400 for text, 500 for controls and navigation, and 600 for headings and product names.
  - Header links are dark at 14–15px, section headings 24–32px, and the hero between 34 and 44px.
  - Letter-spacing was removed from Arabic text and kept only on the Latin logo.
- **`scripts/browser-check.mjs`:** the focus and caret check was updated to rgb(152,82,102), and real checks were added for the page color, the image frame color, and the primary button and its white text.
- **Unchanged:** `data.js`, `ui.js`, `logic.js`, `state.js`, `main.js`, the HTML, and the shop's photos, data and features.

### Contrast and actual verification

**Contrast:**

| Pair                                     | Ratio   |
| ---------------------------------------- | ------- |
| Primary pink `#985266` on page `#EBDADD` | 4.18:1  |
| White text on the primary action         | 5.62:1  |
| Secondary text on the page               | 5.15:1  |
| Dark text on the page                    | 10.23:1 |

Because the primary pink reaches only 4.18:1, `#7D4053` is used for small text and links on pink. The focus indicator stays in the primary pink, which is clear as a non-text element.

**Verification:**

- Formatting, ESLint and the Vite build passed, and the local production build ran on port 4179.
- Chrome passed the 360/768/1280 checks without horizontal overflow, with 2/3/4 columns, all 20 images and the font loading, and the page, image, button and focus colors matching the palette.
- The home page on mobile and large screens, the catalog and the open menu were reviewed visually.
- Filters, the keyboard, customization, the cart, quantities, persistence, the form and reduced motion passed the existing check with no unhandled exceptions.

**Lighthouse:** the final Lighthouse 13.6.0 accessibility measurement for the home page was **100/100**, at report time 2026-11-01T10:25:19.471Z. The report is in `test-results/lighthouse-pink.json`, and no audits with a non-null score below 1 appeared. The result is automated and does not replace a screen reader or a real phone; neither check is claimed to have been done.

### Files and how to review

**Files changed:** `DESIGN.md`, `AGENTS.md`, `src/styles.css` and `scripts/browser-check.mjs`, along with this documentation, the notes log and `README.md`.

**To review:**

1. Run `npm.cmd run dev`, or `npm.cmd run build`, then `npm.cmd run preview`.
2. Try a filter menu, an add button and the search focus to see the pink states.
3. Check how the light photos stand out on the deeper page background.

**Key concept:** a central palette of shared variables separates the identity from the components. Check contrast after changing the background instead of assuming a color works on every surface.

There is no new business data, price or policy, and the demo wording the user asked to remove earlier was not brought back. The next step was to review the pink direction with the user, keeping `:root` as the single source of colors.

## Banner, header and footer improvement — 1 November 2026

- **Banner:**
  - It was changed to a responsive Grid: the shop photo complete at a square ratio without stretching or cropping, next to the Arabic text on the right at 768px and above, and below it on mobile.
  - The gradient covering the photo and the strip overlapping it were removed. The banner area stayed full-width in the approved pink identity.
- **Header:** a sticky header wrapper was added, with a semi-opaque pink background and a light divider. The Gift Lab name stays visible in Arabic and English while scrolling. `scroll-padding-top` was set so section-link targets are not hidden behind the header.
- **Footer:** the short footer was replaced with a semantic footer containing the store identity, a brief description, links to the existing sections and a back-to-top link. No contact numbers or unapproved policies were added.
- **Files:** `index.html` for structure, `src/styles.css` for presentation and responsiveness, and `scripts/browser-check.mjs` for checking the sticky header and the footer links and capturing screenshots. The product data and the logic, state and DOM modules did not change.
- **Verification:**
  - The build and ESLint passed.
  - The real Chrome check at 360, 768 and 1280 confirmed no horizontal overflow, the sticky header, correct footer links and image loading.
  - The search, filter, sort, customization, cart and persistence checks, native account validation, the keyboard and reduced motion kept passing.
  - The page and footer screenshots were reviewed visually. No new Lighthouse measurement is claimed for this change.
- **How to review:** run `npm run dev`, then scroll the page, try the header and footer links, and resize the window. Review screenshots are saved locally in `test-results/width-*.png` and `footer-*.png`.
- **Concepts:**
  - CSS Grid to arrange the photo and text, and `position: sticky` to keep navigation visible.
  - `scroll-padding` for section navigation.
  - Landmarks and native HTML links that work with the keyboard.
- **Next step:** review the banner layout with Sara. No new business decisions or runtime problems were observed in the current check.

## Correcting the full-width banner and the occasion circles

Following Sara's clarification, the separate image display was replaced with a photographic background that truly runs from screen edge to screen edge. It uses absolute positioning and `object-fit: cover`, with the text over it on the right and a light gradient for legibility. Filling the banner area requires responsive cropping of the square photo without distorting it. The sticky header and the footer stayed as they were.

The «وش مناسبتك؟» buttons became 1:1 circles: four columns on mobile and eight on larger devices. The selected circle uses a solid pink, and `aria-pressed` and the existing events were kept without changing the data or `ui.js`.

**Files changed:** `src/styles.css`, `scripts/browser-check.mjs` and this documentation.

**Verification:**

- A check was added for the width of the image element itself and for the circles' equal width and height.
- Chrome passed at 360, 768 and 1280, along with the sticky header, the footer and the other filtering, customization, cart, persistence, keyboard and reduced-motion checks.
- The build and ESLint passed, and the page screenshots were reviewed visually.

To run, use `npm run dev`. The next step was to review the look with Sara.

## Refining the hero into one connected scene

Only the hero rules in `src/styles.css` were changed, following Sara's clarification:

- **Photo position:** the single local Gift Lab giveaway photo stayed `cover` across the full section width. Its position was set to 46% 72% on mobile and center 68% on larger devices, to show the giveaway details.
- **Height and copy:** the banner height was reduced from 680 to 590px on mobile and from 570/600 to 500/520 on larger devices, with less text spacing and smaller text.
- **Gradient and strip:** the heavy gradient was replaced with a connected transparent gradient that fades gradually from the text side. The bottom strip's background and any text background or shadow were removed.
- **Unchanged:** other sections, the data, the DOM and the features.

**Verification:** the build, ESLint and the existing Chrome check at 360, 768 and 1280 passed. This included the width of the image itself, no screen overflow, and the filters, cart, customization, keyboard and reduced motion still working. `width-360.png` and `width-1280.png` were reviewed visually. No new Lighthouse measurement was taken.

**Concepts:** `object-fit: cover` and `object-position`, transparent `color-mix` gradients, and layering the image, gradient and text without splitting into columns.

**Running and review:** run `npm run dev`, then open the home page.

**Also changed for documentation:** `docs/day-01.md` and `debugging-log.md`. There were no new business decisions; the square photo is cropped responsively to fill the banner without stretching.
