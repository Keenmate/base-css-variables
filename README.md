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

## What's New in 2.0.0-rc02

- **Inputs — a focus halo of its own** — new `--base-input-shadow-color-focus` (5% of `--base-primary-color`) and `--base-input-box-shadow-focus` (`0 0 0 3px` of it) give the soft glow around a focused field its own tokens. It used to borrow the `--base-primary-bg-subtle` fill tint, which themes set much stronger (up to 25% in dark mode) and which made the halo heavy. Components with a different halo size compose their own `box-shadow` from the color token, so the tone stays the same.
- **Controls — outlines stronger than the divider** — `--base-input-border-color` was `var(--base-border-color)`, the hairline for card and table edges (about 1.2–1.9:1), so inputs, checkboxes and outline buttons nearly disappeared in some themes. It is now `--base-text-color-1` mixed 45% (light) / 35% (dark) into `--base-main-bg` (about 2–3.4:1), and `--base-checkbox-border-color` follows it. `--base-border-color` stays the quiet divider. Every form's field outlines get visibly darker.

## What's New in 2.0.0-rc01

- **Contract — a few inputs, everything else derived** — only `--base-main-bg`, `--base-page-bg`, `--base-text-color-1`, the role colors and their text / on-fill colors, overlay, shadow color and palette are hand-set. Text levels 2–4, the `subtle` / `elevated` / `disabled` surfaces, `--base-border-color`, the `hover` / `active` overlays, role `-hover` / `-active` steps, tints, input / dropdown / tooltip tokens are formulas (`color-mix`, OKLCH relative colors), so a theme sets the inputs and the rest follows — in light and dark. Any derived token can still be set by hand. Needs relative color syntax (Chrome/Edge 119+, Safari 16.4+, Firefox 128+). See [Inputs and derived tokens](#inputs-and-derived-tokens).
- **Contract — re-themed scopes recalculate** — the derived block is declared on `:root, [data-theme], .base-scope`, so setting inputs on such an element re-derives every dependent token inside it (a `var()` resolves where it's declared, not where it's used).
- **Breaking — `accent` is now `primary`** — `--base-accent-color[-hover|-active]` → `--base-primary-color[-hover|-active]`, `--base-accent-color-light[-hover]` → `--base-primary-bg-subtle[-hover]`, `--base-text-color-on-accent` → `--base-on-primary-text-color`. One brand role, named like the rest of the role set. No aliases.
- **Breaking — names state their type** — a token ends in `-color`, `-bg`, or the shorthand it feeds (`-border`, `-outline`): `--base-<role>-text` → `-text-color`, `--base-text-on-<role>` → `--base-on-<role>-text-color`, `--base-ring-width` / `*-ring` → `--base-outline-width` / `*-outline`, `--base-input-color` → `--base-input-text-color`, `--base-input-clear-*` → `--base-input-icon-*`. Palette slots are `--base-palette-1…9` (were `--base-color-N`). Full table in the CHANGELOG.
- **Breaking — one tint per role, copies removed** — `--base-<role>-bg-subtle` (10% light / 20% dark of the role color) is the only role tint; `--base-<role>-bg`, `-bg-light`, `-text-light`, `-border` and the `--base-inverse-*` pair are gone.
- **Shadows — one tone** — `--base-shadow-color` is mode-aware (15% black light / 40% dark) and every shadow derives from it, including `--base-dropdown-box-shadow`; pure-css, pure-admin and the Keenmate components now use it for all their shadows, so a component inside pure-admin matches its surroundings.

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
- **active** — pressed — a stronger overlay (selection is `--base-highlighted-bg`, see [Item states](#item-states))
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
LAYER 0  contract (THIS file, CSS)       :root { --base-primary-color: #0ea5e9 }
            │  pure-css mirrors the list into SCSS
LAYER 1  pure-css source (SCSS)          $base-primary-color: #0ea5e9 !default;   ◀─ a THEME overrides here
            │  derive
LAYER 2  pure-css framework var (SCSS)   $primary-color: $base-primary-color;       (serves only as the build fallback)
            │  emit (two mixins)
LAYER 3  pure-css emit  ──▶ CSS          --base-primary-color: #0ea5e9;                         ◀─ RAIL A · the knob
                                         --pc-primary-color: var(--base-primary-color, #0ea5e9)  ◀─ RAIL B · pure-admin's token
                                         --pc-primary-bg-subtle: var(--base-primary-bg-subtle, …)
                                         --pc-link-color: var(--pc-primary-color), …
            │
LAYER 4  pure-admin-core (CSS)           --pa-btn-primary-bg: var(--base-primary-color, #0ea5e9), …
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
  `--base-success/-danger/-warning/-info-color`), the role text colors
  (`--base-<role>-text-color`), `--base-overlay-bg`, `--base-shadow-color` and the palette.
  About 28 colors in all — that's what a theme decides.
- **Derived** — calculated from the inputs, so changing an input moves them all:
  - text levels 2–4 = `--base-text-color-1` mixed into `--base-main-bg` (75 / 55 / 40%);
  - surfaces (`subtle`, `elevated`, `disabled`, `border-color`) = the background's own hue
    shifted in lightness (OKLCH) — darker in light mode, lighter in dark mode, with
    twice the step in dark mode;
  - `hover` / `active` = translucent overlays of that hue, so they show on any surface;
  - role `-hover` / `-active` = the role color mixed with black (light) / white (dark);
  - tints (`-bg-subtle`, `--base-highlighted-bg`) = the role color at 10% (light) / 20% (dark);
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

### Secondary role
| Variable | Purpose |
|----------|---------|
| `--base-secondary-color` | **Input.** Neutral grey secondary action color |
| `--base-secondary-color-hover` | Secondary hover state. *Derived:* like primary |

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

### Item states
Shared look for list options, tree rows and grid rows, so a selected multiselect option
and a highlighted tree row on the same page are identical. The model is Windows Explorer's,
with three states:

- **focused** — the *one* item the keyboard / mouse cursor is on;
- **highlighted** — the Ctrl/Shift-click (Shift+arrow) set, 0..n items;
- **selected** — the checkbox-*checked* items. Shown by the checkbox only, so there are no
  `--base-selected-*` row tokens. With no checkboxes, highlighted *is* the selection
  (svelte-treeview keeps the two arrays identical in that mode).

`*-outline` is an `outline` (not `border`) shorthand that consumers draw **inset** (`outline-offset: calc(-1 * var(--base-outline-width))`):
no layout shift, no bleed onto neighbouring rows, and a separate paint channel from
background / box-shadow. To thicken it, change `--base-outline-width` — a px
written directly into `*-outline` won't move the inset offset, so the outline spills out of the row.

| Variable | Purpose |
|----------|---------|
| `--base-outline-width` | Thickness for `*-outline`; consumers inset the outline by −this (default: `1px`) |
| `--base-highlighted-bg` | Highlighted item tint. *Derived:* `var(--base-primary-bg-subtle)` (primary at 10% light / 20% dark) |
| `--base-highlighted-bg-hover` | Highlighted item on hover. *Derived:* same as `--base-highlighted-bg` |
| `--base-highlighted-text-color` | Text on a highlighted item (default: `currentColor` = unchanged) |
| `--base-highlighted-outline` | Highlighted item outline shorthand (default: `none`) |
| `--base-focused-bg` | Focused item background (default: `transparent`, the outline alone marks focus) |
| `--base-focused-text-color` | Text on the focused item (default: `currentColor`) |
| `--base-focused-outline` | Keyboard-focus outline shorthand. *Derived:* `var(--base-outline-width) solid var(--base-primary-color)` |

### Text
| Variable | Purpose |
|----------|---------|
| `--base-text-color-1` | **Input.** Primary — default body text, titles |
| `--base-text-color-2` | Secondary — muted labels, supporting text. *Derived:* text-color-1 75% into main-bg |
| `--base-text-color-3` | Tertiary — icons, metadata, paths, placeholders, hints. *Derived:* 55% |
| `--base-text-color-4` | Faint — disabled, decorative. *Derived:* 40% |
| `--base-on-primary-text-color` | Text on the primary fill. *Derived:* black or white, whichever reads better on the fill by APCA (Lc ≥ 45 on every default fill); hand-set it for a fill near the tie |
| `--base-on-secondary-text-color` | Readable text on the secondary fill. *Derived:* black or white, whichever reads better on the fill by APCA (Lc ≥ 45 on every default fill); hand-set it for a fill near the tie |

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
Role ∈ `success` / `danger` / `warning` / `info`. Each role defines the full set below.

| Variable | Purpose |
|----------|---------|
| `--base-<role>-color` | **Input.** Role **fill identity** (vivid) |
| `--base-<role>-color-hover` | Role fill, hover. *Derived:* 15% black (light) / white (dark) |
| `--base-<role>-bg-subtle` | Role tint for backgrounds (labels, toasts, invalid cells): `-color` mixed 10% (light) / 20% (dark) into transparent |
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

### Elevation / shadow scale
Colored from `--base-shadow-color` so shadows theme with the surface.

| Variable | Purpose |
|----------|---------|
| `--base-shadow-sm` | Small elevation shadow. *Derived:* `0 1px 3px` |
| `--base-shadow-md` | Medium elevation shadow. *Derived:* `0 2px 8px` |
| `--base-shadow-lg` | Large elevation shadow. *Derived:* `0 4px 12px` |

### Motion
| Variable | Purpose |
|----------|---------|
| `--base-duration-fast / normal / medium / slow` | Transition durations (0.1s → 0.3s) |
| `--base-ease-standard` | Standard easing `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--base-ease-out` | Ease-out `cubic-bezier(0, 0, 0.2, 1)` |
| `--base-ease-in` | Ease-in `cubic-bezier(0.4, 0, 1, 1)` |

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
| `--base-icon-check` | Selected (tick) |
| `--base-icon-check-size` | Mask-size of the selection glyph in its box (`68%`) |
| `--base-icon-indeterminate` | Partially selected (tri-state minus) |
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

## License

MIT © Keenmate s.r.o.
