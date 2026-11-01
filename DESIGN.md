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

## Approved color direction — pink
- Replace the previous terracotta direction completely. Do not reuse the old terracotta palette or its preview as a current reference.
- Main page background: muted dusty blush `#EBDADD`, slightly deeper than the product-photo background so the photos stand out. Keep it soft and light, never saturated or dark.
- Product-photo background: warm off-white `#FAF8F4`; preserve the consistent light background already prepared in the product photos.
- Card and form surfaces: warm ivory `#FFFDF9`.
- Secondary pink surfaces: pale blush `#F5EBED`.
- Primary action color: deep dusty rose `#985266`, with white text.
- Hover/pressed action color: deeper rose `#7D4053`.
- Main text and header links: deep warm plum `#352A30`.
- Secondary text: muted plum `#6C535D`.
- Subtle borders: `#D8BBC3`.
- Use pink accents consistently on links, active filters, selection states, badges and keyboard focus. Avoid default blue interface accents while retaining clearly visible focus.
- Gray, orange, terracotta and gold are not interface brand colors. Product photography may naturally contain any of these colors.
- The approved direction is pink with a slightly deeper page background; these exact hex values are implementation starting points. Check real contrast and the balance beside product photos before finalizing.
- Define the palette once as shared CSS custom properties and apply it consistently across every page and component.

## Typography
- Use Alexandria for all Arabic headings, body text, navigation, buttons, inputs and selects.
- Body weight: 400; navigation, controls and product names: 500–600; headings: 600–700.
- Header links must be dark, prominent and readable, using the main text color rather than faint secondary text.
- Start with 16px body text, 14–16px navigation, 24–32px section headings and a responsive 30–44px hero heading. Adjust for clear reading and balanced layout.
- Keep headings elegant and compact; avoid oversized hero text and excessively light weights.
- Do not apply letter-spacing to connected Arabic lettering.
- Verify the actual Alexandria font loads rather than silently showing only a fallback.

## Product cards
- Keep product cards compact and consistent, with clear medium-sized product imagery. Use four columns on wide desktop layouts and two on mobile when readable.
- Use real product photographs; do not substitute cartoon illustrations. Keep the complete product visible with consistent image ratios and object-fit: contain where needed.
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
- Final color values after review with real Gift Lab product photography.
- Logo and brand assets.
- Exact hero image, photography direction, image treatments, and icon style.
- Final homepage content and which curated product sections appear at launch.
- Border/shadow strength and detailed responsive breakpoints.

Update this file when Sara makes a design decision. Preserve the calm, cohesive, product-first direction unless she explicitly changes it.
