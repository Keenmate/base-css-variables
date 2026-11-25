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

## What's New in v2.1.0

Upgrade guide: the [2.1.0 release notes](release-notes/2.1.0.md); full list: the
[CHANGELOG 2.1.0 section](CHANGELOG.md).

- **Tokens — `--base-container-narrow` / `--base-container-medium` set where a component counts as narrow, medium or wide** — two new tokens, `480px` and `768px`, for a component's *own* width rather than the window's. web-components-core's responsive rules gained a `container` axis (`narrow` / `medium` / `wide`): below `-narrow` a component is narrow, below `-medium` it is medium, otherwise wide. Core reads the tokens at the element, so setting them on a section moves the lines for every component inside it — a sidebar can call its components narrow sooner than the main area does. Core works without them (it has the same defaults). They're plain `px` like the breakpoints, not rem multipliers. pure-css mirrors them as `$base-container-narrow` / `$base-container-medium`. The new Sizing chapter SZ06 · Container sizes shows the same search form in a sidebar and in the main area of a resizable frame, with sliders that move the lines.
- **Docs — which z-index tier a dialog or phone sheet uses** — the z-index scale in `docs/variables.md` now states that a dialog, a phone full-screen sheet or a drawer is the modal tier, so whatever opens inside it stacks above, and that a component's sub-layer is `calc(<tier> + 1)`, never a bare number (rulebook C-BV-15; core `Z_INDEX`).

## What's New in v2.0.2

Upgrade guide: the [2.0.2 release notes](release-notes/2.0.2.md); full list: the
[CHANGELOG 2.0.2 section](CHANGELOG.md).

- **Token — `--base-touch-target-min` sets the minimum tap size on touch** — a new `44px` token for the smallest tappable size in a component's phone / coarse-pointer view: option rows, the close / Done button and icon-only buttons. Until now each component chose its own touch sizing, so the same app could have rows of different heights. Components now use the token as a floor (`min-height` / `min-width: var(--base-touch-target-min, 44px)`), so one override changes every component's tap size. 44px is the Apple HIG minimum and the WCAG 2.5.5 target size, and rulebook check C-RO-7 expects components to read this token. It's plain `px` like the breakpoints, not a rem multiplier. pure-css mirrors it as `$base-touch-target-min`.
- **Examples — live demos for the two new sizing tokens** — the Sizing page has two new chapters. SZ04 · Dropdown offset places a dropdown and a calendar panel the way a component does, reading `--base-dropdown-offset` in JS; a slider and presets (0 / 4 / 8px) set the token on the demo only, and a marker shows the gap. SZ05 · Touch target puts a dense desktop list next to a phone sheet whose rows and close button are sized by `--base-touch-target-min`; presets (44 / 48px) set the token, and each row shows its measured height.

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
