# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@keenmate/base-css-variables` is a **single-file, zero-build npm package**: `base-variables.css`
defines the shared `--base-*` CSS custom-property contract consumed by all Keenmate web
components (web-multiselect `--ms-*`, web-daterangepicker `--drp-*`, web-grid `--wg-*`,
web-treeview, …) and by `@keenmate/pure-css` / `@keenmate/pure-admin-core`.

There is no build, lint, or bundle step. Editing the CSS *is* the work; publishing is
`npm publish`. The package ships only `base-variables.css` + `README.md` + `CHANGELOG.md`
+ `LICENSE` (see the `files` field) — the demo and tests below are repo-only.

**Demo + e2e (repo-only, dev-time):** `npm run demo` serves `demo/item-states.html` via the
zero-dependency `demo/serve.mjs` on :12510. The server also mounts the *local* builds of the
sibling repos (`../web-treeview/dist`, `../web-multiselect/dist` → `/vendor/*`) so the page
shows real components reading this checkout's tokens. `npm run test:e2e` (Playwright,
`e2e/`) locks the item-state contract against the reference list *and* both components, and
the derivation contract (inputs → derived, `.base-scope`, removed names);
component specs skip when a sibling build is missing — run `npm run build` in those repos
first. One-time: `npm run test:e2e:install`. Makefile wrappers: `make setup` (deps + chromium +
sibling builds), `make build` (rebuilds the two sibling components — *not* this package),
`make dev`, `make test`, `make test-headed`.

## The core architecture: this file is the canonical contract

`base-variables.css` is the **single source of truth** ("LAYER 0" / the "one knob"). Everything
downstream derives from it and must not define a parallel source of truth:

- `@keenmate/pure-css` **mirrors this exact token list into SCSS** (`$base-*`), adds theme
  derivation + `.pc-mode-*`, and emits each `--pc-*` as `var(--base-*, <fallback>)`.
- `@keenmate/pure-admin-core` builds component tokens on top of `--pc-*`.
- Keenmate web components read `--base-*` directly with inline fallbacks
  (e.g. `--ms-accent-color: var(--base-primary-color, #3b82f6)`).

Because every downstream token is `var(--base-*, …)`, overriding **one** `--base-*` at runtime
re-themes pure-admin *and* the web components together. The README's "layer pipeline" section
traces this end-to-end for the primary color — read it before touching token structure.

**Consequences for any edit:**
- **Do not add a token here that pure-css lacks, or remove/rename one it mirrors, without keeping
  pure-css in sync.** The two lists must match. This constraint is stated at the top of the CSS file.
- Naming is intentionally **not 1:1** with component variables (`--ms-primary-bg` reads
  `--base-hover-bg`; `--drp-primary-bg` reads `--base-main-bg`). Don't "fix" a name to match a consumer.
- When you add/change/remove a `--base-*` token, update the **Variable reference tables in
  README.md** to match — they are hand-maintained documentation, not generated.

## Token conventions (follow the existing patterns)

- **Default theme is pure-admin "Corporate"** (sky-blue `#0ea5e9` primary, slate surfaces, cyan info).
  Light values = Corporate light mode, dark = Corporate dark mode.
- **Inputs vs derived (2.0.0):** `:root` holds the hand-set INPUTS (main/page bg, text-color-1,
  role colors, role text colors, overlay, shadow color, palette) plus the
  non-color tokens. Every token calculated from another lives in the second block,
  `:root, [data-theme], .base-scope { … }` — formulas (`color-mix`, OKLCH relative colors), so a
  re-themed scope recalculates. A new derived token goes there, never as a pasted literal.
  `demo/derived.html` compares the formulas against the compiled pure-admin themes;
  `demo/fill-states.html` shows text on fills (WCAG 2 vs APCA pick) and button hover / press states.
- **What belongs here (three categories):** INPUTS = what a theme decides (keep few);
  DERIVED = shared formulas for anything more than one consumer asks (hover / active steps,
  tints, text levels, text on fills…) — free to grow, a theme never sets them; COMPONENT tokens =
  one component's design choices (button state fill / text / border, variants) — they stay in the
  component (`--pa-btn-*`, `--drp-button-apply-*`) and default to the contract. Promote a
  component token into the contract (as a derived default) when a second consumer draws the same
  thing. Don't add per-state button tokens here. README "What belongs in the contract".
- **Light/dark** is done with CSS `light-dark()`, driven by `color-scheme`. `:root` sets
  `color-scheme: light dark` (auto/OS). `[data-theme="light"|"dark"]` blocks force a mode on a
  subtree. Mode-invariant tokens (icons, spacing/shadow/motion/z-index scales, typography
  multipliers, brand palette slots) are plain single values, not `light-dark()`.
- **Unitless multipliers:** font sizes, radii, input heights, and the spacing scale are stored as
  bare numbers, combined by consumers as `calc(var(--base-…) * var(--base-rem))` (`--base-rem: 1rem`).
  Keep new sizing tokens unitless to match.
- **Aliases** point back via `var()`: `--base-icon-clear`/`-remove` follow `--base-icon-close`.
  2.0.0 removed the `accent` ↔ `primary` pair — `primary` is the only name.
- **Role color model** (primary/secondary/success/danger/warning/info): `-color` = vivid fill
  identity (also the solid fill); `-color-hover`/`-active` = darker steps; `-bg-subtle` = the one
  tint (a `color-mix` of `-color`, so it follows it); `-text-color` = role as foreground on a
  light surface; `--base-on-<role>-text-color` = readable text *on* the fill (derived: black or
  white by APCA contrast, so it follows the fill). Derive from the
  source token with `var()` / `color-mix()` — never paste its literal.
- **Names state their type (2.0.0):** a token ends in what it is — `-color` (any color value),
  `-bg` (background color), or the CSS shorthand it feeds (`-border`, `-outline`, `-box-shadow`),
  e.g. `--base-input-text-color`, not `--base-input-text`. Item states are `-bg` / `-text-color` /
  `-outline`; `-outline` tokens are drawn inset by `--base-outline-width`.
- **Surface elevation ladder:** `page` < `subtle` < `main` < `elevated`; `hover`/`active`/`disabled`
  are the interaction-state axis. Role-specific surfaces (`--base-input-bg`, `--base-dropdown-bg`,
  `--base-tooltip-bg`) default into this scale but stay distinct tokens so they can be retargeted alone.
- **Icons** are inline `data:image/svg+xml` (Lucide glyphs), rendered by consumers via
  `mask: var(--base-icon-*); background: currentColor`.

## Related repos

- `@keenmate/pure-css`, `@keenmate/pure-admin-core` — downstream consumers described above.
- `@keenmate/theme-designer` (github.com/keenmate/theme-designer) — generates `--base-*` values
  from 3 input colors.
