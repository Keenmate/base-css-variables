# Plan — bring the web components onto base-css-variables 2.0.0-rc03

Date: 2026-10-22. Source: three read-only audits of every component repo against the published
`@keenmate/base-css-variables` 2.0.0-rc03 and `@keenmate/pure-css` 2.0.0-rc04. Line numbers are as of
today's working trees (uncommitted WIP included). Supersedes the progress notes in
`audit-components-2.0.md` §0 where they conflict (e.g. web-treeview is **not** on `prod`).

## What rc03 changed (recap)

- **Removed:** `--base-highlighted-*` → `--base-selected-*` (no aliases).
- **Added (derived, a theme sets nothing):** every role has `-color`, `-color-hover`, `-color-active`,
  `-bg-subtle`, `-bg-subtle-hover`, `-text-color`, `--base-on-<role>-text-color`;
  `--base-disabled-opacity: 0.65`.
- **Values:** `--base-on-*-text-color` derived by APCA (success / warning / info / palette 1, 3 → black);
  placeholder = text step 3; danger `#ef4444` → `#dc2626`; palette 5 / 6 / 8 one shade darker.
- **Policy:** consumers read derived tokens; button-specific choices stay component tokens.
- **pure-css rc04** `--pc-text-color-1..4` break: no component reads `--pc-*` → **no impact**.

## Cross-cutting rules for every task

- **R1 — fill and text from the same source.** Any `--base-on-<role>-text-color` must sit on that
  role's own fill. A component accent (`--xx-accent-color`) that can be overridden needs its text token
  documented next to it.
- **R2 — danger / role as text** → `--base-<role>-text-color`, never the fill (`#dc2626` on dark = 3.6:1).
- **R3 — primary as text** → `--base-primary-text-color`.
- **R4 — tints** → `--base-<role>-bg-subtle(-hover)` instead of `color-mix(... 10% / 15%)`.
- **R5 — disabled** → `var(--base-disabled-opacity, <old>)` (visible change 0.5 → 0.65; note in CHANGELOG).
- **R6 — standalone fallbacks** match rc03: danger `#dc2626`; black (`#000`) text on success / warning / info.
- **R7 — dark mode:** no `:host-context()` (Firefox unsupported, Safari partial). Use core rc13's
  `:host([data-context-theme="dark|light"])`; model: `web-multiselect/src/css/dark-mode.css:39-45`.
  Wrapper-div signals then need `theme-source="closest"` — document it.
- **R8 — no hex dark-mode overrides** of colours that `light-dark()` / base already provide.

---

## Phase 0 — prerequisites

- [x] **T0.1 Publish web-components-core 1.0.0-rc13** (user; `make publish-rc` in `../web-components-core`, then push).
      Blocks every R7 task.
- [ ] **T0.2 Confirm web-multiselect 2.6.0-rc01 on npm.** `npm view` lists only up to 2.5.0 while the
      CHANGELOG says `[PUBLISHED]`. If not yet published: publish the existing `dist/` (built with rc12
      core) **without rebuilding** — a rebuild bundles the local rc13 core via the symlink.
- [ ] **T0.3 base-css-variables:** commit `docs/audit-components-2.0.md`,
      `docs/handoff-treeview-selected-checked.md` and this plan; correct §0 of the audit
      (treeview commits `ebb7339` / `604f8e5` live on `feature/rc03-svelte-parity`, not `prod`;
      multiselect dark-mode WIP is the core rc13 migration, not "user's WIP").

---

## Phase 1 — web-multiselect 2.6.0-rc02 (~1.5 h)

Must
- [x] **T1.1** Bump `@keenmate/web-components-core` `1.0.0-rc12` → `1.0.0-rc13` (`package.json:106`) — after T0.1.
- [x] **T1.2** Commit the rc13 dark-mode migration (`src/css/dark-mode.css`, `test/dark-mode-signals.html`,
      `e2e/dark-mode.spec.ts`); run `npm run test:e2e:all`.
- [x] **T1.3** Re-export `setThemeMode` / `getThemeMode` (and types) from `src/index.ts`.
- [x] **T1.4** `README.md:37` — What's New names `--base-highlighted-*` → `--base-selected-*`.
- [x] **T1.5** CHANGELOG rc02: dark-mode entry (data-context-theme, works in Firefox / Safari;
      wrapper-div signals need `theme-source="closest"`); fix `CHANGELOG.md:41` ("is planned").

Should
- [x] **T1.6** Fallbacks (R6): `src/css/variables.css:816` `#ef4444` → `#dc2626`; `:819` `#ffffff` → `#000`.
- [x] **T1.7** Primary as text (R3): `--ms-badge-text-color` `:203` (2.6:1 today), `--ms-fullscreen-info-color` `:452`,
      `--ms-add-new-color` `:651` → `var(--base-primary-text-color, var(--ms-accent-color))`.
- [x] **T1.8** R1: rewrite comment `:80-81` ("stays white"); document in `docs/theming.md` that overriding
      `--ms-accent-color` also needs `--ms-text-color-on-accent`. Fix the header example `:11` (`#10b981` + white).
- [x] **T1.9** Stale dark-mode docs: `docs/theming.md:174-175`, `FEATURES.md:220`,
      `examples-theming.html:524, 597-598, 627, 680` (`:host-context` / ancestor wording).

Nice
- [x] **T1.10** R5: `--ms-disabled-opacity` `:560`, `--ms-disabled-input-opacity` `:887`, `floating.css:280`;
      update `docs/theming.md:354`. Run e2e.
- [x] **T1.11** R4: `:253`, `:558` → `var(--ms-accent-color-light)` (keep 8 / 12 / 15 / 22 % deliberate tints).
- [x] **T1.12** Accent fallback `#3b82f6` (`:69`) → `#0ea5e9`.
- [ ] **T1.13** `/publish rc` (rebuild is now correct — rc13 core is published).

---

## Phase 2 — web-commandpalette 1.0.0-rc03 (~2 h)

Must
- [ ] **T2.1** Commit the working tree (HEAD `variables.css:122-123` reads removed `--base-highlighted-*`).
- [ ] **T2.2** Next version is **rc03** — npm already has `1.0.0-rc02` (2026-10-12); retitle the CHANGELOG section.
- [ ] **T2.3** Manifest `component-variables.manifest.json:365` — drop "--base-highlighted-bg" wording.

Should
- [ ] **T2.4** R6: `src/css/variables.css:164, 166, 170` `#ffffff` → `#000`; `:167` `#ef4444` → `#dc2626`.
- [ ] **T2.5** R3: `--cp-item-icon-color` `:133`, `--cp-highlight-text` `:135` (`<mark>`), `search.css:88`,
      `results.css:90` → `--base-primary-text-color`.
- [ ] **T2.6** R1: `--cp-badge-primary-bg` / text `:161-162` — document text token next to accent.
- [ ] **T2.7** R7: core → rc13 (peer `^1.0.0-rc13`, dev `1.0.0-rc13`); port `dark-mode.css:15-23` to
      `data-context-theme`; update `README.md:134`.
- [ ] **T2.8** Add dark-mode e2e + firefox / webkit / mobile-webkit Playwright projects (copy multiselect config).

---

## Phase 3 — web-treeview + svelte-treeview (~4 h, then API later)

web-treeview (branch `feature/rc03-svelte-parity`, 4 commits unpushed)

Must
- [x] **T3.1** CSS switch (handoff Task 1): `src/css/variables.css:130-134` → `--base-selected-*`;
      rename `--wtv-highlighted-*` → `--wtv-selected-*` with aliases; comments `:36, :123`, `tree.css:334, 336`.
- [x] **T3.2** Manifest `:26-29`, `:91-94` → `npm run analyze` (regenerates `custom-elements.json`,
      `vscode.css-custom-data.json`, `web-types.json`).
- [x] **T3.3** `docs/theming.md:34, 82-85`; `examples-theming.html` (11 places set `--base-highlighted-bg`);
      CHANGELOG `:37, 49, 60, 80`.
- [x] **T3.4** Run base-css-variables contract e2e; merge branch to `prod`.

Should
- [x] **T3.5** R2: context-menu danger text `tree.css:656` → `--base-danger-text-color`.
- [x] **T3.6** R5: `variables.css:385`, `tree.css:1139`. R4: `:328` → `--base-success-bg-subtle-hover`;
      `tree.css:564` → `--base-danger-bg-subtle-hover`.
- [x] **T3.7** R7 (web-treeview `f0f9edb`): core → rc13; `dark-mode.css:47-63` → `data-context-theme`; drop dead light-DOM selectors;
      Firefox e2e for OS-dark + `<html data-theme="light">`.

Nice
- [x] **T3.8** R6 fallbacks: danger `:93` (`#dc3545/#f87c86`), success `:92`, primary `:85`.

svelte-treeview (branch `feature/core-render-split`, 4 commits unpushed)

Must
- [ ] **T3.9** CSS switch `src/lib/styles/variables.css:229-232` + `--stv-*` aliases; comments `:219`,
      `node.css:43`, `states.css:7`; manifest `:17-20`, `:127-130`; theming page `+page.svelte:658, 660`.
- [ ] **T3.10** Regenerate `src/routes/examples/theme-comparison/*.css` with `scripts/extract-theme-tokens.mjs`.
- [ ] **T3.11** Re-vendor `static/vendor/web-multiselect/style.css` from ms ≥ 2.6.0-rc02.

Should
- [ ] **T3.12** Shipped `ai/*.txt`: `--base-accent-color` (`styling-theming.txt:47, 52`, `import-patterns.txt:103`),
      `--base-border-radius-sm: 6px` unit error (`:55`).
- [ ] **T3.13** Touch ghost: variables live on `.stv__container` but ghost is appended to `<body>`
      (`TreeController.svelte.ts:5283-5294`) → set inline; `--tree-ghost-color: #fff` (`:271`) → on-accent token.
- [ ] **T3.14** R2 `context-menu.css:41`; R4 `context-menu.css:45`, `drag-drop.css:108, 141, 146`, `variables.css:247, 249`;
      R5 `context-menu.css:36`, `checkbox.css:107`; `drag-drop.css:231, 249` `#e11d48` → `--stv-danger`.

Nice
- [ ] **T3.15** Fallbacks `variables.css:58, 72, 73`; `debug.css:23` → R3; info button (`node.css:117-155`) onto tokens.

Later (two releases)
- [ ] **T3.16** Handoff Task 2 — API rename `highlightedPaths` → `selectedPaths`, checkbox `selectedPaths` →
      `checkedPaths`, events `highlight-change` / `selection-change`. Note svelte-treeview 5.0.0 just shipped
      `selectedNodeClass` in the checkbox sense.

---

## Phase 4 — web-dropzone (~3 h + core catch-up)

Must
- [ ] **T4.1** R8: delete hex blocks in `src/css/dark-mode.css:24-111` (accent `#60a5fa` + base-derived text =
      white on light blue in dark mode); rely on `light-dark()` / base.
- [ ] **T4.2** R7: core `^1.0.0-rc04` → rc13 (expect API catch-up rc05–rc12); `data-context-theme`.
- [ ] **T4.3** R1: status badge text `dropzone.css:219, 233-235` — per status `--base-on-<role>-text-color`
      (white on amber / emerald today ≈ 2:1).

Should
- [ ] **T4.4** R3 / R2 role-as-text (~25 places): `file-item.css:99-101, 415-417, 467, 469, 684-686`,
      `popover.css:421-423`, `progress.css:43, 47, 116, 120`, `indicator.css:82-97`, `variables.css:234, 335, 488`.
- [ ] **T4.5** R4 tints (~10): `variables.css:90, 115-118`, accent 10% `:286, 308, 344, 456, 518`, error `:333, 486`.
- [ ] **T4.6** R6 danger `variables.css:108`; `--dz-text-color-4` `:96` → `--base-text-color-4`; R5 `:559`, `indicator.css:100`.
- [ ] **T4.7** Examples / tests: invented `--base-input-background`, `--base-primary-bg(-hover)`
      (`examples-theming.html`, `test/theming.html:26`); vacuous assertion `e2e/theming.spec.ts:70`;
      remove hand-set `--base-on-primary-text-color: #ffffff` (`:128, 143, 176`); CHANGELOG `:32-33`;
      manifest `:28-29` + `packages/web-dropzone/README.md:65` "local extensions" wording.

Nice
- [ ] **T4.8** `--dz-button-bg/-bg-hover/-bg-active/-color` tokens + `:active`; preview-remove text `:376-377` → `--base-on-danger-text-color`.

---

## Phase 5 — web-daterangepicker (~2 h; 20 files of WIP uncommitted on `prod`)

Must
- [ ] **T5.1** R1: invalid-range day `variables.css:606-607` (primary text on `#fecaca`, ≈1.4:1) →
      `--base-danger-color` + `--base-on-danger-text-color`.
- [ ] **T5.2** Placeholder dimmed twice: drop `opacity: 0.6` at `controls.css:32`.
- [ ] **T5.3** `--base-icon-calendar` is not a contract token (`variables.css:349`, manifest `:398`,
      generated files, `examples-theming.html:140, 1448, 1626`) — rename to a `--drp-*` token or propose it to base.
- [ ] **T5.4** Unreleased CHANGELOG `:55, :61-62` — false claims (bg-subtle, focused / highlighted outline).

Should
- [ ] **T5.5** Apply button: `.drp__button--apply:hover` keeps `--drp-button-apply-border`
      (now overridden by `summary-actions.css:80-83`); add `--drp-button-apply-bg-active` → `--base-primary-color-active`.
- [ ] **T5.6** Danger hex `:616, 627, 669-670` → `--base-danger-*` / `--base-on-danger-text-color`;
      dark-mode bug `--drp-badge-text-bg` / `#ffffff` `:671-672`.
- [ ] **T5.7** Messages `:699-716` (12 hex) → `--base-<role>-bg-subtle` / `--base-<role>-text-color`.
- [ ] **T5.8** R3: `:460, 477, 494, 640, 649`.
- [ ] **T5.9** Outline buttons use divider `--drp-border-color` `:642` → `--base-input-border-color` (rc02 audit §3.1).

Nice
- [ ] **T5.10** R4 `:472, 492-493`, `calendar-grid.css:274-286`; R5 `:278`; fallbacks `:133-134, 141, 300`,
      `dark-mode.css:26, 54`.
- [x] **T5.11** R7 (done on top of the uncommitted WIP; not committed): core → rc13; `dark-mode.css:22-24, 48-50` → `data-context-theme`.

---

## Phase 6 — web-grid (1 h + ½–1 day core; 48 commits ahead of `origin/prod`)

Must
- [ ] **T6.1** Shipped docs: `ai/styling-theming.txt:11, 18, 25, 52` (+ `packages/web-grid/ai/`) `--base-accent-color`;
      `README.md:12` `--base-inverse-bg`; `CHANGELOG.md:24` highlighted-outline claim; `docs/theming.md:157`.

Should
- [ ] **T6.2** R2: `toolbar.css:88, 221`, `contextmenu/index.ts:122, 175` → `--base-danger-text-color`.
- [ ] **T6.3** Row selection `variables.css:383` → `var(--base-selected-bg, …)`; focus `:392`, cell selection `:398`.
- [ ] **T6.4** R5 (7): `toolbar.css:71, 210`, `dropdown.css:159`, `editors.css:135`, `variables.css:205`,
      `contextmenu/index.ts:124`, `datepicker.ts:236`.
- [ ] **T6.5** R7: core `^1.0.0-rc02` → rc13 (large jump: INPUTS / events); `dark-mode.css:43-55`.

Nice
- [ ] **T6.6** Wire `--wg-input-placeholder-color` (`variables.css:79`) with a `::placeholder` rule.
- [ ] **T6.7** R4 `contextmenu/index.ts:179`, `datepicker.ts:260`, `variables.css:49`; fallbacks `:82-83`,
      `contextmenu/index.ts:122`, accent `#0078d4`, `datepicker.ts:25`.
- [ ] **T6.8** Go button `dialogs.css:72-80`: `:active` (`--base-primary-color-active`) + disabled style.

---

## Phase 7 — web-switch / svelte-switch (½ day)

- [ ] **T7.1** Must: `svelte-switch/src/lib/assets/_theme.scss` dead 1.x names → ON `--base-primary-color`,
      OFF `--base-input-border-color`, steps `--base-primary-bg-subtle(-hover)`, focus primary;
      thumb stays a component token (`#fff` / `--base-main-bg`, **not** on-primary).
- [ ] **T7.2** Must: declare the svelte-switch dependency in web-switch `package.json` (currently an undeclared symlink).
- [ ] **T7.3** Should: label hover `:132-133` → `--base-hover-bg` / `--base-active-bg`; R5 `:162`.
- [ ] **T7.4** Nice: dark mode; optional move to BlissElement.

## Phase 8 — web-editor (3–5 h)

- [ ] **T8.1** Point the `--km-*` seam (`src/css/editor.css:13-20`) at `--base-*` (primary, surfaces, border, text-3).
- [ ] **T8.2** Accent fills with `#fff` (`:254-258, 341-345, 374-377`) → `--base-on-primary-text-color`;
      hover `:252` → `--base-hover-bg`; R5 `:260, 384`; links `:442, 447` → R3; selection / resize `:458, 558, 568, 575`.
- [ ] **T8.3** Nice: tokenise selection toolbar, code, table hex; `data-context-theme` besides `theme="dark"`.

## Found along the way

- [x] **web-treeview on WebKit — search:** `requestIdleCallback` missing in Safari → index never
      built, every query "0 results". Fixed `e965237` (macrotask fallback).
- [ ] **web-treeview on WebKit — scroll:** `search-deep.spec.ts:59` second search scrolls the hit
      ~2400px off-screen (smooth `scrollTo` measured while the filtered tree re-renders).
- [ ] **web-treeview on WebKit — drag:** `drag-drop.spec.ts` (13) + `touch-drag.spec.ts:28` fail;
      likely Playwright WebKit drag emulation, not verified.

## Out of scope

- web-timepicker, web-wysiwyg — prototypes, not git repos, no `--base-*` reads.
- web-wysiwyg — archive (superseded by web-editor).
