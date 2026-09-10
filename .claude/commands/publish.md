---
description: Prepare @keenmate/base-css-variables for npm publish — bump version, finalize CHANGELOG/README, verify, commit
argument-hint: rc|release|patch|minor|major
---

# /publish — prepare an npm release of @keenmate/base-css-variables

You are preparing this package for `npm publish`. **Do not run `npm publish`** — the user logs in and publishes manually.

This command follows the canonical `/publish` structure shared across KeenMate component packages (see `@keenmate/pure-css`'s `/publish`). Sections marked **[canonical]** are byte-identical across every package's `/publish`; sections marked **[per-repo]** are customized for this repo's layout.

**What makes this repo different from pure-css:** there is **no build step**. `base-variables.css` is authored by hand and IS the published artifact — no SCSS, no compile, no `dist/`, no tests. The release gate here is (a) the CSS being well-formed and (b) the `--base-*` token list staying in sync with `@keenmate/pure-css`'s `$base-*` mirror.

## Argument [canonical]

The release type: **$ARGUMENTS**

Must be one of:

- `rc` — ship the WIP rc as-is. The topmost CHANGELOG heading (e.g. `## [1.1.0-rc01] — 2026-09-10`) gets ` [PUBLISHED]` appended.
- `release` — promote a WIP rc to a final release. `X.Y.Z-rcN` → `X.Y.Z`. CHANGELOG heading is renamed to match the new version.
- `patch` — SemVer patch bump. Drops any `-rc` suffix.
- `minor` — SemVer minor bump. Drops `-rc`. Resets patch.
- `major` — SemVer major bump. Drops `-rc`. Resets minor and patch.

If missing or invalid, stop and ask the user which one to use (don't guess).

## Repo layout [per-repo]

Single-file, zero-build package, everything at root:

- **`./package.json`** — `version` field is the source of truth. Has no `scripts` (nothing to build). `files` ships `base-variables.css`, `README.md`, `CHANGELOG.md`, `LICENSE` (npm always adds `package.json`).
- **`./base-variables.css`** — the canonical `--base-*` contract and the **only** shipped code artifact. Authored directly; there is nothing to compile.
- **`./CHANGELOG.md`** — at the root. Topmost `## [X.Y.Z] — YYYY-MM-DD` heading **without** the `[PUBLISHED]` marker is the WIP section. Date separator is an **em-dash** (` — `, U+2014).
- **`./README.md`** — at the root. Carries `## What's New in X.Y.Z` sections near the top (one per release, the **two most recent** retained), **no `v` prefix**. Also carries the hand-maintained "Variable reference" tables that must match the tokens in `base-variables.css`.
- **`./Makefile`** — wraps `npm pack` / `npm publish` (`make publish` / `make publish-rc`). No `build`/`clean` targets — there's nothing to build.

There is **no `dist/`, no `src/`, and no test suite.**

## CHANGELOG convention in this repo [canonical]

There is **no `## [Unreleased]` section**. The WIP section is the topmost `## [X.Y.Z] — YYYY-MM-DD` heading without a `[PUBLISHED]` tag. Already-released sections carry `[PUBLISHED]` at the end of their heading:

```
## [1.1.0] — 2026-09-15                       ← WIP, the one you're shipping
### Added
- ...

## [1.0.0] — 2026-09-10 [PUBLISHED]
### Added
- ...
```

Publishing the WIP section means **appending ` [PUBLISHED]`** to its heading — exact format: `## [X.Y.Z] — YYYY-MM-DD [PUBLISHED]` (em-dash date separator). The next development cycle creates a fresh `## [next-version] — <date>` heading on its first CHANGELOG edit.

**The `1.0.0` section may not carry `[PUBLISHED]` yet** if the package hasn't been published under this convention. Don't retro-add the tag to older sections — only finalize the section you're shipping.

## Resolve versions [canonical]

Read `./package.json` `version` as `CURRENT_VERSION`.
Read the topmost `## [X.Y.Z...]` heading from `./CHANGELOG.md` as `WIP_VERSION` (the version the latest WIP section is tagged for).

Compute `NEW_VERSION`:

| Argument | Logic |
|---|---|
| `rc` | If `CURRENT_VERSION` matches `X.Y.Z-rcN`, `NEW_VERSION = CURRENT_VERSION` (no bump — we're shipping what's already in package.json). If `CURRENT_VERSION` is not an rc, stop and ask the user (they probably wanted `release`/`patch`/etc.). |
| `release` | If `CURRENT_VERSION` matches `X.Y.Z-rcN`, `NEW_VERSION = X.Y.Z`. Otherwise stop. |
| `patch` | Strip any `-rcN`, then bump patch. |
| `minor` | Strip any `-rcN`, then bump minor, reset patch. |
| `major` | Strip any `-rcN`, then bump major, reset minor and patch. |

If `WIP_VERSION` ≠ `NEW_VERSION` (e.g. the WIP is `X.Y.Z-rcN` but the user asked for `release`), the CHANGELOG heading rename in step 3 also re-tags the section to `NEW_VERSION` — call this out in the report so the user notices.

## Steps (in order)

### 1. Sanity checks [per-repo]

- Run `git status`. If there are uncommitted changes that aren't `CHANGELOG.md`, `README.md`, `package.json`, or `base-variables.css`, list them and ask the user before continuing. (Typical case: a token change in `base-variables.css` belonging in this release that hasn't been committed yet — confirm it's intended for this version before bumping.) The `.claude/` directory is intentionally untracked — that's fine.
- **Verify the new version isn't already on npm.** Run `npm view @keenmate/base-css-variables@<NEW_VERSION> version 2>/dev/null` — if it returns the version string, that version is already published and **stop**: bumping over it would fail at publish time and pollute the commit.
- **Verify the registry hasn't drifted past you.** Run `npm view @keenmate/base-css-variables version` to fetch the latest published version on the `latest` tag; if it's higher than `NEW_VERSION`, warn the user and ask before continuing. (If the package has never been published, this returns nothing — that's fine for a first release.)
- Confirm the WIP CHANGELOG section has at least one bullet of substantive content under `### Added`, `### Changed`, `### Removed`, or `### Fixed`. If empty, stop — there's nothing meaningful to release.
- Confirm `./README.md` has a `## What's New in WIP_VERSION` section (no `v` prefix). If it's missing, draft one from the CHANGELOG and present it to the user for approval before continuing:
  - Read the WIP CHANGELOG section, distill it to 3–8 scannable bullets covering the Added/Changed themes (paraphrase — the CHANGELOG is exhaustive; What's New is the highlight reel). Pure internal tidy-ups don't need coverage.
  - **Format** (mirror the existing `## What's New in 1.0.0` section — that's the canonical shape for this repo):
    - **Heading:** `## What's New in NEW_VERSION` — no `v` prefix, no backticks, no date.
    - **Each bullet:** `- **<area> — <one-line headline>** — <engineer-level prose>`. Bold-wrapped lead phrase, then a true em-dash (` — `, U+2014 with surrounding spaces), then prose explaining *what changed*, *why*, and *which concrete tokens are affected* (name them inline, e.g. `--base-accent-color`, `--base-main-bg`). Plain hyphens or en-dashes fail the canonical check.
    - **No `### ` sub-headings** inside a What's New section — it's a flat bullet list.
  - Show the user the proposed draft as plain markdown in your reply. Ask whether to (a) insert as-is, (b) edit, or (c) abort so they can write it themselves.
  - Only proceed past step 1 once the user approves. On approval, insert the section directly above the current top `## What's New in X.Y.Z` heading in `./README.md`, then continue. Do not silently insert — the writing voice is the user's call.

### 2. Bump version (if needed) [canonical]

If `NEW_VERSION` ≠ `CURRENT_VERSION`, edit `./package.json` and change `"version": "CURRENT_VERSION"` to `"version": "NEW_VERSION"`.

For `rc` arg this is normally a no-op — version was bumped earlier in the development cycle.

### 3. Finalize CHANGELOG [canonical]

In `./CHANGELOG.md`:

- If `WIP_VERSION` ≠ `NEW_VERSION` (e.g. promoting `X.Y.Z-rcN` → `X.Y.Z`), rename the WIP heading from `## [WIP_VERSION] — <date>` to `## [NEW_VERSION] — <today>` (today's date from system context).
- If `WIP_VERSION` == `NEW_VERSION`, leave the bracketed version alone but update the date to today **if** the existing date is stale (more than a few days old).
- In either case, **append ` [PUBLISHED]`** to the heading so it reads exactly: `## [NEW_VERSION] — YYYY-MM-DD [PUBLISHED]` (keep the em-dash date separator).
- Leave all bullet content untouched.
- **Do not** create an empty new WIP section — the next dev cycle's first CHANGELOG edit will create one.

### 4. Update README "What's New" — only if version changed [canonical]

In `./README.md`:

- If the existing `## What's New in WIP_VERSION` section's version differs from `NEW_VERSION`, rename its heading to `## What's New in NEW_VERSION` (no `v` prefix). No content rewrites.
- Then count the `## What's New in X.Y.Z` headings. If there are more than **two**, delete the oldest ones so only the **two most recent** remain.

For `rc` arg this is normally a no-op on the heading itself.

### 5. Validate README reflects the release [per-repo]

Two checks, both because README is hand-maintained documentation of the contract:

- **What's New coverage.** Read the finalized CHANGELOG section and the matching `What's New in NEW_VERSION` section. Every **Added** or **Changed** bullet that represents a user-facing token/behavior change should have a corresponding (paraphrased) hit in What's New. If a significant entry is missing, add a bullet. Keep What's New to ≤ ~8 scannable bullets.
- **Variable-reference tables match the CSS.** If this release **added, removed, or renamed** any `--base-*` token in `base-variables.css`, confirm the "Variable reference" tables in `README.md` were updated to match. If a token changed and the table didn't, stop and fix the table (or ask the user) — a published contract whose docs lie about its tokens is a real defect here.

### 6. Validate CHANGELOG entries match recent work [canonical]

Find the previous `[PUBLISHED]` tag in CHANGELOG (the version just before NEW_VERSION) and locate the commit that bumped to it. Run `git log --oneline <previous-publish-commit>..HEAD` to list commits since. (If nothing has published under the `[PUBLISHED]` convention yet, use the previous CHANGELOG section's bump commit, or the repo root, as the boundary.)

Also check `git status` for any uncommitted work outside the files you're editing in this command.

For every substantive commit or uncommitted change, verify the WIP CHANGELOG section mentions it. If something significant is missing, **stop and ask the user** — don't invent entries. Pure doc/example tweaks and typo fixes don't need entries.

### 7. Tests [per-repo]

**This repo has no test suite** — it's a static CSS file with no runtime. There is nothing to run. Proceed.

### 8. Validate the artifact + contract sync [per-repo]

There is no build. Instead, gate the release on the CSS itself and its sync with pure-css:

- **CSS well-formedness.** Confirm `base-variables.css` still has a `:root { … }` block, defines `--base-*` custom properties, and has balanced braces (no truncation / stray edit). A quick read of the head and the `:root` close is enough — this file is the artifact, so a broken file ships broken.
- **`--base-*` ↔ pure-css `$base-*` sync (the defining check).** `@keenmate/pure-css` mirrors this token list into SCSS at `../pure-css/src/scss/variables/_base.scss` (and related `variables/` partials). If this release **added, removed, or renamed** a `--base-*` token, the mirror there must gain/lose/rename the matching `$base-*`. If the sibling repo is checked out next to this one, diff the token *names* (not values — pure-css owns its own defaults) and report any drift. If it's not available locally, **explicitly flag in the report** that the pure-css mirror still needs the same change — this is the easiest thing to forget and the whole point of the "one contract" design.

If either check fails, stop and report.

### 9. Verify the package contents [per-repo]

Run `npm pack --dry-run` (or `make verify`) and confirm the file list is exactly:

- `base-variables.css`
- `README.md`
- `CHANGELOG.md`
- `LICENSE`
- `package.json`

If anything is missing or anything private leaked in (e.g. `Makefile`, `.claude/`, `node_modules/`), stop and report — the `files` field in `package.json` controls this and needs fixing before publish.

### 10. Commit [canonical]

Stage:

- `./CHANGELOG.md`
- `./README.md`
- `./package.json`
- `./base-variables.css` — **only if** this release actually changed it (a token add/remove/edit). A docs-only or version-only release won't touch it.

Commit message format:

```
vNEW_VERSION - <one-line summary of the headline change>

<grouped bullets paraphrased from the CHANGELOG section — same groups the
CHANGELOG used: Added, Changed, Fixed, etc. Keep bullets terse; full prose
lives in the CHANGELOG.>

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

### 11. Report [canonical]

Report back with:

- The new version number
- The commit SHA
- Whether the pure-css `$base-*` mirror needs a matching change (from step 8) — call it out prominently if the sibling repo wasn't available to diff.
- The exact commands to publish. **Pick the right one for the arg type:**
  - For `rc` (publishing a pre-release):
    ```
    npm login          # if not already logged in
    make publish-rc    # npm publish --tag rc
    ```
    The `--tag rc` is critical — without it npm assigns the `latest` dist-tag, making the pre-release the default install for everyone. With `--tag rc` (what `make publish-rc` does) the `latest` tag stays put and consumers opt in via `@rc` or by pinning the exact version.
  - For `release` / `patch` / `minor` / `major` (publishing a stable release):
    ```
    npm login          # if not already logged in
    make publish       # npm publish as latest
    ```
    No `--tag` needed — it lands as `latest`.
- A reminder that the CHANGELOG `[PUBLISHED]` tag is now in place — if `npm publish` fails, the user should revert both the tag (CHANGELOG heading) and the version bump (`package.json`) before retrying, since the registry refuses to re-publish the same version.

## Things not to do [canonical]

- **Do not run `npm publish`.** The user publishes manually after `npm login` (via `make publish-rc` / `make publish`).
- **Do not push to git remote.** The commit stays local until the user pushes.
- **Do not create an empty `[Unreleased]` or new WIP heading** in CHANGELOG after finalizing — the next dev cycle's first edit creates the next heading.
- **Do not retro-fix older CHANGELOG sections** that are missing the `[PUBLISHED]` tag — only finalize the section you're shipping.
- **Do not silently insert a drafted What's New section** — present it and wait for approval.
- **Do not keep more than two `## What's New in X.Y.Z` sections** in the README.
- **Do not invent CHANGELOG entries** to cover commits you find; ask the user if something's missing.
- **Do not bump if there's nothing meaningful in the WIP section** — stop and explain.

### Repo-specific don'ts

- **Do not add a `v` prefix to `## What's New` headings** — this repo's convention is `## What's New in X.Y.Z` without the `v`.
- **Do not use a hyphen as the CHANGELOG date separator** — this repo uses an em-dash (` — `) in `## [X.Y.Z] — YYYY-MM-DD` headings.
- **Do not add, rename, or remove a `--base-*` token without (a) updating the README reference tables and (b) flagging the matching change needed in pure-css's `$base-*` mirror.** The two token lists are a contract; drifting them apart is the one mistake this package exists to prevent.
- **Do not look for a build/`dist/` step** — there is none. `base-variables.css` is the artifact.
