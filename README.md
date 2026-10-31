# @keenmate/base-css-variables

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

## What's New in 2.0.0-rc06

- **Motion — reduced motion turns animation off** — under `prefers-reduced-motion: reduce` the four `--base-duration-*` speeds become `0s` and `--base-scroll-behavior` becomes `auto`, so everything timed by the contract stops animating. Turning motion off any other time is CSS only: `--base-duration-*: 0s` page-wide, or a component's own `--<prefix>-transition-*: 0s`. Components use only the four speeds and the `--base-ease-*` easings.
- **Loader — one loader for the app and every component** — `--base-loader-icon` (the shape, a mask; default a spinner arc), `--base-loader-rotate` (`1turn`, or `0` for an SVG that animates itself), `--base-loader-duration` (`0.8s`) and `--base-loader-size` (`1.25em`). Every consumer draws it with the same mask + `currentColor` + rotate lines, so a theme swaps the loader in one token, inside shadow roots too. Under reduced motion it slows to `1.5s` instead of stopping.
- **Drop target — `--base-drop-target-bg` / `-bg-active` / `-border-color`** — one look for everything you can drop onto (tree rows, dropzones, grid column reorder). Derived from the success role, so a drop target is told apart from the primary-tinted selection at a glance.
- **New tokens — `--base-tree-indent` and `--base-scroll-behavior`** — `--base-tree-indent: 1.6` (unitless, 16px at a 10px rem) is one indent per level for both treeviews, the web-grid tree column and the web-multiselect tree. `--base-scroll-behavior` (`smooth`) drives programmatic scrolling, as CSS `scroll-behavior` or as the `behavior` passed to `scrollTo` / `scrollIntoView`.
- **Tooling — `base-contract-check` knows reduced motion** — a read inside `@media (prefers-reduced-motion: reduce)` must fall back to the contract's value in that block (`var(--base-loader-duration, 1.5s)`, `var(--base-duration-fast, 0s)`). Before, that fallback was flagged as a C2 error.

## What's New in 2.0.0-rc05

- **Default primary — blue-500 `#3b82f6`** — `--base-primary-color` was Corporate's sky `#0ea5e9`, which read too light as text and on its own tint; its derived text (`--base-primary-text-color`) turned teal-grey. Everything derived from the primary follows: hover / active, tints, selected / focused item states, the input focus border and halo. White stays the text on the fill. The rest of the default theme stays Corporate; pure-css 2.0.0-rc05 mirrors the default.
- **Tooling — `contractParity()` e2e helper** — `@keenmate/base-css-variables/testing/parity` renders a component standalone and with the contract, in light and dark plus a custom-accent pass, and compares every color token. It catches formula fallbacks that differ from the contract's, which the static check can't see (e.g. a 10% tint where the contract is 10% light / 20% dark).
- **Tooling — stricter `base-contract-check`** — a fallback for a contract alias (`--base-selected-bg: var(--base-primary-bg-subtle)`) must go through the aliased token. The check no longer exits 0 without checking when run through a symlink (`npm link`, pnpm), and compares numbers by value.

## Install

```bash
npm install @keenmate/base-css-variables
```

## Usage

Import the stylesheet once, as early as possible (before the component styles):

```js
import '@keenmate/base-css-variables/base-variables.css';
```

or in CSS / HTML:

```css
@import '@keenmate/base-css-variables/base-variables.css';
```

```html
<link rel="stylesheet" href="node_modules/@keenmate/base-css-variables/base-variables.css">
```

**Browser support:** the derived tokens use `light-dark()`, `color-mix()` and relative color
syntax (`oklch(from …)`) — Chrome / Edge 119+, Safari 16.4+, Firefox 128+.

### Upgrading from 1.x

2.0 renamed and removed tokens **without aliases**: an override that still uses a 1.x name
(`--base-accent-color`, `--base-color-3`, `--base-success-bg`, …) is silently ignored and the
default shows instead. Rename overrides with the table in the
[CHANGELOG](./CHANGELOG.md) (2.0.0 → *Rename table*), and upgrade the components together with
this package — each one reads the 2.0 names from its matching release.

## How it works

The base layer is a set of **semantic design tokens**, not raw colors. Several
tokens may resolve to the *same default value* yet exist as separate variables so
each **role** can be themed independently.

### Semantic roles that overlap by default

`--base-main-bg` and `--base-input-bg` resolve to the same color by default, but they mean
different things:

| Token | Meaning | Example component consumers |
|-------|---------|-----------------------------|
| `--base-main-bg` | The **content surface** — the canvas a grid, tree, dropzone or panel paints itself on | `--wg-main-bg`, `--wtv-bg-color`, `--dz-background`, `--ms-hint-bg`, `--ms-actions-bg` |
| `--base-input-bg` | The background of **form fields** specifically | `--ms-input-bg`, `--drp-input-bg`, `--wg-input-bg` |

`--base-input-bg` is derived — `var(--base-main-bg)` — so by default inputs follow the
surface. Because it's a separate token you can still give input fields their own fill:

```css
:root {
  --base-main-bg: #ffffff;   /* grid / tree / dropzone canvas */
  --base-input-bg: #f7f9fc;  /* inputs stand out slightly      */
}
```

### Surface hierarchy

Background surfaces climb an **elevation ladder** — each step a little more
prominent than the last — with a separate **interaction-state** axis on top:

```
--base-page-bg  →  --base-subtle-bg  →  --base-main-bg  →  --base-elevated-bg
                                        └─ hover / active / disabled ─┘
```

- **page** — canvas / backdrop below the content
- **subtle** — recessed / inset surface (code, wells)
- **main** — content surface (cards, panels, grid, dropzone)
- **elevated** — raised areas: table headers, toolbars, popovers
- **hover** — pointer hover on a surface (rows, options) — a translucent overlay
- **active** — pressed — a stronger overlay (selection is `--base-selected-bg`, see [Item states](#item-states))
- **disabled** — inert / readonly surface

Role-specific surfaces default into this scale — `--base-input-bg` and `--base-dropdown-bg`
are `var(--base-main-bg)`; `--base-tooltip-bg` is its own always-dark tone — but each can be
retargeted on its own. That's the whole point of keeping them as distinct tokens.

## The layer pipeline (pure-css → pure-admin)

`--base-*` is the **single knob**. This package is the canonical contract; its
consumers never define a parallel source of truth, they derive from it:

- **[`@keenmate/pure-css`](https://www.npmjs.com/package/@keenmate/pure-css)** mirrors
  this token list into SCSS (`$base-*`) — inputs as Sass colors, derived tokens as the
  *same formulas* as this file — adds its own `--pc-*` foundation tokens, and ships the
  grid / utilities / app-shell.
- **`@keenmate/pure-admin-core`** builds its component tokens (`--pa-*`) on top.
  pure-admin themes are pure-css builds that set the `$base-*` inputs (and hand-tune
  derived tokens where they want a specific value).
- **Keenmate web components** read `--base-*` directly (with inline fallbacks, so they
  also work without this package).

The `--pc-*` / `--pa-*` tokens are wired as `var(--base-*, <fallback>)`, so overriding
**one** `--base-*` re-themes pure-admin components *and* the web components together.
Traced end-to-end for the primary color:

```
LAYER 0  contract (THIS file, CSS)       :root { --base-primary-color: #3b82f6 }
            │  pure-css mirrors the list into SCSS
LAYER 1  pure-css source (SCSS)          $base-primary-color: #3b82f6 !default;   ◀─ a THEME overrides here
            │  derive
LAYER 2  pure-css framework var (SCSS)   $primary-color: $base-primary-color;       (serves only as the build fallback)
            │  emit (two mixins)
LAYER 3  pure-css emit  ──▶ CSS          --base-primary-color: #3b82f6;                         ◀─ RAIL A · the knob
                                         --pc-primary-color: var(--base-primary-color, #3b82f6)  ◀─ RAIL B · pure-admin's token
                                         --pc-primary-bg-subtle: var(--base-primary-bg-subtle, …)
                                         --pc-link-color: var(--pc-primary-color), …
            │
LAYER 4  pure-admin-core (CSS)           --pa-btn-primary-bg: var(--base-primary-color, #3b82f6), …
            │
LAYER 5  consumers
            pure-admin components         background: var(--pa-btn-primary-bg);
            web components                --ms-accent-color: var(--base-primary-color, #3b82f6);
```

- **RAIL A** (`--base-primary-color`) is the knob; **RAIL B** (`--pc-primary-color`) is
  `var(--base-primary-color, …)`, so at runtime it simply *is* the base value — the
  `<fallback>` only fires if RAIL A is ever missing (it isn't, once this file or a
  theme is loaded).
- There is **no `$pc-*` SCSS variable**. The `pc` layer is born at emission as a CSS
  property pointing back at `--base-*`; nothing to author in SCSS.

| Override… | Where | Effect |
|---|---|---|
| `--base-primary-color` | the root element — `:root`, or `<html>` carrying `.pc-mode-*` / `[data-*]` (runtime) | **everything** downstream, live — pure-admin **and** web components |
| `--base-primary-color` | a descendant element (runtime) | web components inside it (they read `--base-*` on their own host); pure-admin's `--pc-*` / `--pa-*` are declared on `:root`, so they don't see a subtree override |
| `$base-primary-color` | pure-css SCSS (build) | the default baked into `base.css` + every `--pc-*` fallback |
| `--pc-primary-color` | a single `--pc-*` (runtime) | pure-admin only — use for a deliberate pure-admin-only divergence |

The first row is the whole design: a theme (or a time-of-day `[data-daypart]` scope on
`<html>`) re-sets `--base-*` and the entire `--pc-*` / `--pa-*` layer re-resolves. Put mode
and variant classes on `<html>`, not `<body>`, for the same reason.

## Theming

Override any `--base-*` variable in your own `:root` — the value flows into every
component (for overriding on part of a page, see *Re-theming part of a page* below):

```css
:root {
  --base-primary-color: #e11d48;   /* rebrand every component's primary color */
  --base-main-bg: #fafafa;
  --base-border-radius-md: 1;      /* rounder corners everywhere */
}
```

### Inputs and derived tokens

The colors come in two kinds:

- **Inputs** — set by hand: `--base-main-bg`, `--base-page-bg`, `--base-text-color-1`,
  the role colors (`--base-primary-color`, `--base-secondary-color`,
  `--base-success/-danger/-warning/-info-color`), the status role text colors
  (`--base-success/-danger/-warning/-info-text-color`), `--base-overlay-bg`, `--base-shadow-color` and the palette.
  About 28 colors in all — that's what a theme decides.
- **Derived** — calculated from the inputs, so changing an input moves them all:
  - text levels 2–4 = `--base-text-color-1` mixed into `--base-main-bg` (75 / 55 / 40%);
  - surfaces (`subtle`, `elevated`, `disabled`, `border-color`) = the background's own hue
    shifted in lightness (OKLCH) — darker in light mode, lighter in dark mode, with
    twice the step in dark mode;
  - `hover` / `active` = translucent overlays of that hue, so they show on any surface;
  - role `-hover` / `-active` = the role color mixed with black (light) / white (dark), the same
    for all six roles;
  - tints (`-bg-subtle`, `-bg-subtle-hover`, `--base-selected-bg`) = the role color at 10% (light) / 20% (dark);
  - primary / secondary `-text-color` = the role color mixed with black (light) / white (dark);
  - text on a fill (`--base-on-<role>-text-color`, `--base-on-palette-N-text-color`) = black or
    white, whichever reads better on the fill by APCA;
  - input, dropdown, tooltip, border shorthands and shadows reuse the tokens above.

**Any derived token can still be hand-set** — a plain value simply replaces its formula:

```css
:root {
  --base-main-bg: light-dark(#fff8e7, #1f1a12);  /* input: text levels, surfaces, borders all follow */
  --base-elevated-bg: light-dark(#f2e5c4, #2b2418); /* hand-set: this one keeps your exact color */
}
```

Write overrides of mode-dependent tokens with `light-dark(<light>, <dark>)` — a plain value
pins that token to one color in both modes.

**Re-theming part of a page.** A `var()` inside a custom property is resolved on the element
that *declares* it, so derived tokens declared on `:root` don't recalculate when you change an
input on a descendant. The derived block is therefore also declared on `[data-theme]` and
`.base-scope` — set the inputs on such an element and everything inside it follows:

```html
<aside class="base-scope" style="--base-main-bg: #0b1220; --base-text-color-1: #e2e8f0">
  … borders, hover, text levels and tints inside are recalculated from these inputs …
</aside>
```

(Without the hook, a subtree override behaves like a plain value: only the tokens you set change.)

### What belongs in the contract

Consistency comes from consumers reading the same token: if pure-admin and a component both
draw "danger, hovered", they agree only when both read one `--base-*` name. So the contract is
kept slim in its **inputs**, not in its token count:

1. **Inputs** — what a theme genuinely decides (the colors above, plus the size, type and motion
   scales). Kept small; every new input is work for every theme.
2. **Derived tokens** — shared formulas for any question more than one consumer asks: hover /
   active steps, tints, text levels, surfaces, text on fills, input and dropdown colors. They can
   grow when needed — a theme never has to set them.
3. **Component tokens** — one component's design choices (a button's hover / press fill, text
   and border, an outline variant) live in that component (`--pa-btn-*`,
   `--drp-button-apply-*`, …) and default to 1 and 2. A theme overrides them only for a custom
   look, per component.

When a second consumer starts drawing the same thing, its token moves into the contract as a
derived default, so one override reaches both. Consumers *read* the derived tokens rather than
re-deriving or hand-picking their own values — a parallel copy is what breaks consistency.

### Light / dark mode

Colors are defined with CSS [`light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark),
so they follow the active `color-scheme`.

- **Automatic** — the file sets `color-scheme: light dark` on `:root`, so it
  follows the operating-system preference out of the box.
- **Manual** — force a theme on any subtree:

  ```html
  <html data-theme="dark">   <!-- or data-theme="light" -->
  ```

  or set `color-scheme: light | dark` on any element.

## Checking a component against the contract

Components read the contract with inline fallbacks — `var(--base-primary-color, #3b82f6)` — so
nothing fails when a component reads a renamed token or carries a fallback that drifted from the
contract: the fallback quietly takes over. The package ships a check for that. A component adds
the package as a **devDependency** (never a runtime one: components read `--base-*`, the page
defines it) and runs it in its build:

```bash
npm i -D @keenmate/base-css-variables
npx base-contract-check src        # paths default to src; exit 1 on findings
```

```json
"scripts": { "check:contract": "base-contract-check src" }
```

| Rule | Checks |
|---|---|
| **C1** | every `--base-*` read **or set** exists in the contract; a renamed or removed name says what to use (`renames.json`). Setting an unknown name (`--base-accent-color: #10b981` in CSS, a `style` attribute or `style.setProperty(…)`) does nothing, so it is a finding too |
| **C2** | the fallback of an **input** token equals the contract default, per mode (`light-dark()`); inside `@media (prefers-reduced-motion: reduce)` it equals the contract's reduced value (`var(--base-loader-duration, 1.5s)`, `var(--base-duration-fast, 0s)`) |
| **C3** | the fallback of a **derived** token is a formula on the component's own tokens, not a literal |

C3 is the one that keeps a component consistent on its own. A literal hover such as
`var(--base-primary-color-hover, #2563eb)` fits only the default accent; an app that sets the
component's accent without the contract keeps the old hover. Write the contract formula on the
component's own token instead:

```css
--xx-accent-color-hover: var(--base-primary-color-hover,
  light-dark(color-mix(in srgb, black 15%, var(--xx-accent-color)),
             color-mix(in srgb, white 15%, var(--xx-accent-color))));
```

A fallback that is a component token is followed to its declaration, so
`var(--base-primary-text-color, var(--xx-accent-color))` counts as the literal accent (primary
used as text — too light). A derived token that is an alias in the contract
(`--base-input-bg: var(--base-main-bg)`) passes when the fallback chain reads the aliased token.

Deliberate differences go in `contract-check.json` next to `package.json`, each with a reason:

```json
{ "allow": [
  { "token": "--base-z-tooltip", "rule": "C2", "reason": "must sit above the host app's modals" },
  { "token": "--base-icon-calendar", "rule": "C1", "file": "variables.css", "reason": "proposed token, read ahead" }
] }
```

Options: `--report` (list, exit 0 — for adopting), `--json`, `--config <file>`,
`--contract <base-variables.css>`. Scans `.css .scss .ts .js .mjs .svelte .html .md` (example pages and docs too), comments stripped,
`node_modules`, `dist`, `dist-examples` and test output skipped. The same check is importable: `import { check } from
'@keenmate/base-css-variables/check'`.

### Parity test (e2e)

The static check reads the CSS; it can't tell whether a *formula* fallback gives the same color
as the contract (a 10% tint where the contract is 10% light / 20% dark, an own hover mix
instead of the contract's overlay). The package ships a Playwright helper that renders the
component and compares:

```ts
import { contractParity } from '@keenmate/base-css-variables/testing/parity';

test('standalone colors match the contract', async ({ page }) => {
  const diffs = await contractParity(page, {
    url: '/test/contract-parity.html',   // one plain instance
    selector: '#parity',
    prefix: 'ms',                         // compares every color-valued --ms-* token
    accentToken: '--ms-accent-color',     // enables the accent pass
    allow: { '--ms-option-title-color-selected': 'reason' },
  });
  expect(diffs).toEqual([]);
});
```

It loads the page standalone and with `base-variables.css` injected, in light and dark, and
resolves each token on a probe inside the shadow root. The **accent pass** sets
`--ms-accent-color: #16a34a` standalone and `--base-primary-color: #16a34a` with the contract,
so a literal fallback that only fits the default accent (a fixed hover) fails. Non-color tokens
and tokens that resolve to `currentColor` are skipped; channels may differ by 2 / 255. No
Playwright dependency — pass your `page`.

## Checkbox render method

Every Keenmate component that draws a checkbox (multiselect options, tree nodes,
grid selection, …) should render it the **same way**, so the tick/dash lands
identically everywhere. The contract has two knobs — `--base-checkbox-scale` (box
size) and `--base-icon-check-size` (glyph size) — and one hard rule: **scale the
box, never the glyph via `transform`.**

**Canonical method (the one every component ships — crisp at every scale):**

```css
.x__checkbox {
  /* border-box so the declared size IS the rendered outer size — a native
     <input type=checkbox> defaults to this, so a custom <span> box must match it
     or the two render at different totals (span content-box = size + 2×border).
     It also keeps the scaled border growing INWARD instead of enlarging the box. */
  box-sizing: border-box;
  /* scale the BOX, its BORDER and its RADIUS all via calc — one layer-free path.
     calc keeps border + corners proportional to the box without a compositing
     layer, so there is no case left where you'd reach for transform. */
  inline-size:  calc(var(--x-checkbox-size)  * var(--base-checkbox-scale, 1));
  block-size:   calc(var(--x-checkbox-size)  * var(--base-checkbox-scale, 1));
  border-width: calc(var(--base-border-width) * var(--base-checkbox-scale, 1));
  border-style: solid;
  border-color: var(--base-checkbox-border-color);
  border-radius: calc(var(--x-checkbox-radius) * var(--base-checkbox-scale, 1));
  position: relative;
}
.x__checkbox::after {               /* the tick / dash */
  content: '';
  position: absolute;
  inset: 0;
  background-color: /* checkmark color */;
  mask: var(--base-icon-check) no-repeat center / var(--base-icon-check-size, 68%);
}
.x__checkbox--indeterminate::after { mask-image: var(--base-icon-indeterminate); }
```

The glyph is masked at `center / --base-icon-check-size` over the full box —
a percentage, so it already tracks the box as it scales. With no `transform`,
the browser renders it in normal layout space with sub-pixel anti-aliasing, so
it stays optically centred on every row regardless of fractional row heights.

**Why not `transform: scale()`?** It promotes the element to its own compositing
layer; the layer rasterizes and **pixel-snaps** the mask. The glyph sits at a
fractional offset (`--base-icon-check-size: 68%` of a 16px box ≈ 2.56px), so the
snap rounds left on some rows and right on others → the tick drifts, visibly and
inconsistently. The one thing transform used to be "needed" for — thickening the
border and corners with the box — is covered above by `calc`-ing `border-width`
and `border-radius` directly. So there is no situation where transform is the
right tool; it is a **last resort only** (e.g. a legacy box you cannot restyle),
and then only paired with integer box + glyph sizes to minimise the snap.

## Variable reference

Naming is intentionally **not 1:1** between the base layer and component variables.
For example `--ms-primary-bg` and `--drp-primary-bg` both read `--base-hover-bg`. Always
theme via the `--base-*` variables listed here.

These tables are the complete `--base-*` contract, mirrored token-for-token by
`@keenmate/pure-css` (`$base-*`). **Input** marks a hand-set token (defaults are the
pure-admin Corporate theme, light / dark); *Derived* marks a formula — see
[Inputs and derived tokens](#inputs-and-derived-tokens). Unmarked rows are plain values
(sizes, icons, …).

### Primary role
The brand / interactive color — primary buttons, focus, selection, checked state, links.
Brand blue, kept across light / dark. (Before 2.0.0 this was `--base-accent-*`.)

| Variable | Purpose |
|----------|---------|
| `--base-primary-color` | **Input.** Primary brand / action color |
| `--base-primary-color-hover` | Hover step. *Derived:* 15% black (light) / white (dark) |
| `--base-primary-color-active` | Active / pressed step. *Derived:* 30% black / white |
| `--base-primary-bg-subtle` | Primary tint for badges, chips, soft fills: `-color` mixed 10% (light) / 20% (dark) into transparent — same pattern as the role tints |
| `--base-primary-bg-subtle-hover` | The primary tint on hover: 15% (light) / 30% (dark) |
| `--base-primary-text-color` | Primary as **foreground** on a surface (links, emphasised text). *Derived:* 45% black (light) / 25% white (dark) |
| `--base-on-primary-text-color` | Text on the primary fill. *Derived:* black or white, whichever reads better on the fill by APCA (Lc ≥ 45 on every default fill); hand-set it for a fill near the tie |

### Secondary role
| Variable | Purpose |
|----------|---------|
| `--base-secondary-color` | **Input.** Neutral grey secondary action color |
| `--base-secondary-color-hover` | Hover step. *Derived:* like primary |
| `--base-secondary-color-active` | Active / pressed step. *Derived:* like primary |
| `--base-secondary-bg-subtle` | Secondary tint. *Derived:* like primary |
| `--base-secondary-bg-subtle-hover` | The secondary tint on hover. *Derived:* like primary |
| `--base-secondary-text-color` | Secondary as foreground on a surface. *Derived:* like primary |
| `--base-on-secondary-text-color` | Text on the secondary fill. *Derived:* black or white, whichever reads better on the fill by APCA (Lc ≥ 45 on every default fill); hand-set it for a fill near the tie |

### Background / surface
Elevation ladder: `page` (canvas) < `subtle` (recessed) < `main` (content) <
`elevated` (raised). `hover` / `active` / `disabled` are the interaction-state axis.

| Variable | Purpose |
|----------|---------|
| `--base-page-bg` | **Input.** Canvas / backdrop below the content |
| `--base-main-bg` | **Input.** Content surface — cards, panels, grid |
| `--base-subtle-bg` | Recessed / inset surface (code, wells). *Derived:* page-bg shifted in lightness |
| `--base-elevated-bg` | Raised surface — headers, toolbars, popovers. *Derived:* main-bg shifted in lightness |
| `--base-overlay-bg` | **Input.** Modal / overlay scrim |
| `--base-shadow-color` | **Input.** Shadow tint for elevation: 15% black (light) / 40% (dark); every shadow derives from it — the shadow scale, the dropdown shadow, and the shadows in pure-css / pure-admin / the components |
| `--base-hover-bg` | Hover state for any surface (option / row hover). *Derived:* translucent overlay of the background hue |
| `--base-active-bg` | Active / pressed surface. *Derived:* stronger overlay |
| `--base-disabled-bg` | Disabled / readonly surface. *Derived:* main-bg shifted in lightness |
| `--base-disabled-opacity` | Fade for a disabled control (`0.65`) — one value for every role, button, input and icon |

### Item states
Shared look for list options, tree rows and grid rows, so a selected multiselect option
and a selected tree row on the same page are identical. The model is Windows Explorer's,
with three states:

- **focused** — the *one* item the keyboard / mouse cursor is on;
- **selected** — the click / Ctrl / Shift-click (Shift+arrow) set, 0..n items;
- **checked** — the items whose checkbox is ticked. Shown by the checkbox only, so there are
  no `--base-checked-*` row tokens. With no checkboxes, checked mirrors selected.

Pointer hover is not an item state: it's `--base-hover-bg`, the same overlay on any surface.
(Before 2.0.0-rc03 *selected* was called *highlighted*: `--base-highlighted-*`.)

`*-outline` is an `outline` (not `border`) shorthand that consumers draw **inset** (`outline-offset: calc(-1 * var(--base-outline-width))`):
no layout shift, no bleed onto neighbouring rows, and a separate paint channel from
background / box-shadow. To thicken it, change `--base-outline-width` — a px
written directly into `*-outline` won't move the inset offset, so the outline spills out of the row.

| Variable | Purpose |
|----------|---------|
| `--base-outline-width` | Thickness for `*-outline`; consumers inset the outline by −this (default: `1px`) |
| `--base-selected-bg` | Selected item tint. *Derived:* `var(--base-primary-bg-subtle)` (primary at 10% light / 20% dark) |
| `--base-selected-bg-hover` | Selected item on hover. *Derived:* same as `--base-selected-bg` |
| `--base-selected-text-color` | Text on a selected item (default: `currentColor` = unchanged) |
| `--base-selected-outline` | Selected item outline shorthand (default: `none`) |
| `--base-focused-bg` | Focused item background (default: `transparent`, the outline alone marks focus) |
| `--base-focused-text-color` | Text on the focused item (default: `currentColor`) |
| `--base-focused-outline` | Keyboard-focus outline shorthand. *Derived:* `var(--base-outline-width) solid var(--base-primary-color)` |

#### Drop target
Where a dragged item or file can land: tree rows, dropzones, grid column reorder, pure-admin's file
dropzone. The success tint by default, so a drop target never looks like the primary-tinted
selection next to it; a theme restyles every drop here without touching selection
(`demo/drop-target.html`). A drop that is *not allowed* stays a danger tint in the component.

| Variable | Purpose |
|----------|---------|
| `--base-drop-target-bg` | A valid target while a drag is in progress (the "armed" dropzone). *Derived:* `var(--base-success-bg-subtle)` |
| `--base-drop-target-bg-active` | The target under the pointer. *Derived:* `var(--base-success-bg-subtle-hover)` |
| `--base-drop-target-border-color` | Border / outline of a drop target. *Derived:* `var(--base-success-color)` |

### Text
| Variable | Purpose |
|----------|---------|
| `--base-text-color-1` | **Input.** Primary — default body text, titles |
| `--base-text-color-2` | Secondary — muted labels, supporting text. *Derived:* text-color-1 75% into main-bg |
| `--base-text-color-3` | Tertiary — icons, metadata, paths, placeholders, hints. *Derived:* 55% |
| `--base-text-color-4` | Faint — disabled, decorative. *Derived:* 40% |

### Borders
| Variable | Purpose |
|----------|---------|
| `--base-border-width` | Shared stroke width the shorthands compose from |
| `--base-border-color` | Standard border color. *Derived:* main-bg shifted in lightness |
| `--base-border` | Full border shorthand. *Derived:* `var(--base-border-width) solid var(--base-border-color)` |
| `--base-checkbox-border-color` | Checkbox border. *Derived:* `var(--base-input-border-color)` — a control outline, not the divider |

### Input fields
| Variable | Purpose |
|----------|---------|
| `--base-input-bg` | Input background. *Derived:* `var(--base-main-bg)` |
| `--base-input-text-color` | Input text color. *Derived:* `var(--base-text-color-1)` |
| `--base-input-border-color` | Outline of a control: inputs, checkboxes, outline (secondary) buttons. *Derived:* `--base-text-color-1` mixed into `--base-main-bg`, 45% light / 35% dark — about twice the divider's contrast, so a field reads as a field. `--base-border-color` stays the quiet divider |
| `--base-input-border` | Input border shorthand (normal). *Derived:* from `--base-border-width` + `--base-input-border-color` |
| `--base-input-border-hover` | Input border on hover. *Derived:* primary color |
| `--base-input-border-focus` | Input border on focus. *Derived:* primary color |
| `--base-input-shadow-color-focus` | Tone of the halo around a focused input. *Derived:* 5% of `--base-primary-color` |
| `--base-input-box-shadow-focus` | Focus halo shorthand (`box-shadow`). *Derived:* `0 0 0 3px var(--base-input-shadow-color-focus)`; components with a different halo size reuse the color token |
| `--base-input-placeholder-color` | Placeholder text — the same tone as the field's icons. *Derived:* `var(--base-text-color-3)` |
| `--base-input-bg-disabled` | Disabled input background. *Derived:* `var(--base-disabled-bg)` |
| `--base-input-icon-color` | Icons inside an input (clear ✕, chevron, calendar, search). *Derived:* `var(--base-text-color-3)` |
| `--base-input-icon-bg-hover` | Background of an input icon button on hover. *Derived:* `var(--base-hover-bg)` |

### Dropdown / popover
| Variable | Purpose |
|----------|---------|
| `--base-dropdown-bg` | Dropdown / popover background. *Derived:* `var(--base-main-bg)` |
| `--base-dropdown-border` | Dropdown border. *Derived:* from `--base-border-width` + `--base-border-color` |
| `--base-dropdown-box-shadow` | Dropdown shadow. *Derived:* `0 8px 16px var(--base-shadow-color)` |

### Tooltip
| Variable | Purpose |
|----------|---------|
| `--base-tooltip-bg` | Tooltip background — always dark. *Derived:* text-color-1 85% into main-bg (light) / main-bg lifted (dark) |
| `--base-tooltip-text-color` | Tooltip text. *Derived:* main-bg (light) / text-color-1 (dark) |

### Status colors
Role ∈ `success` / `danger` / `warning` / `info`. Every role — primary and secondary
included — has the same seven tokens; the status roles differ only in that `-text-color` is
an input.

| Variable | Purpose |
|----------|---------|
| `--base-<role>-color` | **Input.** Role **fill identity** (vivid) |
| `--base-<role>-color-hover` | Role fill, hover. *Derived:* 15% black (light) / white (dark) |
| `--base-<role>-color-active` | Role fill, active / pressed. *Derived:* 30% black / white |
| `--base-<role>-bg-subtle` | Role tint for backgrounds (labels, toasts, invalid cells): `-color` mixed 10% (light) / 20% (dark) into transparent |
| `--base-<role>-bg-subtle-hover` | The role tint on hover: 15% (light) / 30% (dark) |
| `--base-<role>-text-color` | **Input.** Role as **foreground** on the page surface (text / links) — dark shade in light mode, light shade in dark |
| `--base-on-<role>-text-color` | Readable text **on** the role fill. *Derived:* black or white, whichever reads better on the fill by APCA (Lc ≥ 45 on every default fill); hand-set it for a fill near the tie |

### Typography
| Variable | Purpose |
|----------|---------|
| `--base-font-family` | Font stack (sans) |
| `--base-font-family-mono` | Monospace font stack |
| `--base-font-size-2xs … 2xl` | Font sizes (unitless multipliers): `2xs` `xs` `sm` `base` `lg` `xl` `2xl` |
| `--base-font-weight-normal / medium / semibold / bold` | Font weights (400 / 500 / 600 / 700) |
| `--base-line-height-tight / normal / relaxed` | Line heights |
| `--base-list-bullet-type` | Default `ul, ol` marker (`disc` / `circle` / `square` / `none` / `decimal` / …) |

### Sizing
| Variable | Purpose |
|----------|---------|
| `--base-border-radius-sm / md / lg` | Corner radii (unitless multipliers) |
| `--base-checkbox-scale` | Checkbox box scale (multiplies the box size; `1` = base). See [Checkbox render method](#checkbox-render-method) |
| `--base-input-size-xs…xl-height` | Standard input heights (unitless multipliers) |
| `--base-rem` | Rem base (`1rem`) the unitless multipliers combine against |

### Spacing scale
Unitless multipliers, combined as `calc(var(--base-space-*) * var(--base-rem))`.

| Variable | Purpose |
|----------|---------|
| `--base-space-xs / sm / md / base / lg / xl / 2xl` | Spacing scale steps (0.4 → 4.8) |
| `--base-tree-indent` | Indent per tree level (`1.6` = 16px at 10px rem base) — treeviews, grid tree column, multiselect tree; a consumer multiplies by the level itself |

### Elevation / shadow scale
Colored from `--base-shadow-color` so shadows theme with the surface.

| Variable | Purpose |
|----------|---------|
| `--base-shadow-sm` | Small elevation shadow. *Derived:* `0 1px 3px` |
| `--base-shadow-md` | Medium elevation shadow. *Derived:* `0 2px 8px` |
| `--base-shadow-lg` | Large elevation shadow. *Derived:* `0 4px 12px` |

### Motion
Components use only these four speeds and these easings — every transition and animation duration
goes through a component variable that chains here (`--ms-transition-fast:
var(--base-duration-fast, 0.1s)`). Short and snappy is the house style.

- **Motion off, page-wide:** set `--base-duration-fast / normal / medium / slow: 0s` (and
  `--base-scroll-behavior: auto`).
- **Motion off, one component:** set its `--<prefix>-transition-*: 0s`.
- **`prefers-reduced-motion: reduce`** sets the four durations to `0s` (and each component does
  the same for its own variables, so it holds without the contract too). The loader slows
  instead (see Loader).

| Variable | Purpose |
|----------|---------|
| `--base-duration-fast / normal / medium / slow` | Transition durations (0.1s / 0.15s / 0.25s / 0.3s; `0s` under reduced motion) |
| `--base-ease-standard` | Standard easing `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--base-ease-out` | Ease-out `cubic-bezier(0, 0, 0.2, 1)` |
| `--base-ease-in` | Ease-in `cubic-bezier(0.4, 0, 1, 1)` |
| `--base-scroll-behavior` | Programmatic scrolling — `smooth`; `auto` (instant) under reduced motion. CSS `scroll-behavior`, or read in JS and passed as `behavior` to `scrollTo` / `scrollIntoView` |

### Loader
One loading indicator for the app and every component, changed in one place. Shadow DOM lets only
custom properties in, so the loader is four tokens, and every consumer draws it with the same lines
(a component reads them through its own `--<prefix>-loader-*`, which fall back to these):

```css
.x-loader {
  inline-size: var(--x-loader-size);
  block-size: var(--x-loader-size);
  mask: var(--x-loader-icon) center / contain no-repeat;
  background: currentColor;
  animation: x-loader-spin var(--x-loader-duration) linear infinite;
}
@keyframes x-loader-spin { to { transform: rotate(var(--x-loader-rotate)); } }
```

- **Swap the shape:** set `--base-loader-icon` to another SVG. A shape that should spin keeps
  `--base-loader-rotate: 1turn`; an SVG that animates itself (CSS or SMIL inside it, e.g. a
  travelling sine wave) sets `--base-loader-rotate: 0`. Both work as a mask in Chromium, Firefox
  and WebKit (`e2e/loader.spec.ts`, `demo/loader.html`).
- **One colour:** the icon is a mask painted with `currentColor`. Multi-colour loaders need
  markup, not a token.
- **Reduced motion:** the loader is the one loop that keeps moving — it slows to `1.5s` per turn
  instead of stopping (a stopped loader reads as frozen). An SVG that animates itself keeps its own
  timing: it doesn't read `--base-loader-duration`, and a `@media (prefers-reduced-motion)` rule
  inside the SVG was not applied under Playwright's emulation in any engine, so don't rely on it.
- **CSP:** the data-URI mask falls under `img-src`, like the icons.

| Variable | Purpose |
|----------|---------|
| `--base-loader-icon` | The shape — mask image (default: Lucide loader-circle arc) |
| `--base-loader-rotate` | Turn per cycle (`1turn`; `0` for an SVG that animates itself) |
| `--base-loader-duration` | One cycle (`0.8s`; `1.5s` under reduced motion). The one exception to the four motion speeds |
| `--base-loader-size` | Width and height (`1.25em` — scales with the text it sits in) |

### Z-index scale
Generic stacking tiers for overlay coordination.

| Variable | Purpose |
|----------|---------|
| `--base-z-dropdown` | Dropdown (7500) |
| `--base-z-modal-backdrop` | Modal backdrop (6000) |
| `--base-z-modal` | Modal (7000) |
| `--base-z-popover` | Popover (7600) |
| `--base-z-toast` | Toast (8000) |
| `--base-z-tooltip` | Tooltip (9000) |

### Breakpoints
The layout lines by viewport width: below `-mobile` is mobile, below `-tablet` is tablet, else
desktop. Read in JS (`parseFloat(getComputedStyle(document.documentElement).getPropertyValue(…))`)
by pure-css (`pureCss` config `mobileBreakpoint` / `tabletBreakpoint`) and web-components-core
(`env.breakpoint`), so the app shell and every component switch at the same width. `@media` can't
read `var()`: pure-css compiles the same lines from `$mobile-breakpoint` / `$tablet-breakpoint` —
change both together. Plain `px`, not rem multipliers.

| Variable | Purpose |
|----------|---------|
| `--base-breakpoint-mobile` | Mobile below this width (`768px`) |
| `--base-breakpoint-tablet` | Tablet below this width (`1024px`) |

### Icons
Inline `data:image/svg+xml` Lucide glyphs, rendered by consumers via
`mask: var(--base-icon-*); background: currentColor`. Mode-invariant — override any
one to re-glyph every consumer at once.

| Variable | Glyph / purpose |
|----------|-----------------|
| `--base-icon-chevron` | Chevron (points right; rotate 90° when open) |
| `--base-icon-caret-down` | Static down caret (sort / select) |
| `--base-icon-caret-up` | Static up caret |
| `--base-icon-close` | ✕ close |
| `--base-icon-clear` | Field-clear — alias → `--base-icon-close` |
| `--base-icon-remove` | Item take-out (non-destructive) — alias → `--base-icon-close` |
| `--base-icon-expand` | Expand (+ / plus) |
| `--base-icon-collapse` | Collapse (− / minus) |
| `--base-icon-add` | Add (plus) |
| `--base-icon-edit` | Edit (pencil) |
| `--base-icon-delete` | Delete (destructive trash) |
| `--base-icon-search` | Search (magnifier) |
| `--base-icon-filter` | Filter (funnel) |
| `--base-icon-refresh` | Refresh (two curved arrows; consumers spin it) |
| `--base-icon-check` | Checked (tick) |
| `--base-icon-check-size` | Mask-size of the selection glyph in its box (`68%`) |
| `--base-icon-indeterminate` | Partially checked (tri-state minus) |
| `--base-icon-copy` | Copy to clipboard (two sheets) |
| `--base-icon-ellipsis` | More / overflow (three dots; vertical = same glyph rotated 90°) |
| `--base-icon-save` | Save (floppy disk) |
| `--base-icon-settings` | Settings (cog / gear) |
| `--base-icon-bell` | Notification bell |
| `--base-icon-user` | User / profile (person) |
| `--base-icon-download` | Download / export (tray + down arrow) |
| `--base-icon-link` | Hyperlink / attach-URL (chain) |
| `--base-icon-external-link` | Opens in a new tab (diagonal arrow out of box) |
| `--base-icon-info` | Status: info (circle-i) |
| `--base-icon-success` | Status: success (circle-check) |
| `--base-icon-warning` | Status: warning (triangle-alert) |
| `--base-icon-danger` | Status: danger (circle-x) |

### Theme palette slots
Nine brand palette slots (mode-invariant) with paired contrast text, used for
categorical color (charts, tags, avatars).

| Variable | Purpose |
|----------|---------|
| `--base-palette-1 … 9` | **Input.** Palette slots 1–9 (amber, pink, emerald, sky, violet, indigo, slate, corporate-blue, dark-slate) |
| `--base-on-palette-1-text-color … 9` | Readable text on each slot. *Derived:* black or white, whichever reads better on the fill by APCA (Lc ≥ 45 on every default fill); hand-set it for a fill near the tie |

> **Unitless multipliers:** font sizes, radii, input heights and the spacing scale
> are stored as plain numbers and combined by components against `--base-rem` — e.g.
> `calc(var(--base-font-size-base) * var(--base-rem))`. This keeps sizing consistent
> across all Keenmate components while remaining scalable.

## Related

- [`@keenmate/theme-designer`](https://github.com/keenmate/theme-designer) — visual
  theme designer & generator that produces `--base-*` values from 3 input colors.
  *Not yet updated for 2.0* — it still emits the 1.x names.
- `demo/derived.html` in the [GitHub repo](https://github.com/Keenmate/base-css-variables) (not in the npm package; `npm run demo`) — compares the derived formulas against
  the compiled pure-admin themes, with live input pickers and formula knobs.
- `demo/fill-states.html` (same place) — text on fills (WCAG 2 vs APCA pick, with both scores),
  hover / press options for buttons, and how a theme overrides a button component's state tokens.
- `demo/variables.html` (same place) — every `--base-*` token in logical groups, marked input or
  derived, with its light and dark value, a preview and its definition.

## License

MIT © Keenmate s.r.o.
