# Gift Lab — Rules for AI Coding Assistants

## Project goal

Build the Gift Lab individual-customer storefront as a learning project, following the instructor's assignments and the client requirements in `docs/client-requirements.md`.

## Technology stack

- Vite 8, TypeScript 6.0 (`strict`), plain HTML and CSS, ES modules. No UI framework.
- Arabic interface, `lang="ar" dir="rtl"`.
- Products come from `https://shopboard-api.vercel.app/api/products`.
- Tooling: ESLint 10 + typescript-eslint 8, Prettier 3, Husky 9 + lint-staged 16, Node's built-in test runner.
- TypeScript is pinned to `~6.0.3`. typescript-eslint 8 does not support TypeScript 7. Do not upgrade it without checking that support.

## Scope

- Individual customers only. Business and corporate workflows are out of scope unless Sara asks for them.
- Treat prices, quantities, options, policies and other unconfirmed client details as clearly labeled demo data. Never present them as approved business facts.
- Do not invent product, payment, shipping, cancellation, privacy or launch policies.
- Do not invent API data: no currency, images, occasions or options the API does not send. If an unresolved decision blocks the work, explain what is missing and ask Sara.

## Folder structure

```text
src/
├── main.ts            # startup only: create shared services, connect modules
├── styles.css         # presentation only; design tokens on :root
├── shared/            # feature-independent code
│   ├── api/client.ts  # getJson<T>, ApiError — fetch, HTTP and JSON errors
│   ├── validation.ts  # isRecord, isPositiveInteger, findById<T>
│   ├── dom.ts         # byId, requireElement, closestFromEvent, escapeHTML
│   └── ui/            # select-picker, motion, dialogs, toast (stacking aria-live toasts)
└── modules/
    ├── products/      # types, api (validation), mapper, logic, ui (request states)
    ├── filters/       # types, logic (parse/filter/sort), ui (form, chips, occasions)
    ├── cart/          # types, logic, state (localStorage), ui
    ├── home/          # brand photography (not the catalog)
    └── account/       # demo registration form
tests/                 # node --test unit tests (+ fixtures/)
scripts/               # browser-check.mjs Chrome QA
docs/                  # client requirements, daily notes, image sources
```

## Where new features go

- A new feature gets its own folder in `src/modules/<feature>/`, with only the files it needs:
  - `<feature>.types.ts`: types
  - `<feature>.api.ts`: network access and runtime validation
  - `<feature>.mapper.ts`: converting API data into the internal model
  - `<feature>.logic.ts`: pure functions, no DOM or storage
  - `<feature>.state.ts`: state and persistence
  - `<feature>.ui.ts`: the only kind of file that touches the DOM
- Code that two or more modules need, and that knows nothing about any feature, goes in `src/shared/`.
- `main.ts` only creates services and wires modules together with callbacks. No business logic belongs there.
- **Dependency direction:** `main` → `modules` → `shared`. `shared` never imports `modules`. `products` never imports `cart` or the filters UI. There are no circular imports.
- If you add a new module, explain its responsibility and update this file and the README.

## TypeScript conventions

- Keep `strict: true` and never weaken `tsconfig.json`.
- No `any`. No `as` assertions (this includes `as const`). No non-null `!`. No `@ts-ignore`, `@ts-expect-error` or `@ts-nocheck`. ESLint enforces all of these in `src/`.
- External data (API responses, `localStorage`, `JSON.parse`, `FormData`) is `unknown` until a type guard has validated it.
- Narrow DOM values with `instanceof`. Use `byId(id, HTMLFormElement)`; never `querySelector<T>()`, because the generic type argument is an unchecked cast.
- Use discriminated unions for request states (`LoadState` in `products.types.ts`).
- Use `import type` for type-only imports.
- Declare callback members of interfaces as function properties (`read: () => X`), so they can be passed around safely.
- Write code, identifiers, comments, file names, documentation and commit messages in English. Only user-facing UI text is Arabic.

## Code quality and accessibility

1. Use semantic HTML: `<button>` for actions, `<a>` for navigation. Exactly one `<h1>`, and headings in order.
2. Every form control has a visible, associated `<label>`. Use native input types and validation.
3. Images get useful `alt` text; decorative elements get empty `alt` or `aria-hidden`. An accessible name must contain the visible text.
4. Keyboard access and visible focus everywhere. Respect `prefers-reduced-motion`.
5. Mobile-first CSS with `min-width` queries only (768px, 1280px). No max-width queries and no `!important`. Check 360, 768 and 1280px with no horizontal overflow.
6. Use Flexbox for one-dimensional layouts and Grid for product and page layouts.
7. Render lists with `map().join('')` and escape every string from data with `escapeHTML`. Use event delegation for repeated controls.
8. Sort a copy, never the source array.
9. Store only non-sensitive cart data (`productId`, `quantity`) in `localStorage`. Never store passwords.
10. Use small single-purpose functions and named constants instead of magic numbers. Preserve behavior when refactoring, and don't add dependencies or features Sara did not request.
11. Follow `DESIGN.md` for every interface change.

## Testing requirements

Before claiming any work is done, run and report the real results of:

```bash
npm run typecheck && npm run lint && npm run format:check && npm test && npm run build
```

- Add or update unit tests in `tests/` for new logic, validation or state.
- For UI changes, run `node scripts/browser-check.mjs` against `npm run dev`, and look at the screenshots in `test-results/`.
- Report Lighthouse scores only when they were actually measured.
- Never bypass hooks (`--no-verify`) or disable checks to make them pass.

## Rules learned from real AI mistakes in this project

The AI proposed these from evidence in `debugging-log.md` and the Day 2 session, and Sara reviewed and approved them.

1. **Verify the exact element a requirement names.**
   - **What happened:** asked for a full-width banner *photo*, the AI made the *section* full-width, and its browser check measured the section width, so the wrong result "passed".
   - **Rule:** test the precise element and property in the requirement. When the wording could mean two things, ask Sara before building.
2. **Colors come only from the `:root` tokens.**
   - **What happened:** after the palette changed from terracotta to dusty pink, hard-coded terracotta and brown hex values survived in gradients, shadows and an icon.
   - **Rule:** never write a raw color outside `:root`. After any design change, grep `src/styles.css` for stray hex values.
3. **Don't hide casts or `any` behind TypeScript features.**
   - **What happened:** the AI used `as const` and `querySelectorAll<HTMLElement>()`, which are unchecked casts, and iterated over an `Array.isArray()` result, which is silently `any[]`, even though the rules said "no `as`, no `any`".
   - **Rule:** narrow with `instanceof` or type guards, and assign `Array.isArray` results to `readonly unknown[]` before reading items. Rely on ESLint (`consistent-type-assertions: never`) rather than memory.

## Working style

- Read the relevant assignment, `docs/client-requirements.md` and `DESIGN.md` before implementing. Inspect files before editing and preserve unrelated work.
- After completing a task, explain it to Sara in clear Arabic: what changed, why, how it works, which files changed, and how to check it.
- Do not claim a feature works unless you have checked it. Report the checks you performed and any known gaps.

## Daily documentation

At the end of each work day, create or update `docs/day-XX.md` with:
- Work completed
- Files changed
- Explanations of the important changes
- Concepts learned
- How to run and check the result
- Known issues
- The next step

Do not create a note before that day's work is done, and do not overwrite earlier notes. Record observed issues, how they were discovered, their cause, the fix and the AI's involvement in `debugging-log.md`.

## Git

- Use local commits at meaningful checkpoints, with English conventional messages (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `build:`).
- The remote is `origin` (github.com/sarakh19/gift-lab), branch `main`.
- Push only when Sara asks. Never force-push, rewrite history or skip hooks.
