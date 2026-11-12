# Design decisions — why the contract looks the way it does

This document explains the thinking behind `@keenmate/base-css-variables`: what we wanted to
achieve, why things are built the way they are, and which other paths we looked at and turned
down. It is for anyone who changes the contract or builds a component on top of it.

It is not a reference. The token tables live in [variables.md](variables.md), the how-to in
[usage.md](usage.md) and [theming.md](theming.md). When those documents say *what*, this one says
*why*.

It replaces the working notes written during the 2.0 cycle (October 2026): the 2.0 color-contract
plan, the component audits, the rc03 component plan, the treeview hand-off and the
contract-check plan. Their task lists are finished or have moved to the component repos; the
reasoning is kept here.

---

## Contents

1. [The goal: one knob for the whole stack](#1-the-goal-one-knob-for-the-whole-stack)
2. [The page defines, components only read](#2-the-page-defines-components-only-read)
3. [Few inputs, many derived tokens](#3-few-inputs-many-derived-tokens)
4. [What belongs in the contract — and what doesn't](#4-what-belongs-in-the-contract--and-what-doesnt)
5. [Naming](#5-naming)
6. [Roles: one brand color, seven tokens each](#6-roles-one-brand-color-seven-tokens-each)
7. [Text on colored fills](#7-text-on-colored-fills)
8. [Text levels, borders and inputs](#8-text-levels-borders-and-inputs)
9. [Item states: focused, selected, checked](#9-item-states-focused-selected-checked)
10. [Light and dark mode](#10-light-and-dark-mode)
11. [Sizes: unitless multipliers, with a few px exceptions](#11-sizes-unitless-multipliers-with-a-few-px-exceptions)
12. [Motion and the loader](#12-motion-and-the-loader)
13. [Keeping components honest: the check and the parity test](#13-keeping-components-honest-the-check-and-the-parity-test)
14. [Releasing breaking changes](#14-releasing-breaking-changes)
15. [Mistakes we found in components](#15-mistakes-we-found-in-components)
16. [Open questions](#16-open-questions)

---

## 1. The goal: one knob for the whole stack

A Keenmate app is usually pure-admin (the page layout and its CSS) with several web components
inside it: a multiselect, a date picker, a grid, a tree. Before this package, each of those had
its own colors. Changing the brand color meant finding the right variable in five places, and
the results still didn't quite match — one component's "danger, hovered" was a different red
from another's.

The contract fixes this by giving everything one shared set of names, the `--base-*` tokens.
pure-admin reads them (through pure-css), and every component reads them. Change
`--base-primary-color` once and the whole page — layout and components — follows.

Two consequences shape everything else in this document:

- **There is exactly one source of truth.** pure-css mirrors this token list into Sass, but it
  must not invent tokens of its own or drift from this list. If two places define the same
  thing, they will eventually disagree.
- **Consistency comes from reading the same name**, not from having the same value. Two
  components that both use `#3b82f6` look the same today; two components that both read
  `--base-primary-color` look the same after a re-theme too.

---

## 2. The page defines, components only read

**What we do.** The page (or pure-admin) loads `base-variables.css`, which defines the tokens on
`:root`. A component never defines a `--base-*` token. It only reads them, always with a fallback
of its own:

```css
--ms-accent-color: var(--base-primary-color, #3b82f6);
```

**Why.** Custom properties inherit into shadow roots, so a component can read whatever the page
defines. If a component defined the tokens itself, it would fight with the page:

- Defaults injected on `:root` by a component would compete with pure-css's own `:root`, and the
  winner would depend on load order.
- Defaults set on the component's `:host` would block the page's theme entirely, because the
  component's value would be the nearest one.

The fallback means a component still works on a page that doesn't load the contract at all.
That is a real use case — people use a single component in a plain app.

**What we didn't do.** We considered making the package a runtime dependency of every component,
so the tokens would always be present. That would bring back exactly the "who defines it"
conflict above, and it would force the contract onto apps that don't want it. Instead, components
take the package as a **devDependency** only, and use it to check themselves at build time (see
[section 13](#13-keeping-components-honest-the-check-and-the-parity-test)).

---

## 3. Few inputs, many derived tokens

**What we do.** Since 2.0 the file has two kinds of tokens, in two blocks:

- **Inputs** are set by hand. They are what a theme actually decides: the page and main
  backgrounds, the main text color, the six role colors, the status text colors, the overlay,
  the shadow color and the palette — about 28 colors — plus the size, type and motion scales.
- **Derived tokens** are calculated from the inputs with `color-mix()` and OKLCH relative
  colors: hover and active steps, tints, text levels 2–4, surfaces, borders, the text color on
  each fill, and the input, dropdown and tooltip colors.

**Why.** In 1.x every token was a hand-picked value. A theme had to set a hundred-odd colors, and
most themes didn't: they changed the primary color and left the hover, the tint and the text on
it at the old blue's values. Derived tokens make the rule "set the inputs, the rest follows"
true. They also mean pure-admin and the components agree on a hover color without either of
them choosing one.

A derived token can still be set by hand. A plain value simply replaces the formula, so a theme
that really wants a specific elevated surface can have it.

**Why the derived block is declared three times.** The derived block is declared on
`:root, [data-theme], .base-scope`, not only on `:root`. The reason is how CSS resolves custom
properties: a `var()` inside a custom property is resolved on the element that *declares* it.
If the formulas lived only on `:root`, setting `--base-primary-color` on a sidebar would change
the primary color there, but the hover and tint — already resolved on `:root` — would stay the
old ones. Declaring the block again on `[data-theme]` and `.base-scope` gives a page a way to
re-theme a part of itself: put the inputs on an element with one of those hooks, and every
derived token inside recalculates.

`[data-theme]` is already how a subtree forces light or dark, so it gets the recalculation
for free; `.base-scope` is the explicit opt-in for any other element. Declaring the block on
*every* element (`*`) would also work, but then every element on the page would carry a few
hundred extra declarations.

---

## 4. What belongs in the contract — and what doesn't

The contract has three layers, and a token's layer decides where it lives:

1. **Inputs** — what a theme decides. **Kept few on purpose**: every new input is work for every
   theme, and an input nobody sets is just a default with a misleading name.
2. **Derived tokens** — shared formulas for any question more than one consumer asks: "what is
   the hover color of danger?", "what text goes on a primary fill?". This layer is **free to
   grow**, because a theme never has to set anything in it.
3. **Component tokens** — one component's design choices, such as a button's hover fill or an
   outline variant. They stay in the component (`--pa-btn-*`, `--drp-button-apply-*`) and default
   to the contract.

**The rule for moving things.** When a second consumer starts drawing the same thing, its token
is promoted into the contract as a derived default. Until then it stays in the one component
that needs it.

**Why there are no button-state tokens.** We considered putting button hover and pressed fills
in the contract. We decided against it: apart from the primary button (the date picker's Apply,
the grid's Go, the dropzone buttons), no web component draws filled role buttons, and each of
those already has its own button tokens. The contract provides the ingredients
(`-color-hover`, `-color-active`, `--base-on-<role>-text-color`); how a button combines them —
the text stays, the fill moves away from the text, the border follows the fill — is the button
component's design.

**Why role colors stay in the contract anyway.** We also asked the opposite question: should the
role colors leave the contract and become component tokens? No. If pure-admin and a component
each derive their own "danger, hovered", they will drift apart, which is the problem the contract
exists to solve. Because the steps are derived, a theme still sets only `-color`.

**An observation that supported this.** When we looked at the pure-admin themes, almost all of
their `--pc-*` and `--pa-*` overrides were dark-mode repeats of values the contract now derives
(Corporate: 50 of 58 overrides were in the dark-mode block). Themes rarely design at the
component level; they set the inputs.

---

## 5. Naming

**Names say what type they are (2.0).** A token's name ends in what it holds:

- `-color` — any color value (`--base-input-text-color`);
- `-bg` — a background color (`--base-hover-bg`);
- or the CSS shorthand it feeds: `-border`, `-outline`, `-box-shadow`.

Before 2.0 there were names like `--base-input-text` (a color? a size? a weight?) and
`--base-focused-ring` ("ring" is not a CSS property). Every reader had to look them up. With
the type in the name, you can tell how to use a token without opening the reference.

**Names are not 1:1 with component variables, on purpose.** web-multiselect's
`--ms-primary-bg` reads `--base-hover-bg`; the date picker's `--drp-primary-bg` reads
`--base-main-bg`. The component name describes the component's role ("the primary surface of
this widget"), the contract name describes the shared meaning. Don't "fix" one to match the
other.

**Common words over invented ones.** Where the industry has a word, we use it: *selected*,
*focused*, *checked*, *primary*. See [section 9](#9-item-states-focused-selected-checked) for the
one place where that meant a painful rename.

---

## 6. Roles: one brand color, seven tokens each

**One brand role.** 1.x had both `accent` and `primary`, with `primary` as an alias of
`accent`. Nobody could say which to use, and both appeared in the same component. 2.0 keeps one
name, `primary`, because that is what every CSS framework and design tool calls it.

**Every role has the same seven tokens.** The six roles (primary, secondary, success, danger,
warning, info) each have:

| Token | What it is |
|---|---|
| `--base-<role>-color` | the vivid identity of the role, also its solid fill |
| `-color-hover`, `-color-active` | darker steps of the fill (lighter in dark mode) |
| `-bg-subtle`, `-bg-subtle-hover` | a tint: the role color mixed into the background |
| `-text-color` | the role used as text on a normal surface |
| `--base-on-<role>-text-color` | text drawn *on* the role's fill |

**Why the same set everywhere.** In 1.x the roles had different subsets — success had no active
step, secondary had no tint — and every gap was filled differently by every component. A full,
regular set means a component can switch a role by changing one word in a token name, and a
theme knows exactly what exists. The cost is a few tokens that no one reads yet; since they are
derived, that cost is close to zero.

**Why the fill and the text color are separate.** The vivid fill is often too light to read as
text. `#dc2626` danger red on a dark background has a contrast of about 3.6:1. So `-text-color`
is a separate token: a darker shade in light mode, a lighter one in dark mode.

**Why one tint per role.** 1.x had `-bg`, `-bg-light`, `-bg-subtle` and `-border` per role. `-bg`
turned out to be an exact copy of `-color`, nobody read `-border`, and `-bg-light` and
`-bg-subtle` were two names for nearly the same thing. 2.0 keeps one tint: 10% of the role color
in light mode and 20% in dark mode, because the same 10% almost disappears on a dark background.

**Why disabled is not a role step.** A disabled control looks the same whatever its role, so
there is one `--base-disabled-opacity` (0.65) instead of a disabled step per role. Before this
token existed, components used anything from 0.4 to 0.6.

**The default primary is blue-500 `#3b82f6`.** The default theme is pure-admin's "Corporate",
whose primary is sky `#0ea5e9`. We kept Corporate for everything else but changed the primary:
sky is too light to read as text, and its tint is hard to tell from white.

**How the hover and active steps are mixed.** Today they are sRGB mixes with black (light mode)
or white (dark mode): 15% for hover, 30% for active. We are evaluating OKLCH lightness steps
instead, which keep the hue more stable; see [section 16](#16-open-questions).

---

## 7. Text on colored fills

**What we do.** `--base-on-<role>-text-color` and `--base-on-palette-N-text-color` are derived:
the formula picks **black or white**, whichever reads better on the fill. Change the fill and
the text follows.

**Why derived.** In 1.x these were hand-set, usually to white. When a theme changed a fill to a
light color, the white text stayed and became unreadable. White on amber `#f59e0b` warning was
about 2.1:1, so the warning toast in web-multiselect got *worse* when the contract was loaded.

**Why APCA and not WCAG 2.** We first used the WCAG 2 contrast formula. On mid-tone fills it
often picks black — black on sky blue, black on pink — and when we looked at the results, white
was clearly easier to read in those cases. APCA, the contrast model being developed for WCAG 3,
matches what people actually see much better for these colors. With the APCA pick, no fill in
the contract or in any of the 16 pure-admin themes scores below Lc 45.
`examples-fill-states.html` shows both picks side by side, with their scores.

**How it is calculated in CSS.** The formula is APCA's luminance, computed with relative color
syntax. APCA raises each channel to the power 2.4. Firefox has no `pow()` on color channels,
so the power is written as a polynomial that is close enough. The constants are rounded to two
digits, which matches exact APCA except where black and white differ by less than 1 Lc — a tie
either way. Chromium, Firefox and WebKit give the same result.

**Four fills got darker.** So that white text also passes WCAG 2 on the defaults, four fills are
one shade darker than in 1.x: danger `#dc2626`, palette 5 `#7c3aed`, palette 6 `#4f46e5` and
palette 8 `#0369a1`.

**Near-ties.** On a few fills black and white score almost the same (the default success and info
are close). A theme that prefers the other color can set the token by hand.

---

## 8. Text levels, borders and inputs

**Four text levels, derived from one.** `--base-text-color-2/3/4` are `--base-text-color-1`
mixed into `--base-main-bg` at 75%, 55% and 40%. A theme sets one text color and gets a
consistent ladder. The levels have fixed meanings:

1. body text;
2. secondary, muted text;
3. icons, metadata, paths, placeholders, hints;
4. disabled and decorative only — never content.

**Why placeholders use level 3, not 4.** Level 4 gave placeholders a contrast of about 2.1–2.5:1,
too faint to read. Level 3 is still clearly "not a value yet", but readable.

**Why a field's outline is stronger than a divider (2.0.0-rc02).** `--base-border-color` is the
divider between areas, and it is meant to be quiet. When controls used it too, an empty input
on a white card was nearly invisible. `--base-input-border-color` has about twice the divider's
contrast, so a field reads as a field.

**Why a focus halo.** A focused input changes its border to the primary color and adds a soft
halo, `--base-input-box-shadow-focus`. A border-color change alone was too subtle to notice,
especially on a field that already had a colored border.

**Copies follow their source.** Tokens that are "the same as X" are written as `var(X)`, not as
X's value pasted in. `--base-input-text-color` is `var(--base-text-color-1)`;
`--base-dropdown-bg` is `var(--base-main-bg)`. In 1.x several of them were pasted literals, so
overriding the source left the copies behind. A few tokens are deliberately *not* derived
because their values genuinely differ per mode, for example `--base-input-bg` and
`--base-hover-bg`.

---

## 9. Item states: focused, selected, checked

**The model.** Lists, trees and grids share one model with three states, the same as Windows
Explorer or macOS Finder:

| State | Meaning | How it looks |
|---|---|---|
| **focused** | the one item the keyboard / mouse cursor is on | an inset outline |
| **selected** | the set picked by click, Ctrl-click, Shift-click — 0 to n items | a primary tint |
| **checked** | the item's checkbox is ticked | the checkbox only, no row style |

Pointer hover (`--base-hover-bg`) is not an item state; it is the general interaction overlay.

**Why focus is an outline with no fill.** Focus and selection are separate, so keyboard users
can see where the cursor is *inside* a selection. If focus were also a fill, a focused selected
row and a selected row would look the same. The outline is drawn inset, so it never shifts the
layout or overlaps a neighbouring row.

**Why we renamed `highlighted` to `selected` (2.0.0-rc03).** The first version called the picked
set *highlighted*. That word reads like hover or search-match emphasis. Worse, *selected* meant
the checkbox in the treeviews but the picked option in web-multiselect, so the same word meant
two things in two components on one page. We switched to the common words: *selected* for the
picked set, *checked* for the checkbox. There are no aliases (see
[section 14](#14-releasing-breaking-changes)).

**Why the treeview API rename takes two releases.** For the CSS tokens the rename was simple.
For the treeview *API* it was not: `selectedPaths` keeps its type (`string[]`) but changes
meaning, from "checked" to "picked". An app that upgraded in one step would compile and quietly
use the wrong set. So the plan was:

1. **A minor release** adds the *checked* names (`checkedPaths`, `isChecked`, …) as the new home
   of the checkbox API, and keeps the old checkbox names as deprecated aliases that warn.
2. **A major release** removes the deprecated checkbox names, then renames the highlight API to
   *selected*.

This way no release changes what an existing name means while the old code still compiles.

**Drop targets are a fourth look.** When something is dragged over a tree or list, the target
uses `--base-drop-target-*`, a **success** tint by default, not primary. A drop target next to a
primary-tinted selection was too easy to confuse with it; green reads as "you can drop here".

---

## 10. Light and dark mode

**What we do.** Colors are written as `light-dark(<light>, <dark>)` and follow the CSS
`color-scheme`. The file sets `color-scheme: light dark` on `:root`, so it follows the operating
system by default. `[data-theme="light"]` / `[data-theme="dark"]` force a mode on any subtree.

**Why `light-dark()`.** The alternative is duplicate blocks — a light value on `:root` and a dark
value in `@media (prefers-color-scheme: dark)` and in `.dark` classes. That doubles every color
and the two copies drift apart. With `light-dark()` each token is one line and switching mode is
just changing `color-scheme`, which also works inside shadow roots.

**Mode-invariant tokens are single values.** Icons, the spacing, shadow, motion and z-index
scales, the type multipliers and the palette slots don't change with the mode, so they are plain
values, not `light-dark()` pairs.

**Dark mode inside components.** Components must not use `:host-context()` to find a dark
ancestor — Firefox doesn't support it and Safari only partly. web-components-core instead sets
`data-context-theme="dark|light"` on the host, which the component's CSS can match with
`:host([data-context-theme="dark"])`. And components must not add hex overrides for dark mode:
`light-dark()` and the contract already provide the dark values (see
[section 15](#15-mistakes-we-found-in-components)).

---

## 11. Sizes: unitless multipliers, with a few px exceptions

**What we do.** Font sizes, radii, input heights, the spacing scale and the tree indent are bare
numbers. Consumers multiply them by `--base-rem`:

```css
font-size: calc(var(--base-font-size-base) * var(--base-rem));
```

**Why.** One token, `--base-rem`, scales every size on the page — useful for a compact admin
screen or a large touch kiosk. A component can also scale on its own by setting its own rem
(`--ms-rem`) without touching anything else.

**The 10px assumption.** pure-admin sets `html { font-size: 10px }`, so `--base-rem: 1rem` means
10px there and a multiplier of `1.6` is 16px. On a page with the browser's default 16px root, the
same multipliers come out 1.6× larger. Standalone, components therefore fall back to `10px`
rather than `1rem`, and allow this difference in their contract check. This is a known wrinkle;
see [section 16](#16-open-questions).

**Why some tokens are plain px.** The breakpoints (`--base-breakpoint-mobile`, `-tablet`), the
dropdown offset and the touch-target minimum are plain `px`:

- breakpoints are compared with the viewport, which media queries measure in px regardless of
  the root font size;
- the dropdown offset is read in JavaScript and passed to the positioning code, which works in
  px;
- the touch-target minimum (`44px`) is a physical size for a finger. It must not shrink when an
  app makes its text smaller.

**Z-index is a shared scale.** Components used to pick their own z-index values, from 9999 to
100000, so their popovers fought each other and pure-admin's modals. They now read
`--base-z-dropdown` / `-popover` / `-tooltip`, with the same numbers as their standalone
fallback, so a page can restack everything from one place.

---

## 12. Motion and the loader

**Four speeds, no one-offs.** Components animate only with the four `--base-duration-*` speeds
and the `--base-ease-*` easings. A component that needs "a bit slower" picks the next speed
rather than inventing 180ms. The look we want is *snappy over animated*: motion that confirms an
action, not motion that makes the user wait.

**Why a fixed set.** It keeps the stack feeling like one product, and it gives a page one place
to change motion: set the four durations and everything follows.

**Motion levels.** `data-motion="none | snappy | smooth"` on any element sets the four speeds
and the scroll behaviour for everything inside it; the nearest one wins. `none` is the shortcut
for motion off (durations of `0s` in CSS still work too). web-components-core ships the same
values, and its test compares them with this file, so the two can't drift.

**Reduced motion always wins.** `prefers-reduced-motion: reduce` sets the durations to `0s` and
scrolling to instant, and it beats every level, `smooth` included. A user's accessibility setting
is not something a page design should override. That is why the reduced-motion block comes
*after* the level rules in the file.

**One loader, and it keeps turning.** The loader is one shape for the app and every component
(`--base-loader-icon` and friends), drawn as a mask painted with `currentColor` plus a rotation.
A theme swaps the loader in one token, and it reaches into shadow roots. Its duration is the one
exception to the four speeds, and the one thing that keeps moving under reduced motion: it slows
to 1.5s per turn instead of stopping, because a stopped loader looks like a frozen app.

---

## 13. Keeping components honest: the check and the parity test

**The problem.** Components read a token with a fallback of their own. When the contract renames the token, or
its default changes, nothing breaks: the fallback quietly takes over. We found this many times
in the 2.0 audit — a component reading a removed `--base-accent-color`, four components with
four different hover fallbacks for the same token (`#2563eb`, `#106ebe`, …), a component that
looked one way standalone and another way with the contract loaded.

**The check (`base-contract-check`).** The package ships a script that components run in their
build. It reads `base-variables.css` itself, so there is no second token list to keep in sync:

- **C1** — every `--base-*` a component reads or sets exists. A renamed or removed name says what
  to use instead, from `renames.json`.
- **C2** — the fallback of an *input* token equals the contract default, in both modes.
- **C3** — the fallback of a *derived* token is a formula on the component's own tokens, not a
  literal.

**Why C3 is an error, not a warning.** A literal hover such as `#2563eb` is correct only for the
default blue. An app that sets the component's accent to green, without the contract, would
get a green button with a blue hover. Writing the contract's formula on the component's own
accent makes the component behave the same with or without the contract.

**Why the check ships inside this package.** We considered a separate package. Keeping it here
means the check and the token list are always the same version: when a component bumps its
devDependency, it gets the new tokens and the rules that know about them in one step.

**Why the parity test runs in each component's e2e.** The static check can't tell whether a
formula gives the *same color* as the contract (a 10% tint where the contract uses 10% light /
20% dark, for example). `testing/parity.mjs` renders the component with and without the contract,
in light and dark, and compares every color token. We put it in each component's own e2e, not in
this repo, so the component author finds out before their release, against the contract version
they actually depend on.

**Deliberate differences are allowed, with a reason.** A component can list exceptions in
`contract-check.json`, each with a written reason — for example the 10px rem, or a component
that inherits the page font instead of imposing the contract's. The check refuses an entry
without a reason, so every difference is explained where it is made.

---

## 14. Releasing breaking changes

**2.0 renamed things without aliases.** We could have kept `--base-accent-color` as an alias of
`--base-primary-color` for a while. We chose not to:

- Aliases double the surface. Every alias is another name that themes might set and components
  might read, and the 1.x `accent` / `primary` pair showed that people keep using both.
- An alias in CSS can't warn. Nobody notices they are on the old name until it is removed.
- The check covers the migration instead: C1 reports every old name with its replacement from
  `renames.json`, and the contract's e2e asserts that removed names are really gone.

**`renames.json` is part of the contract.** Every renamed or removed token gets an entry (old
name, new name, version), so the check can say "use X" instead of just "unknown token".

**The contract and pure-css change together.** pure-css mirrors the token list into Sass.
A token added here without the pure-css mirror means pure-admin themes can't set it; a token
removed here but left in pure-css keeps a dead name alive. Every token change lists the matching
pure-css change.

---

## 15. Mistakes we found in components

The 2.0 audit read every component against the contract. The same mistakes came up again and
again. Each one has a rule now, and most are caught by the check or the parity test.

| Mistake | Why it's wrong | Do this instead |
|---|---|---|
| Using a role fill as text (`color: var(--base-danger-color)`) | The vivid fill is too light as text, especially in dark mode | `--base-<role>-text-color` |
| Putting `--base-on-<role>-text-color` on a different fill | The text color is picked for *that role's* fill only | Fill and text from the same role |
| Pasting a tint (`color-mix(… 10%, primary)`) | Stays at 10% in dark mode, where the contract uses 20%; ignores theme overrides | `--base-<role>-bg-subtle` |
| Hex values in a dark-mode block | Throws away the whole theme in dark mode (web-dropzone replaced every color) | Let `light-dark()` and the contract handle the mode |
| `:host-context()` for dark mode | Not supported in Firefox, partial in Safari | `:host([data-context-theme="dark"])` from web-components-core |
| A dead fallback chain: `--base-dropdown-bg`, falling back to `--base-elevated-bg`, falling back to a literal | The contract always defines the first token, so the middle step never runs, but the docs describe it as if it did | One fallback, matching the contract |
| Extra `opacity` on a placeholder | The placeholder color is already a faint text level; dimming it again makes it unreadable | Use `--base-input-placeholder-color` as it is |
| Controls drawn with the divider color | Inputs and buttons disappear on a card | `--base-input-border-color` |
| Literal fallbacks for derived tokens (`#2563eb` hover) | Correct only for the default accent | The contract formula on the component's own accent (C3) |
| Inline `z-index: 10000` in JavaScript | Overrides the token, so the page can't restack it | Read the z-index token |
| Inventing `--base-*` names in examples (`--base-input-background`) | Sets nothing, and tests that check it pass for the wrong reason | Only contract names (C1 also scans HTML and Markdown) |

---

## 16. Open questions

These are known and deliberately left open. Each needs a decision before it changes.

- **The 10px root behind `--base-rem`.** The multipliers assume `html { font-size: 10px }`, as in
  pure-admin. On a page with a 16px root, loading the contract makes every component 1.6× larger.
  Components work around it by falling back to `10px` and allowing the difference. Possible fixes
  are a px-based `--base-rem` (loses scaling with the user's font size) or multipliers re-based
  on 16px (a breaking change for every consumer). Not decided.
- **OKLCH for the role steps.** Hover, active and role text are sRGB mixes with black or white.
  The alternative is a step in OKLCH lightness, which changes only how light the color is and
  keeps its hue and saturation. `examples-role-steps.html` (RS01) shows both on every role, with
  the difference per step. Waiting for a decision.
- **Near-tie text on fills.** On fills where black and white score almost the same in APCA (the
  default success and info), the automatic pick can feel wrong. Today a theme sets the token by
  hand; a tie-breaker rule might be better.
- **Parity test in light DOM.** `contractParity()` probes inside a shadow root. svelte-treeview
  renders in light DOM and had to reimplement the test; the helper could support that case.
