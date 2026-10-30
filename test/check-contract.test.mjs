// Unit tests for bin/check-contract.mjs (node:test, no browser). Run: npm run test:check
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { check, parseContract, normalize, scanVars, DEFAULT_CONTRACT } from '../bin/check-contract.mjs';

const BIN = fileURLToPath(new URL('../bin/check-contract.mjs', import.meta.url));

/** Run the check on one CSS snippet (written to a temp `src/x.css`). */
function run(css, { allow = [], ext = 'css' } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'bcc-'));
  try {
    mkdirSync(join(dir, 'src'));
    writeFileSync(join(dir, 'src', `x.${ext}`), css);
    return check({ paths: ['src'], cwd: dir, allow });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
const rules = (res) => res.findings.map((f) => `${f.rule} ${f.token}`);

test('parses the contract: 194 tokens, inputs and derived', () => {
  const t = parseContract(readFileSync(DEFAULT_CONTRACT, 'utf8'));
  assert.equal(t.size, 194);
  assert.equal(t.get('--base-loader-duration').value, '0.8s'); // not the reduced-motion 1.5s
  assert.equal(t.get('--base-primary-color').kind, 'input');
  assert.equal(t.get('--base-primary-color-hover').kind, 'derived');
  assert.equal(t.get('--base-icon-clear').kind, 'derived'); // alias = derived
  assert.equal(t.get('--base-disabled-opacity').value, '0.65');
});

test('scanVars finds nested reads and their fallbacks', () => {
  const r = scanVars('a: var(--base-a, var(--base-b, light-dark(#fff, #000)));', '--base-');
  assert.deepEqual(r.map((x) => [x.name, x.fallback]), [
    ['--base-a', 'var(--base-b, light-dark(#fff, #000))'],
    ['--base-b', 'light-dark(#fff, #000)'],
  ]);
});

test('normalize: hex, named colours, numbers, time units, quotes, svg encoding', () => {
  assert.equal(normalize('#FFF'), normalize('#ffffff'));
  assert.equal(normalize('white'), normalize('#fff'));
  assert.equal(normalize('rgba(0, 0, 0, 0.40)'), normalize('rgba(0,0,0,.4)'));
  assert.equal(normalize('150ms'), normalize('0.15s'));
  assert.equal(normalize("'Segoe UI'"), normalize('"Segoe UI"'));
  assert.equal(
    normalize(`url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'><path d='M1 1'/></svg>")`),
    normalize('url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M1 1%22/%3E%3C/svg%3E")'),
  );
});

test('clean component: no findings', () => {
  const res = run(`:host {
    --xx-accent-color: var(--base-primary-color, #3b82f6);
    --xx-accent-color-hover: var(--base-primary-color-hover,
      light-dark(color-mix(in srgb, black 15%, var(--xx-accent-color)), color-mix(in srgb, white 15%, var(--xx-accent-color))));
    --xx-main-bg: var(--base-main-bg, light-dark(#ffffff, #1e293b));
    --xx-input-bg: var(--base-input-bg, var(--xx-main-bg));
    --xx-opacity: var(--base-disabled-opacity, 0.65);
    --xx-plain: var(--base-selected-bg);
  }`);
  assert.deepEqual(rules(res), []);
  assert.equal(res.reads, 6);
});

test('C1: unknown token, with the rename hint', () => {
  const res = run(`a { color: var(--base-highlighted-bg, #eee); b: var(--base-nope); c: var(--base-success-border, red); }`);
  assert.deepEqual(rules(res), ['C1 --base-highlighted-bg', 'C1 --base-nope', 'C1 --base-success-border']);
  assert.match(res.findings[0].message, /use --base-selected-bg \(renamed in 2\.0\.0-rc03\)/);
  assert.doesNotMatch(res.findings[1].message, /use/);
  assert.match(res.findings[2].message, /removed/);
});

test('C2: input fallback must equal the contract default, per mode', () => {
  const res = run(`:host {
    --a: var(--base-primary-color, #0ea5e9);
    --b: var(--base-main-bg, light-dark(#fff, #1a1a1a));
    --c: var(--base-shadow-color, rgba(0, 0, 0, 0.15));
    --d: var(--base-primary-color, #3B82F6);
  }`);
  assert.deepEqual(rules(res), ['C2 --base-primary-color', 'C2 --base-main-bg', 'C2 --base-shadow-color']);
});

test('C2: inside @media (prefers-reduced-motion: reduce) the fallback is the reduced value', () => {
  const t = parseContract(readFileSync(DEFAULT_CONTRACT, 'utf8'));
  assert.equal(t.get('--base-loader-duration').media.get('(prefers-reduced-motion:reduce)'), '1.5s');
  assert.equal(t.get('--base-duration-fast').media.get('(prefers-reduced-motion:reduce)'), '0s');
  const ok = run(`:host { --x-loader-duration: var(--base-loader-duration, 0.8s); --x-transition-fast: var(--base-duration-fast, 100ms); }
@media (prefers-reduced-motion: reduce) {
  :host { --x-loader-duration: var(--base-loader-duration, 1.5s); --x-transition-fast: var(--base-duration-fast, 0s); }
}`);
  assert.deepEqual(rules(ok), []);
  // the reduced value outside the block, the normal value inside it: both wrong
  const bad = run(`:host { --x-loader-duration: var(--base-loader-duration, 1.5s); }
@media (prefers-reduced-motion:reduce) { :host { --x-loader-duration: var(--base-loader-duration, 0.8s); } }
@media (min-width: 600px) { :host { --x-loader-duration: var(--base-loader-duration, 1.5s); } }`);
  assert.deepEqual(rules(bad), ['C2 --base-loader-duration', 'C2 --base-loader-duration', 'C2 --base-loader-duration']);
  assert.match(bad.findings[1].message, /under @media \(prefers-reduced-motion:reduce\) 1\.5s/);
});

test('C2: follows component tokens to the literal (and says via)', () => {
  const res = run(`:host { --xx-accent: #0ea5e9; --a: var(--base-primary-color, var(--xx-accent)); }`);
  assert.deepEqual(rules(res), ['C2 --base-primary-color']);
  assert.match(res.findings[0].message, /via var\(--xx-accent\)/);
});

test('C3: derived token with a literal fallback (direct or via a component token)', () => {
  const res = run(`:host {
    --xx-accent-color: var(--base-primary-color, #3b82f6);
    --a: var(--base-primary-color-hover, #2563eb);
    --b: var(--base-primary-text-color, var(--xx-accent-color));
    --c: var(--base-on-primary-text-color, #fff);
  }`);
  assert.deepEqual(rules(res), ['C3 --base-primary-color-hover', 'C3 --base-primary-text-color', 'C3 --base-on-primary-text-color']);
  assert.match(res.findings[1].message, /literal #3b82f6 \(via var\(--xx-accent-color\)\)/);
});

test('C3: an alias is followed when the chain reads the aliased token', () => {
  const ok = run(`:host {
    --xx-main-bg: var(--base-main-bg, light-dark(#ffffff, #1e293b));
    --a: var(--base-input-bg, var(--xx-main-bg));
    --b: var(--base-dropdown-bg, var(--base-main-bg, light-dark(#ffffff, #1e293b)));
  }`);
  assert.deepEqual(rules(ok), []);
  const bad = run(`:host { --a: var(--base-input-bg, light-dark(#ffffff, #1e293b)); }`);
  assert.deepEqual(rules(bad), ['C3 --base-input-bg']);
  assert.match(bad.findings[0].message, /aliases --base-main-bg/);
});

test('comments are ignored; TS line comments too, URLs in strings are not', () => {
  const css = run(`/* var(--base-nope, 1) */ a { b: var(--base-primary-color, #3b82f6); }`);
  assert.deepEqual(rules(css), []);
  const ts = run(`// var(--base-nope)\nconst u = 'https://x.y/var(--base-gone)';\n`, { ext: 'ts' });
  assert.deepEqual(rules(ts), ['C1 --base-gone']);
});

test('line and column point at the read', () => {
  const res = run(`a {\n  b: var(--base-nope);\n}`);
  assert.equal(res.findings[0].line, 2);
  assert.equal(res.findings[0].col, 6);
});

test('allowlist: by token, optionally rule and file; moved to `allowed`', () => {
  const css = `a { b: var(--base-z-tooltip, 10000); c: var(--base-nope); }`;
  const res = run(css, { allow: [{ token: '--base-z-tooltip', rule: 'C2', reason: 'above the host app' }] });
  assert.deepEqual(rules(res), ['C1 --base-nope']);
  assert.equal(res.allowed[0].reason, 'above the host app');
  const wrongRule = run(css, { allow: [{ token: '--base-z-tooltip', rule: 'C3', reason: 'x' }] });
  assert.equal(wrongRule.findings.length, 2);
  const wrongFile = run(css, { allow: [{ token: '--base-z-tooltip', file: 'other.css', reason: 'x' }] });
  assert.equal(wrongFile.findings.length, 2);
});

test('CLI: exit 1 on findings, 0 with --report, 2 on a bad allowlist', () => {
  const dir = mkdtempSync(join(tmpdir(), 'bcc-'));
  try {
    mkdirSync(join(dir, 'src'));
    writeFileSync(join(dir, 'src', 'x.css'), 'a { b: var(--base-nope); }');
    const exit = (args) => {
      try { execFileSync(process.execPath, [BIN, ...args], { cwd: dir, stdio: 'pipe' }); return 0; } catch (e) { return e.status; }
    };
    assert.equal(exit([]), 1);
    assert.equal(exit(['--report']), 0);
    writeFileSync(join(dir, 'contract-check.json'), JSON.stringify({ allow: [{ token: '--base-nope' }] }));
    assert.equal(exit([]), 2);
    writeFileSync(join(dir, 'contract-check.json'), JSON.stringify({ allow: [{ token: '--base-nope', reason: 'test' }] }));
    assert.equal(exit([]), 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('renames.json: every old name is gone, every new name exists', async () => {
  const { loadRenames } = await import('../bin/check-contract.mjs');
  const t = parseContract(readFileSync(DEFAULT_CONTRACT, 'utf8'));
  for (const [from, { to }] of loadRenames()) {
    assert.ok(!t.has(from), `${from} is still in the contract`);
    if (to) assert.ok(t.has(to), `${from} → ${to}: ${to} is not in the contract`);
  }
});

test('C3: a formula fallback for an alias must go through the aliased token', () => {
  const bad = run(`:host {
    --xx-accent: var(--base-primary-color, #3b82f6);
    --a: var(--base-selected-bg, color-mix(in srgb, var(--xx-accent) 10%, transparent));
  }`);
  assert.deepEqual(rules(bad), ['C3 --base-selected-bg']);
  assert.match(bad.findings[0].message, /aliases --base-primary-bg-subtle/);
  const ok = run(`:host {
    --xx-accent: var(--base-primary-color, #3b82f6);
    --xx-tint: var(--base-primary-bg-subtle, light-dark(color-mix(in srgb, var(--xx-accent) 10%, transparent), color-mix(in srgb, var(--xx-accent) 20%, transparent)));
    --a: var(--base-selected-bg, var(--xx-tint));
    --b: var(--base-selected-bg-hover, var(--a));
  }`);
  assert.deepEqual(rules(ok), []); // -hover → selected-bg → primary-bg-subtle: any link of the chain counts
});

test('CLI runs when invoked through a symlink (npm link / folder install)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'bcc-'));
  try {
    mkdirSync(join(dir, 'src'));
    writeFileSync(join(dir, 'src', 'x.css'), 'a { b: var(--base-nope); }');
    const link = join(dir, 'check-link.mjs');
    try { symlinkSync(BIN, link); } catch { return; } // no symlink permission (Windows without dev mode)
    let status = 0;
    try { execFileSync(process.execPath, [link], { cwd: dir, stdio: 'pipe' }); } catch (e) { status = e.status; }
    assert.equal(status, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('normalize: numbers compare as values (0.0 = 0, 0.40 = .4), hex and identifiers untouched', () => {
  assert.equal(normalize('cubic-bezier(0.4, 0.0, 0.2, 1)'), normalize('cubic-bezier(0.4, 0, 0.2, 1)'));
  assert.equal(normalize('rgba(0,0,0,.40)'), normalize('rgba(0, 0, 0, 0.4)'));
  assert.equal(normalize('#1e293b'), '#1e293b');
  assert.notEqual(normalize('1.5'), normalize('15'));
});
