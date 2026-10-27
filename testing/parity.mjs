/**
 * Contract parity — does a component look the same with and without the contract?
 *
 * For a Playwright `page`, renders the component's test page twice per pass — once
 * standalone (no base-variables.css) and once with the contract injected — in light and
 * dark, and compares every color-valued `--<prefix>-*` token the component declares
 * (resolved to sRGB on a probe inside its shadow root).
 *
 *   pass "default" — default colors: standalone fallbacks must equal the contract.
 *   pass "accent"  — a different accent: standalone `--<prefix>-accent-color: X` vs the
 *                    contract with `--base-primary-color: X`. Derived fallbacks that are
 *                    the contract formula on the component's accent follow; a hand-set
 *                    literal (e.g. a fixed hover) doesn't, and shows up here.
 *
 * Usage (component e2e spec):
 *
 *   import { test, expect } from '@playwright/test';
 *   import { contractParity } from '@keenmate/base-css-variables/testing/parity';
 *
 *   test('standalone colors match the contract', async ({ page }) => {
 *     const diffs = await contractParity(page, {
 *       url: '/test/contract-parity.html', selector: 'web-multiselect', prefix: 'ms',
 *       accentToken: '--ms-accent-color',
 *       allow: { '--ms-option-title-color-selected': 'title keeps its own color' },
 *     });
 *     expect(diffs).toEqual([]);
 *   });
 *
 * Only colors are compared (that is where fallbacks drift); tokens that resolve to
 * `currentColor` / inherit, or aren't colors, are skipped. Channels may differ by
 * `tolerance` (default 2 of 255; alpha 0.02) — formula vs. formula rounding.
 *
 * Plain ESM, no Playwright import: pass your `page`.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const CONTRACT = join(dirname(fileURLToPath(import.meta.url)), '..', 'base-variables.css');

/**
 * Resolve every color-valued `--<prefix>-*` token of the element matching `selector`.
 * Runs in the page. Returns { [token]: 'r,g,b,a' }.
 */
function collectInPage({ selector, prefix }) {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`contractParity: no element matches ${selector}`);
  const root = el.shadowRoot ?? el;
  const names = new Set();
  const walk = (rules) => {
    for (const r of rules) {
      if (r.style) for (const p of r.style) if (p.startsWith(`--${prefix}-`)) names.add(p);
      if (r.cssRules) walk(r.cssRules);
    }
  };
  const sheets = [...(root.adoptedStyleSheets ?? []), ...[...root.querySelectorAll('style, link[rel=stylesheet]')].map((n) => n.sheet).filter(Boolean)];
  for (const s of sheets) { try { walk(s.cssRules); } catch { /* cross-origin */ } }

  const wrap = document.createElement('div');
  const probe = document.createElement('span');
  wrap.style.display = 'none';
  wrap.appendChild(probe);
  root.appendChild(wrap);
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const rgba = (c) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#000';
    ctx.fillStyle = c;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return `${d[0]},${d[1]},${d[2]},${(d[3] / 255).toFixed(3)}`;
  };
  const out = {};
  for (const name of [...names].sort()) {
    probe.style.color = `var(${name})`;
    wrap.style.color = 'rgb(1, 2, 3)';
    const a = getComputedStyle(probe).color;
    wrap.style.color = 'rgb(4, 5, 6)';
    const b = getComputedStyle(probe).color;
    if (a !== b) continue; // not a color, or currentColor / inherit
    out[name] = rgba(a);
  }
  wrap.remove();
  return out;
}

async function render(page, { url, selector, prefix, scheme, contract, vars, ready }) {
  await page.goto(url);
  if (contract) await page.addStyleTag({ content: contract });
  await page.evaluate(({ scheme, vars, selector }) => {
    document.documentElement.style.colorScheme = scheme;
    for (const [target, decls] of Object.entries(vars)) {
      const node = target === ':root' ? document.documentElement : document.querySelector(selector);
      for (const [k, v] of Object.entries(decls)) node.style.setProperty(k, v);
    }
  }, { scheme, vars, selector });
  await page.waitForFunction((s) => {
    const el = document.querySelector(s);
    return el && customElements.get(el.localName) && el.shadowRoot;
  }, selector);
  if (ready) await ready(page);
  return page.evaluate(collectInPage, { selector, prefix });
}

const close = (a, b, tol) => {
  const x = a.split(',').map(Number), y = b.split(',').map(Number);
  return Math.abs(x[0] - y[0]) <= tol && Math.abs(x[1] - y[1]) <= tol && Math.abs(x[2] - y[2]) <= tol && Math.abs(x[3] - y[3]) <= 0.02;
};

/**
 * @param page      Playwright page
 * @param opts.url        test page with one instance of the component
 * @param opts.selector   the instance, e.g. 'web-multiselect'
 * @param opts.prefix     component token prefix, e.g. 'ms' (→ --ms-*)
 * @param opts.accentToken the component's accent input, e.g. '--ms-accent-color' (enables the accent pass)
 * @param opts.accent     the accent used in the accent pass (default #16a34a, green)
 * @param opts.schemes    default ['light', 'dark']
 * @param opts.allow      { token: reason } — tokens that may differ (reason required)
 * @param opts.tolerance  per-channel tolerance, default 2
 * @param opts.ready      async (page) => {} — after render, before reading (e.g. open a dropdown)
 * @returns list of { pass, scheme, token, standalone, contract } that differ (allowlisted removed)
 */
export async function contractParity(page, opts) {
  const { url, prefix, accentToken, accent = '#16a34a', schemes = ['light', 'dark'], allow = {}, tolerance = 2, ready } = opts;
  const { selector } = opts;
  if (!selector || !prefix || !url) throw new Error('contractParity: url, selector and prefix are required');
  const contract = readFileSync(CONTRACT, 'utf8');
  for (const [k, v] of Object.entries(allow)) if (!v) throw new Error(`contractParity: allow['${k}'] needs a reason`);
  const passes = [{ pass: 'default', standalone: {}, withContract: {} }];
  if (accentToken) passes.push({ pass: 'accent', standalone: { host: { [accentToken]: accent } }, withContract: { ':root': { '--base-primary-color': accent } } });

  const diffs = [];
  for (const p of passes) {
    for (const scheme of schemes) {
      const a = await render(page, { url, selector, prefix, scheme, contract: null, vars: p.standalone, ready });
      const b = await render(page, { url, selector, prefix, scheme, contract, vars: p.withContract, ready });
      if (!Object.keys(a).length) throw new Error(`contractParity: found no color --${prefix}-* tokens on ${selector}`);
      for (const token of Object.keys(a)) {
        if (!(token in b) || allow[token]) continue;
        if (!close(a[token], b[token], tolerance)) diffs.push({ pass: p.pass, scheme, token, standalone: a[token], contract: b[token] });
      }
    }
  }
  return diffs;
}

export { CONTRACT as CONTRACT_PATH };
