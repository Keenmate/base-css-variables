# Component audit against the `--base-*` 2.0 contract (rc02)

Date: 2026-10-19. Read-only audit of every Keenmate component repo. Each repo was read file by file
and checked against `base-variables.css` (169 tokens) and the rc01/rc02 rename table.
Nothing was edited. Line numbers refer to the working trees as of today, including uncommitted WIP.

---

## 0. Progress (updated 2026-10-21)

### ▶ Resume here — state at the end of the 2026-10-21 session
- **base-css-variables** (`prod`, local, not pushed; `package.json` = `2.0.0-rc03`, unpublished):
  committed `3f3c0db` placeholders → step 3 · `45495cb` derived text on fills + 4 darker fills ·
  `f48751d` APCA pick (2-digit formula) + `demo/fill-states.html` · `bc4efff` "What belongs in the
  contract" (README + CLAUDE.md) · `5f8b1d2` full role set (7 tokens × 6 roles), `--base-disabled-opacity`,
  `highlighted` → `selected` (checkbox = `checked`), `demo/variables.html`. 183 tokens. Contract e2e 48/48.
  Uncommitted: this audit doc and `docs/handoff-treeview-selected-checked.md` (treeview tasks).
  README still needs a "What's New in 2.0.0-rc03" section before `/publish rc` (publish drafts it).
- **web-treeview**: done, committed (`ebb7339` user's WIP, `604f8e5` fixes), not pushed.
- **web-multiselect**: 2.6.0-rc01 released by the user. `d431cb1` (user) placeholder / hint step 3;
  `ef0054c` reads `--base-selected-*`. The user's dark-mode WIP is uncommitted — leave it. Untracked
  `validation_*.md` are the user's — leave them.
- **web-commandpalette**: `c1cf242` committed; uncommitted second-round fixes + placeholder fallback
  (55% mix) with their CHANGELOG lines.
- **Waiting on the user:** commit `demo/variables.html`; commit the multiselect / palette changes;
  then the next component (web-dropzone first — its dark-mode hex overrides are the critical bug).
- **Other session (pure-css / pure-admin / themes):** see the hand-off list below.
- **Running:** demo server `node demo/serve.mjs` on :12510 (pages: `item-states`, `derived`,
  `fill-states`, `variables`); the other session's pure-admin demo on :3000.
- **Test engines:** Firefox and WebKit for Playwright were installed (used to check the CSS
  formulas in all three engines).

The work goes component by component. web-commandpalette and web-multiselect come first because
both can be tested inside pure-admin: pure-admin already has a multiselect demo, and its own command
palette will be removed and replaced by the component. Each of the two was then audited again by a
fresh agent, and the gaps it found are fixed.

### Decisions the user made
- **Command palette CSS:** the palette owns its CSS. It is plain CSS laid out the way multiselect
  does it, and it no longer compiles pure-admin-core's SCSS (pure-admin's palette is going away).
- **Palette cursor row = the *focused* item state:** no fill, an inset `--base-focused-outline`. The
  user wanted to see it; screenshots looked fine.
- **Component defaults:** input padding, badge radius / weight and checkbox radius are the
  component's own defaults, not base fallbacks. They stay as they are, but pure-admin must be able
  to change them through knobs (`--ms-input-padding-h`, `--ms-badge-border-radius`,
  `--ms-badge-font-weight`, `--ms-badge-height`, `--ms-checkbox-border-radius`;
  `--cp-input-padding-h`, `--cp-badge-border-radius`).
- **z-index** must be configurable. Component z-index now defaults to `--base-z-*`, and the old
  numbers remain as the standalone fallback.
- **Unused `--ms-*` variables:** remove them only if they are provably unused. A script proved it
  (CSS rules, chains through other variables, TS, the pure-admin / theme-designer / treeview repos),
  and 44 were removed.

### web-commandpalette — branch `prod`
- **Committed `c1cf242`:** the palette owns its CSS (`src/css/*.css` with variables / component /
  overrides layers; `--cp-*` declared on `:host` and reading the `--base-*` 2.0 names).
  pure-admin-core, sass, postcss and `scripts/shadow-css.mjs` are removed, and the manifest,
  docs, examples and e2e were updated.
- **Uncommitted, ready to commit:** the fixes from the second audit.
  - The focused cursor row: the outline, plus a hover fill under it.
    `--cp-item-active-color` now reaches the title.
  - Item icons given by name map to `--base-icon-<name>`; unknown names render empty instead of a
    square. The token ✕ reads `--cp-icon-remove` (`render.ts`: `pa-icon--remove`).
  - The input has no vertical padding (`--cp-input-padding-h`).
  - `--cp-z-index: calc(var(--base-z-popover, 10499) + 1)`.
  - The `60vh` mobile cap was moved into `results.css`; reduced motion now also stops the open
    animations.
  - Docs: the "any ancestor" claim, the removed build-step text, the keycap font, browser versions
    (Chrome 123 / Firefox 128 / Safari 17.5), and the false leak-guard claim (also in
    `.claude/commands/publish.md`). The gallery themes are readable on a dark page.
  - CHANGELOG 1.0.0-rc02 is updated. The manifest is regenerated with
    `/tmp/cpport/gen-manifest.mjs` plus a patch (89 base / 119 cp).
  - Tests: build OK, 67 unit, 60 e2e.

### web-multiselect — not committed, user WIP mixed in
- **User WIP (do not commit with mine unless told):**
  - `README.md` (Demos block moved)
  - `src/multiselect.ts` hunk @~1403 (navigate-mode re-scroll; its CHANGELOG line already exists)
  - `test/tree.html`, `test/virtual-scroll.html`
  - untracked `e2e/tree-navigate-virtual.spec.ts`
  - untracked `validation_2026-06-*.md`
- **My changes (Unreleased CHANGELOG is written):**
  - `fullscreenScale()` measures `--ms-rem` / `--ms-fullscreen-rem` with a probe. This fixes rows
    12× too tall when `--base-rem: 1rem`. It is `src/multiselect.ts` hunk @~3793; stage it alone
    when committing.
  - `--ms-fullscreen-rem: calc(1.2 * var(--ms-rem))`.
  - Control outline `--ms-input-border-color` (`--base-input-border-color`) for the input fallback,
    the action buttons and the count pill.
  - Focus halo `--ms-input-box-shadow-focus`.
  - The actions bar and hint use `--ms-dropdown-bg`. The popover uses `--base-dropdown-border` and
    the dropdown shadow.
  - The placeholder opacity is 1. `--ms-border-width` follows `--base-border-width`.
    `--base-icon-info`, `--base-shadow-md` and `--base-font-family-mono` are wired.
  - 44 unused variables and 22 duplicate declarations removed. The manifest dropped 7 base tokens
    that only those variables read.
  - A disabled checked or indeterminate checkbox keeps its fill and mark. A disabled field gets no
    hover border.
  - Title colours: `--ms-option-title-color-focused` / `-selected` read
    `--base-focused-text-color` / `--base-highlighted-text-color`.
  - The chevron and the fullscreen search icons use `--base-input-icon-color`.
  - z-index reads `--base-z-dropdown` / `-popover` / `-tooltip`; the phone sheet sits at tooltip + 1.
  - The tree indent uses `× --ms-rem`, and the `defer` reserve uses `--ms-input-height`.
  - `THEMING.md`, `docs/theming.md`, `examples-theming.html`, `CLAUDE.md` and `docs/examples.md`
    no longer name any nonexistent variable (a script checks this).
  - **Bug in the published 2.5.0, from commit `d9e7933`:** declarative `<option>` children
    rendered as "[N/A]". Fixed in `src/web-component.ts:645` (`cfg[key] == null`). New fixture
    `test/declarative.html` and spec `e2e/declarative.spec.ts`. Worth a 2.5.1.
  - New e2e: fullscreen scale (presentation.spec), control tokens (action-buttons.spec), disabled
    checked checkbox (disabled.spec), declarative.
  - Tests: build OK, 139 unit, 349 e2e (the last full run showed 347; the 2 declarative tests are
    new and passed alone). The base-css-variables e2e passes 38/38 against the rebuilt dist.

### web-treeview — branch `prod`, committed (not pushed)
- **`ebb7339`:** the existing WIP (Oct 14–15), committed as-is at the user's request after a green
  build + e2e: item states on `--base-highlighted-*` / `--base-focused-*`, 2.0 base names,
  before/after drop-zone rename, tooltip / focus-accumulation fixes.
- **`604f8e5`:** this audit's fixes.
  - **Touch drag was broken in the web component:** the ghost lived in `<body>` (no CSS at all),
    `document.elementFromPoint` stopped at the shadow host (touch drops never landed), and the
    drag-over highlight and the 🚫 badges (desktop drop-denied too) looked rows up in `document`.
    Fixed with `_domScope()` / `_elementFromPoint()` in `tree-controller.ts`; new
    `e2e/touch-drag.spec.ts` (failed before, passes after).
  - The inline drop-zone `z-index: 10000` is gone → `--wtv-z-index-drop-zones`.
  - Context menu `--base-dropdown-border` / `-bg`, danger hover and drop tints on `-bg-subtle`,
    shadows `--base-shadow-md` / `-lg`, mono font, `--wtv-border-width`, duration, z-index on
    `--base-z-dropdown` / `--base-z-tooltip`. Drop arrows are masks in the glow colour; loading veil
    is the surface at 80%; drag-denied pulse reads the danger colour.
  - Manifest = exactly the `--base-*` read; 7 phantom `--wtv-*` names removed (manifest → CEM /
    vscode / web-types via `npm run analyze`, and `docs/theming.md`); demos set
    `--base-highlighted-bg`; Unreleased CHANGELOG on 2.0 names; Keenmate in prose.
  - Tests: build OK, e2e 193 passed / 18 skipped, base-css-variables e2e 38/38.
- **Left as is:** `--wtv-text-color-2` reads `--base-text-color-3` (same open question as the
  multiselect subtitles); the checkbox focus ring is a private 2px / 25% mix; disabled opacities are
  literals (waiting on the token decision); `package.json` and the runtime author string still say
  "KeenMate" (metadata, not prose); untracked `validation_2026-06-19_1918.md` was left alone.
- **Parity follow-up for svelte-treeview:** the same touch-ghost problem (§1), plus the
  token changes above, so both trees keep rendering alike.

### Contract 2.0.0-rc03 (unpublished) — base-css-variables, branch `prod`, committed, not pushed
- `3f3c0db` **Placeholders use text step 3** (`--base-input-placeholder-color`; step 4 gave about
  2.1–2.5:1). Step 3 = icons, metadata, paths, placeholders, hints; step 4 = disabled, decorative.
- `45495cb` + `f48751d` **Text on fills is derived**: the 15 `--base-on-<role>/-palette-N-text-color`
  moved from inputs to the derived block — black or white, picked by **APCA** (the user found WCAG
  2's black on sky blue / pink hard to read). CSS formula from APCA's luminance, `c^2.4` as a
  polynomial (Firefox has no `pow()` on colour channels), 2-digit constants; Chromium, Firefox and
  WebKit agree. Across the contract + 16 themes no fill is below Lc 45 (WCAG 2 pick: 68). Near-tie
  fills (default success, info) can be hand-set by a theme.
- **Four default fills one shade darker** so white text also passes WCAG 2: danger `#dc2626`,
  palette 5 `#7c3aed`, 6 `#4f46e5`, 8 `#0369a1`.
- `f48751d` **`demo/fill-states.html`**: WCAG 2 vs APCA, hover / press options, and the agreed button
  model with a theme-override editor.
- `bc4efff` **What belongs in the contract** (README + CLAUDE.md): inputs (few) / derived shared
  formulas (can grow) / component tokens (one component's design choices, default to the contract);
  promote a token when a second consumer draws the same thing.
- Components updated to match (uncommitted): web-multiselect placeholder + hint fallback → step 3
  (new `2.6.0-rc02` CHANGELOG section), web-commandpalette placeholder fallback → 55%.

### Decisions (2026-10-21)
- **Role colours stay in the contract** (`-color`, `-color-hover`, `-color-active`, tints,
  `-text-color`, text on fill). Removing them would let pure-admin and the components invent
  different "danger, hovered" colours. They are derived, so a theme sets only `-color`.
- **No button-state tokens in the contract.** No web component draws role-filled buttons except
  primary (daterangepicker Apply, grid Go, dropzone buttons — each with its own button tokens).
  Button hover / press live in the button component: text stays, the fill moves away from the
  text, the border follows each state's fill; a theme can override them (the "flip" case).
- Themes almost only set `--base-*`; their many `--pc-*` / `--pa-*` overrides are dark-mode
  re-statements (Corporate: 50 of 58 in `.pc-mode-dark`), not custom designs.

### Hand-off to the pure-css / pure-admin / themes session
1. **Mirror rc03 in pure-css `_base.scss`:** `$base-input-placeholder-color: var(--base-text-color-3)`
   (and the step 3 / 4 comments); the APCA on-colour formula for the 15 tokens (check that Sass
   passes `color(from …)` through untouched); the four darker default fills; dark values for
   `$base-<role>-text-color` (contract has `light-dark(#155724, #34d399)` etc.); the **full role
   set** — 14 new tokens: `$base-<success|danger|warning|info>-color-active` / `-bg-subtle-hover`,
   `$base-secondary-color-active` / `-bg-subtle` / `-bg-subtle-hover`, derived
   `$base-primary-text-color` / `$base-secondary-text-color`, and `$base-disabled-opacity: 0.65`
   (pure-admin's button `:disabled` can read it); **rename** `$base-highlighted-*` →
   `$base-selected-*` (bg, bg-hover, text-color, outline) and its `--pc-*` / docs uses.
2. **Themes:** drop hand-set placeholder colours and the `#fff` `--base-on-*` overrides (hand-set
   only near-tie fills where white is wanted); drop the dark-mode `--pc-*` / `--pa-*` blocks the
   contract now derives; reconsider Corporate's hand-set text steps 3 / 4 (fainter than the formula).
3. **Buttons (`--pa-btn-<role>-*`):** per-state fill / text / border, defaults as above, read from
   the contract's role colours; see `demo/fill-states.html` section 3.
4. **From the review:** core's pure-css range `^2.0.0-rc04`; regenerate pure-css `COMPONENTS.md`.

### Open / next
1. **Commit.** commandpalette: one commit with all its uncommitted changes (second-round fixes +
   placeholder fallback). multiselect: 2.6.0-rc01 is released; the placeholder / hint fallback change
   is uncommitted (2.6.0-rc02 section).
2. **multiselect phone view resets overrides.** `floating.css:76-123` declares about 20 sizing
   variables again on the fullscreen panels (option padding / gap / font sizes, checkbox size, group
   label, tree indent, 6 badge variables, 4 action-button variables). An override such as
   `--ms-option-padding` set on the element (pure-admin `multiselect.mustache:298` does this) is
   therefore lost on phones, and the variables that are *not* declared again stay at the desktop
   size. Proposed fix (waiting for approval): "late binding". Don't declare these variables; each
   rule uses `var(--ms-x, calc(N * var(--ms-rem)))`, so the default resolves against the panel's
   `--ms-rem`, then remove the panel declarations. The manifest checker must allow
   read-but-not-declared knobs. Add a phone e2e test showing an override survives.
3. **Contract decisions not made yet (section 4):**
   - `--base-rem: 1rem` assumes a 10px root; every component is 1.6× larger elsewhere.
   - Possible new tokens: disabled opacity, calendar icon, control focus ring.
   - Hover / press text contrast on role fills (56 pairs below 4.5:1 across themes) is now a button
     component concern (see Decisions); the contract keeps `-color-hover` / `-active` as is.
4. **Remaining minor items from the second audits** (only if wanted):
   - Palette: `--cp-*` sub-knobs don't cascade when a theme is present (each reads `--base-*` first;
     documented). `:host-context` is Chromium-only.
   - multiselect: subtitles use text-3 (the contract calls supporting text text-2). The search-match
     tint equals the selected tint in dark themes. The virtual list `maxHeight` defaults to a real
     `20rem` (JS). The JS px literals (option height 50, badge height 36, popover gap 4) don't follow
     `--ms-rem`. `--ms-input-padding-h` is 12px against `.pa-input`'s 8px.
   - pure-admin side (another session owns it): `_web-components-theme.scss` forces the group label
     colour and weight. `snippets/web-multiselect.html` lists variable names that don't exist.
5. **The other components (sections 1–3, 5)** are not started: web-dropzone (dark-mode.css hex
   overrides — critical), svelte-treeview (touch ghost unstyled; port the web-treeview changes),
   web-grid, web-daterangepicker, svelte-switch, the web-components devkit `tokens.css` (it drives
   every example), web-editor. web-treeview is done (see above).

Scratch files for this work are in `/tmp/cpport/` (`C:\Users\OndrejValenta\AppData\Local\Temp\cpport`):
- `gen-manifest.mjs` (palette manifest)
- `ms_dead.mjs` (proves which `--ms-*` are unused)
- `vis.html` / `vis*.cjs` (screenshots)
- `oncolor.cjs` (text on fills across all themes: today / WCAG 2 / APCA), `apcaformula.cjs`
  (the CSS APCA pick vs exact APCA in Chromium / Firefox / WebKit), `themefills.cjs`
- the edit scripts

---

## 1. Functional bugs found along the way (fix first)

| Repo | Where | Bug |
|---|---|---|
| web-dropzone | `src/css/dark-mode.css` (imported `layer(overrides)`, `main.css:39`) | In OS dark mode, or under `[data-theme="dark"]`, `.dark` or `[data-bs-theme="dark"]`, every `--dz-*` color is replaced with hex values. This throws away the whole `--base-*` theme. The bare `:host` rule also matches `[managed]` satellites. **Fix:** delete the hex values and let `light-dark()` handle the mode. |
| web-multiselect | `src/multiselect.ts:3802` `fullscreenScale()` | It runs `parseFloat()` on `--ms-rem`. With the contract loaded the value is `1rem`, so the scale becomes 12 / 1 = 12×: fullscreen virtual rows are 600px tall and badges and the gap are inflated. Not yet confirmed in a browser. |
| svelte-treeview | `TreeController.svelte.ts:5283-5293` | The touch-drag ghost is appended to `<body>`, but its variables are declared on `.stv__container`, so it renders with no background or shadow and inherits the page colour. |
| web-grid | context menu and datepicker | These popovers are styled from `document.head`, outside the shadow root. `:host` `--wg-*` variables never reach them, so a `<web-grid data-theme="dark">` opens light popovers, the sizes fall back to px, and `--wg-cm-z-index` and `--wg-dp-z-index` are never defined. |
| web-grid | `dropdown/rendering.ts:33` | An inline `max-height: 200px` overrides `--wg-dropdown-max-height`, so that token does nothing. |
| web-editor | `editor.css` | Dark mode only works with `theme="dark"`, and it misses links, inline code, `th`/`td` and table selection, which stay light. The Prism theme is imported globally, so it probably never reaches the shadow root. `editor.css` is also injected page-wide (`index.ts:10`). |
| web-switch | `package.json` | Does not depend on `@keenmate/svelte-switch`, although its SCSS imports it from `node_modules`. It only builds on this machine because of a local symlink. |
| web-treeview / svelte-treeview | `dom-renderer.ts:1623`, `Tree.svelte:2025` | An inline `z-index: 10000` on drop zones overrides the CSS token. |

---

## 2. Stale or nonexistent `--base-*` names

### Live code (what actually ships)
| Repo | Status |
|---|---|
| web-multiselect, web-grid, web-treeview, svelte-treeview, web-dropzone | **Clean.** Every name in `src` is a valid 2.0 name. |
| web-daterangepicker | `variables.css:349` reads `--base-icon-calendar`, which is **not in the contract and never was**. Same in the manifest, CEM, vscode and web-types data. Either add it to the contract (and pure-css), or drop the `var()`. |
| web-commandpalette | `_shadow-base.scss:111, 151, 196, 228` read `--base-accent-color`. In addition, the compiled-in pure-admin-core **3.3.0-rc06** (devDependency) brings 25 stale names, including accent, `input-color`, `text-on-*` and `color-N`. A test build against core rc07 clears all of them. **Fix:** bump core, change the 4 lines, and regenerate the manifest; the fixture and `e2e/theming.spec.ts` must change in the same commit. |
| web-switch | Inherits from `svelte-switch/src/lib/assets/_theme.scss`: line 51 `--base-primary-bg` (never existed; the OFF track has always been dead), 52 and 55 `--base-accent-color`, 53 `--base-text-color-on-accent`, 132 and 135 `--base-accent-color-light[-hover]`. The fix belongs in svelte-switch. |
| web-components devkit | `src/examples/css/tokens.css:41-49, 75` (accent*, `text-color-on-accent`, `input-color`) plus the `templates/new/*`. **These drive the examples of every component**, so once a component reads only 2.0 names, its demo theme switch stops recolouring it. |
| web-editor, web-timepicker, web-wysiwyg | Read no `--base-*` tokens at all. |

### Current docs, manifests and Unreleased CHANGELOGs (history entries are fine)
- **web-treeview** `CHANGELOG.md:41` (Unreleased): `-text`, `-ring` and `--base-ring-width`.
- **web-multiselect**:
  - Unreleased CHANGELOG lines 23, 44-45 and 53-61 use the 1.x names.
  - `THEMING.md:34, 36` use `-text/-ring`.
  - The manifest `:189` refers to `inverse-bg`.
  - `examples-theming.html:244, 298` set `--base-actions-bg` and `--base-popover-bg`, which are not tokens.
  - The untracked `validation_*.md` files set `--base-accent-color`.
- **web-daterangepicker**:
  - The Unreleased CHANGELOG claims the component reads `--base-primary-bg-subtle` and the item-state tokens; it reads neither.
  - The manifest `:29` says it falls back to `inverse-bg`.
  - API.md and `docs/theming.md` document `--drp-*` tokens that don't exist, with wrong defaults.
- **web-grid**:
  - `ai/styling-theming.txt` uses `--base-accent-color` four times, **and this file ships to npm**.
  - The root README presents `--base-inverse-bg` as a hook. The Makefile copies that README over the package README at build.
  - `docs/theming.md:157` uses `--base-input-color`.
  - The manifest and `examples-theming.html` have tooltip find/replace leftovers.
- **svelte-treeview**:
  - `ai/styling-theming.txt:47, 52` and `ai/import-patterns.txt:103` use accent.
  - `ai/styling-theming.txt:55` sets `--base-border-radius-sm: 6px`, a unit error that makes the radius collapse.
  - The showcase `theming/+page.svelte:645, 646, 660, 662` lists old names.
  - `docs/theming.md:124-141` documents classes that don't exist.
- **web-dropzone**:
  - `examples-theming.html`, `test/theming.html:26` and `e2e/theming.spec.ts:70` use the invented `--base-input-background` and `--base-primary-bg[-hover]`. The e2e assertion is vacuous.
  - `THEMING.md:331` has `1.4rem` (unit error); the file is a multiselect leftover.
  - The manifest and the package README call success and warning "local extensions".
  - `CHANGELOG.md:94` wrongly says `text-color-4`, `font-size-lg`, `font-weight-medium` and `line-height-tight` "were never canonical". That is why they aren't wired.
- **web-commandpalette**: manifest (25 entries), `docs/theming.md:17, 92, 97`, `examples-theming.html` (14 lines), `test/fixture.html:12`.

---

## 3. Cross-cutting issues: the same mistake in several components

### 3.1 The rc02 control outline isn't used: controls drawn with the divider (`--base-border-color`)
- **web-daterangepicker**: nav buttons `:394`, action buttons `:642`.
- **web-grid**:
  - Go-to input `dialogs.css:37`.
  - Pagination `<select>` `pagination.css:60-69`.
- **web-multiselect**:
  - Action buttons `variables.css:523`.
  - Count pill `:784`.
- **web-dropzone**:
  - Dashed drop area `variables.css:129`.
  - `.dz__minimal` `dropzone.css:256`.
  - Native button `:321`.
- **web-commandpalette**: search input and close button (core `_command-palette.scss:113, 394`).

### 3.2 Focus halo `--base-input-box-shadow-focus` not used
- **web-multiselect**: `controls.css:40-42` swaps only the border; `floating.css:352`.
- **web-grid**:
  - `header.css:167` uses a hardcoded 1px.
  - `dialogs.css:47-48`.
  - `pagination.css:76-78` uses an outline.
- **web-commandpalette**: core rc06 hardcodes a 5% mix (rc07 reads the colour token).
- **web-daterangepicker**: reads the colour token and builds `0 0 0 3px` itself. Fine.

### 3.3 Item states not on `--base-highlighted-*` / `--base-focused-*`
- **web-grid**:
  - Row selection (`variables.css:383`), row focus (`:392`) and cell selection (`:398`) are private mixes.
  - The dropdown's keyboard item (`dropdown.css:148-155`) has its own look.
  - Frozen columns re-mix the tint themselves (`freeze.css:77-98`), so they ignore even `--wg-*` overrides.
- **web-daterangepicker**: in-range days `:580-596`.
- **web-commandpalette**: rows `--cp-item-hover/active-bg` use a primary tint. Hover should be `--base-hover-bg` and the keyboard row should be the highlighted set.
- **web-editor**: `.km-menu-item:hover` is a solid accent fill.
- **web-treeview**: selection is correct, but the manifest, the header comment and every theming demo describe or set `--base-primary-bg-subtle`, which does nothing. They should set `--base-highlighted-bg`.

### 3.4 Dead fallback chain `var(--base-dropdown-bg, var(--base-elevated-bg, …))`
The contract always defines `--base-dropdown-bg`, so the `elevated-bg` step is unreachable. It is the same pattern as the removed `inverse-bg` chain.
- web-daterangepicker `:116` (plus `dark-mode.css`)
- web-grid `:67`
- web-treeview `:359`
- svelte-treeview `:338`
- web-multiselect `:147, 258`

The manifests describe this middle step as if it worked.

### 3.5 Role and primary tints pasted as `color-mix` instead of `-bg-subtle`
In dark mode these stay at a flat 10%, while the contract uses 20%.
- **web-treeview**: `:317, 319, 378`.
- **svelte-treeview**: `context-menu.css:45`, `drag-drop.css:141, 146`.
- **web-dropzone**:
  - Accent, error, warning and success backgrounds `:115-118`.
  - 10% accent mixes `:286, 308, 344, 456, 518`; 10% error mixes `:333, 486`.
- **web-grid**:
  - Context-menu danger hover.
  - Datepicker today hover.
- **web-daterangepicker**:
  - The 12 message colours `:699-716` are hand-picked hex values.
  - Wheel and pill tints.

### 3.6 Role fill colours used as text (should be `--base-<role>-text-color`)
- **web-dropzone**: `file-item.css:467, 469`, `progress.css:43, 47, 116, 120`, `indicator.css:82-97`.

### 3.7 Hardcoded values where a token exists (all components)
- **Mono font → `--base-font-family-mono`**:
  - web-treeview `tree.css:801`
  - svelte-treeview `debug.css:41`
  - web-multiselect `debug.css:49`
  - web-grid `--wg-font-family-mono` `:105`
  - web-editor: `editor.css:140, 475, 504` and the playground
  - web-timepicker
- **Spacing scale**: none of the components read `--base-space-*`; all use their own literals.
  - The numbers mostly match, but the names are shifted: component `md` 1.6 corresponds to `--base-space-base`.
  - Affected: drp `:71-75`, wtv `:168`, ms `:945` (also unused), grid `:117`, commandpalette core.
- **Border width → `--base-border-width`**: about 60 `1px` literals across all components. Setting `--base-border-width: 2px` only thickens the inputs.
- **Motion → `--base-duration-*` / `--base-ease-*`**: 150ms is exactly `--base-duration-normal` everywhere (drp, wtv, ms, dz, grid). The comment in drp `:179` contradicts itself.
- **Font weights**: literal 500/600/700/bold in drp badges, stv states, dz, grid floating, cp and the editor.
- **Overlay → `--base-overlay-bg`**: drp `:201`, grid `:280`, cp core backdrop, editor examples.
- **Shadows**: the colour already follows `--base-shadow-color` almost everywhere.
  - Exceptions: editor `:159, 322`, cp core rc06, timepicker.
  - Several values are exactly `--base-shadow-md` / `-lg` (wtv, stv, ms tooltip `0 2px 8px`, ghost `0 4px 12px`).
- **Icons duplicated inline**:
  - dz `--dz-icon-remove` = `--base-icon-remove`
  - ms `--ms-icon-info`
  - stv context-menu chevron and info
  - grid: text glyphs ▶ ▲▼ ✕
  - wtv: `'▸'` and the 🚫 emoji
  - drp: `&times;`
- **Danger red `#e11d48`**: drag-denied in wtv `tree.css:558` and stv `drag-drop.css:231, 249`.
- **Raw `#ef4444` / `#10b981`**: drp holiday, event and badge colours; cp rc06 badges.

### 3.8 z-index: no component uses `--base-z-*`
All components sit above the contract scale (tooltip 9000, dropdown 7500, modal 7000):
- drp: 9500–10002
- ms: 9999–10002
- grid: 9999/10000
- wtv and stv: 10000
- dz: up to 100000
- cp: 10500

This needs a deliberate decision: lift the contract scale, or bring the components down to it.

### 3.9 Tooltip fallback inverts in dark mode
In ms, wtv, stv, drp and grid the fallback is `light-dark(#333, #f5f5f5)`, which gives a light tooltip in dark mode. The contract tooltip is always dark. This only matters without the contract loaded.

### 3.10 Old fallback literals
Fallbacks still use the old blue (`#3b82f6`, `#0078d4`, `#667eea`) instead of `#0ea5e9`, plus old text and border greys. Cosmetic; only visible without the contract.

### 3.11 Placeholder dimmed twice
drp `controls.css:32` and ms `controls.css:69` apply `opacity: .6` on top of `--base-input-placeholder-color`, which is already the faint level. cp core does the same with text-color-2 at `.5`.

---

## 4. Problems in the contract itself (base-css-variables)

1. **`base-variables.css:101-104`**: the role-model comment still describes `-bg`, `-text` and `text-on-*`, which 2.0 removed.
2. **`--base-on-warning-text-color: #ffffff`** on amber `#f59e0b` gives about 2.1:1 contrast. The warning toast in multiselect gets *worse* when the contract is loaded (its own fallback was `#1a1a1a`).
3. **`--base-rem: 1rem` assumes `html { font-size: 10px }`.** On any other page that loads `base-variables.css`, every component that uses `--x-rem: var(--base-rem, 10px)` renders 1.6× larger (ms, drp, wtv, stv, cp). That also causes the 12× multiselect bug. grid, dz and switch deliberately don't read `--base-rem`, so the components are inconsistent with each other. Decide on one approach and document it.
4. **Missing tokens the components keep inventing**:
   - **Disabled opacity**: each component has its own value, from 0.4 to 0.6.
   - **Calendar icon**: drp already reads one (`--base-icon-calendar`).
   - **Checkbox / button focus ring**: wtv, stv and ms hardcode `0 0 0 2px` at 25% primary. The rc02 halo colour (5%) is too faint as the only focus cue.
5. **Wrapper-scoped re-theming**: derived tokens only recalculate on `:root`, `[data-theme]` or `.base-scope`. The tree demos (TC01) and the svelte comments suggest setting `--base-primary-color` on a plain class, which won't move highlight or focus. Docs need a note to use `class="base-scope"`.

---

## 5. Per-repo notes (beyond the shared themes above)

### web-multiselect
- Dead reads that the manifest claims are used:
  - `--ms-primary-bg-hover` (via `--base-active-bg`)
  - `--ms-accent-color-active`
  - `--ms-text-color-2`
  - the `--ms-badge-*`/`--ms-more-badge-*` chains
- The whole `--ms-font-size-*` and `--ms-spacing-*` sets are defined but never read.
- About 20 duplicate `:host` declarations in `variables.css`.
- `--ms-text-muted-color` is read but never defined.
- The disabled checkbox background uses the hover overlay (`:650`) instead of `--base-input-bg-disabled`.
- The sticky actions bar and hint read `main-bg` instead of the dropdown surface (`:142, 153`).
- The selected-items popover has its own shadow and border (`:880-882`) instead of `--base-dropdown-*`.
- `base.css:13` `web-multiselect:not(:defined)` sits in shadow CSS, so it never matches.
- Tree indent uses real `rem` (`tree.css:17`).
- `docs/theming.md` tables list names that don't exist.

### web-grid
- **Half the input contract is dead**: `--wg-input-color`, `--wg-input-placeholder-color`, `--wg-input-border-hover` and `--wg-filter-input-bg` are defined but never used. There is no `::placeholder` rule at all.
- The filter input uses `main-bg` / `text-color-1`.
- Checkboxes are scaled with `transform: scale()` (`editors.css:110`) instead of `--base-checkbox-scale`, and have no `accent-color`.
- The datepicker background uses `main-bg` instead of `dropdown-bg`. Its shadow reads an undefined `--wg-shadow-lg`.
- `--wg-border-color-hover` resolves to the same token as the rest state, so hover shows no change.
- `--wg-error-*` is entirely unused.
- About 30 `--wg-*` variables are defined but unused, and about 65 used ones are missing from the manifest. The variable counts in the docs disagree with each other.
- No e2e test or demo loads `base-variables.css`, so the 2.0 contract isn't tested against the grid at all.
- An untracked, stale root `dist/` (Jan 2026) still contains pre-1.0 names.

### web-daterangepicker
- `--drp-text-secondary` is `--base-text-color-3`, used for labels (should be -2) and disabled items (should be -4).
- The rolling, clock and wheel surfaces use `--base-hover-bg` as their resting background.
- The calendar icon uses opacity 0.6 instead of `--base-input-icon-color`, so ✕ and the calendar icon have different tones.
- The fullscreen close hover is `rgba(0,0,0,.06)`, which is invisible in dark mode.
- The disabled hatch is `rgba(0,0,0,…)`, also invisible in dark mode.
- `--drp-day-invalid-range-color` uses on-accent; it should be `--base-on-danger-text-color`.
- The fallbacks in `dark-mode.css` have drifted from `variables.css`.
- `scripts/check-variable-manifest.mjs` doesn't check `--base-*` names against the contract, which is how `--base-icon-calendar` got in.

### web-treeview / svelte-treeview (parity)
- `--stv-light` is mapped to `main-bg`, wtv uses `elevated-bg`, so the chip/stat surface disappears in svelte.
- Text levels differ: wtv `text-color-2` reads base `-3`, while stv maps 1:1. The context-menu shortcut has a different tone in each.
- **wtv**: drop-indicator arrows are SVGs with baked-in colours (`tree.css:118, 138, 159`). Port the svelte mask approach.
- **wtv**: the loading overlay uses an rgba literal, svelte uses `color-mix` of main-bg.
- **stv**: the info button and reveal popover use hardcoded GitHub colours (`node.css:117-155`).
- **stv**: the checkbox reads `--stv-accent-color`, the rest reads `--stv-primary`, so the documented override doesn't recolour checkboxes.
- **wtv metadata**: 7 phantom tokens (`--wtv-border`, `-border-width-base`, `-border-radius-md`, `-font-size-base`, `-transition-normal`, `-easing`, `-toggle-size`) and 4 undocumented ones. The `docs/theming.md` tables are stale (node height 32 vs 24, indent, and more).
- **stv manifest**: missing `tooltip-bg/-text-color` and `border-radius-lg`; lists `font-weight-medium`, which isn't read.
- Both: context menu should use `--base-dropdown-border`; no `:focus-visible` on menu items (stv).

### web-dropzone
- The elevated surface is used as hover (`--dz-primary-bg`, `:124, 133, 303, 410, 473`); it should be `--base-hover-bg`.
- The popover doesn't use the dropdown family (`:428-429`).
- `text-color-4`, `font-size-lg`, `font-weight-medium` and `line-height-tight` aren't wired, because of the false CHANGELOG claim.
- z-index up to 100000 (`indicator.css:30`).
- The drag overlay sits in light DOM and doesn't set `--base-font-family`.
- Undeclared variables are used: `--dz-preview-item-size`, `--dz-overlay-hover-*`, `--dz-font-family`.
- The repo has no dependency on base-css-variables and no example loads it.
- Leftovers from multiselect: THEMING.md, `ai/*.txt`, the mustache template, CHANGELOG from :502 on.

### web-commandpalette
- Mostly fixed by bumping pure-admin-core rc06 → rc07; see §2.
- What stays wrong after the bump:
  - Divider border on the input.
  - Hover and active row tint.
  - `<mark>` stuck at `#0ea5e9`.
  - Placeholder opacity hack.
  - `.pa-badge--secondary` hardcoded `#6c757d`.
  - Backdrop not on `--base-overlay-bg`.
  - Input height literal 3.8 (= `--base-input-size-lg-height`).
- About 75 lines of dead `.pa-shortcut-help*`, the loaders and the `--color-N` badges are shipped into the shadow root.
- `pa-spinner--sm` is rendered but no CSS rule exists for it.

### web-editor
- Uses a private `--km-*` theme with no `--base-*` at all. Point the `:host` seam at the contract and the separate dark block is no longer needed.
- `pre` / `code` / `th` / `selectedCell` / link colours are hardcoded (see the editor findings above).

### web-switch / svelte-switch
- Fix the chains in svelte-switch `_theme.scss`.
- The OFF track should be a neutral control token, not primary.
- Label hover uses `rgba(0,0,0,.06/.12)`, which breaks in dark mode.
- web-switch looks stalled (last activity Sep 2025, no full build). "KeenMate" spelling in `package.json`.

### web-timepicker, web-wysiwyg
- Prototypes, not git repos. web-wysiwyg is the predecessor (POC) of web-editor; archive it.
- If timepicker is ever productized: everything is hardcoded (`#667eea`), with no dark mode.

### Spelling "KeenMate" → "Keenmate"
- web-daterangepicker: `variables.css`, `docs/theming.md`, README.
- web-treeview: 11 occurrences.
- web-switch: `package.json`.

---

## 6. Suggested order

1. **Functional bugs (§1):** dropzone dark mode, the multiselect 12× scale, the stv touch ghost.
2. **Contract decisions (§4):** `--base-rem` / 10px root, `on-warning` contrast, whether to add calendar icon / disabled opacity / control focus ring tokens, the z-index scale. Then fix the comment at :101-104.
3. **Upstream sources of stale names:**
   - pure-admin-core rc07 → commandpalette
   - svelte-switch `_theme.scss`
   - the devkit `tokens.css`, which drives every component's examples
4. **rc02 adoption** in all components: control border (§3.1) and focus halo (§3.2).
5. **Item states** (§3.3) and **role tints** (§3.5): grid, drp, cp, dz.
6. **Docs, manifests and Unreleased CHANGELOGs** (§2): one cleanup per repo.
7. **Hardcode-to-token pass** (§3.7): mono font, border width, duration and spacing. The z-index scale after the decision in step 2.
