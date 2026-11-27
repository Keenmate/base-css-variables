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

## What's New in v2.2.0

Upgrade guide: the [2.2.0 release notes](release-notes/2.2.0.md); full list: the
[CHANGELOG 2.2.0 section](CHANGELOG.md).

- **Token — `--base-rem` is `10px`, so components have the same size on every page** — the size multipliers (font sizes, spacing, radii, field heights) are written in 10px units, so `1.4` means 14px. Until now `--base-rem` was `1rem`, which is 10px only where the root font size is 10px, as in pure-admin. On any other page, loading the contract made every component bigger than intended: 1.6× on the browser's default 16px root, 1.4× on a SharePoint page with a 14px root. The components were already right without the contract, because their own fallback is `10px`. Now the contract agrees with them. pure-admin doesn't change: its root is 10px, so the sizes are identical. To make components follow the browser's font-size setting instead, set `--base-rem: 0.625rem` yourself on a page with a 16px root.

## What's New in v2.1.0

Upgrade guide: the [2.1.0 release notes](release-notes/2.1.0.md); full list: the
[CHANGELOG 2.1.0 section](CHANGELOG.md).

- **Tokens — `--base-container-narrow` / `--base-container-medium` set where a component counts as narrow, medium or wide** — two new tokens, `480px` and `768px`, for a component's *own* width rather than the window's. web-components-core's responsive rules gained a `container` axis (`narrow` / `medium` / `wide`): below `-narrow` a component is narrow, below `-medium` it is medium, otherwise wide. Core reads the tokens at the element, so setting them on a section moves the lines for every component inside it — a sidebar can call its components narrow sooner than the main area does. Core works without them (it has the same defaults). They're plain `px` like the breakpoints, not rem multipliers. pure-css mirrors them as `$base-container-narrow` / `$base-container-medium`. The new Sizing chapter SZ06 · Container sizes shows the same search form in a sidebar and in the main area of a resizable frame, with sliders that move the lines.
- **Docs — which z-index tier a dialog or phone sheet uses** — the z-index scale in `docs/variables.md` now states that a dialog, a phone full-screen sheet or a drawer is the modal tier, so whatever opens inside it stacks above, and that a component's sub-layer is `calc(<tier> + 1)`, never a bare number (rulebook C-BV-15; core `Z_INDEX`).

Earlier releases: [2.0.2 release notes](release-notes/2.0.2.md) · [CHANGELOG](CHANGELOG.md).

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
