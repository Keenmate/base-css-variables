# Plan — 2.0.0 color contract cleanup

Repo-only working doc (not shipped — see `files` in package.json). 2.0.0 is a
**breaking** release: renames/removals land **without aliases**. Every change is
mirrored in pure-css (`$base-*` / `--pc-*`, parity script) and its consumers.

**Repos touched:** base-css-variables, pure-css, pure-admin (core + demo),
pure-admin-themes, web-multiselect, web-treeview, svelte-treeview,
web-daterangepicker, web-grid (`packages/web-grid`), web-dropzone
(`packages/web-dropzone`). web-switch, web-timepicker, web-editor, web-wysiwyg
read no `--base-*`.

Status legend: **DONE** · **DISCUSS** (open, needs a decision) · **OUT OF SCOPE**

---

## 1. Palette slots — DONE

`--base-color-N` → `--base-palette-N` (`$base-palette-N`, `$palette-N`,
`--pc-palette-N`); text pair `--base-color-N-text` → `--base-on-palette-N-text-color`
(`$on-palette-N-text-color`, `--pc-on-palette-N-text-color`). Class modifiers
(`pa-*--color-N`, `.text-color-N`, `.bg-color-N`, …) unchanged.

## 2. One brand role: `accent` → `primary` — DONE

| Was | Now |
|---|---|
| `--base-accent-color[-hover\|-active]` | `--base-primary-color[-hover\|-active]` |
| `--base-accent-color-light[-hover]` | `--base-primary-bg-subtle[-hover]` (color-mix 5% / 8%) |
| `--base-text-color-on-accent` | `--base-on-primary-text-color` (§6) |
| `--base-primary-*` aliases | removed (nothing left to alias) |
| `$accent-color` / `$accent-light` / `$accent-hover` | `$primary-color` / `$primary-bg-subtle` / `$primary-bg-subtle-hover` |
| `--pc-accent` / `-light` / `-hover` | `--pc-primary` / `-bg-subtle` / `-bg-subtle-hover` |
| — | new `--pc-primary-hover` / `--pc-primary-active` (darker steps) |

Renamed by meaning: `--pc-accent-hover` was the low-alpha **tint**. Places that used
it as a darker hover (notification + tooltip link hover text, range-thumb hover,
scrollbar `:active`) were bugs — they now read `--pc-primary-hover` / `-active`.
Component tokens (`--ms-accent-color`, …) keep their names. Core manifest/schema
category `accent` → `primary`; stale `base-primary-bg[-hover]` (old surface alias)
dropped; demo inline styles off the ghost `--base-primary-bg`.

## 3. Role families — DONE

- `-bg` removed (copy of `-color`). Fixed web-multiselect messages (text read the
  role color = invisible on the role background).
- One tint: `--base-<role>-bg-subtle` = `light-dark(color-mix 10%, color-mix 20%)`;
  `-bg-light` removed. Core's `--pa-<role>-bg-light` reads it; `--pa-<role>-bg-subtle`
  removed (callouts 8% → 10%). `-border` later removed entirely (§6) — nothing read it.
  web-grid's invalid cell reads `--base-danger-bg-subtle`. Theme Sass overrides
  and mode-block overrides set `--base-<role>-bg-subtle`.
- `-text-light` removed (+ core's unused `--pa-<role>-text-light`, `$badge-<role>-*`).
- Decided: **no new tokens** — secondary keeps `-color` / `-hover`, status roles
  get no `-active`, until a component needs them.

## 4. Text — DONE

- `--base-text-color-1…4` descriptions fixed: primary/body, secondary/muted,
  tertiary (icons, metadata), faint (hints, placeholders, disabled).
- `--base-text-inverted` / `--base-inverse-bg` removed (review pass) — the components only used
  inverse-bg as a never-reached fallback behind `--base-tooltip-bg`; the tooltip keeps its own pair.
- "Text on a fill" is always `--base-on-*-text-color` (§6).

## 5. Copies that don't follow their source — DONE (contract)

`--base-border`, `--base-input-border-color`, `--base-input-border`,
`--base-dropdown-border`, `--base-checkbox-border-color` ← `--base-border-color`;
`--base-input-border-hover/-focus` ← `--base-primary-color` (were `#0ea5e9`);
`--base-input-text-color` ← `--base-text-color-1`; `--base-input-icon-color` ←
`--base-text-color-3`; `--base-dropdown-bg` ← `--base-main-bg`. Locked by
`e2e/derivation.spec.ts` (override a source → dependents follow; mutation-tested).
Not derived (values genuinely differ per mode): `--base-input-placeholder-color`,
`--base-dropdown-box-shadow`, `--base-input-bg`, `--base-hover-bg`.

## 6. Names state their type — DONE

Rule: a token ends in what it is — `-color` (any color value), `-bg` (background
color), or the CSS shorthand it feeds (`-border`, `-outline`, `-box-shadow`). Bare
`-text` (color? size? weight?) and `-ring` (not a CSS property) are gone.

| Was | Now |
|---|---|
| `--base-ring-width` | `--base-outline-width` |
| `--base-highlighted-ring` / `--base-focused-ring` | `-outline` |
| `--base-highlighted-text` / `--base-focused-text` | `-text-color` |
| `--base-input-color` | `--base-input-text-color` |
| `--base-input-clear-color` / `-clear-bg-hover` | `--base-input-icon-color` / `-icon-bg-hover` (all input icons) |
| `--base-tooltip-color` | folded into `--base-tooltip-text-color` (web-grid moved over) |
| `--base-<role>-text` | `--base-<role>-text-color` |
| `--base-text-on-<role>` / `-on-palette-N` | `--base-on-<role>-text-color` / `--base-on-palette-N-text-color` |
| `--base-<role>-border` | removed — nothing read it (only two demo pages; switched to inline `color-mix`) |

pure-css mirrors all of it (`$base-*`, `$<role>-text-color`, `--pc-<role>-text-color`,
`--pc-on-palette-N-text-color`). Locked by e2e: old names must be undefined.

## 6b. Review pass — DONE

- Primary tint follows the role pattern: `--base-primary-bg-subtle` 10% / 20% (hover 15% / 30%);
  `--pc-primary-bg-subtle[-hover]` read it (pure-admin + components share one value).
- `--base-shadow-color` mode-aware (15% / 40%); `--base-dropdown-box-shadow` derives from it.
- Inverse pair removed (see §4); stale `base-surface-*` legacy docs dropped from core.
- web-treeview: dead `--wtv-selected-bg/-border/-border-color` removed.

## 7. Non-color scales nobody reads — OUT OF SCOPE

`--base-space-*`, `--base-shadow-sm/md/lg`, `--base-z-*`, `--base-duration-*`,
`--base-ease-in/-out`, `--base-font-weight-bold`.

---

## Follow-ups (outside this pass)

- **web-commandpalette** — its manifest check reads the *published*
  pure-admin-core bundle; migrate (accent → primary, palette) when it bumps core.
- **theme-designer** — generates `--base-*`; ~400 old names (accent, palette, `-bg`,
  `-bg-light`, `--base-primary-bg`). Has unrelated uncommitted work; migrate separately.
- **Apps** with theme copies (keenmate-web, registr-smluv, entra-brand-designer, …).
- ~~pure-css runtime follow~~ — DONE (pure-css `1fa04a5`): derived `$base-*` default to the
  contract formulas; only inputs are Sass colours. e2e expectations moved to Corporate (42/42).
- **pure-admin-theme.schema.json** `colors.accent` / `accentHover` (theme preview
  metadata, not the CSS contract) — rename with the theme CLI if wanted.

## Verification

- `node ../pure-css/scripts/check-base-parity.mjs` — 167 tokens match.
- Sweep: zero old names in sources / compiled output (outside CHANGELOG history).
- pure-css build; core + all 16 themes compile against local pure-css.
- `npm run test:e2e` here (31: item states + derivation + removed-names check).
- web-multiselect / web-daterangepicker `check:vars:strict`; all components build.
