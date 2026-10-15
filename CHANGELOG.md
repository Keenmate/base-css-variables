# Changelog

All notable changes to `@keenmate/base-css-variables` are documented here. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [2.0.0] — 2026-10-14

A breaking cleanup of the color contract: one name per concept, names that state their
type, one tint per role, and derived tokens that follow their source at runtime. No aliases —
rename overrides per the table below. Mirrored in `@keenmate/pure-css` (`$base-*` / `--pc-*`)
and its consumers.

### Changed

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
source of truth every KeenMate consumer derives from. `@keenmate/pure-css` mirrors this exact
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
