# Theming — @keenmate/base-css-variables

Override any `--base-*` variable in your own `:root` — the value flows into every
component (for overriding on part of a page, see *Re-theming part of a page* below):

```css
:root {
  --base-primary-color: #e11d48;   /* rebrand every component's primary color */
  --base-main-bg: #fafafa;
  --base-border-radius-md: 1;      /* rounder corners everywhere */
}
```

## Inputs and derived tokens

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

## What belongs in the contract

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

## Light / dark mode

Colors are defined with CSS [`light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark),
so they follow the active `color-scheme`.

- **Automatic** — the file sets `color-scheme: light dark` on `:root`, so it
  follows the operating-system preference out of the box.
- **Manual** — force a theme on any subtree:

  ```html
  <html data-theme="dark">   <!-- or data-theme="light" -->
  ```

  or set `color-scheme: light | dark` on any element.

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
