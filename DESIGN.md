# Gift Lab — Design Guide

## Status

The dusty-blush direction below was approved by Sara and is fully implemented in `src/styles.css`. Values in this file are the **measured, rendered values** of the current build (Chrome, November 2026), not aspirations. Update this file whenever Sara makes a design decision.

## Design reference and inspiration

- **Reference:** [Floward Dammam](https://floward.com/ar-sa/dammam) — Sara likes its browsing flow: clear navigation, occasion-first discovery, curated product groups and calm product browsing.
- **How it is used:** as inspiration for information architecture only. Gift Lab does not copy Floward's branding, text, images or exact layout.
- **Adapted to Gift Lab:** gifts, incense burners, perfumes, giveaways (توزيعات), weddings, newborns, graduations and Saudi seasonal occasions.

## Visual direction

- Calm, cohesive, product-first storefront that is easy on the eyes.
- A light, neutral blush interface so photography with many fabric colors stays the focus.
- Premium gift-shop feel through restraint: soft surfaces, thin borders, one deep accent color, generous whitespace.
- Arabic, right-to-left, mobile-first.

## Color palette

All colors are defined once as CSS custom properties on `:root` in `src/styles.css`. No other hex values appear in the stylesheet.

| Token            | Value                       | Use                                                                 |
| ---------------- | --------------------------- | ------------------------------------------------------------------- |
| `--page`         | `#EBDADD`                   | Page background (muted dusty blush)                                 |
| `--photo`        | `#FAF8F4`                   | Photo and product-image background (warm off-white)                 |
| `--surface`      | `#FFFDF9`                   | Cards, filter panel, inputs, occasion circles (warm ivory)          |
| `--secondary`    | `#F5EBED`                   | Pale blush: empty/loading/error states, toast, quiet-button hover   |
| `--accent`       | `#985266`                   | Primary actions, focus ring, active states (deep dusty rose)        |
| `--accent-hover` | `#7D4053`                   | Hover/pressed actions; small accent text and links (`--link`)       |
| `--text`         | `#352A30`                   | Main text and header links (deep warm plum)                         |
| `--muted`        | `#6C535D`                   | Secondary text, product meta, placeholders                          |
| `--line`         | `#D8BBC3`                   | Borders                                                             |
| `--on-accent`    | `#FFFFFF`                   | Text on accent buttons                                              |
| Derived          | `color-mix(...)` of the above | Focus halo, shadows, dialog backdrop, page washes                 |

Contrast decision: `--accent` on `--page` measured 4.18:1, too low for small text, so small accent text uses `--accent-hover`. Accent buttons keep white text on `--accent`.

Gray, orange, terracotta and gold are **not** interface colors (the earlier terracotta palette was fully removed). Photography may naturally contain them.

## Typography

- **Font:** Alexandria (self-hosted in `public/fonts/`, weights 400/500/600, `font-display: swap`), fallback `Tahoma, sans-serif`.
- **Base:** 16px, weight 400, line-height 1.85.
- **No letter-spacing** on Arabic text (it breaks connected letters).

| Element                   | 360px | 768px | 1280px | Weight |
| ------------------------- | ----- | ----- | ------ | ------ |
| Hero `h1` (only `h1`)     | 30px  | 38px  | 42px   | 600    |
| Section heading `h2`      | 24px  | 28px  | 32px   | 600    |
| Product name `h3`         | 14.7px | 14.7px | 14.7px | 600   |
| Primary button            | 13.1px | 13.1px | 13.1px | 500   |
| Inputs and selects        | 13.6px | 13.6px | 13.6px | 500   |

## Spacing and layout

- **Container:** `.wrap` = `min(100% - 2rem, 1240px)`, centered. 16px side gutters on mobile; at 1280px the content is 1201px wide (with wider gutters).
- **Rhythm:** spacing uses rem steps of the 16px base (0.4, 0.6, 0.8, 1, 1.2, 1.5, 2, 3rem).
- **Catalog section:** 24px top / 48px bottom padding on mobile and tablet; 32px / 54px on desktop.
- **Product grid gaps (row × column):** 24 × 12.8px (mobile), 28.8 × 16px (tablet), 32 × 20px (desktop).
- **Corner radii:** 5px for buttons and inputs; 8px for cards, filter panel, state panels and toast; 50% for occasion circles.
- **Touch targets:** interactive controls have a minimum height of 44px.

## Buttons

| Variant                         | Look                                                                          | Use                                     |
| ------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------- |
| Primary (`.button`, `.add-button`) | `--accent` background, white text, 1px `--accent` border, 5px radius; hover `--accent-hover` | Main calls to action, add to cart |
| Quiet (`.quiet`)                | Transparent, `--accent-hover` text, 8px radius; hover pale blush background   | Secondary actions: reset, retry, cart controls, dialog close |
| Disabled                        | 50% opacity, default cursor                                                   | Out-of-stock "غير متوفر"                |
| Filter chip (`.filter-chip`)    | Small pill showing an active filter with ×                                    | Removing one filter                     |

All buttons are real `<button>` elements. Navigation uses `<a>`.

## Product cards

- Ivory `--surface` card, 1px `--line` border, 8px radius, no heavy shadow.
- Square (1:1) image area on `--photo`, `object-fit: contain` so the complete product stays visible.
- **API catalog without images:** the products API provides no image URLs, so the image area shows the neutral text "لا توجد صورة من مصدر البيانات". No image is invented or borrowed.
- Content order: category (muted, small) → product name (`h3`) → availability (متوفر / غير متوفر حاليًا) → price and action.
- Prices are shown as numbers with two decimals and **no currency symbol**, because the API gives `price_cents` without a currency.
- Columns: 2 on mobile, 3 on tablet, 4 on desktop.

## Hero section

- A full-bleed banner photograph (`object-fit: cover`) spans the full viewport width at every breakpoint.
- The copy sits over a light wash: eyebrow, the page's single `h1`, a short paragraph, a primary button to the catalog and a secondary link to customization.
- A transparent bottom strip (no separate colored band) links to occasions.
- The store header is sticky so navigation and the cart stay reachable.

## Catalog states

- **Loading:** 8 skeleton cards with the same layout as real cards (image area, text lines, price and button), in `--secondary` with a soft `--surface` shimmer. The shimmer is turned off under reduced motion. The skeletons are `aria-hidden`; the results line announces "جارٍ تحميل المنتجات…", and the grid has `aria-busy="true"`.

Error, empty and "no matches" reuse one pale-blush panel (`.empty`, 8px radius, `--secondary`):

- **Error:** a `role="alert"` panel with the message and a primary "حاولي مرة ثانية ↻" (try again) button. If a retry fails again, focus returns to the new button.
- **Empty (API returned no products):** an explanatory message.
- **No matches (filters):** a message plus a "عرض كل الهدايا" reset button.

## Toasts

Feedback appears in stacking toasts inside an `aria-live="polite"` region:
- **Position:** bottom-center on mobile; bottom inline-end on 768px and up.
- **Look:** ivory `--surface` card, `--line` border, a 4px `--accent` edge on the inline-start side, 8px radius, soft shadow, and a round ✓ icon.
- **Error toasts:** `--secondary` background, with `--accent-hover` for the edge and the "!" icon.
- **Motion:** they enter with a 200ms rise and fade, and leave with a 200ms fade; both are disabled under reduced motion.
- **Lifetime:** success toasts stay 3.5s and errors 6s. At most 3 are visible; the oldest leaves first.

## Responsive behavior

- Mobile-first CSS; the only breakpoints are `min-width: 768px` and `min-width: 1280px`. There are no max-width queries and no `!important`.
- Checked at 360, 768 and 1280px with no horizontal overflow (automated in `scripts/browser-check.mjs`).
- The filter panel is a 2-column grid on mobile, 4 columns on tablet, and one row on desktop.

## Accessibility

- One `h1` per page; headings in order.
- Every input and select has a visible, associated `<label>`. Custom select popups keep the native `<select>` as the source of truth and support arrow keys, Home/End, Enter/Space, Escape and Tab.
- Visible focus: 3px `--accent` outline with a 4px offset.
- Meaningful `alt` text on photographs; decorative marks are `aria-hidden`.
- Accessible names include the visible text (e.g. "أضف للسلة: Leather Tote Bag", "غير متوفر: Sunglasses").
- `prefers-reduced-motion` disables animations.
- Lighthouse accessibility score of the production build: **100** (measured November 2026).

## Improvements over the reference

- **Occasion-first discovery as one-tap filters:** circles filter the catalog and show their pressed state.
- **Honest data presentation:** no invented currency, images or occasions for API products, with clear empty and error states and a retry action.
- **Calmer palette:** one accent color on a soft blush page, so many-colored gift photography stays the focus.
- **Accessibility built in:** keyboard-complete custom selects, visible focus, reduced motion and 44px targets.

## Open design decisions

- Logo and final brand assets. The favicon and header currently use the ✧ text mark.
- Product photography for API products (the API has no images). The 12 store product photos in `public/images/store/` are currently unused.
- The customization section text describes product options that the API catalog does not provide.
- The final homepage content and the curated sections at launch.
