# Plan — components check themselves against the contract (build-time dependency)

Date: 2026-10-25. Status:
- **Phase 1 published** in 2.0.0-rc04 (check + renames.json).
- **Phase 2 implemented** (2.0.0-rc05 WIP, uncommitted): `testing/parity.mjs` (`contractParity`), C3 alias
  rule, symlink CLI fix, number normalisation fix; 17 unit tests.
- **Phase 3 done locally (uncommitted) in web-multiselect, web-treeview, web-daterangepicker:** devDependency
  `^2.0.0-rc04` + `check:contract` in `build` + `contract-check.json` + `e2e/contract-parity.spec.ts`
  (+ `test/contract-parity.html`); full e2e green in all three. The parity specs import
  `@keenmate/base-css-variables/testing/parity`, which needs **rc05 published** — locally linked with
  `npm i --no-save ../base-css-variables`; after publishing, bump the devDependency to `^2.0.0-rc05`.
- 2026-10-27: rc05 published; the three components committed on `^2.0.0-rc05` (multiselect 7d5d081,
  treeview 2d8f064, daterangepicker 2be6a83), not pushed.
- Remaining: web-grid, web-dropzone, web-commandpalette, svelte-treeview.

First run (`base-contract-check src --report`, 2026-10-25), findings before any allowlist:

| Component | Reads | C1 | C2 | C3 |
|---|---|---|---|---|
| web-multiselect | 126 | 0 | 23 | 21 |
| web-treeview | 66 | 0 | 11 | 12 |
| web-daterangepicker | 89 | 1 | 13 | 39 |
| web-grid (packages/web-grid) | 75 | 1 | 26 | 31 |
| web-dropzone (packages/web-dropzone) | 55 | 0 | 14 | 7 |
| web-commandpalette | 91 | 0 | 7 | 8 |
| svelte-treeview | 151 | 7 | 22 | 18 |

Typical C2: dark `--base-main-bg` `#1a1a1a` vs `#1e293b`, `--base-text-color-1`, shadow colour
without the dark value, z-index / disabled-opacity / `--base-rem: 10px` (some deliberate →
allowlist). Typical C3: hover `#2563eb`, tints, text levels, on-fill `#fff`, tooltip, shadows.

## Problem

No package depends on `@keenmate/base-css-variables`. Components read `var(--base-*, fallback)`
and pure-css mirrors the token list by hand, so nothing notices when a component:

- reads a token the contract doesn't have (renamed / removed / never existed) — the fallback
  takes over silently;
- carries a fallback that no longer matches the contract default — the component looks
  different standalone than with the contract (the multiselect sky fill + `#2563eb` hover).

Today's scan (every `var(--base-*)` read in `src`, against `base-variables.css` 2.0.0-rc03):

| Component | `--base-*` reads | Unknown to the contract |
|---|---|---|
| web-multiselect | 85 | — |
| web-commandpalette | 90 | — |
| web-treeview | 57 | — |
| web-daterangepicker | 55 | `--base-icon-calendar` (forward reference, by comment) |
| web-grid | 40 | `--base-accent-color` (removed in 2.0) |
| web-dropzone | 26 | — |
| svelte-treeview | 51 | `--base-highlighted-bg` / `-bg-hover` / `-outline` / `-text-color` (renamed in rc03) |

Stale fallbacks for `--base-primary-color-hover` alone: web-multiselect `#2563eb`,
web-daterangepicker `#2563eb`, web-grid `#106ebe`, web-dropzone `light-dark(#2563eb, #3b82f6)`.
Only web-treeview uses the contract formula on its own accent.

## Decision

- **Build-time dependency, not runtime.** Each component gets `@keenmate/base-css-variables`
  as a **devDependency**. Components never *define* `--base-*` (injecting `:root` defaults would
  compete with pure-css's `:root`; setting them on `:host` would block page themes) — the
  contract stays "the page defines, components read".
- The pinned devDependency version = the contract version the component speaks. Bumping it is
  a deliberate step; the check then lists what changed.
- Optional: `peerDependencies` + `peerDependenciesMeta: { optional: true }` as a signal to apps
  that install the contract themselves. Documentation only — pure-admin apps get the tokens from
  pure-css and never see the warning.

## Phase 1 — the check, shipped in base-css-variables

Ship one script in the package so every component runs the same rules:

- `bin/check-contract.mjs`, exposed as `"bin": { "base-contract-check": … }`, added to `files`.
- It parses the `base-variables.css` next to it (no second token list): name, input vs derived
  (`:root` block vs the derived block), light / dark default.
- `renames.json` (shipped): removed / renamed names with the version, e.g.
  `--base-highlighted-bg → --base-selected-bg (2.0.0-rc03)`, `--base-accent-color →
  --base-primary-color (2.0.0)`, so errors say what to use.

Usage in a component: `base-contract-check src/css` (globs, comments stripped, also `.ts` for
inline styles).

Rules:

| # | Rule | Level |
|---|---|---|
| C1 | every `var(--base-x…)` read exists in the contract (hint from `renames.json`) | error |
| C2 | the fallback of an **input** token equals the contract default (hex normalised, `light-dark()` compared per mode) | error |
| C3 | the fallback of a **derived** token is not a literal — it's the contract formula on the component's own accent (`color-mix(…, var(--ms-accent-color))`) or a `var()`. A literal only fits the default accent: an app that sets `--ms-accent-color` standalone keeps the old hover / tint / text. | error |
| C4 | allowlist file in the component (`contract-check.json`): token + reason, for deliberate differences and forward references (`--base-icon-calendar`) | — |

Tests in this repo: fixtures with one case per rule; `npm test` runs them.

## Phase 2 — runtime parity test (catches what static parsing can't)

C3 can't prove a formula fallback gives the same colour as the contract. **Decided 2026-10-25:
the test runs in each component's own e2e**, against the contract version pinned in its
devDependency — the component author finds out before release. The logic ships in the package
(next to the check script) as a Playwright helper, e.g.
`@keenmate/base-css-variables/testing/parity.mjs`; a component's spec is ~10 lines (tag name,
accent token, allowlist). It loads `node_modules/@keenmate/base-css-variables/base-variables.css`.
The helper:

- render each component twice, without and with `base-variables.css`, in light and dark;
- for every colour-valued `--xx-*` token, apply it to a probe inside the shadow root
  (`probe.style.color = var(--xx-token)`) and read the computed colour — unregistered custom
  properties don't resolve `color-mix()` / `light-dark()` on their own;
- standalone ≠ contract → failure, unless on the component's allowlist.

This is the test that answers "does the component look the same with and without the contract".
A second pass sets the component's accent (`--xx-accent-color`) to a different hue standalone and
checks hover / tint / text-on-fill follow it (the contract formulas applied to that hue).

Optional cross-check (not a gate): this repo's e2e runs the same helper against the sibling
`dist/` builds after a contract change, to list which components a change affects.

## Phase 3 — adopt in the components

Per component, one commit:

1. `npm i -D @keenmate/base-css-variables@^2.0.0-rc03`.
2. `"check:contract": "base-contract-check src/css"`, run in `build` (web-multiselect: next to
   `check:vars:strict`).
3. `e2e/contract-parity.spec.ts` using the shipped helper; runs in the component's CI.
4. Fix findings: hover / text / tint fallbacks as formulas on the component's accent (the
   web-treeview pattern), the unknown reads in the table above.
5. CHANGELOG note.

Order: web-multiselect (already has the manifest check; the reported bug), web-daterangepicker,
web-grid, web-dropzone, web-commandpalette, web-treeview; svelte-treeview with its rc03 rename
task (`handoff-treeview-selected-checked.md`).

## Phase 4 — optional

- **pure-css mirror check:** the same script diffs the token names against pure-css's
  `src/scss/variables/_base.scss` and the `output-base-css-variables` mixin (pure-css devDepends on
  the package). Belongs to the pure-css session.
- **Example pages:** load `base-variables.css` in the component demos (as
  `examples-theming.html` does) or keep them standalone on purpose — with Phase 2 green both look
  the same, so it's a presentation choice.

## Release

- base-css-variables: `bin/check-contract.mjs`, `renames.json` and `testing/parity.mjs` ship in
  the next rc (added to `files`; no token change). `@playwright/test` is a peer of the helper only —
  components already have it.
- Components: devDependency only, no runtime change except the fixed fallbacks.

## Open questions

1. ~~Ship inside or separate?~~ **Decided 2026-10-25: inside `@keenmate/base-css-variables`.**
2. ~~C3 strictness?~~ **Decided 2026-10-25: every derived fallback is a formula (C3 = error).**
   Inputs (the accent itself) stay literals equal to the contract default.
3. ~~Where does Phase 2 live?~~ **Decided 2026-10-25: in each component's e2e**, helper shipped in the package.
