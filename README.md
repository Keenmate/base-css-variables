# @keenmate/base-css-variables

The shared **base layer** of CSS custom properties (`--base-*`) used by all
KeenMate web components — [web-multiselect](https://www.npmjs.com/package/@keenmate/web-multiselect),
[web-daterangepicker](https://www.npmjs.com/package/@keenmate/web-daterangepicker),
[web-grid](https://www.npmjs.com/package/@keenmate/web-grid), web-treeview, and more.

Each component ships its own prefixed variables (`--ms-*`, `--drp-*`, `--wg-*`, …)
that **cascade from these `--base-*` values**. Define the base layer once and every
component picks up a consistent, coordinated theme. Override a single `--base-*`
variable and the change propagates everywhere.

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

Background surfaces layer outward from the canvas; each step is a little more
prominent:

```
--base-main-bg  →  --base-elevated-bg  →  --base-hover-bg  →  --base-active-bg
```

- **main** — base canvas (page, grid, panel, dropzone)
- **elevated** — raised areas: headers, toolbars, dropdowns, popovers
- **hover** — pointer hover on a surface (rows, options)
- **active** — pressed / selected
- **inverse** — high-contrast surface, used for tooltips

Role-specific surfaces (`--base-input-bg`, `--base-dropdown-bg`, `--base-tooltip-bg`)
default to values in this scale but can be retargeted on their own — that's the
whole point of keeping them as distinct tokens.

## Theming

Override any `--base-*` variable in your own `:root` (or any scope) — the value
flows into every component:

```css
:root {
  --base-accent-color: #e11d48;   /* rebrand every component's accent */
  --base-main-bg: #fafafa;
  --base-border-radius-md: 1;      /* rounder corners everywhere */
}
```

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

## Variable reference

Naming is intentionally **not 1:1** between the base layer and component variables.
For example `--ms-primary-bg` reads `--base-hover-bg`, and `--drp-primary-bg` reads
`--base-main-bg`. Always theme via the `--base-*` variables listed here.

### Accent colors
| Variable | Purpose |
|----------|---------|
| `--base-accent-color` | Primary brand / action color |
| `--base-accent-color-hover` | Accent hover state |
| `--base-accent-color-active` | Accent active / pressed state |
| `--base-accent-color-light` | Subtle accent tint for backgrounds |
| `--base-accent-color-light-hover` | Subtle accent tint, hover |

### Background / surface
| Variable | Purpose |
|----------|---------|
| `--base-main-bg` | Main surface (inputs, dropdowns) |
| `--base-elevated-bg` | Elevated surfaces: headers, toolbars, popovers |
| `--base-hover-bg` | Hover state for any surface (option/row hover) |
| `--base-active-bg` | Active / pressed surface |
| `--base-inverse-bg` | Inverse surface (fallback for tooltip background) |

### Text
| Variable | Purpose |
|----------|---------|
| `--base-text-color-1` | Headers, titles, high-emphasis |
| `--base-text-color-2` | Body text, labels |
| `--base-text-color-3` | Secondary content, subtitles |
| `--base-text-color-4` | Hints, placeholders, captions |
| `--base-text-color-on-accent` | Text on accent backgrounds |
| `--base-text-inverted` | Inverse of main text (on inverse / accent surfaces) |

### Borders
| Variable | Purpose |
|----------|---------|
| `--base-border-color` | Standard border color |
| `--base-border` | Full border shorthand (`1px solid …`) |

### Input fields
| Variable | Purpose |
|----------|---------|
| `--base-input-bg` | Input background |
| `--base-input-color` | Input text color |
| `--base-input-border` | Input border (normal) |
| `--base-input-border-hover` | Input border on hover |
| `--base-input-border-focus` | Input border on focus |
| `--base-input-placeholder-color` | Placeholder text |
| `--base-input-bg-disabled` | Disabled input background |
| `--base-disabled-bg` | Disabled / readonly surface |

### Dropdown / popover
| Variable | Purpose |
|----------|---------|
| `--base-dropdown-bg` | Dropdown / popover background |
| `--base-dropdown-border` | Dropdown border |
| `--base-dropdown-box-shadow` | Dropdown shadow |

### Tooltip
| Variable | Purpose |
|----------|---------|
| `--base-tooltip-bg` | Tooltip background |
| `--base-tooltip-text-color` | Tooltip text |
| `--base-tooltip-color` | Tooltip text alias (web-grid) |

### Status colors
| Variable | Purpose |
|----------|---------|
| `--base-danger-color` | Danger / error color |
| `--base-danger-bg` | Danger background |
| `--base-danger-bg-light` | Subtle danger background |
| `--base-success-bg` | Success background |
| `--base-success-color` | Text on success background |
| `--base-warning-bg` | Warning background |
| `--base-warning-color` | Text on warning background |
| `--base-checkbox-border-color` | Checkbox border |

### Typography
| Variable | Purpose |
|----------|---------|
| `--base-font-family` | Font stack |
| `--base-font-size-2xs … 2xl` | Font sizes (unitless multipliers) |
| `--base-font-weight-normal / medium / semibold` | Font weights |
| `--base-line-height-tight / normal / relaxed` | Line heights |

### Sizing
| Variable | Purpose |
|----------|---------|
| `--base-border-radius-sm / md / lg` | Corner radii (unitless multipliers) |
| `--base-input-size-xs…xl-height` | Standard input heights (unitless multipliers) |

> **Unitless multipliers:** font sizes, radii and input heights are stored as
> plain numbers and combined by components with their rem scale — e.g.
> `calc(var(--base-font-size-base) * 0.1rem)`. This keeps sizing consistent
> across all KeenMate components while remaining scalable.

## Related

- [`@keenmate/theme-designer`](https://github.com/keenmate/theme-designer) — visual
  theme designer & generator that produces `--base-*` values from 3 input colors.

## License

MIT © KeenMate
