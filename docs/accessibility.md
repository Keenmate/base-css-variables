# Accessibility — @keenmate/base-css-variables

This package is a stylesheet of custom properties: it renders nothing, has no keyboard surface and
sets no ARIA. Keyboard navigation, roles and screen-reader behaviour belong to each component and are
documented in that component's own `docs/accessibility.md`. What the contract does own is the visual
side every consumer inherits — contrast, focus and motion — listed here.

## Contrast

- **Text on fills** — `--base-on-<role>-text-color` and `--base-on-palette-N-text-color` are black or
  white, whichever reads better on the fill by APCA (Lc ≥ 45 on every default fill). A theme with a
  fill near the black / white tie should hand-set the token. `examples-fill-states.html` shows the
  WCAG 2 and APCA pick side by side, with both scores.
- **Text levels** — `--base-text-color-2 / 3 / 4` are `--base-text-color-1` mixed 75 / 55 / 40% into
  `--base-main-bg`. Level 4 is for disabled and decorative text only, not for content.
- **Role text** — `--base-<role>-text-color` is the role as *foreground* on the page surface (a dark
  shade in light mode, a light shade in dark mode), so links and status text stay readable where the
  vivid `--base-<role>-color` fill would not.
- **Control outlines** — `--base-input-border-color` has about twice the divider's
  (`--base-border-color`) contrast, so a field reads as a field.
- **Light / dark** — colors are `light-dark()` pairs and follow `color-scheme`; the file sets
  `color-scheme: light dark` on `:root`, so the OS preference is honoured by default (see
  [theming.md](theming.md#light--dark-mode)).

## Focus

- **Keyboard focus on an item** — `--base-focused-outline` (`var(--base-outline-width) solid
  var(--base-primary-color)`) marks the one item the keyboard / mouse cursor is on in lists, trees and
  grids. Consumers draw it as an inset `outline`, so it never shifts layout or bleeds onto neighbouring
  rows. `--base-focused-bg` is `transparent` by default: the outline alone marks focus.
- **Focused input** — `--base-input-border-focus` (the primary color) plus the
  `--base-input-box-shadow-focus` halo.
- **Focus vs selection** — focus (one item) and selection (0..n items) are separate states with
  separate tokens, so keyboard users can see the cursor inside a selection. See
  [variables.md → Item states](variables.md#item-states).

## Motion

- **`prefers-reduced-motion: reduce`** sets the four `--base-duration-*` speeds to `0s` and
  `--base-scroll-behavior` to `auto` (instant), and beats every `data-motion` level, `smooth`
  included. Components do the same for their own variables, so it holds without the contract too.
- **The loader** is the one loop that keeps moving under reduced motion — it slows to `1.5s` per turn
  instead of stopping, because a stopped loader reads as frozen.
- **Turning motion off** for a page, a region or one component: `data-motion="none"`, or the
  durations set to `0s` (see [variables.md → Motion](variables.md#motion)).
