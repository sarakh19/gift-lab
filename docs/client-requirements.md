# Gift Lab — Client Requirements Reference

Source: `Gift_Lab_Client_Requirements_AR.docx`, client requirements draft dated 25 September 2026. This document is a reference for implementation, not final approval of prices, policies, or launch scope.

## Current project decisions
- This learning version focuses on individual customers.
- Interface language is Arabic with RTL direction for now.
- The project follows the instructor's assignments using Vite, HTML, CSS and strict TypeScript. The product catalog currently comes from the instructor's products API (see README).
- The visual identity (dusty blush) was chosen by Sara and is recorded in `DESIGN.md`.

## Confirmed client context
- Gift Lab is an established gift shop in Dammam, Saudi Arabia, with a physical store and recurring orders. The website is an additional sales channel.
- A key differentiator is a specialist gift coordinator who prepares thoughtful, premium arrangements.
- Products serve individuals as well as organizations and companies; the current project version focuses on individuals.
- Occasions include weddings, newborns, graduations, Ramadan, Eid, Saudi National Day, Founding Day, Teacher's Day, and others.
- The website should help customers browse and order without visiting the shop and reduce repeated photo requests and back-and-forth messages.
- The catalog should highlight selected and popular items first, then expand over time.
- Products may be ready for pickup or made to order; communicate status and preparation time when approved data is available.
- Browsing by product type and occasion is desired. Final category structure is not approved.
- Incense burners and perfumes were mentioned as popular products.
- Complementary items such as cards or tags may be suggested after product selection.
- Quantities and minimum orders can vary by product. A dozen means 12 pieces.
- Product customization may involve arrangement, color, logo, complementary additions, tray, and packaging, depending on the product.
- A design preview may require customer approval before production. Timing, revisions, and change fees require confirmation.
- The client wants a clear order summary showing selected options and the total before confirmation.
- The site should be easy to use on phones, tablets, and computers, with readable text and clear controls.
- The client requested Arabic and English for the eventual store; this implementation starts in Arabic only.
- The client mentioned account registration before showing some or all products/prices, but what is gated and which fields are required are unresolved.
- The client wants to surface the physical store for customer confidence; approved location details and photos are still needed.

## Demo data and unresolved decisions — do not present as approved
- Product launch list, names, codes, images, descriptions, materials, dimensions, and packaging contents.
- Final category tree and occasion taxonomy.
- Product-specific prices, price tiers, minimum quantities, quantity increments, add-on prices, discounts, and tax presentation.
- Any example amounts in the source interview are not approved prices and must not be published as real prices.
- Ready stock, made-to-order status, inventory handling, preparation times, rush orders, and production capacity.
- Customization boundaries, logo meaning and formats, included design revisions, preview process, approval deadline, and fees for changes after approval.
- Payment methods, deposits, payment timing, refund/cancellation/amendment rules, invoices, and privacy policy.
- Shipping regions, fees, courier integrations, pickup details, breakage, and delay handling.
- Which products, images, and prices are visible before account registration; required account fields and their purpose.
- Admin roles, order statuses, notifications, reporting definitions, analytics, and marketing plans.
- Launch date and season.

## Important limitations
- Do not claim that a website can fully prevent screenshots; that cannot be guaranteed.
- Do not claim that a demo checkout processes real payments or that demo account registration creates a secure production account.
- Do not infer final business rules from interview examples. Mark placeholders visibly as demo content and keep them easy to replace.

## Implementation guidance
- Make product readiness, occasion/category, and customization choices clear when those fields exist in the data.
- Keep browsing available alongside any guided product-finder experience if one is later requested.
- Show selected options and a clear demo total before a demo order confirmation.
- Keep the current assignment scope focused on individuals. Do not build corporate quote flows unless Sara asks.
- Before implementing a feature that depends on an unresolved decision, surface the specific decision to Sara rather than silently choosing a business policy.
