# Variable reference — @keenmate/base-css-variables

Naming is intentionally **not 1:1** between the base layer and component variables.
For example `--ms-primary-bg` and `--drp-primary-bg` both read `--base-hover-bg`. Always
theme via the `--base-*` variables listed here.

These tables are the complete `--base-*` contract, mirrored token-for-token by
`@keenmate/pure-css` (`$base-*`). **Input** marks a hand-set token (defaults are the
pure-admin Corporate theme, light / dark); *Derived* marks a formula — see
[Inputs and derived tokens](theming.md#inputs-and-derived-tokens). Unmarked rows are plain values
(sizes, icons, …).

## Primary role
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

## Secondary role
| Variable | Purpose |
|----------|---------|
| `--base-secondary-color` | **Input.** Neutral grey secondary action color |
| `--base-secondary-color-hover` | Hover step. *Derived:* like primary |
| `--base-secondary-color-active` | Active / pressed step. *Derived:* like primary |
| `--base-secondary-bg-subtle` | Secondary tint. *Derived:* like primary |
| `--base-secondary-bg-subtle-hover` | The secondary tint on hover. *Derived:* like primary |
| `--base-secondary-text-color` | Secondary as foreground on a surface. *Derived:* like primary |
| `--base-on-secondary-text-color` | Text on the secondary fill. *Derived:* black or white, whichever reads better on the fill by APCA (Lc ≥ 45 on every default fill); hand-set it for a fill near the tie |

## Background / surface
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

## Item states
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

### Drop target
Where a dragged item or file can land: tree rows, dropzones, grid column reorder, pure-admin's file
dropzone. The success tint by default, so a drop target never looks like the primary-tinted
selection next to it; a theme restyles every drop here without touching selection
(`examples-drop-target.html`). A drop that is *not allowed* stays a danger tint in the component.

| Variable | Purpose |
|----------|---------|
| `--base-drop-target-bg` | A valid target while a drag is in progress (the "armed" dropzone). *Derived:* `var(--base-success-bg-subtle)` |
| `--base-drop-target-bg-active` | The target under the pointer. *Derived:* `var(--base-success-bg-subtle-hover)` |
| `--base-drop-target-border-color` | Border / outline of a drop target. *Derived:* `var(--base-success-color)` |

## Text
| Variable | Purpose |
|----------|---------|
| `--base-text-color-1` | **Input.** Primary — default body text, titles |
| `--base-text-color-2` | Secondary — muted labels, supporting text. *Derived:* text-color-1 75% into main-bg |
| `--base-text-color-3` | Tertiary — icons, metadata, paths, placeholders, hints. *Derived:* 55% |
| `--base-text-color-4` | Faint — disabled, decorative. *Derived:* 40% |

## Borders
| Variable | Purpose |
|----------|---------|
| `--base-border-width` | Shared stroke width the shorthands compose from |
| `--base-border-color` | Standard border color. *Derived:* main-bg shifted in lightness |
| `--base-border` | Full border shorthand. *Derived:* `var(--base-border-width) solid var(--base-border-color)` |
| `--base-checkbox-border-color` | Checkbox border. *Derived:* `var(--base-input-border-color)` — a control outline, not the divider |

## Input fields
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

## Dropdown / popover
| Variable | Purpose |
|----------|---------|
| `--base-dropdown-bg` | Dropdown / popover background. *Derived:* `var(--base-main-bg)` |
| `--base-dropdown-border` | Dropdown border. *Derived:* from `--base-border-width` + `--base-border-color` |
| `--base-dropdown-box-shadow` | Dropdown shadow. *Derived:* `0 8px 16px var(--base-shadow-color)` |

## Tooltip
| Variable | Purpose |
|----------|---------|
| `--base-tooltip-bg` | Tooltip background — always dark. *Derived:* text-color-1 85% into main-bg (light) / main-bg lifted (dark) |
| `--base-tooltip-text-color` | Tooltip text. *Derived:* main-bg (light) / text-color-1 (dark) |

## Status colors
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

## Typography
| Variable | Purpose |
|----------|---------|
| `--base-font-family` | Font stack (sans) |
| `--base-font-family-mono` | Monospace font stack |
| `--base-font-size-2xs … 2xl` | Font sizes (unitless multipliers): `2xs` `xs` `sm` `base` `lg` `xl` `2xl` |
| `--base-font-weight-normal / medium / semibold / bold` | Font weights (400 / 500 / 600 / 700) |
| `--base-line-height-tight / normal / relaxed` | Line heights |
| `--base-list-bullet-type` | Default `ul, ol` marker (`disc` / `circle` / `square` / `none` / `decimal` / …) |

## Sizing
| Variable | Purpose |
|----------|---------|
| `--base-border-radius-sm / md / lg` | Corner radii (unitless multipliers) |
| `--base-checkbox-scale` | Checkbox box scale (multiplies the box size; `1` = base). See [Checkbox render method](examples.md#checkbox-render-method) |
| `--base-input-size-xs…xl-height` | Standard input heights (unitless multipliers) |
| `--base-rem` | Rem base (`1rem`) the unitless multipliers combine against |

## Spacing scale
Unitless multipliers, combined as `calc(var(--base-space-*) * var(--base-rem))`.

| Variable | Purpose |
|----------|---------|
| `--base-space-xs / sm / md / base / lg / xl / 2xl` | Spacing scale steps (0.4 → 4.8) |
| `--base-tree-indent` | Indent per tree level (`1.6` = 16px at 10px rem base) — treeviews, grid tree column, multiselect tree; a consumer multiplies by the level itself |

## Elevation / shadow scale
Colored from `--base-shadow-color` so shadows theme with the surface.

| Variable | Purpose |
|----------|---------|
| `--base-shadow-sm` | Small elevation shadow. *Derived:* `0 1px 3px` |
| `--base-shadow-md` | Medium elevation shadow. *Derived:* `0 2px 8px` |
| `--base-shadow-lg` | Large elevation shadow. *Derived:* `0 4px 12px` |

## Motion
Components use only these four speeds and these easings — every transition and animation duration
goes through a component variable that chains here (`--ms-transition-fast:
var(--base-duration-fast, 0.1s)`). Short and snappy is the house style.

- **Motion off, page-wide:** set `--base-duration-fast / normal / medium / slow: 0s` (and
  `--base-scroll-behavior: auto`), or use the shortcut `<html data-motion="none">` (below).
- **Motion off, one component:** set its `--<prefix>-transition-*: 0s`, or `data-motion="none"` on it.
- **`prefers-reduced-motion: reduce`** sets the four durations to `0s` (and each component does
  the same for its own variables, so it holds without the contract too). The loader slows
  instead (see Loader).

### Motion level

`data-motion` on any element (`<html>`, a section, a component) sets the four speeds and the scroll
behaviour for everything inside it:

| `data-motion` | fast / normal / medium / slow | `--base-scroll-behavior` |
|---------------|-------------------------------|--------------------------|
| *(unset)* / `auto` | 0.1s / 0.15s / 0.25s / 0.3s (`:root`) | `smooth` |
| `none` | 0s / 0s / 0s / 0s | `auto` (instant) |
| `snappy` | 0.05s / 0.08s / 0.12s / 0.15s | `smooth` |
| `smooth` | 0.15s / 0.25s / 0.35s / 0.45s | `smooth` |

```html
<html data-motion="snappy">           <!-- the whole app -->
<section data-motion="none">…</section> <!-- one region -->
```

Components built on `@keenmate/web-components-core` also take a `motion="auto | none | snappy |
smooth"` attribute (core writes the matching `data-motion` onto the element) and a page-wide
`window.components.motion`. Core carries the same presets, so the levels work on a page without
this file too.

**Which one wins:** the OS `prefers-reduced-motion: reduce` beats every level, `smooth` included →
the element's own level → the nearest `data-motion` ancestor → `:root` → the component's
fallback. The loader is not part of the levels: it keeps its `--base-loader-duration`.

`<html data-motion>` and a page's own `:root { --base-duration-*: … }` have the same specificity, so
whichever stylesheet loads later wins there; on a section or a component the level always wins.

| Variable | Purpose |
|----------|---------|
| `--base-duration-fast / normal / medium / slow` | Transition durations (0.1s / 0.15s / 0.25s / 0.3s; `0s` under reduced motion) |
| `--base-ease-standard` | Standard easing `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--base-ease-out` | Ease-out `cubic-bezier(0, 0, 0.2, 1)` |
| `--base-ease-in` | Ease-in `cubic-bezier(0.4, 0, 1, 1)` |
| `--base-scroll-behavior` | Programmatic scrolling — `smooth`; `auto` (instant) under reduced motion. CSS `scroll-behavior`, or read in JS and passed as `behavior` to `scrollTo` / `scrollIntoView` |

## Loader
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
  and WebKit (`e2e/loader.spec.ts`, `examples-loader.html`).
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

## Z-index scale
Generic stacking tiers for overlay coordination.

| Variable | Purpose |
|----------|---------|
| `--base-z-dropdown` | Dropdown (7500) |
| `--base-z-modal-backdrop` | Modal backdrop (6000) |
| `--base-z-modal` | Modal (7000) |
| `--base-z-popover` | Popover (7600) |
| `--base-z-toast` | Toast (8000) |
| `--base-z-tooltip` | Tooltip (9000) |

## Breakpoints
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

## Icons
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

## Theme palette slots
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
