#!/usr/bin/env node
/**
 * base-contract-check — checks a component's `var(--base-*, fallback)` reads against
 * the contract (the base-variables.css shipped next to this script).
 *
 *   C1  every --base-* read exists in the contract (renames.json says what to use)
 *   C2  the fallback of an INPUT token equals the contract default (per mode)
 *   C3  the fallback of a DERIVED token is a formula, not a literal: a literal only
 *       matches the default accent, so an app that sets the component's accent
 *       without the contract keeps the old hover / tint / text
 *
 * A fallback that is a component token (`var(--ms-accent-color)`) is followed to
 * its declaration, so `var(--base-primary-text-color, var(--ms-accent-color))`
 * is judged by what --ms-accent-color is standalone (#0ea5e9 → a literal).
 *
 * Usage:  base-contract-check [paths…] [--config contract-check.json]
 *                             [--contract base-variables.css] [--report] [--json]
 * Paths default to `src`. Scans .css .scss .ts .js .mjs .svelte (comments stripped),
 * skips node_modules / dist. Exit 1 on any finding not on the allowlist, unless --report.
 *
 * Allowlist (`contract-check.json` in the working directory, optional):
 *   { "allow": [ { "token": "--base-icon-calendar", "rule": "C1", "reason": "…" } ] }
 * `rule` and `file` (substring of the path) are optional; `reason` is required.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, extname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_CONTRACT = join(here, '..', 'base-variables.css');
export const DEFAULT_RENAMES = join(here, '..', 'renames.json');
const EXTS = new Set(['.css', '.scss', '.ts', '.js', '.mjs', '.svelte']);
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.svelte-kit', 'build']);
const ROLES = ['success', 'danger', 'warning', 'info'];

// ---------------------------------------------------------------- parsing

/** Blank out comments, keeping offsets and newlines (so line numbers stay right). */
export function stripComments(text, { lineComments = false } = {}) {
  let out = text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  // `// …` only at line start: inside code a `//` is usually a URL in a string.
  if (lineComments) out = out.replace(/^([ \t]*)\/\/.*$/gm, (m, ind) => ind + ' '.repeat(m.length - ind.length));
  return out;
}

/** Index of the `)` closing the `(` at `open`, or -1. */
function closeParen(s, open) {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === '(') depth++;
    else if (s[i] === ')' && --depth === 0) return i;
  }
  return -1;
}

/** Every `var(--name[, fallback])` in `text` (nested ones too). */
export function scanVars(text, prefix = '--') {
  const out = [];
  const re = /var\(\s*(--[A-Za-z0-9_-]+)\s*(,|\))/g;
  let m;
  while ((m = re.exec(text))) {
    const name = m[1];
    if (!name.startsWith(prefix)) continue;
    const open = m.index + 3;
    let fallback = null;
    if (m[2] === ',') {
      const end = closeParen(text, open);
      if (end === -1) continue;
      fallback = text.slice(m.index + m[0].length, end).trim();
    }
    out.push({ name, fallback, index: m.index });
  }
  return out;
}

/** Custom-property declarations `--name: value;` (top-level value, up to `;` or `}`). */
export function scanDecls(text) {
  const out = [];
  const re = /(^|[\s{;])(--[A-Za-z0-9_-]+)\s*:/g;
  let m;
  while ((m = re.exec(text))) {
    let i = m.index + m[0].length, depth = 0;
    const start = i;
    for (; i < text.length; i++) {
      const c = text[i];
      if (c === '(') depth++;
      else if (c === ')') depth--;
      else if (depth === 0 && (c === ';' || c === '}')) break;
    }
    out.push({ name: m[2], value: text.slice(start, i).trim(), index: m.index + m[1].length });
  }
  return out;
}

/**
 * The contract: name → { kind: 'input' | 'derived', value }. Inputs are the
 * literal values in the first `:root { … }` block; derived = the
 * `:root, [data-theme], .base-scope { … }` block (or any value with a var()).
 */
export function parseContract(cssText) {
  const css = stripComments(cssText);
  const tokens = new Map();
  const blockRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = blockRe.exec(css))) {
    const selector = m[1].trim().replace(/\s+/g, ' ');
    const derivedBlock = /\.base-scope/.test(selector);
    for (const d of scanDecls(m[2])) {
      if (!d.name.startsWith('--base-')) continue;
      if (tokens.has(d.name) && !derivedBlock) continue;
      const kind = derivedBlock || /var\(/.test(d.value) ? 'derived' : 'input';
      tokens.set(d.name, { kind, value: d.value });
    }
  }
  return tokens;
}

/** renames.json → Map old name → { to, since, note } (patterns expanded). */
export function loadRenames(path = DEFAULT_RENAMES) {
  const map = new Map();
  const { renames } = JSON.parse(readFileSync(path, 'utf8'));
  for (const r of renames) {
    const variants = [];
    if (r.from.includes('<role>')) for (const role of ROLES) variants.push([r.from.replaceAll('<role>', role), r.to?.replaceAll('<role>', role) ?? null]);
    else if (r.from.includes('-N')) for (let n = 1; n <= 9; n++) variants.push([r.from.replace('-N', `-${n}`), r.to?.replace('-N', `-${n}`) ?? null]);
    else variants.push([r.from, r.to]);
    for (const [from, to] of variants) if (!map.has(from)) map.set(from, { to, since: r.since, note: r.note });
  }
  return map;
}

// ---------------------------------------------------------------- values

const NAMED = { white: '#ffffff', black: '#000000' };

/** Comparable form: lower case, no optional spaces, long hex, plain numbers. */
export function normalize(v) {
  return decodeDataUrls(v)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*([,()/*+])\s*/g, '$1')
    .replace(/'/g, '"')
    .toLowerCase()
    .replace(/#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])?\b/g, (_, r, g, b, a) => `#${r}${r}${g}${g}${b}${b}${a ? a + a : ''}`)
    .replace(/\b(white|black)\b/g, (w) => NAMED[w])
    .replace(/(\d*\.?\d+)ms\b/g, (_, n) => `${parseFloat(n) / 1000}s`)
    .replace(/(^|[^\w.#-])0+(\.\d)/g, '$1$2')
    .replace(/(\.\d*?)0+\b/g, '$1')
    .replace(/(\d)\.(?!\d)/g, '$1');
}

/** SVG data URLs as plain markup, so `;utf8,<svg …>` and `,%3Csvg …%3E` compare equal. */
function decodeDataUrls(v) {
  return v.replace(/url\(\s*(["']?)data:image\/svg\+xml(?:;utf8|;charset=utf-?8)?,([\s\S]*?)\1\s*\)/gi, (_, _q, body) => {
    let svg = body;
    try { svg = decodeURIComponent(body); } catch { /* not encoded */ }
    return `url(svg:${svg.replace(/["']/g, '"').replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim()})`;
  });
}

const BARE_VAR = /^var\(\s*(--[A-Za-z0-9_-]+)\s*(?:,([\s\S]*))?\)$/;

/** `var(--x[, fb])` as the whole value → { name, fallback }, else null. */
function bareVar(v) {
  const m = v.trim().match(BARE_VAR);
  if (!m) return null;
  // The match must be one var() call, not `var(--a) , var(--b)`.
  if (closeParen(v.trim(), 3) !== v.trim().length - 1) return null;
  return { name: m[1], fallback: m[2]?.trim() ?? null };
}

/**
 * What a value is with no contract loaded: --base-* reads take their fallback,
 * component tokens are replaced by their declaration. Returns the value (null if
 * it can't be resolved: undeclared token, no fallback) and the --base-* tokens
 * read on the way (`reads`).
 */
export function standalone(v, locals, depth = 0, reads = new Set()) {
  if (v == null || depth > 8) return { value: null, reads };
  const bv = bareVar(v);
  if (bv) {
    if (bv.name.startsWith('--base-')) { reads.add(bv.name); return standalone(bv.fallback, locals, depth + 1, reads); }
    if (locals.has(bv.name)) return standalone(locals.get(bv.name), locals, depth + 1, reads);
    return standalone(bv.fallback, locals, depth + 1, reads);
  }
  return { value: v, reads };
}

const isLiteral = (v) => !/var\(/.test(v);

// ---------------------------------------------------------------- check

function walk(p, files) {
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const e of readdirSync(p)) if (!SKIP_DIRS.has(e)) walk(join(p, e), files);
  } else if (EXTS.has(extname(p))) files.push(p);
  return files;
}

function lineCol(text, index) {
  const before = text.slice(0, index);
  const line = before.split('\n').length;
  return { line, col: index - before.lastIndexOf('\n') };
}

const short = (v, n = 90) => (v.length > n ? v.slice(0, n - 1) + '…' : v);

/**
 * Check `paths` against the contract. Returns { findings, allowed, reads }.
 * finding = { rule, token, file, line, col, message }.
 */
export function check({ paths = ['src'], contract = DEFAULT_CONTRACT, renames = DEFAULT_RENAMES, allow = [], cwd = process.cwd() } = {}) {
  const tokens = parseContract(readFileSync(contract, 'utf8'));
  const renamed = loadRenames(renames);
  const files = paths.flatMap((p) => walk(resolve(cwd, p), []));
  const sources = files.map((f) => {
    const raw = readFileSync(f, 'utf8');
    return { file: f, text: stripComments(raw, { lineComments: !/\.(s?css)$/.test(f) }) };
  });

  // Component tokens declared anywhere in the scanned files (first declaration wins).
  const locals = new Map();
  for (const { text } of sources) {
    for (const d of scanDecls(text)) if (!d.name.startsWith('--base-') && !locals.has(d.name)) locals.set(d.name, d.value);
  }

  const findings = [];
  let reads = 0;
  for (const { file, text } of sources) {
    for (const r of scanVars(text, '--base-')) {
      reads++;
      const at = { token: r.name, file: relative(cwd, file).replaceAll('\\', '/'), ...lineCol(text, r.index) };
      const t = tokens.get(r.name);
      if (!t) {
        const rn = renamed.get(r.name);
        const hint = rn ? (rn.to ? ` — use ${rn.to} (renamed in ${rn.since}${rn.note ? `; ${rn.note}` : ''})` : ` — ${rn.note ?? 'removed'} in ${rn.since}`) : '';
        findings.push({ rule: 'C1', ...at, message: `${r.name} is not in the contract${hint}` });
        continue;
      }
      if (r.fallback == null) continue;
      const { value: sa, reads: via_ } = standalone(r.fallback, locals);
      if (sa == null) continue; // resolves to an undeclared token: nothing to compare
      if (t.kind === 'input') {
        if (!isLiteral(sa)) continue; // computed standalone — Phase 2 (parity test) compares it
        if (normalize(sa) !== normalize(t.value)) {
          const via = normalize(sa) !== normalize(r.fallback) ? ` (via ${short(r.fallback, 40)})` : '';
          findings.push({ rule: 'C2', ...at, message: `${r.name} fallback ${short(sa)}${via} ≠ contract default ${short(t.value)}` });
        }
      } else if (isLiteral(sa)) {
        // A contract alias (`--base-input-bg: var(--base-main-bg)`) is followed when the
        // fallback chain reads the aliased token; its own literal is checked where it is read.
        const alias = bareVar(t.value);
        if (alias && !alias.fallback && via_.has(alias.name)) continue;
        const via = normalize(sa) !== normalize(r.fallback) ? ` (via ${short(r.fallback, 40)})` : '';
        const fix = alias && !alias.fallback
          ? `the contract aliases ${alias.name} — fall back to the component token that reads it`
          : `use the contract formula on the component's own tokens: ${short(t.value, 140)}`;
        findings.push({ rule: 'C3', ...at, message: `${r.name} is derived, fallback is the literal ${short(sa)}${via} — ${fix}` });
      }
    }
  }

  const kept = [], allowed = [];
  for (const f of findings) {
    const a = allow.find((x) => x.token === f.token && (!x.rule || x.rule === f.rule) && (!x.file || f.file.includes(x.file)));
    (a ? allowed : kept).push(a ? { ...f, reason: a.reason } : f);
  }
  return { findings: kept, allowed, reads, files: files.length };
}

// ---------------------------------------------------------------- CLI

function main(argv) {
  const opt = { paths: [], config: 'contract-check.json', report: false, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--config') opt.config = argv[++i];
    else if (a === '--contract') opt.contract = argv[++i];
    else if (a === '--report') opt.report = true;
    else if (a === '--json') opt.json = true;
    else if (a === '-h' || a === '--help') { console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0]); return 0; }
    else opt.paths.push(a);
  }
  let allow = [];
  if (existsSync(opt.config)) {
    allow = JSON.parse(readFileSync(opt.config, 'utf8')).allow ?? [];
    const bad = allow.filter((a) => !a.token || !a.reason);
    if (bad.length) { console.error(`${opt.config}: every allow entry needs "token" and "reason"`); return 2; }
  }
  const res = check({ paths: opt.paths.length ? opt.paths : ['src'], contract: opt.contract, allow });
  if (opt.json) { console.log(JSON.stringify(res, null, 2)); return res.findings.length && !opt.report ? 1 : 0; }
  for (const f of res.findings) console.log(`${f.file}:${f.line}:${f.col}  ${f.rule}  ${f.message}`);
  const by = (r) => res.findings.filter((f) => f.rule === r).length;
  console.log(`\nbase-contract-check: ${res.reads} --base-* reads in ${res.files} files — ` +
    (res.findings.length ? `${res.findings.length} finding(s) (C1 ${by('C1')}, C2 ${by('C2')}, C3 ${by('C3')})` : 'ok') +
    (res.allowed.length ? `, ${res.allowed.length} allowed` : ''));
  return res.findings.length && !opt.report ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) process.exitCode = main(process.argv.slice(2));
