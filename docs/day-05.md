# Work Day 05 — 5 November 2026

## Work completed

This day addressed the instructor's review of the submitted tasks.

1. **Task 2: complete the cart.**
   - Pressing "−" at quantity 1 now removes the product. Before, the button was disabled at 1.
   - A new "تفريغ السلة" button empties the cart in one step. It only shows when the cart has items.
2. **Task 2: real errors in the debugging log.** Entries about the AI tool's own environment were removed from `debugging-log.md`: PowerShell policy, sandbox permissions, disk space, Git ownership, ports and blocked sites. The log now keeps only code, test and design bugs, and adds today's cart bugs.
3. **Task 2: clean the project.** `CODEX-PROMPT.txt` had already been deleted in commit `e6ad68b`. It no longer appears in the tracked files.
4. **Task 1: 360px rule.** `AGENTS.md` rule 5 now states exactly what "no horizontal scroll at 360px" means, how to prevent it, and how to check it.
5. Committed the 4 November work (API loading states and stacking toasts in `shared/ui/toast.ts`) separately, after all checks passed.

## Files changed

- `src/modules/cart/cart.types.ts`, `cart.state.ts`: new `decrease()` and `clear()` store methods.
- `src/modules/cart/cart.ui.ts`: "−" uses `decrease()` and is never disabled. Wired up the clear button.
- `index.html`, `src/styles.css`: the `#cart-clear` button.
- `tests/cart.test.js`: new test for decrease-to-remove and clear.
- `scripts/browser-check.mjs`: asserts both behaviors and saves `test-results/cart-dialog.png`.
- `debugging-log.md`, `AGENTS.md`, `README.md`, `docs/day-05.md`.

## Important changes explained

- The decision "quantity 1 minus one means remove" lives in the store (`decrease`), not in the UI. That way a unit test can check it without a browser.
- At quantity 1, the "−" button's accessible name changes to "حذف … من السلة", so screen-reader users know it removes the item.
- After clearing, focus moves to the dialog's close button, because the button that was pressed disappears.

## Concepts learned

- A disabled button can hide a missing feature. The old browser check only pressed "−" at quantity 2, so it never noticed. Tests need to cover edge values (1, 0, the maximum).

## How to run and check

```bash
npm run typecheck && npm run lint && npm run format:check && npm test && npm run build
npm run dev   # then, in another terminal:
node scripts/browser-check.mjs
```

Manual check: add a product, open the cart, press "−" at quantity 1 and the row disappears. Add two products and press "تفريغ السلة": the count shows 0, and the cart stays empty after a refresh.

## Known issues

- The 12 unused store photos in `public/images/store/` are still kept, pending Sara's decision.
- There is no `docs/day-04.md` for the 4 November work. That work is described in `debugging-log.md` and in commit `f31f33d`.
- "تفريغ السلة" does not ask for confirmation. Sara did not request one.

## Next step

- Sara: rewrite `AGENTS.md` in her own words (the instructor's Task 1 note), and add her own coding mistakes to `debugging-log.md`.
