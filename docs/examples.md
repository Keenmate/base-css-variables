# Examples — @keenmate/base-css-variables

Worked patterns beyond the quick start: the examples site, and the one rendering method every
component that draws a checkbox shares. Re-theming a single region (`.base-scope`) is in
[theming.md](theming.md#inputs-and-derived-tokens); motion levels and the loader's drawing lines
are in [variables.md](variables.md#motion).

## The examples site

The examples site lives in the [GitHub repo](https://github.com/Keenmate/base-css-variables) (not in
the npm package; `make dev` → http://localhost:15300). One page per feature, live with
web-multiselect and web-treeview: theming and `.base-scope`, light / dark, roles, surfaces and text,
forms and the checkbox, item states, sizing and density, icons and the palette, motion, the loader,
and every variable. The design notes are there too.

- `examples-derived.html` — compares the derived formulas against the compiled pure-admin themes,
  with live input pickers and formula knobs.
- `examples-fill-states.html` — text on fills (WCAG 2 vs APCA pick, with both scores), hover / press
  options for buttons, and how a theme overrides a button component's state tokens.
- `examples-variables.html` — every `--base-*` token in logical groups, marked input or derived,
  with its light and dark value, a preview and its definition.

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
