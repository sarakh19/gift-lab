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
