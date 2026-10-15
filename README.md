# @keenmate/base-css-variables

The shared **base layer** of CSS custom properties (`--base-*`) used by all
KeenMate web components — [web-multiselect](https://www.npmjs.com/package/@keenmate/web-multiselect),
[web-daterangepicker](https://www.npmjs.com/package/@keenmate/web-daterangepicker),
[web-grid](https://www.npmjs.com/package/@keenmate/web-grid), web-treeview, and more.

Each component ships its own prefixed variables (`--ms-*`, `--drp-*`, `--wg-*`, …)
that **cascade from these `--base-*` values**. Define the base layer once and every
component picks up a consistent, coordinated theme. Override a single `--base-*`
variable and the change propagates everywhere.

## What's New in 2.0.0-rc01

- **Contract — a few inputs, everything else derived** — only `--base-main-bg`, `--base-page-bg`, `--base-text-color-1`, the role colors and their text / on-fill colors, overlay, shadow color and palette are hand-set. Text levels 2–4, the `subtle` / `elevated` / `disabled` surfaces, `--base-border-color`, the `hover` / `active` overlays, role `-hover` / `-active` steps, tints, input / dropdown / tooltip tokens are formulas (`color-mix`, OKLCH relative colors), so a theme sets the inputs and the rest follows — in light and dark. Any derived token can still be set by hand. Needs relative color syntax (Chrome/Edge 119+, Safari 16.4+, Firefox 128+). See [Inputs and derived tokens](#inputs-and-derived-tokens).
- **Contract — re-themed scopes recalculate** — the derived block is declared on `:root, [data-theme], .base-scope`, so setting inputs on such an element re-derives every dependent token inside it (a `var()` resolves where it's declared, not where it's used).
- **Breaking — `accent` is now `primary`** — `--base-accent-color[-hover|-active]` → `--base-primary-color[-hover|-active]`, `--base-accent-color-light[-hover]` → `--base-primary-bg-subtle[-hover]`, `--base-text-color-on-accent` → `--base-on-primary-text-color`. One brand role, named like the rest of the role set. No aliases.
- **Breaking — names state their type** — a token ends in `-color`, `-bg`, or the shorthand it feeds (`-border`, `-outline`): `--base-<role>-text` → `-text-color`, `--base-text-on-<role>` → `--base-on-<role>-text-color`, `--base-ring-width` / `*-ring` → `--base-outline-width` / `*-outline`, `--base-input-color` → `--base-input-text-color`, `--base-input-clear-*` → `--base-input-icon-*`. Palette slots are `--base-palette-1…9` (were `--base-color-N`). Full table in the CHANGELOG.
- **Breaking — one tint per role, copies removed** — `--base-<role>-bg-subtle` (10% light / 20% dark of the role color) is the only role tint; `--base-<role>-bg`, `-bg-light`, `-text-light`, `-border` and the `--base-inverse-*` pair are gone.
- **Shadows — one tone** — `--base-shadow-color` is mode-aware (15% black light / 40% dark) and every shadow derives from it, including `--base-dropdown-box-shadow`; pure-css, pure-admin and the KeenMate components now use it for all their shadows, so a component inside pure-admin matches its surroundings.

## What's New in 1.0.7

- **Item states — one shared look for focused and highlighted rows** — new `--base-highlighted-bg` / `-bg-hover` / `-text` / `-ring` and `--base-focused-bg` / `-text` / `-ring` tokens give list options, tree rows and grid rows a single look across components, so a picked web-multiselect option and a highlighted web-/svelte-treeview row on the same page match, and one override re-themes all of them. It follows the Windows Explorer model: *focused* is the one cursor item (an inset accent ring), *highlighted* is the Ctrl/Shift-click set (an accent tint), and *selected* means checkbox-checked, shown by the checkbox alone, so it has no row tokens. See [Item states](#item-states).
- **Item states — `--base-ring-width` keeps rings inset** — the `*-ring` tokens are `outline` shorthands that consumers draw inset with `outline-offset: calc(-1 * var(--base-ring-width))`, so states never shift layout or bleed onto neighbouring rows. Thicken the ring via `--base-ring-width` (default `1px`, composed into `--base-focused-ring`) rather than a px inside the shorthand, and the offset stays in step.
- **Checkboxes — one `calc`-only render method** — the [render method](#checkbox-render-method) now scales the box, its `border-width` and its `border-radius` all with `calc(… * var(--base-checkbox-scale))` and pins `box-sizing: border-box`, so a native `<input type=checkbox>` and a custom `<span>` box render at the same size. `transform: scale()` is demoted to a legacy-only last resort. Docs only, no token change.

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

## How it works

The base layer is a set of **semantic design tokens**, not raw colors. Several
tokens may resolve to the *same default value* yet exist as separate variables so
each **role** can be themed independently.

### Semantic roles that overlap by default

`--base-main-bg` and `--base-input-bg` both default to white (light) / near-black
(dark), but they mean different things:

| Token | Meaning | Example component consumers |
|-------|---------|-----------------------------|
| `--base-main-bg` | The **global / primary surface** — the canvas an app shell, grid, dropzone or panel paints itself on | `--wg-surface-1` (grid surface), `--drp-primary-bg` (calendar panel), `--ms-hint-bg`, `--ms-actions-bg` |
| `--base-input-bg` | The background of **form fields** specifically | `--ms-input-bg`, `--drp-input-bg`, `--wg-input-bg` |

Because they are separate variables, you can, for example, keep a grid or dropzone
on a plain page background while giving input fields a subtly tinted fill:

```css
:root {
  --base-main-bg: #ffffff;   /* page / grid / dropzone canvas */
  --base-input-bg: #f7f9fc;  /* inputs stand out slightly      */
}
```

If you only set `--base-main-bg`, inputs keep their own default — they don't
inherit from it. Set both when you want them to match.

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
- **elevated** — raised areas: headers, toolbars, dropdowns, popovers
- **hover** — pointer hover on a surface (rows, options)
- **active** — pressed / selected
- **disabled** — inert / readonly surface

Role-specific surfaces (`--base-input-bg`, `--base-dropdown-bg`, `--base-tooltip-bg`)
default to values in this scale but can be retargeted on their own — that's the
whole point of keeping them as distinct tokens.

## The layer pipeline (pure-css → pure-admin)

`--base-*` is the **single knob**. This package is the canonical contract; its
consumers never define a parallel source of truth, they derive from it:

- **[`@keenmate/pure-css`](https://www.npmjs.com/package/@keenmate/pure-css)** mirrors
  this token list into SCSS (`$base-*`), adds theme derivation + its own `--pc-*`
  foundation tokens, and ships the grid / utilities / app-shell.
- **`@keenmate/pure-admin-core`** builds its component tokens (`--pc-*`) on top.
- **KeenMate web components** read `--base-*` directly (with inline fallbacks).

Every `--pc-*` is wired as `var(--base-*, <fallback>)`, so overriding **one**
`--base-*` re-themes pure-admin components *and* the web components together.
Traced end-to-end for the primary color:

```
LAYER 0  contract (THIS file, CSS)       :root { --base-primary-color: #0ea5e9 }
            │  pure-css mirrors the list into SCSS
LAYER 1  pure-css source (SCSS)          $base-primary-color: #0ea5e9 !default;   ◀─ a THEME overrides here
            │  derive
LAYER 2  pure-css framework var (SCSS)   $primary-color: $base-primary-color;       (serves only as the build fallback)
            │  emit (two mixins)
LAYER 3  pure-css emit  ──▶ CSS          --base-primary-color: #0ea5e9;                   ◀─ RAIL A · the knob
                                         --pc-primary: var(--base-primary-color, #0ea5e9)  ◀─ RAIL B · pure-admin's token
            │
LAYER 4  pure-admin-core (CSS)           --pc-primary-bg-subtle, --pc-primary-bg-subtle-hover,
                                         --pc-link-color: var(--pc-primary), …
            │
LAYER 5  consumers
            pure-admin components         background: var(--pc-primary-bg-subtle);
            web components                --ms-accent-color: var(--base-primary-color, #3b82f6);
```

- **RAIL A** (`--base-primary-color`) is the knob; **RAIL B** (`--pc-primary`) is
  `var(--base-primary-color, …)`, so at runtime it simply *is* the base value — the
  `<fallback>` only fires if RAIL A is ever missing (it isn't, once this file or a
  theme is loaded).
- There is **no `$pc-*` SCSS variable**. The `pc` layer is born at emission as a CSS
  property pointing back at `--base-*`; nothing to author in SCSS.

| Override… | Where | Effect |
|---|---|---|
| `--base-primary-color` | any `:root` / `.pc-mode-*` / `[data-*]` scope (runtime) | **everything** downstream, live — pure-admin **and** web components |
| `$base-primary-color` | pure-css SCSS (build) | the default baked into `base.css` + every `--pc-*` fallback |
| `--pc-primary` | a single `--pc-*` (runtime) | pure-admin only — use for a deliberate pure-admin-only divergence |

That middle-less "one knob" row is the whole design: a theme (or a time-of-day
`[data-daypart]` scope) re-sets `--base-*` and the entire `--pc-*` layer re-resolves.

## Theming

Override any `--base-*` variable in your own `:root` (or any scope) — the value
flows into every component:

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
  (`--base-<role>-text-color`), the "text on a fill" colors (`--base-on-*-text-color`),
  `--base-overlay-bg`, `--base-shadow-color` and the palette.
- **Derived** — calculated from the inputs, so changing an input moves them all:
  - text levels 2–4 = `--base-text-color-1` mixed into `--base-main-bg` (75 / 55 / 40%);
  - surfaces (`subtle`, `elevated`, `disabled`, `border-color`) = the background's own hue
    shifted in lightness (OKLCH) — darker in light mode, lighter in dark mode, with
    twice the step in dark mode;
  - `hover` / `active` = translucent overlays of that hue, so they show on any surface;
  - role `-hover` / `-active` = the role color mixed with black (light) / white (dark);
  - tints (`-bg-subtle`, `--base-highlighted-bg`) = the role color at 10% (light) / 20% (dark);
  - input, dropdown, tooltip, border shorthands and shadows reuse the tokens above.

**Any derived token can still be hand-set** — a plain value simply replaces its formula:

```css
:root {
  --base-main-bg: #fff8e7;          /* input: text levels, surfaces, borders all follow */
  --base-elevated-bg: #f2e5c4;      /* hand-set: this one keeps your exact color */
}
```

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

Every KeenMate component that draws a checkbox (multiselect options, tree nodes,
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
For example `--ms-primary-bg` reads `--base-hover-bg`, and `--drp-primary-bg` reads
`--base-main-bg`. Always theme via the `--base-*` variables listed here.

These tables are the complete `--base-*` contract, mirrored token-for-token by
`@keenmate/pure-css` (`$base-*`). Light values are Corporate light mode, dark are
Corporate dark mode.

### Primary role
The brand / interactive color — primary buttons, focus, selection, checked state, links.
Brand blue, kept across light / dark. (Before 2.0.0 this was `--base-accent-*`.)

| Variable | Purpose |
|----------|---------|
| `--base-primary-color` | Primary brand / action color |
| `--base-primary-color-hover` | Hover step. *Derived:* 15% black (light) / white (dark) |
| `--base-primary-color-active` | Active / pressed step. *Derived:* 30% black / white |
| `--base-primary-bg-subtle` | Primary tint for badges, chips, soft fills: `-color` mixed 10% (light) / 20% (dark) into transparent — same pattern as the role tints |
| `--base-primary-bg-subtle-hover` | The primary tint on hover: 15% (light) / 30% (dark) |

### Secondary role
| Variable | Purpose |
|----------|---------|
| `--base-secondary-color` | Neutral grey secondary action color |
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
| `--base-overlay-bg` | Modal / overlay scrim |
| `--base-shadow-color` | Shadow tint for elevation: 15% black (light) / 40% (dark); used by the shadow scale and the dropdown shadow |
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
| `--base-highlighted-bg` | Highlighted item tint (default: primary at 10%) |
| `--base-highlighted-bg-hover` | Highlighted item on hover (default: same as `--base-highlighted-bg`) |
| `--base-highlighted-text-color` | Text on a highlighted item (default: `currentColor` = unchanged) |
| `--base-highlighted-outline` | Highlighted item outline shorthand (default: `none`) |
| `--base-focused-bg` | Focused item background (default: `transparent`, the outline alone marks focus) |
| `--base-focused-text-color` | Text on the focused item (default: `currentColor`) |
| `--base-focused-outline` | Keyboard-focus outline shorthand (default: `--base-outline-width solid` primary) |

### Text
| Variable | Purpose |
|----------|---------|
| `--base-text-color-1` | **Input.** Primary — default body text, titles |
| `--base-text-color-2` | Secondary — muted labels, supporting text. *Derived:* text-color-1 75% into main-bg |
| `--base-text-color-3` | Tertiary — icons, metadata, paths. *Derived:* 55% |
| `--base-text-color-4` | Faint — hints, placeholders, disabled. *Derived:* 40% |
| `--base-on-primary-text-color` | Text on the primary fill |
| `--base-on-secondary-text-color` | Readable text on the secondary fill |

### Borders
| Variable | Purpose |
|----------|---------|
| `--base-border-width` | Shared stroke width the shorthands compose from |
| `--base-border-color` | Standard border color. *Derived:* main-bg shifted in lightness |
| `--base-border` | Full border shorthand (`1px solid …`) |
| `--base-checkbox-border-color` | Checkbox border |

### Input fields
| Variable | Purpose |
|----------|---------|
| `--base-input-bg` | Input background |
| `--base-input-text-color` | Input text color |
| `--base-input-border-color` | Input border color |
| `--base-input-border` | Input border (normal) |
| `--base-input-border-hover` | Input border on hover |
| `--base-input-border-focus` | Input border on focus |
| `--base-input-placeholder-color` | Placeholder text |
| `--base-input-bg-disabled` | Disabled input background |
| `--base-input-icon-color` | Icons inside an input (clear ✕, chevron, calendar, search) |
| `--base-input-icon-bg-hover` | Background of an input icon button on hover |

### Dropdown / popover
| Variable | Purpose |
|----------|---------|
| `--base-dropdown-bg` | Dropdown / popover background |
| `--base-dropdown-border` | Dropdown border |
| `--base-dropdown-box-shadow` | Dropdown shadow (`0 8px 16px` in `--base-shadow-color`) |

### Tooltip
| Variable | Purpose |
|----------|---------|
| `--base-tooltip-bg` | Tooltip background — always dark. *Derived:* text-color-1 85% into main-bg (light) / main-bg lifted (dark) |
| `--base-tooltip-text-color` | Tooltip text. *Derived:* main-bg (light) / text-color-1 (dark) |

### Status colors
Role ∈ `success` / `danger` / `warning` / `info`. Each role defines the full set below.

| Variable | Purpose |
|----------|---------|
| `--base-<role>-color` | Role **fill identity** (vivid) |
| `--base-<role>-color-hover` | Role fill, hover. *Derived:* 15% black (light) / white (dark) |
| `--base-<role>-bg-subtle` | Role tint for backgrounds (labels, toasts, invalid cells): `-color` mixed 10% (light) / 20% (dark) into transparent |
| `--base-<role>-text-color` | Role as **foreground on a light surface** (text / links) |
| `--base-on-<role>-text-color` | Readable text **on** the role fill |

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
| `--base-shadow-sm` | Small elevation shadow |
| `--base-shadow-md` | Medium elevation shadow |
| `--base-shadow-lg` | Large elevation shadow |

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
| `--base-palette-1 … 9` | Palette slots 1–9 (amber, pink, emerald, sky, violet, indigo, slate, corporate-blue, dark-slate) |
| `--base-on-palette-1-text-color … 9` | Readable text on each slot |

> **Unitless multipliers:** font sizes, radii, input heights and the spacing scale
> are stored as plain numbers and combined by components against `--base-rem` — e.g.
> `calc(var(--base-font-size-base) * var(--base-rem))`. This keeps sizing consistent
> across all KeenMate components while remaining scalable.

## Related

- [`@keenmate/theme-designer`](https://github.com/keenmate/theme-designer) — visual
  theme designer & generator that produces `--base-*` values from 3 input colors.

## License

MIT © KeenMate
