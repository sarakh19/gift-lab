# Gift Lab

## Project goal
Build the Gift Lab individual-customer storefront as a learning project, following the instructor's Day 1 and Day 2 assignments. Work from the current assignment requirements and the client requirements in `docs/client-requirements.md`.

## Stack
- Vite
- Vanilla HTML, CSS, and JavaScript (ES modules)
- Arabic interface with right-to-left direction for the current version

## Scope
- Focus on individual customers in this version. Business and corporate workflows are out of scope unless Sara asks to add them.
- Implement the assignment features: semantic responsive storefront, product data rendering, search, category/occasion filtering, price sorting, product customization, account registration form, and a cart with count, total, and persistence across refreshes.
- Treat prices, quantities, product options, policies, and other unconfirmed client details as clearly labeled demo data. Never present them as approved business facts.
- Do not invent product, payment, shipping, cancellation, privacy, or launch policies. If an unresolved decision blocks implementation, explain what is missing and ask Sara.
- Visual design decisions belong in `DESIGN.md` after Sara selects a direction. Until then, use simple neutral styling and do not invent a final brand identity.

## Project architecture
Keep responsibilities separated. Follow this structure as the project grows:
- `src/data.js`: product and other static demo data only.
- `src/logic.js`: pure search, filter, sorting, validation, and calculation functions. No DOM access or `localStorage`.
- `src/state.js`: cart and other application state, including persistence to and loading from `localStorage`. No DOM rendering.
- `src/ui.js`: the only module that reads or changes the DOM and binds UI events.
- `src/main.js`: imports modules and connects application startup; keep business logic out of this file.
- `src/styles.css` (or `src/styles/`): presentation styles only.
- `docs/`: client requirements, daily work notes, and learning notes.

When adding a feature, place its data, pure logic, state, and DOM work in the appropriate existing modules. Extend this architecture consistently; do not create a monolithic file or move responsibilities across modules without a clear reason. If a new module is necessary, explain its responsibility and update this file.

## Code and accessibility rules
1. Prefer semantic HTML; use a real button for actions and an anchor for navigation.
2. Use one clear `<h1>` per page and keep heading levels in order.
3. Give every form control a visible, programmatically associated `<label>`; use native input types and validation where suitable.
4. Provide useful `alt` text for meaningful images and empty alt text for decorative images.
5. Ensure keyboard access and visible focus styles.
6. Build mobile-first. Check layouts at 360px, 768px, and 1280px; prevent horizontal overflow.
7. Use Flexbox for one-dimensional layouts and Grid for two-dimensional product/page layouts where appropriate.
8. Do not use `!important` unless Sara explicitly approves a documented exception.
9. Use clear names, small single-purpose functions, and constants instead of unexplained magic numbers.
10. Do not add dependencies, features, or scope that Sara did not request. Preserve existing behavior when refactoring.

## Working style
- Complete the requested task, then explain what changed in clear Arabic.
- Sara wants to understand the work: for every important change or addition, explain why it was made, how it works, which files changed, and how to inspect or use it.
- Read the relevant assignment and client requirements before implementation. Follow the instructor's sequence and constraints.
- Do not claim a feature works unless you have actually checked it. Report checks performed and any known gaps.
- Before editing, inspect the relevant files and preserve unrelated work.

## Daily documentation
At the end of each work day, create or update one file at `docs/day-XX.md` (for example, `docs/day-01.md`). Include:
- Work completed and assignment checkpoint
- Files created or changed
- Detailed explanations of important changes and how they work
- Concepts Sara learned
- How to run and manually check the result
- Known issues or unresolved decisions
- Suggested next step

Do not create a daily note until that day's work is actually done. Do not overwrite earlier daily notes; append or correct only the relevant day's note.

## Design reference
Read and follow `DESIGN.md` before creating or modifying any interface. The approved current direction is dusty blush with ivory surfaces, off-white product photography and deep dusty-rose actions, as defined in DESIGN.md.

## Assignment quality requirements
- Use mobile-first CSS with min-width media queries; do not use max-width queries or !important.
- Configure Prettier, ESLint, Husky and lint-staged. Formatting must be fixed and lint errors must block commits.
- Aim for Lighthouse accessibility 90+ and report the actual measured result only.
- Render product cards from data with map and join; use event delegation for cart actions.
- Sort a copy rather than mutating the original product array.
- Save only non-sensitive cart data in localStorage using JSON serialization; handle invalid stored data gracefully. Never store passwords there.
- Keep a debugging-log.md recording observed issues, discovery method, cause, fix and AI involvement.
- Initialize Git and create local commits at meaningful checkpoints. Ask for the target GitHub repository before pushing; never claim a push happened without completing it.
