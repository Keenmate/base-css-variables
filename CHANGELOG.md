# Changelog

All notable changes to `@keenmate/base-css-variables` are documented here. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [2.0.0-rc07] — 2026-10-30

### Added

- **Breakpoints — `--base-breakpoint-mobile` (`768px`) / `--base-breakpoint-tablet` (`1024px`):**
  the layout lines, already read by pure-css (`pureCss` config `mobileBreakpoint` /
  `tabletBreakpoint`) and web-components-core (`env.breakpoint`), so the app shell and every
  component switch at the same width. Read in JS — `@media` can't read `var()`; pure-css compiles
  the same lines from `$mobile-breakpoint` / `$tablet-breakpoint`. README → Breakpoints.

### Changed

- **`base-contract-check` C1 also catches setting a name the contract doesn't have** —
  `--base-accent-color: #10b981` in CSS, in a `style` attribute or via `style.setProperty(…)`
  does nothing since 2.0.0, and nothing said so. The rename hint names the replacement.
- **`base-contract-check` scans `.html` and `.md` too** (HTML comments stripped), so example pages,
  scaffold templates and docs snippets are checked like the source. A component's default path is
  still `src`; pass the extra folders to include them.

## [2.0.0-rc06] — 2026-10-29 [PUBLISHED]

### Added

- **Loader tokens — one loader for the app and every component:** `--base-loader-icon` (the
  shape, a mask image; default the Lucide loader-circle arc), `--base-loader-rotate` (`1turn`;
  `0` for an SVG that animates itself), `--base-loader-duration` (`0.8s`) and
  `--base-loader-size` (`1.25em`). Every consumer draws it the same way — a mask painted with
  `currentColor` plus a rotate animation — so a theme swaps the loader in one token, and it
  reaches inside shadow roots. Under reduced motion the loader slows to `1.5s` instead of
  stopping; its duration is the one exception to the four motion speeds. README → Loader;
  `demo/loader.html`; `e2e/loader.spec.ts` checks the default spinner, a self-animating sine
  wave (CSS and SMIL inside the SVG), the shadow-root swap and reduced motion in Chromium,
  Firefox and WebKit.

- **Drop target — `--base-drop-target-bg` / `-bg-active` / `-border-color`:** one look for
  everything you can drop onto (tree rows, dropzones, grid column reorder, pure-admin's file
  dropzone). Derived from the success role (`--base-success-bg-subtle`, `-bg-subtle-hover`,
  `--base-success-color`), so a drop target is told apart from the primary-tinted selection at a
  glance; a theme restyles drops here alone. Consumers today borrow the primary tint or mix their
  own 5–28% — they move to these. `demo/drop-target.html`.
- **`--base-tree-indent: 1.6`** — indent per tree level (16px at 10px rem base), unitless like the
  spacing scale. One value for web-treeview / svelte-treeview (`--*-indent-size`), the web-grid
  tree column (`--wg-tree-indent`, 20px today) and the web-multiselect tree (12px today).
- **`--base-scroll-behavior`** — programmatic scrolling (scroll into view, wheel / rolling
  pickers): `smooth`, `auto` (instant) under reduced motion. Used as CSS `scroll-behavior`, or read
  in JS and passed as `behavior` to `scrollTo` / `scrollIntoView` (web-daterangepicker, web-grid,
  web-multiselect, both treeviews).
- **`base-contract-check` knows reduced motion:** a read inside `@media (prefers-reduced-motion:
  reduce)` must fall back to the contract's value in that block (`var(--base-loader-duration,
  1.5s)`, `var(--base-duration-fast, 0s)`); outside it, the normal default. Before, the reduced
  fallback was a C2 error.
- **Reduced motion:** under `prefers-reduced-motion: reduce` the four `--base-duration-*`
  tokens are `0s`, so everything timed by the contract stops animating. Turning motion off
  otherwise is CSS only: `--base-duration-*: 0s` page-wide, or a component's own
  `--<prefix>-transition-*: 0s`. Components use only the four speeds and the `--base-ease-*`
  easings (README → Motion).

## [2.0.0-rc05] — 2026-10-27 [PUBLISHED]

### Added

- **`testing/parity.mjs` — the contract parity e2e helper** (`import { contractParity } from
  '@keenmate/base-css-variables/testing/parity'`). For a Playwright `page`, renders a
  component's test page standalone and with the contract, in light and dark, and compares every
  color-valued `--<prefix>-*` token; an accent pass checks that the derived fallbacks follow a
  standalone accent override. Catches what the static check can't: formula fallbacks that
  differ from the contract's (first run: web-multiselect's selected tint was 10% in dark mode
  instead of 20%, web-treeview's hover / active were its own mixes). README → "Parity test".

### Changed

- **Default primary is blue-500 `#3b82f6`** (was Corporate's sky `#0ea5e9`). Sky read too light
  as text and on its own tint, and its derived text (`--base-primary-text-color`) turned
  teal-grey; blue keeps a clear hue in every step. White stays the text on the fill (APCA).
  Everything derived from `--base-primary-color` follows (hover / active, tints, selected /
  focused item states, input focus border and halo). The rest of the default theme stays
  Corporate. pure-css mirrors the default (`$base-primary-color`); components' standalone
  fallbacks follow it (`base-contract-check` C2 flags the old value).
- **C3 also checks formula fallbacks of contract aliases:** a token the contract defines as an
  alias (`--base-selected-bg: var(--base-primary-bg-subtle)`) must fall back through the aliased
  token (or one it aliases in turn); a formula of its own drifts when the target changes.

### Fixed

- **`base-contract-check` did nothing when run through a symlink** (`npm link`, a folder
  install, pnpm): the "run as CLI" guard compared the link path with the real file, so it
  exited 0 without checking. It resolves the real path now.
- **The check compared numbers as text:** `cubic-bezier(0.4, 0.0, 0.2, 1)` and `(0.4, 0, …)` were
  reported as different. Numbers now compare by value.

## [2.0.0-rc04] — 2026-10-25 [PUBLISHED]

### Added

- **`base-contract-check` — a component checks itself against the contract.** Components read
  `var(--base-*, fallback)`, so a renamed token or a drifted fallback failed silently (e.g.
  web-multiselect's sky accent with the old `#2563eb` hover, primary-as-text falling back to the
  raw accent). The package now ships `bin/check-contract.mjs` (`npx base-contract-check src`),
  meant as a component **devDependency**, run in its build. Rules: C1 every `--base-*` read
  exists (renamed / removed names say what to use); C2 an input's fallback equals the contract
  default, per mode; C3 a derived token's fallback is a formula on the component's own tokens,
  not a literal. Component-token fallbacks are followed to their declaration; deliberate
  differences go in the component's `contract-check.json` with a reason. Also importable as
  `@keenmate/base-css-variables/check`. README → "Checking a component against the contract".
- **`renames.json`** — every removed / renamed `--base-*` name since 1.x with its replacement
  and version (shipped; read by the check).
- Unit tests for the check (`npm run test:check`, `node:test`; part of `npm test`).

## [2.0.0-rc03] — 2026-10-20 [PUBLISHED]

### Changed — breaking

- **Item state `highlighted` is now `selected`; the checkbox state is `checked`.** "Highlighted"
  read like hover or emphasis, and the word meant three things across the stack. The Explorer
  model now reads: *focused* = the one cursor item, *selected* = the click / Ctrl / Shift-click
  set (0..n), *checked* = the ticked checkbox (drawn by the checkbox only, no row tokens);
  pointer hover stays `--base-hover-bg`. Renamed, no aliases: `--base-highlighted-bg` →
  `--base-selected-bg`, `-bg-hover`, `-text-color`, `-outline` likewise. The checkbox icon
  comments say *checked*. Mirrored in `@keenmate/pure-css` (`$base-selected-*`); web-multiselect
  2.6.0-rc02 reads the new names; web-treeview and svelte-treeview follow (their CSS, and their
  `selectedPaths` / `highlightedPaths` API).

### Added

- **Every role has the same seven tokens.** The role set had grown by request: primary had
  `-color-active` and `-bg-subtle-hover`, secondary had only `-color-hover`, the status roles had no
  pressed step — so a component drawing a pressed danger button had to invent one, and it would not
  match pure-admin's. Now primary, secondary, success, danger, warning and info all have `-color`,
  `-color-hover`, `-color-active`, `-bg-subtle`, `-bg-subtle-hover`, `-text-color` and
  `--base-on-<role>-text-color`. New, all derived (a theme sets nothing more):
  `--base-<success|danger|warning|info>-color-active` and `-bg-subtle-hover`,
  `--base-secondary-color-active`, `--base-secondary-bg-subtle(-hover)`, and
  `--base-primary-text-color` / `--base-secondary-text-color` — the fill 45% toward black (light) /
  25% toward white (dark), ≥ 4.5:1 on the main surface by default. The status roles keep their
  hand-set `-text-color`. Mirrored in `@keenmate/pure-css` (`$base-*`).
- **`--base-disabled-opacity: 0.65`** — one fade for every disabled control, whatever its role
  (pure-css `$opacity-disabled`). Disabled is not a role step, so there are no per-role disabled
  colours.

### Changed

- **Placeholders use text step 3.** `--base-input-placeholder-color` was `var(--base-text-color-4)`,
  the faint step — about 2.1–2.5:1 on the input background in most themes, too faint for a hint you
  are meant to read. It is now `var(--base-text-color-3)` (about 3–7:1 across the pure-admin
  themes), the same tone as the field's own icons (`--base-input-icon-color`), and still clearly
  lighter than typed text. Step 4 is now described as "disabled, decorative" and step 3 takes
  placeholders and hints. Visible change: every placeholder gets darker. Mirrored in
  `@keenmate/pure-css` (`$base-input-placeholder-color`).
- **Text on fills is derived: black or white, whichever reads better by APCA.** The 15
  `--base-on-<role>-text-color` / `--base-on-palette-N-text-color` tokens were hand-set inputs,
  almost all `#ffffff`, and most fills are bright (sky blue, emerald, amber, cyan, pink): white on
  amber was 2.1:1. They now derive from their fill in the derived block, so a fill changed at
  runtime or in a `.base-scope` brings its text along. The pick uses APCA (the perceptual contrast
  model of the WCAG 3 draft), not the WCAG 2 ratio: WCAG 2 favours black on bright saturated
  mid-tones such as sky blue and pink, where white reads better. Across the contract and the 16
  pure-admin themes (510 text/fill pairs) no pair is below Lc 45 any more (today 8, a WCAG 2 pick
  would leave 68); the trade-off is that 141 pairs stay below the WCAG 2 ratio of 4.5:1 (today
  155). It is computed in CSS — APCA's luminance, with `c^2.4` as a polynomial because Firefox has
  no `pow()` on colour channels, constants rounded to 2 digits — and matches exact APCA except
  where black and white differ by less than 1 Lc. Fills near the tie point (default success, info: within 5 Lc) can be hand-set
  with a plain value. Visible change in the default: success, warning, info and palette 1 / 3 get
  black text; primary, secondary, danger and palette 2 / 4–9 keep white. Mirrored in
  `@keenmate/pure-css`.
- **Four default fills one shade darker,** so their white text also passes the WCAG 2 ratio:
  danger `#ef4444` → `#dc2626`, palette 5 violet `#8b5cf6` → `#7c3aed`, palette 6 indigo
  `#6366f1` → `#4f46e5`, palette 8 Corporate blue `#0284c7` → `#0369a1` (white 4.8 / 5.7 / 6.3 /
  5.9:1, Lc 77–86). Themes keep their own fills.
- Hover / active fills keep the resting fill's text colour, so a fill near the tie point can read
  weaker while hovered or pressed (see `demo/fill-states.html`).

## [2.0.0-rc02] — 2026-10-16 [PUBLISHED]

### Added

- **Input focus halo.** `--base-input-shadow-color-focus` (5% of `--base-primary-color`) and
  `--base-input-box-shadow-focus` (`0 0 0 3px` of it) give the soft glow around a focused field
  its own tokens, so it no longer borrows the `--base-primary-bg-subtle` fill tint — which
  themes set much stronger (e.g. 25% in a dark theme) and which made the halo heavy. Fields in
  pure-admin and the components read the same tone; a component with a different halo size
  composes its own `box-shadow` from the color token.

### Changed

- **Control outlines are no longer the divider.** `--base-input-border-color` was
  `var(--base-border-color)` — a hairline meant for card and table edges, about 1.2–1.9:1 against
  the surface, so inputs, checkboxes and outline (secondary) buttons almost disappeared in some
  themes. It is now `--base-text-color-1` mixed 45% (light) / 35% (dark) into `--base-main-bg`
  (about 2–3.4:1 across the pure-admin themes), and `--base-checkbox-border-color` follows it. `--base-border-color` stays the quiet divider.
  Visible change: every form's field outlines get darker.

## [2.0.0-rc01] — 2026-10-15 [PUBLISHED]

A breaking cleanup of the color contract: one name per concept, names that state their
type, one tint per role, and derived tokens that follow their source at runtime. No aliases —
rename overrides per the table below. Mirrored in `@keenmate/pure-css` (`$base-*` / `--pc-*`)
and its consumers.

### Changed

- **The contract is derived: a few inputs, everything else calculated.** Hand-set inputs are
  `--base-main-bg`, `--base-page-bg`, `--base-text-color-1`, the role colors, role text colors,
  "text on a fill" colors, overlay, shadow color and palette. The rest are formulas: text levels
  2–4 mix text-color-1 into main-bg (75 / 55 / 40%); `subtle` / `elevated` / `disabled` /
  `border-color` shift the background's own hue in lightness (OKLCH relative colors — darker in
  light mode, 2× lighter in dark mode); `hover` / `active` are translucent overlays of that hue
  (visible on any surface); role `-hover` / `-active` mix the role color with black (light) /
  white (dark); tooltip is always dark. Fixes the dark-mode collisions where hover, elevated,
  disabled and input shared one hex and faint text equalled the border color. Values move slightly
  from the hand-tuned Corporate slate; any derived token can still be hand-set (a plain value
  replaces the formula) — pure-admin themes keep their own values. Requires relative color syntax
  (Chrome/Edge 119+, Safari 16.4+, Firefox 128+).
- **Derived tokens recalculate in re-themed scopes:** the derived block is declared on
  `:root, [data-theme], .base-scope`, so setting inputs on such an element re-derives everything
  inside it.
- **BREAKING: `accent` → `primary` — one brand role.** Accent and primary were the same color
  everywhere (primary button, focus, selection, checked state, links); `primary` matches the role
  set (secondary, success, danger, warning, info). The `--base-primary-*` aliases are gone — the
  primary tokens are now the real ones. Component tokens (`--ms-accent-color`, …) keep their names.
- **BREAKING: names state their type.** A token ends in what it is — `-color`, `-bg`, or the CSS
  shorthand it feeds (`-border`, `-outline`). `-text` alone (color? size? weight?) and `-ring`
  (not a CSS property) are gone.
- **BREAKING: palette slots are `--base-palette-1…9`** (were `--base-color-N`, which read like a
  ranked scale next to `--base-text-color-1…4`; the number is an ID, not a rank).
- **BREAKING: one role tint** (success, danger, warning, info): `--base-<role>-bg-subtle` is now
  `color-mix` of `--base-<role>-color` (10% light / 20% dark), so it follows a runtime role-color
  override. pure-admin-core now reads it (labels, toasts, statistics, callouts, validation glow)
  instead of a private copy, and web-grid's invalid-cell tint reads it.
- **The primary tint follows the role-tint pattern.** `--base-primary-bg-subtle` is now 10% light /
  20% dark (was a fixed 5%), `-hover` 15% / 30% (was 8%). It is the generic primary tint (badges,
  chips, soft fills — not row selection, which is `--base-highlighted-bg`). pure-css's
  `--pc-primary-bg-subtle[-hover]` now read it, so pure-admin and the web components share one value
  (before, pure-admin used a private 5% and ignored the theme's value).
- **The dropdown shadow follows `--base-shadow-color`**, which is now mode-aware (15% black light /
  40% dark): `--base-dropdown-box-shadow: 0 8px 16px var(--base-shadow-color)`. Same look; a
  shadow-color override now reaches the dropdown.
- **Input icons:** the clear-button tokens now cover every icon inside an input (clear ✕,
  chevron, calendar, search).
- **Derived tokens follow their source.** Pasted copies are now `var()` of the token they copy:
  `--base-border`, `--base-input-border-color`, `--base-input-border`, `--base-dropdown-border`,
  `--base-checkbox-border-color` (← `--base-border-color`); `--base-input-border-hover` / `-focus`
  (← `--base-primary-color`, were a hard-coded `#0ea5e9`); `--base-input-text-color`
  (← `--base-text-color-1`); `--base-input-icon-color` (← `--base-text-color-3`);
  `--base-dropdown-bg` (← `--base-main-bg`). Same values; an override of the source now cascades.
- **Text-level descriptions corrected** (comments / README): `--base-text-color-1` is the primary
  (default body) text, `-2` secondary/muted, `-3` tertiary (icons, metadata), `-4` faint (hints,
  placeholders, disabled).

#### Rename table

| 1.0.x | 2.0.0 |
|---|---|
| `--base-accent-color` / `-hover` / `-active` | `--base-primary-color` / `-hover` / `-active` |
| `--base-accent-color-light` / `-light-hover` | `--base-primary-bg-subtle` / `-bg-subtle-hover` |
| `--base-text-color-on-accent`, `--base-text-on-primary` | `--base-on-primary-text-color` |
| `--base-text-on-secondary` | `--base-on-secondary-text-color` |
| `--base-text-on-<role>` | `--base-on-<role>-text-color` |
| `--base-<role>-text` | `--base-<role>-text-color` |
| `--base-<role>-bg-light` | `--base-<role>-bg-subtle` |
| `--base-color-N` | `--base-palette-N` |
| `--base-color-N-text` | `--base-on-palette-N-text-color` |
| `--base-ring-width` | `--base-outline-width` |
| `--base-highlighted-ring` / `--base-focused-ring` | `--base-highlighted-outline` / `--base-focused-outline` |
| `--base-highlighted-text` / `--base-focused-text` | `--base-highlighted-text-color` / `--base-focused-text-color` |
| `--base-input-color` | `--base-input-text-color` |
| `--base-input-clear-color` / `-clear-bg-hover` | `--base-input-icon-color` / `-icon-bg-hover` |
| `--base-tooltip-color` | `--base-tooltip-text-color` (was a duplicate) |

### Removed

- **BREAKING: `--base-<role>-bg`** (success, danger, warning, info) — a pasted copy of `-color`,
  so overriding the role color left the fill behind. Use `--base-<role>-color`.
- **BREAKING: `--base-<role>-text-light`** — nothing read it, and its meaning flipped between
  modes (a pale tint in light, a vivid color in dark).
- **BREAKING: `--base-<role>-border`** — nothing read it (alerts use their own border token).
- **BREAKING: the `--base-primary-*` aliases** of accent (primary is now the real token).
- **BREAKING: `--base-inverse-bg` and `--base-inverse-text-color`** (was `--base-text-inverted`).
  Components only used `--base-inverse-bg` as a second fallback behind `--base-tooltip-bg`, which is
  always defined, so it never applied; nothing read the text color. The tooltip has its own
  `--base-tooltip-bg` / `--base-tooltip-text-color` pair.

## [1.0.7] — 2026-10-14 [PUBLISHED]

### Added

- **Item-state tokens: `--base-highlighted-bg` / `-bg-hover` / `-text` / `-ring` and
  `--base-focused-bg` / `-text` / `-ring`, plus `--base-ring-width`.** One shared look
  for list options, tree rows and grid rows, so a selected web-multiselect option and a
  highlighted svelte-/web-treeview row on the same page match, and one override
  re-themes all of them. Follows the Explorer model: *focused* = the one cursor item,
  *highlighted* = the Ctrl/Shift-click set, *selected* = checkbox-checked (shown by the
  checkbox only — no row tokens; with no checkboxes, highlighted is the selection).
  Defaults: highlighted = accent at 10% (no ring); focused = transparent bg + a
  `1px solid` accent ring. The `*-ring` tokens are outline shorthands drawn inset by
  consumers via `outline-offset: calc(-1 * var(--base-ring-width))`; the ring
  width is its own token (default `1px`, composed into `--base-focused-ring`) so a
  thicker ring keeps the inset offset in step instead of spilling outside the row.
  Mirrored in `@keenmate/pure-css`.

- **Item-states demo + e2e suite (repo-only, not shipped).** `npm run demo` serves
  `demo/item-states.html` — the Explorer model (focused / highlighted / selected), live
  token controls, a reference list implementing the contract, and the local
  web-treeview + web-multiselect builds reading the same tokens. `npm run test:e2e`
  (Playwright) locks the defaults, the interaction model, the inset-ring-tracks-width
  rule, and that both components render the same look as the reference.

### Changed

- **Checkbox render method is now a SINGLE `calc`-all path; `transform` demoted to
  a documented last resort (doc-only — no token change).** The 1.0.6 README still
  listed `transform: scale()` as the right tool when the border must thicken
  proportionally with a scaled box. It isn't: scaling `border-width` and
  `border-radius` with `calc(... * var(--base-checkbox-scale))` — exactly as the box
  itself is scaled — keeps them proportional *and* layer-free, so the mask glyph
  never pixel-snaps. There is therefore no situation where transform is correct; the
  README now documents one canonical method (box + border + radius all via `calc`)
  and flags transform as a legacy-only fallback. The canonical snippet also pins
  `box-sizing: border-box` so the declared size is the rendered outer size — a
  native `<input type=checkbox>` already defaults to it, so a component using a
  custom `<span>` box (content-box) would otherwise render ~2×border larger than a
  component using the native input. Adopters (svelte-treeview, web-multiselect)
  updated to scale border-width + radius via `calc` and to pin `border-box`.

## [1.0.6] — 2026-10-03 [PUBLISHED]

### Added

- **A `--base-checkbox-scale` token — the scale of the checkbox BOX (default
  `1`), plus a documented canonical render method.** One knob every component with
  a checkbox reads, so a theme resizes all of them in lockstep. The method sizes
  the box with `calc(<base-size> * var(--base-checkbox-scale))` and the tick/dash
  glyph with `--base-icon-check-size`, and applies **no CSS transform**: a
  `transform: scale()` promotes the box to its own compositing layer, which
  pixel-snaps the fractionally-positioned mask glyph and shifts the mark
  off-centre — inconsistently from row to row. Scaling the box directly keeps the
  mark crisp at every scale. See README → "Checkbox render method" for the
  reference snippet and the per-situation method table. `pure-css` to mirror it as
  `$base-checkbox-scale`.

## [1.0.5] — 2026-09-20 [PUBLISHED]

### Added

- **A `--base-icon-check-size` token — the mask-size for the selection glyph
  inside its box (checkbox / tree-node).** One knob every consumer reads, so
  overriding the glyph *and* its scale re-sizes the selection mark everywhere in
  lockstep. Default `68%` leaves breathing room around the tick; a glyph that
  fills its viewBox edge-to-edge (e.g. a star) can be shrunk from here without
  touching each component. Also sizes the indeterminate mark, since it shares the
  same mask box. `pure-css` mirrors it as `$base-icon-check-size` and re-emits it
  (parity green).

## [1.0.4] — 2026-09-18 [PUBLISHED]

### Added

- **A `--base-list-bullet-type` token — the default marker for `ul, ol`.**
  Mode-invariant single value (default `disc`; also `circle` / `square` / `none` /
  `decimal` / …), added to the TYPOGRAPHY block. Consumers read it on their base
  list reboot with an inline `disc` fallback, so overriding it re-marks every
  default list at once. `pure-css` mirrors it as `$base-list-bullet-type`,
  re-emits it (parity green), and layers its per-instance `--pc-list-bullet-type`
  knob over it (`var(--pc-list-bullet-type, var(--base-list-bullet-type, disc))`).
- **Three action / navigation icon tokens: `--base-icon-download`,
  `--base-icon-link`, `--base-icon-external-link`.** Mask-friendly Lucide glyphs —
  `download` (tray + down arrow) for save-to-disk / export, `link` (chain) for
  hyperlink / attach-URL, `external-link` (diagonal arrow-out-of-box) for links
  that open in a new tab / leave the app. Consumed by pure-admin's
  `--pa-icon-download`, `--pa-icon-link`, and `--pa-icon-external-link` (which fell
  back to inline glyphs until these landed). `pure-css` mirrors all three as
  `$base-icon-*` and re-emits them (parity green).

## [1.0.3] — 2026-09-16 [PUBLISHED]

### Added

- **Three affordance icon tokens: `--base-icon-settings`, `--base-icon-bell`,
  `--base-icon-user`.** Mask-friendly Lucide glyphs — `settings` (cog / gear) for
  preferences / config, `bell` for the notification bell, `user` (person) for the
  profile trigger / avatar placeholder. Consumed by pure-admin's
  `--pa-icon-settings` (settings-panel toggle), `--pa-icon-bell` (navbar
  notification bell), and `--pa-icon-user` (navbar profile button). `pure-css`
  mirrors all three as `$base-icon-*` and re-emits them (parity green).
- **Four status / severity icon tokens: `--base-icon-info`,
  `--base-icon-success`, `--base-icon-warning`, `--base-icon-danger`.**
  Mask-friendly Lucide glyphs — `info` = circle-i, `success` = circle-check,
  `warning` = triangle-alert, `danger` = circle-x. One shared family so every
  severity surface (toasts, alerts, callouts, notifications) shows the SAME mark;
  consumed by pure-admin's `--pa-icon-info` / `-success` / `-warning` / `-danger`.
  `pure-css` mirrors all four as `$base-icon-*` and re-emits them (parity green).

## [1.0.2] — 2026-09-15 [PUBLISHED]

### Added

- **Four new mask-friendly Lucide icon tokens: `--base-icon-refresh`,
  `--base-icon-copy`, `--base-icon-ellipsis`, `--base-icon-save`.** `refresh`
  (two curved arrows, refresh-cw) for reload / re-fetch — consumers spin it with a
  CSS animation while a refresh is in flight; `copy` (two overlapping sheets) for
  copy-to-clipboard; `ellipsis` (three dots) for the "more / overflow" affordance —
  the vertical `⋮` variant is the same glyph rotated 90°, so no separate token — and
  `save` (floppy disk) for persist/commit. Completes the affordance set
  `@keenmate/pure-admin` migrated off Font Awesome; `pure-css` mirrors all four as
  `$base-icon-*` and re-emits them (parity guard green).

## [1.0.1] — 2026-09-12 [PUBLISHED]

### Added

- **Three new mask-friendly Lucide icon tokens.** `--base-icon-filter` (funnel) for filter
  affordances, plus the checkbox/tree-node selection state pair `--base-icon-check` (SELECTED —
  a tick) and `--base-icon-indeterminate` (PARTIALLY selected — the tri-state parent state).
  Selection stays a distinct knob from disclosure (`--base-icon-expand`/`--base-icon-collapse`),
  so one can be retargeted without moving the other. `@keenmate/pure-css` already mirrors all
  three as `$base-icon-*`.

## [1.0.0] — 2026-09-10

The **canonical `--base-*` contract** release. `base-variables.css` is LAYER 0 — the single
source of truth every Keenmate consumer derives from. `@keenmate/pure-css` mirrors this exact
token list into SCSS (`$base-*`), and the web components read `--base-*` directly, so overriding
one `--base-*` re-themes pure-admin **and** the web components together.

### Added

- **Complete `--base-*` contract superset.** `base-variables.css` now carries the full token
  vocabulary every consumer reads — accent/primary + secondary roles, the surface elevation
  ladder (`page` < `subtle` < `main` < `elevated`, plus `hover`/`active`/`disabled` states),
  the text hierarchy (`--base-text-color-1..4`, `--base-text-on-*`, `--base-text-inverted`),
  borders, input fields, dropdown/popover, tooltip, the four status roles
  (success/danger/warning/info) in the `-color`/`-bg`/`-text`/`text-on-*` model, typography,
  sizing and spacing multipliers, the shadow/motion/z-index scales, mask-friendly Lucide icons,
  and the 1–9 brand palette slots.
- **Light/dark via CSS `light-dark()`.** Mode-variant colors resolve against `color-scheme`;
  `:root` opts into `color-scheme: light dark` (OS-driven), and `[data-theme="light"|"dark"]`
  forces a mode on a subtree. Mode-invariant tokens (icons, scales, multipliers, palette) stay
  single values.

### Changed

- **Default theme rebased onto pure-admin "Corporate"** (sky-blue `#0ea5e9` accent, slate
  surfaces, cyan info), with light and dark values paired through `light-dark()`.
