# @keenmate/base-css-variables

The shared `--base-*` token contract behind pure-admin and every Keenmate web component.

## What is it

The shared **base layer** of CSS custom properties (`--base-*`) used by all
Keenmate web components — [web-multiselect](https://www.npmjs.com/package/@keenmate/web-multiselect),
[web-daterangepicker](https://www.npmjs.com/package/@keenmate/web-daterangepicker),
[web-grid](https://www.npmjs.com/package/@keenmate/web-grid), web-dropzone, web-treeview,
svelte-treeview — and by [`@keenmate/pure-css`](https://www.npmjs.com/package/@keenmate/pure-css) /
`@keenmate/pure-admin-core`, so an app and the components inside it share one theme.

Each component ships its own prefixed variables (`--ms-*`, `--drp-*`, `--wg-*`, …)
that **cascade from these `--base-*` values**. Define the base layer once and every
component picks up a consistent, coordinated theme. Override a single `--base-*`
variable and the change propagates everywhere.

## What's New in v2.0.0

- **Release — 2.0.0 is final** — the same contract as rc08, now installed by default. Upgrading from 1.x is breaking: overrides that use 1.x names are silently ignored, see [Upgrading from 1.x](#upgrading-from-1x) below and `renames.json`.
- **Contract — a few inputs, everything else derived** — a theme sets the surfaces, `--base-text-color-1`, the role colors and the palette; hover / active steps, tints, text levels and text on fills (`--base-on-<role>-text-color`, black or white by APCA) are calculated, and recalculate inside `[data-theme]` / `.base-scope`.
- **Names — renamed without aliases** — `--base-accent-color` → `--base-primary-color`, names end in their type (`--base-input-text-color`), `--base-color-N` → `--base-palette-N`, item state `highlighted` → `selected`.
- **Roles — the same seven tokens for every role** — `-color`, `-color-hover`, `-color-active`, `-bg-subtle`, `-bg-subtle-hover`, `-text-color`, `--base-on-<role>-text-color`; one `--base-disabled-opacity`. Default primary is blue-500 `#3b82f6`.
- **New tokens — loader, drop target, tree indent, scroll behavior, breakpoints** — `--base-loader-*`, `--base-drop-target-*`, `--base-tree-indent`, `--base-scroll-behavior`, `--base-breakpoint-mobile` / `-tablet`.
- **Motion — four speeds and `data-motion` levels** — `--base-duration-*` + `--base-ease-*`, `none | snappy | smooth`; the OS reduced-motion setting wins over every level.
- **Tooling — `base-contract-check` and `testing/parity.mjs`** — components check their `--base-*` reads, sets and fallbacks at build time and compare their colors with and without the contract in e2e.

## What's New in v2.0.0-rc08

- **Motion — levels with `data-motion="none | snappy | smooth"`** — on any element (`<html>`, a section, a component) a level sets the four `--base-duration-*` speeds and `--base-scroll-behavior` for everything inside it, and the nearest one wins. `none` is `0s` with instant scrolling, a shortcut for turning motion off (setting the durations to `0s` in CSS still works). `snappy` is 0.05 / 0.08 / 0.12 / 0.15s and `smooth` is 0.15 / 0.25 / 0.35 / 0.45s. Components built on web-components-core get the same levels through their `motion` attribute and `window.components.motion`. The loader isn't affected.
- **Motion — the OS reduced-motion setting beats every level** — `prefers-reduced-motion: reduce` now also zeroes the speeds on every `[data-motion]` element, so it wins even inside `smooth`.
- **Tooling — `base-contract-check` ignores `setProperty` names built at runtime** — ``setProperty(`--base-icon-${key}`, …)`` was reported as setting the unknown token `--base-icon-`.

## Demos & docs

- **Examples site** — one page per feature, live with web-multiselect and web-treeview; in the
  [GitHub repo](https://github.com/Keenmate/base-css-variables) (`make dev` → http://localhost:15300).
  Tour: [docs/examples.md](docs/examples.md).
- [docs/usage.md](docs/usage.md) — loading the stylesheet, how the tokens are organised, and
  `base-contract-check` / the parity test for components.
- [docs/theming.md](docs/theming.md) — overriding tokens, inputs vs derived tokens, re-theming part of a
  page, light / dark, and the pure-css → pure-admin layer pipeline.
- [docs/variables.md](docs/variables.md) — the complete `--base-*` reference.
- [docs/examples.md](docs/examples.md) — the examples site and the shared checkbox render method.
- [docs/accessibility.md](docs/accessibility.md) — contrast, focus and motion.

## Install

```bash
npm install @keenmate/base-css-variables
```

## Quick start

Import the stylesheet once, as early as possible (before the component styles):

```js
import '@keenmate/base-css-variables/base-variables.css';
```

then override any input — every component and pure-admin follow:

```css
:root {
  --base-primary-color: #e11d48;   /* rebrand every component's primary color */
}
```

More ways to load it and every token: [docs/usage.md](docs/usage.md),
[docs/variables.md](docs/variables.md).

## Browser support

The derived tokens use `light-dark()`, `color-mix()` and relative color syntax (`oklch(from …)`) —
Chrome / Edge 119+, Safari 16.4+, Firefox 128+.

## Upgrading from 1.x

2.0 renamed and removed tokens **without aliases**: an override that still uses a 1.x name
(`--base-accent-color`, `--base-color-3`, `--base-success-bg`, …) is silently ignored and the
default shows instead. Rename overrides with the table in the
[CHANGELOG](./CHANGELOG.md) (2.0.0-rc01 → *Rename table*), and upgrade the components together with
this package — each one reads the 2.0 names from its matching release.

## Related

- [`@keenmate/theme-designer`](https://github.com/keenmate/theme-designer) — visual
  theme designer & generator that produces `--base-*` values from 3 input colors.
  *Not yet updated for 2.0* — it still emits the 1.x names.

## About

Authored and maintained by [Keenmate s.r.o.](https://keenmate.com/). The `--base-*` contract is what
lets Keenmate components ship standalone with sensible light/dark defaults and still adopt the host's
colors, typography, and sizing automatically: mounted inside [Pure Admin](https://pureadmin.io/) — or
any host that publishes the `--base-*` taxonomy via this package or
[`@keenmate/theme-designer`](https://www.npmjs.com/package/@keenmate/theme-designer) — they follow the
host's theme. There is no runtime dependency on Pure Admin; the integration is opt-in via CSS variables.

## Built with BlissFramework

This package follows the [BlissFramework](https://blissframework.dev/) web-component guidelines.

## License

MIT © Keenmate s.r.o.
