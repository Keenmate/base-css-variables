# Changelog

All notable changes to `@keenmate/base-css-variables` are documented here. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
