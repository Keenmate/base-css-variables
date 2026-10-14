# Changelog

All notable changes to `@keenmate/base-css-variables` are documented here. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
