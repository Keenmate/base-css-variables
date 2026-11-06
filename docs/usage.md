# Usage — @keenmate/base-css-variables

How to load the contract, how its tokens are organised, and how a component checks itself against it.
The full token list is in [variables.md](variables.md); overriding it is in [theming.md](theming.md).

## Loading the stylesheet

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
- **active** — pressed — a stronger overlay (selection is `--base-selected-bg`, see [Item states](variables.md#item-states))
- **disabled** — inert / readonly surface

Role-specific surfaces default into this scale — `--base-input-bg` and `--base-dropdown-bg`
are `var(--base-main-bg)`; `--base-tooltip-bg` is its own always-dark tone — but each can be
retargeted on its own. That's the whole point of keeping them as distinct tokens.

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
