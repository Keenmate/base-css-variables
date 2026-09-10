# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@keenmate/base-css-variables` is a **single-file, zero-build npm package**: `base-variables.css`
defines the shared `--base-*` CSS custom-property contract consumed by all KeenMate web
components (web-multiselect `--ms-*`, web-daterangepicker `--drp-*`, web-grid `--wg-*`,
web-treeview, …) and by `@keenmate/pure-css` / `@keenmate/pure-admin-core`.

There is no build, test, lint, or bundle step. `package.json` has no `scripts`. Editing
the CSS *is* the work; publishing is `npm publish`. The package ships only
`base-variables.css` + `README.md` (see the `files` field).

## The core architecture: this file is the canonical contract

`base-variables.css` is the **single source of truth** ("LAYER 0" / the "one knob"). Everything
downstream derives from it and must not define a parallel source of truth:

- `@keenmate/pure-css` **mirrors this exact token list into SCSS** (`$base-*`), adds theme
  derivation + `.pc-mode-*`, and emits each `--pc-*` as `var(--base-*, <fallback>)`.
- `@keenmate/pure-admin-core` builds component tokens on top of `--pc-*`.
- KeenMate web components read `--base-*` directly with inline fallbacks
  (e.g. `--ms-accent-color: var(--base-accent-color, #3b82f6)`).

Because every downstream token is `var(--base-*, …)`, overriding **one** `--base-*` at runtime
re-themes pure-admin *and* the web components together. The README's "layer pipeline" section
traces this end-to-end for the accent color — read it before touching token structure.

**Consequences for any edit:**
- **Do not add a token here that pure-css lacks, or remove/rename one it mirrors, without keeping
  pure-css in sync.** The two lists must match. This constraint is stated at the top of the CSS file.
- Naming is intentionally **not 1:1** with component variables (`--ms-primary-bg` reads
  `--base-hover-bg`; `--drp-primary-bg` reads `--base-main-bg`). Don't "fix" a name to match a consumer.
- When you add/change/remove a `--base-*` token, update the **Variable reference tables in
  README.md** to match — they are hand-maintained documentation, not generated.

## Token conventions (follow the existing patterns)

- **Default theme is pure-admin "Corporate"** (sky-blue `#0ea5e9` accent, slate surfaces, cyan info).
  Light values = Corporate light mode, dark = Corporate dark mode.
- **Light/dark** is done with CSS `light-dark()`, driven by `color-scheme`. `:root` sets
  `color-scheme: light dark` (auto/OS). `[data-theme="light"|"dark"]` blocks force a mode on a
  subtree. Mode-invariant tokens (icons, spacing/shadow/motion/z-index scales, typography
  multipliers, brand palette slots) are plain single values, not `light-dark()`.
- **Unitless multipliers:** font sizes, radii, input heights, and the spacing scale are stored as
  bare numbers, combined by consumers as `calc(var(--base-…) * var(--base-rem))` (`--base-rem: 1rem`).
  Keep new sizing tokens unitless to match.
- **Aliases** point back via `var()`: `--base-primary-*` aliases `--base-accent-*` (accent is the
  legacy name, primary the canonical role); `--base-icon-clear`/`-remove` follow `--base-icon-close`.
- **Role/status color model** (success/danger/warning/info): `-color` = vivid fill identity;
  `-bg` = solid fill (equals `-color`); `-bg-light`/`-bg-subtle` = tints; `-border` = border tint;
  `-text` = role as foreground on a light surface; `--base-text-on-<role>` = readable text *on* the fill.
- **Surface elevation ladder:** `page` < `subtle` < `main` < `elevated`; `hover`/`active`/`disabled`
  are the interaction-state axis. Role-specific surfaces (`--base-input-bg`, `--base-dropdown-bg`,
  `--base-tooltip-bg`) default into this scale but stay distinct tokens so they can be retargeted alone.
- **Icons** are inline `data:image/svg+xml` (Lucide glyphs), rendered by consumers via
  `mask: var(--base-icon-*); background: currentColor`.

## Related repos

- `@keenmate/pure-css`, `@keenmate/pure-admin-core` — downstream consumers described above.
- `@keenmate/theme-designer` (github.com/keenmate/theme-designer) — generates `--base-*` values
  from 3 input colors.
