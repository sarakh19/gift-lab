# Gift Lab — Design Direction

## Status
This is the initial visual direction approved by Sara. Treat color values and layout details as a starting point and refine them against real Gift Lab product photography before calling the design final.

## Design goals
- Create a calm, comfortable storefront that is easy on the eyes.
- Keep the page cohesive and visually connected, with little clutter or distraction.
- Make product imagery and its varied fabric colors the visual focus. The interface palette should stay light and neutral so it works alongside many product colors.
- Make the experience clear and easy to use on mobile, tablet, and desktop.

## Reference
- Sara likes the browsing experience and general storefront organization of [Floward Dammam](https://floward.com/ar-sa/dammam).
- Use it as inspiration for clear navigation, occasion and category discovery, curated product groups, and product browsing.
- Adapt all content and structure to Gift Lab: gifts, incense burners, perfumes, توزيعات, weddings, newborns, graduations, seasonal occasions, and product customization.
- Do not copy Floward's branding, text, images, or exact layout. Design for Gift Lab's own products and requirements.

## Initial color palette
- Main page background: warm off-white `#FAF8F4`.
- Secondary surfaces: soft cream `#F1E8DC`.
- Supporting neutral: pale sand `#E6D4C1`, used sparingly.
- Accent: muted light terracotta `#C9846B`, initially for primary actions and small highlights.
- Optional deeper terracotta `#A85F49` for text or interaction states only if contrast needs it.
- Avoid gray as a brand palette color.
- Keep the palette flexible until it is checked with real product and fabric photos. Do not put terracotta behind large areas of product imagery or use it so heavily that it competes with the products.
- Generated palette preview: `generated_images/exec-3ea785d7-88e0-4a41-8ba7-b7aff9af01c9.png` (visual concept only; CSS hex values above are the source of truth).

## Typography
- Use an elegant Arabic type style that remains easy to read, especially on mobile.
- Headings should be prominent and clearly differentiated from body text.
- Body text, prices, labels, and controls should remain comfortable to scan.
- Avoid decorative typefaces for long copy or small interface text.
- Choose exact font families and weights during implementation, then check Arabic shaping, legibility, loading behavior, and contrast.

## Product cards
- Keep product cards simple and consistent, with medium-sized, clear product imagery.
- Use gently rounded corners and restrained borders or shadows; avoid visual effects that distract from the product.
- Show the product name and price clearly.
- Add a small status badge only when relevant, such as “الأكثر مبيعًا”, “جاهز”, or “حسب الطلب”.
- Keep color and fabric variations clear in the product details, using swatches or labeled choices where appropriate.

## Homepage structure
Use a clear, calm storefront flow inspired by the reference, adapted to Gift Lab:
1. Header with Gift Lab identity, primary navigation, search, account, and cart access.
2. A concise welcome/hero area that explains the store and guides customers to browse.
3. Occasion discovery (for example: wedding, newborn, graduation, and seasonal occasions).
4. Curated and popular products.
5. Product categories such as incense burners, perfumes, and توزيعات as the approved catalog allows.
6. Additional helpful store information and footer.

Avoid showing every section with equal emphasis. Use spacing and clear headings to guide attention without creating clutter.

## Layout and interaction
- Start with the mobile layout, then expand for tablet and desktop.
- Keep navigation, filters, product choices, and calls to action easy to find and operate.
- Use consistent spacing, alignment, button styles, corner radii, and heading hierarchy across sections.
- Keep product images at a consistent aspect ratio in lists and cards; allow larger imagery on product detail views where it helps inspect the item.
- Communicate selected product options, readiness (ready or made to order), and preparation time when confirmed data exists.
- Do not invent final pricing, lead times, or business policies. Demo information must be clearly marked as demo content.
- Ensure readable contrast and visible keyboard focus states.

## Design decisions still open
- Exact typefaces and font weights.
- Final color values after review with real Gift Lab product photography.
- Logo and brand assets.
- Exact hero image, photography direction, image treatments, and icon style.
- Final homepage content and which curated product sections appear at launch.
- Border/shadow strength and detailed responsive breakpoints.

Update this file when Sara makes a design decision. Preserve the calm, cohesive, product-first direction unless she explicitly changes it.

## Visual refinement — 1 November 2026

The user requested a refinement of the existing storefront, preserving its data and working features. This supersedes the earlier illustration-based presentation.

- Use real temporary stock photographs until approved Gift Lab photography is supplied. Product pictures are distinct, stored locally in `public/images/`, and selected through `products[].image` in `src/data.js`. Hero and customization photographs use `homeImages` in the same file. See `docs/image-sources.md` for source/credit records.
- Current Arabic typeface: locally hosted Readex Pro, weights 400, 500 and 600, with `font-display: swap`. Its SIL Open Font License is included in `public/fonts/OFL.txt`.
- Keep the original warm off-white and cream palette. Light terracotta `#C9846B` is reserved for the primary action and small details; deeper terracotta is used for readable text/focus. Product photographs supply the varied colors.
- Compact product cards: two columns on phones, three from 768px, four from 1280px. Uniform image frames use `object-fit: contain` so product photos are not cropped. Cards have no enclosing border or shadow.
- Reduce the main heading and section headings, avoid large decorative occasion icons, and use simple text occasion buttons with a selected state.
- Homepage order: storefront header, photographic welcome, occasion discovery, featured/catalog products with the existing filters, photographic customization section, concise store information and footer.
- Existing sample prices, options, product text, account demonstration and cart behavior remain unchanged. Temporary photographs are not claims about approved Gift Lab products or packaging.

Exact final photography, brand assets and commercial content still require client approval.

## Full-width storefront and Saudi copy — 1 November 2026

This latest direction follows the user's review of the previous design and supersedes the Readex Pro typography and split-panel hero described above.

- The hero photograph fills an edge-to-edge section; text sits on the right in an RTL content container. A warm directional gradient protects text contrast while leaving the gift visible. Mobile uses a taller composition and vertical gradient; desktop uses a horizontal composition. This is a full-width image treatment, not a separate image card.
- Typography now pairs IBM Plex Sans Arabic (400/500/600) for interface/body copy with Noto Naskh Arabic (400/500) for editorial headings. Both are hosted locally with font-display:swap and their own OFL files in public/fonts. Earlier font assets are retained but not loaded.
- The desktop wordmark is centered, with navigation to its right and account/cart controls to its left. Use restrained warm brown/terracotta details and off-white/cream surfaces; preserve the two/three/four-column product grid and existing photographs.
- Primary Saudi wording includes “هدايا تليق بغلاهم”، “وش مناسبتك؟”، “تفاصيل تفرّح الخاطر” and “خلّيها على ذوقك”. Preserve explicit educational/demo messages and avoid inventing commercial promises.
- The user supplied https://www.tiktok.com/@glab_sa as a visual reference. Automated browsing was blocked and the direct public response contained a protection challenge, not account content. No TikTok videos or products were actually reviewed or copied. Current visual choices rely on the user's instructions and existing client requirements. Matching the shop's actual fabric arrangements and photography still requires accessible reference images from the account.

## Alexandria and interaction consistency — 1 November 2026

The user's latest instruction supersedes the earlier font pair. Use locally hosted Alexandria 400/500/600 throughout, including the wordmark, headings, controls and body. Header links have a darker warm-brown color and weight 500. Keep a smaller, consistent heading scale, square compact product-image frames, and the existing two/three/four-column grid.

Use the warm off-white/cream/light-terracotta palette for all interface states: visited links, focus outlines, caret, selection, active filters, dropdown selection, hover, search clear button and autofill. Light terracotta buttons use dark text for readability. Do not rely on the OS native dropdown's blue selection styling: progressively enhance the existing select elements into labeled, keyboard-operated listbox popups in ui.js. Preserve the native selects as the form-data source and fallback.

Selected filters appear as individually removable chips; clearing a chip restores focus to its control. Keep results updates immediate and announced by the existing status region. Product data and cart rules are unchanged; the p11 photo was replaced with a real incense photograph because the previous photograph featured a candle.

Motion is supplementary: CSS handles short hover, menu, dialog and toast transitions; ui.js uses IntersectionObserver for a one-time 240ms entrance of section headings and selected sections, plus Web Animations for 140ms result feedback and 200ms cart-count feedback. Content starts visible and remains usable without animation. Respect prefers-reduced-motion both in CSS and JavaScript; cancel active scripted animations when the preference changes and avoid smooth scripted scrolling in that mode.

## Presentation copy cleanup — 1 November 2026

At the user's explicit request, remove educational/demo/temporary wording and related notices from the rendered presentation, including the top strip, product badges/descriptions/prices, cart, customization, footer, image alt suffixes and account form. This overrides prior instructions to show those notices in the interface; retain factual implementation/data limitations in project documentation. No prices, stock, policies, backend integration or production approval were added. The account action remains validation-only, with neutral feedback that the fields are complete and correctly formatted; it does not claim account creation.

## User-supplied shop imagery — 1 November 2026

Replace every displayed stock photograph with the twenty images attached by the user. Preserve original PNGs in Downloads and produce local JPEG delivery copies at the original dimensions, quality 92; do not recolor fabrics, alter product details, or crop product-card photographs. Select images by their visible subject rather than their occasionally inaccurate source filenames.

- Twelve distinct photographs map to the existing twelve product IDs. Keep names, prices, options, categories and occasions intact.
- Use the lavender arrangement for the full-width hero and the peach incense collection for customization. Use contain with responsive positioning so square compositions remain complete, with text at the right of the wide hero and above the photograph on mobile.
- Show the remaining six arrangements in a compact gallery within the existing customization section, not as new catalog products or new commercial offers.
- All displayed image paths now use /images/store/. File provenance, dimensions and delivery sizes are recorded in docs/store-images.json. Earlier stock files remain preserved but are not referenced by the rendered page.
- Retain Alexandria, the current palette, accessible filter interactions, reduced-motion support and the user's removal of educational/demo notices from the presentation.
