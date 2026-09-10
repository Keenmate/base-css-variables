# Changelog

All notable changes to `@keenmate/base-css-variables` are documented here. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
