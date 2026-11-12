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

## What's New in v2.0.2

Upgrade guide: the [2.0.2 release notes](release-notes/2.0.2.md); full list: the
[CHANGELOG 2.0.2 section](CHANGELOG.md).

- **Token — `--base-touch-target-min` sets the minimum tap size on touch** — a new `44px` token for the smallest tappable size in a component's phone / coarse-pointer view: option rows, the close / Done button and icon-only buttons. Until now each component chose its own touch sizing, so the same app could have rows of different heights. Components now use the token as a floor (`min-height` / `min-width: var(--base-touch-target-min, 44px)`), so one override changes every component's tap size. 44px is the Apple HIG minimum and the WCAG 2.5.5 target size, and rulebook check C-RO-7 expects components to read this token. It's plain `px` like the breakpoints, not a rem multiplier. pure-css mirrors it as `$base-touch-target-min`.
- **Examples — live demos for the two new sizing tokens** — the Sizing page has two new chapters. SZ04 · Dropdown offset places a dropdown and a calendar panel the way a component does, reading `--base-dropdown-offset` in JS; a slider and presets (0 / 4 / 8px) set the token on the demo only, and a marker shows the gap. SZ05 · Touch target puts a dense desktop list next to a phone sheet whose rows and close button are sized by `--base-touch-target-min`; presets (44 / 48px) set the token, and each row shows its measured height.

## What's New in v2.0.1

- **Token — `--base-dropdown-offset` sets the gap between a field and its panel** — a new `4px` token for the distance between a field's bordered box and the panel it opens: dropdowns, calendar popovers and other anchored popovers. Until now each component hard-coded its own gap: web-multiselect used 4px and the web-daterangepicker calendar used 8px, so the same form had two different gaps. Components read the token in JS (`getComputedStyle` → `parseFloat`) and pass it to web-components-core's positioning as `offset`, so one override moves every panel together. It's plain `px` like the breakpoints, not a rem multiplier. Tooltips keep their own spacing. pure-css mirrors it as `$base-dropdown-offset`.
- **Docs — the README is a landing page and the reference lives in `docs/`** — the contract is unchanged; only where things are documented moved. `docs/usage.md` covers loading the stylesheet, how the tokens are organised, and `base-contract-check` / the parity test. `docs/theming.md` covers overrides, inputs vs derived tokens, `.base-scope` and the layer pipeline. `docs/variables.md` is the full `--base-*` reference, and `docs/examples.md` and `docs/accessibility.md` cover the examples site and contrast / focus / motion. All five ship in the npm package, so they're readable from `node_modules` too.

Earlier releases: [CHANGELOG](CHANGELOG.md).

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
