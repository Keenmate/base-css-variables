# Hand-off: `highlighted` → `selected`, `selected` → `checked` (web-treeview, svelte-treeview)

From `@keenmate/base-css-variables` 2.0.0-rc03 (unpublished, branch `prod`). For the
svelte-treeview session; web-treeview gets the same treatment.

## Why

"Highlighted" read like hover or emphasis, and "selected" meant the checkbox in the treeviews
but the picked option in web-multiselect. The contract now uses the common words:

| State | Meaning | Look |
|---|---|---|
| **focused** | the one keyboard / mouse cursor item | `--base-focused-*` (inset outline) |
| **selected** | the click / Ctrl / Shift-click (Shift+arrow) set, 0..n | `--base-selected-*` (primary tint) |
| **checked** | the ticked checkbox | the checkbox only (`--base-checkbox-*`, `--base-icon-check`); no row tokens |
| hover | the pointer | `--base-hover-bg` (not an item state) |

With no checkboxes, *checked* mirrors *selected* (today: `selectedPaths` mirrors `highlightedPaths`).

## Contract change (done)

Renamed, no aliases: `--base-highlighted-bg` / `-bg-hover` / `-text-color` / `-outline` →
`--base-selected-bg` / `-bg-hover` / `-text-color` / `-outline`. Defaults unchanged
(`--base-selected-bg: var(--base-primary-bg-subtle)`, hover = same, text `currentColor`,
outline `none`). web-multiselect 2.6.0-rc02 already reads the new names.

Until a treeview switches, it falls back to its own inline fallback — same look by default, but
theme overrides of the selected tint no longer reach it. The treeviews should ship the switch
with (or before) base-css-variables 2.0.0-rc03 is published.

## Task 1 — CSS (one release, no API change, can go now)

Both repos:

1. `var(--base-highlighted-*)` → `var(--base-selected-*)` everywhere (`variables.css`, docs,
   examples, theme-comparison CSS such as `svelte-treeview/src/routes/examples/theme-comparison/*.css`).
2. Component tokens `--wtv-highlighted-*` / `--stv-highlighted-*` → `--wtv-selected-*` /
   `--stv-selected-*` (bg, bg-hover, ring, text). Decide whether to keep the old names as
   aliases for one release (`--stv-highlighted-bg: var(--stv-selected-bg)`) — recommended,
   since themes may set them.
3. Checkbox tokens already say `checked` (`--*-checkbox-checked-*`) — no change.
4. Row CSS classes (`wtv__node-content--highlighted` etc.): rename to `--selected` together
   with the API in task 2, or now with the old class kept as well. Note: the contract's
   `e2e/item-states.spec.ts` accepts both `wtv__node-content--highlighted` and `--selected`.
5. Manifest / CEM / vscode / web-types data (web-treeview: patch the manifest line by line,
   then `npm run analyze`), `docs/theming.md`, CHANGELOG.

## Task 2 — API (two releases, so nothing changes meaning silently)

`selectedPaths` keeps the type `string[]` but would change meaning, so existing apps would
compile and quietly use the wrong set. Do it in two steps:

**Release A (minor, additive + deprecations):**
- Add the *checked* names as the new home of today's "selected" (checkbox) API, keep the old
  ones as deprecated aliases that warn once in dev:
  - `selectedPaths` → `checkedPaths`; `setSelectedPaths` / `getSelectedPaths` / `getSelectedNodes`
    → `setCheckedPaths` / `getCheckedPaths` / `getCheckedNodes`
  - `isSelected` → `isChecked`; `isSelectedMember` → `isCheckedMember`;
    `getIsSelectedCallback` → `getIsCheckedCallback`; `selectedNodeClass` → `checkedNodeClass`
    (attribute `selected-node-class` → `checked-node-class`)
  - events: `selection-change` (checkbox) → `checked-change` (or `check-change`)
  - internal names (`allSelected` / `noneSelected` / `notSelected` / `selectedAffected`)
    can follow at leisure.
- Leave the `highlighted*` API as is. Don't give `selectedPaths` its new meaning in release A:
  apps need one release in which the old checkbox name still works and warns.

**Release B (major):**
- Remove the deprecated checkbox names (`selectedPaths` etc. as checkbox).
- Rename the highlight API to *selected*: `highlightedPaths` → `selectedPaths`,
  `setHighlightedPaths` / `getHighlightedPaths` / `getHighlightedNodes` → `setSelectedPaths` /
  `getSelectedPaths` / `getSelectedNodes`, `isHighlighted` → `isSelected`,
  `highlightedNodeClass` → `selectedNodeClass` (attribute `highlighted-node-class` →
  `selected-node-class`), `highlight-change` → `selection-change`.
- Keep `highlighted*` as deprecated aliases for one more major, if wanted — they're unambiguous.
- Migration note in README / CHANGELOG with the full table; a runtime dev warning when an
  app passes the removed checkbox meaning (e.g. `selectedPaths` together with checkboxes on and
  no `checkedPaths`) is cheap and catches the silent swap.

Watch for in svelte-treeview:
- `selectedNode` (64 uses) — check what it means (the cursor / current node?). If it is the
  focused node, it becomes `focusedNode`, not `selectedNode`.
- Example / demo state names (`targetHighlightedPaths`, `sourceHighlightedPaths`,
  `restrictedHighlightedPaths`, `silentHighlightedPaths`, `pantryHighlighted`, …) and the
  `selected-paths-count` / `selected-paths-list` test ids — follow the API in release B.
- svelte-treeview mirrors `selectedPaths` ↔ `highlightedPaths` when checkboxes are off; after
  the rename that is `checkedPaths` ↔ `selectedPaths`.

## Rough size

- web-treeview: `highlighted*` ≈ 75 identifiers, `selected*` (checkbox) ≈ 150, 7 CSS tokens.
- svelte-treeview: `highlightedPaths` ≈ 146, `selectedPaths` ≈ 88, `isSelected` ≈ 62,
  `highlightedNodeClass` ≈ 59, plus docs and examples, 7 CSS tokens.

## Checks

- Contract repo: `npm run test:e2e` in base-css-variables (needs `npm run build` in
  `../web-treeview`) — the web-treeview item-state specs compare a selected node with the
  reference row; with the switch done, the "selected tint" slider in `demo/item-states.html`
  must move the treeview too.
- `demo/variables.html` → "Item states" lists the four `--base-selected-*` tokens.
