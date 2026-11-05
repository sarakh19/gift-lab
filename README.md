# Gift Lab

An Arabic, right-to-left storefront for Gift Lab, a gift shop in Dammam (gifts, incense burners, perfumes and occasion giveaways). It is a learning project for a Software Engineering with AI course. The product catalog loads from the instructor's products API. There is no backend, checkout or real account system.

## Features

- **Product catalog from an API.** The catalog has four load states: skeleton cards while loading, an error with a "try again" button, an empty-API message (distinct from "no filter matches"), and success.
- **Toasts.** Stacking, auto-dismissing toasts in an `aria-live` region: a success toast when a product is added to the cart, and an error toast when an action fails (item limit reached, or the cart could not be saved).
- **Search.** It is Arabic-aware: it ignores diacritics and tatweel, and unifies alef forms. It matches on product name and category.
- **Filters.** Category options are built from the API data. The occasion filter has one-tap occasion circles and removable active-filter chips.
- **Sorting** by price, ascending or descending. Sorting works on a copy, so the catalog is never mutated.
- **Cart:**
  - Add available products directly; out-of-stock products have a disabled button.
  - Change the quantity (1–99), remove items, and see the item count and total.
  - The cart is saved in `localStorage` and survives refreshes. Corrupt or outdated saved data is ignored safely.
- **Demo registration form.** It uses native HTML validation only. Nothing is sent to a server or stored.
- **Responsive and accessible.** The layout is mobile-first (360 / 768 / 1280px), keyboard-operable custom selects keep a native `<select>` fallback, and the page respects reduced-motion settings.

## Technology stack

| Area       | Tool                                                     |
| ---------- | -------------------------------------------------------- |
| Build/dev  | Vite 8                                                   |
| Language   | TypeScript 6.0 (`strict`), HTML, CSS — no UI framework   |
| Linting    | ESLint 10 + typescript-eslint 8 (type-aware rules)       |
| Formatting | Prettier 3                                               |
| Git hooks  | Husky 9 + lint-staged 16                                 |
| Tests      | Node's built-in test runner (`node --test`), Node 22.18+ |
| Browser QA | `scripts/browser-check.mjs` (Chrome DevTools Protocol)   |

TypeScript is pinned to `~6.0.3` because typescript-eslint 8 supports TypeScript up to 6.0. TypeScript 7 does not ship the JavaScript API that typescript-eslint needs.

## Getting started

Requires Node.js 22.18 or newer (development used 24.18.0).

```bash
npm ci
npm run dev        # http://127.0.0.1:5173
```

On Windows PowerShell, if script execution blocks `npm`, use `npm.cmd` instead.

## Commands

| Command                | What it does                            |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Start the Vite dev server               |
| `npm run build`        | Production build into `dist/`           |
| `npm run preview`      | Serve the production build              |
| `npm run typecheck`    | `tsc --noEmit` with strict settings     |
| `npm run lint`         | ESLint for JavaScript and TypeScript    |
| `npm run format`       | Fix formatting with Prettier            |
| `npm run format:check` | Check formatting without changing files |
| `npm test`             | Unit tests in `tests/`                  |

**Pre-commit hook:**

- Husky runs lint-staged, which formats staged files and runs ESLint on staged JS/TS files.
- It then runs `npm run typecheck`.
- Any failure blocks the commit.

## Architecture

The code is organized by feature. Each feature folder owns its types, pure logic, state and DOM code.

```text
src/
├── main.ts                       # startup: create shared services, wire modules
├── styles.css                    # all presentation (design tokens on :root)
├── shared/
│   ├── api/client.ts             # fetch + JSON + typed ApiError (no product knowledge)
│   ├── validation.ts             # isRecord, isPositiveInteger, findById<T>
│   ├── dom.ts                    # byId, closestFromEvent, escapeHTML, optionHTML
│   └── ui/
│       ├── select-picker.ts      # accessible custom selects over native <select>
│       ├── motion.ts             # animations that respect reduced motion
│       ├── dialogs.ts            # shared <dialog> close behavior
│       └── toast.ts              # stacking, auto-dismissing aria-live toasts
└── modules/
    ├── products/
    │   ├── products.types.ts     # ApiProduct, Product, Category, Occasion, LoadState
    │   ├── products.api.ts       # runtime validation + fetchProducts()
    │   ├── products.mapper.ts    # ApiProduct -> Product
    │   ├── products.logic.ts     # formatPrice, listCategories, loadedState
    │   └── products.ui.ts        # catalog rendering and request states
    ├── filters/
    │   ├── filters.types.ts      # ProductFilters, FilterKey, SortOrder
    │   ├── filters.logic.ts      # parseFilters, filterProducts, normalize
    │   └── filters.ui.ts         # filter form, chips, occasion circles
    ├── cart/
    │   ├── cart.types.ts         # CartItem, Cart, CartState, CartStore
    │   ├── cart.logic.ts         # sanitizeCart, cartTotals
    │   ├── cart.state.ts         # store + localStorage persistence
    │   └── cart.ui.ts            # cart dialog
    ├── home/                     # brand photography (not the catalog)
    └── account/                  # demo registration form
```

**Dependency rules:**

- Dependencies flow in one direction: `main` → `modules` → `shared`. `shared` never imports from `modules`.
- `products` never imports from `cart` or `filters/filters.ui`. `main.ts` connects them through callbacks.
- There are no circular imports.

**Separation of concerns:**

- `*.api.ts` talks to the network.
- `*.logic.ts` contains pure functions: no DOM, no storage.
- `*.state.ts` owns persistence.
- `*.ui.ts` is the only kind of file that touches the DOM.

## Products API integration

- **Endpoint:** `https://shopboard-api.vercel.app/api/products`
- **Response:** `{ items: ApiProduct[], total: number }`
- **Item fields:** `id`, `title`, `category_name`, `price_cents` and `in_stock`.

How the data flows:

1. `getJson()` in `shared/api/client.ts` fetches with a 10-second timeout. It throws `ApiError` with a `kind` of `network`, `timeout`, `http` (non-2xx), `parse` (invalid JSON) or `validation`.
2. `parseProductsResponse()` checks every field at runtime and rejects duplicate IDs. If anything is malformed, it rejects the whole response instead of guessing.
3. `mapApiProduct()` converts API names to the internal `Product` model (for example, `title` → `name`, `price_cents` → `priceCents`).
4. `products.ui.ts` renders the matching state. Network failures never cause an unhandled promise rejection.

Data the API does **not** provide is never invented:

- No currency, so prices are shown as numbers without a symbol.
- No images, so cards show a neutral "no image" placeholder.
- No occasions, so occasion filters return the empty state with a reset action.
- No customization options, so available products are added directly to the cart.

## Testing and verification

```bash
npm run typecheck && npm run lint && npm run format:check && npm test && npm run build
```

- **Unit tests** cover:
  - The mapper and runtime validation, using a saved real API response in `tests/fixtures/`.
  - Search, filtering, sorting and non-mutation.
  - The HTTP client with a mocked `fetch`: success, HTTP 500, bad JSON, network failure and a stalled (slow) response hitting the timeout.
  - `loadedState`: an empty API catalog versus a loaded one.
  - The cart: merging, totals, persistence, corrupt storage, quantity limits and catalog retention.
- **Browser QA:** `node scripts/browser-check.mjs`. It needs a running dev server and Chrome at its default Windows path. It checks:
  - Layout at 360/768/1280px.
  - Keyboard filters, combined filters and sorting.
  - The cart flow.
  - The form.
  - Corrupt storage.
  - Out-of-stock buttons.
  - The error state when the API is blocked, and retry.
  - API responses intercepted with the Chrome Fetch domain: a slow response (skeletons and `aria-busy`), HTTP 500 (error state; a failed retry keeps focus on the button; a successful retry recovers), and an empty response.
  - Toasts: stacking, auto-dismissal, and the error toast at the item limit.
  - Reduced motion.

  Screenshots go to the git-ignored `test-results/`.

- **Lighthouse** (production build, November 2026): Accessibility 100, Best Practices 100, SEO 92, Performance 82.

## Current limitations

- The API catalog has no images, currency, occasions or customization options. The occasion section and the customization copy are kept from the Gift Lab design.
- Product names and categories appear in English, as the API provides them.
- The 12 original store product photos in `public/images/store/` are currently unused, pending Sara's decision.
- The account form is a demo: there is no backend, and passwords are never stored.
- The 99-per-item cart limit is a demo UI limit, not a stock policy. No payment, shipping or cancellation policies exist.
- `npm audit` reports 11 moderate issues in development-only tooling (`minimatch` inside the ESLint dependency tree). Production dependencies have 0. They are not force-fixed across major versions.
- `styles.css` still contains layered overrides from earlier design iterations. The rendered result is consistent, but the source could be consolidated.

## Documentation

- [DESIGN.md](DESIGN.md): visual direction, palette, typography and components.
- [AGENTS.md](AGENTS.md): rules for AI coding assistants working on this repository.
- [debugging-log.md](debugging-log.md): observed issues, causes, fixes and AI involvement.
- [docs/](docs/): client requirements, daily notes and image sources.
