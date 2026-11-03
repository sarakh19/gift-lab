# Work Day 02 — 2 November 2026

## Work completed and assignment checkpoint

The assignment checkpoint was the TypeScript migration, a modular architecture and the products API integration.

1. **First TypeScript migration attempt.** It was completed and checked, then reverted at Sara's request, because she wanted to convert the files by hand. Only `tsconfig.json` and the `typecheck` script were kept.
2. **Modular refactor and API integration.**
   - The task assumed the migration was already complete. In fact `npm run typecheck` reported 196 errors and `index.html` still loaded `main.js`.
   - The new modules were therefore written in strict TypeScript, which completed the migration as part of this work.
3. **Catalog source.** The product catalog now comes from `https://shopboard-api.vercel.app/api/products` instead of local demo data.

## Decisions made by Sara

| Question                                   | Decision                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| API gives `price_cents` with no currency   | Show the number with two decimals and no currency symbol                       |
| API products have no occasions             | Keep the occasion UI; occasion filters show the existing empty state           |
| API products have no customization options | Add available products directly to the cart; out-of-stock buttons are disabled |

## Files created or changed

**Created:**

- `src/shared/`: `api/client.ts`, `validation.ts`, `dom.ts`, and `ui/` (`select-picker`, `motion`, `dialogs`, `announcer`).
- `src/modules/products/`: `products.types.ts`, `products.api.ts`, `products.logic.ts` and `products.ui.ts`.
- `src/modules/cart/`: `cart.types.ts`, `cart.logic.ts`, `cart.state.ts` and `cart.ui.ts`.
- `src/modules/home/` and `src/modules/account/`.
- `tests/products.test.js`, `tests/cart.test.js` and `tests/fixtures/products-response.json` (a real saved API response).

**Deleted:** `src/data.ts`, `logic.ts`, `state.ts`, `ui.ts`, and the old `tests/logic.test.js`.

**Changed:**

- `index.html`: loads `/src/main.ts`, and the unused customization dialog was removed.
- `src/styles.css`: one `.product-art--placeholder` rule.
- `scripts/browser-check.mjs`: updated for the API catalog and the error/retry state.

## Important changes and how they work

- **HTTP client (`getJson`).** It wraps `fetch` with `async`/`await`, a 10-second timeout, a check of `response.ok`, and JSON parsing. Every failure becomes an `ApiError` with a `kind`. The caller passes a `parse` function, so the client stays generic.
- **Runtime validation (`parseProductsResponse`).** TypeScript types disappear at runtime, so every field of every item is checked, and duplicate IDs are rejected. Invalid data rejects the whole response instead of being guessed.
- **Mapper (`mapApiProduct`).** It converts the external shape (`title`, `category_name`, `price_cents`, `in_stock`) into the internal `Product` (`name`, `category`, `priceCents`, `inStock`, `occasions: []`).
- **Request states (`ProductsState`).** A discriminated union of `loading`, `error`, `empty` and `success`. `load()` catches every failure, so there are no unhandled promise rejections. The retry button calls `load()` again.
- **Cart.** It stores only `{ productId, quantity }`; names and prices always come from the loaded catalog. Saved data in the old v1 format, which used string IDs with options, is detected and ignored with a message. After the catalog loads, `retain()` drops items whose product no longer exists.

## Concepts learned

- The difference between compile-time types and runtime validation.
- `unknown` versus `any`, and type guards (`value is ApiProduct`).
- Discriminated unions.
- Generics: `getJson<T>` and `findById<T extends { id: number }>`.
- Feature modules with one-way dependencies.

## How to run and check

```bash
npm run typecheck && npm test && npm run build
npm run dev            # then: node scripts/browser-check.mjs
```

**Manual checks:**

- Search for "bag", choose category "Bags" and sort from high to low.
- Add a product, refresh the page, and the cart remains.
- Choose an occasion and the empty state with a reset button appears.
- Go offline and reload to see the error state, then use retry.

## Verified results

- Typecheck: 0 errors.
- Tests: 7/7.
- ESLint passed (JavaScript files only at that point) and the build passed.
- The Chrome QA script passed every item against the live API, including the blocked-API error state and retry.

## Known issues and open decisions

- ESLint did not lint `.ts` files yet (addressed on Day 03).
- The API has no images, so cards show a placeholder.
- The customization section text still describes options the API catalog doesn't have.

## Suggested next step

Lint the TypeScript code, clean up unused assets, and update the documentation for the new architecture.
