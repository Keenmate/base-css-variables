import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Loader contract (--base-loader-*), in Chromium, Firefox and WebKit (projects in
 * playwright.config.ts). The loader is a mask image + a rotate animation, so a theme swaps
 * the shape in one token and it reaches inside a shadow root. Pixels are compared as raw
 * element screenshots: two frames that differ = the loader moves.
 */

const PAGE = '/examples-loader.html';

async function open(page: Page): Promise<void> {
  await page.goto(PAGE);
  await page.waitForFunction(() => (window as any).__demo?.ready === true);
}

const setShape = (page: Page, value: string) => page.selectOption('#shape', value);

const rootVar = (page: Page, name: string) =>
  page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);

/**
 * Screenshot of the box the loader sits in. Element screenshots wait for a stable bounding
 * box, which a rotating element never has, so clip to its untransformed layout box instead.
 */
async function shot(el: Locator): Promise<Buffer> {
  const clip = await el.evaluate((e: HTMLElement) => {
    // A clip only sees the viewport: bring the loader into it first (the page header pushes it down).
    ((e.getRootNode() as ShadowRoot).host ?? e).scrollIntoView({ block: 'center', behavior: 'instant' });
    let x = 0, y = 0;
    const r = (e.offsetParent ?? (e.getRootNode() as ShadowRoot).host ?? document.body).getBoundingClientRect();
    x = r.left + e.offsetLeft; y = r.top + e.offsetTop;
    return { x: Math.floor(x), y: Math.floor(y), width: Math.ceil(e.offsetWidth), height: Math.ceil(e.offsetHeight) };
  });
  return el.page().screenshot({ clip });
}

/** Two screenshots `ms` apart differ → it is moving. */
async function moves(el: Locator, ms = 230): Promise<boolean> {
  const a = await shot(el);
  await el.page().waitForTimeout(ms);
  const b = await shot(el);
  return !a.equals(b);
}

/** Screenshot of the loader with its mask removed (a filled square) ≠ the masked one → the mask draws a shape. */
async function masked(el: Locator): Promise<boolean> {
  await el.evaluate((e: HTMLElement) => { e.style.animation = 'none'; });
  const shape = await shot(el);
  await el.evaluate((e: HTMLElement) => { e.style.mask = 'none'; });
  const square = await shot(el);
  await el.evaluate((e: HTMLElement) => { e.style.mask = ''; e.style.animation = ''; });
  return !shape.equals(square);
}

const pageLoader = (page: Page) => page.locator('[data-probe="page"]');
const shadowLoader = (page: Page) => page.locator('#shadow-host').locator('.demo-loader');

test('tokens: arc spinner, 1turn, 0.8s, 1.25em', async ({ page }) => {
  await open(page);
  expect(await rootVar(page, '--base-loader-rotate')).toBe('1turn');
  expect(await rootVar(page, '--base-loader-duration')).toBe('0.8s');
  expect(await rootVar(page, '--base-loader-size')).toBe('1.25em');
  expect(await rootVar(page, '--base-loader-icon')).toMatch(/^url\("data:image\/svg\+xml,/);
});

test('default spinner: drawn by the mask, rotating, sized by em', async ({ page }) => {
  await open(page);
  const el = pageLoader(page);
  expect(await masked(el)).toBe(true);
  expect(await moves(el)).toBe(true);
  expect(await el.evaluate((e) => getComputedStyle(e).width)).toBe('40px');  // 1.25 × 32px
});

test('shadow root: the component draws the page-wide shape and follows a swap', async ({ page }) => {
  await open(page);
  const el = shadowLoader(page);
  expect(await masked(el)).toBe(true);
  expect(await moves(el)).toBe(true);
  const before = await el.evaluate((e) => getComputedStyle(e).maskImage);
  await setShape(page, 'dots');
  const after = await el.evaluate((e) => getComputedStyle(e).maskImage);
  expect(after).not.toBe(before);
  expect(after).toContain('circle');
});

for (const shape of ['sine-css', 'sine-smil'] as const) {
  test(`self-animating SVG as a mask (${shape}): moves with --base-loader-rotate: 0`, async ({ page }) => {
    await open(page);
    await setShape(page, shape);
    const el = pageLoader(page);
    expect(await el.evaluate((e) => getComputedStyle(e).getPropertyValue('--base-loader-rotate').trim())).toBe('0');
    expect(await masked(el)).toBe(true);
    expect(await moves(el)).toBe(true);
  });
}

test('reduced motion: the loader slows to 1.5s and keeps turning; durations go to 0s', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  expect(await rootVar(page, '--base-loader-duration')).toBe('1.5s');
  expect(await rootVar(page, '--base-duration-normal')).toBe('0s');
  for (const el of [pageLoader(page), shadowLoader(page)]) {
    expect(await el.evaluate((e) => getComputedStyle(e).animationDuration)).toBe('1.5s');
    expect(await moves(el)).toBe(true);
  }
});

/**
 * Does an SVG used as a mask see prefers-reduced-motion? A static SVG whose square is hidden by
 * a @media rule inside it: if the masked pixels change when reduced motion is emulated, the
 * image evaluates the query. Recorded per engine (annotation), not asserted — it decides
 * whether a self-animating loader can slow itself; the contract does not depend on it.
 */
test('probe: media queries inside a mask SVG', async ({ page }, info) => {
  await open(page);
  const icon = await page.evaluate(() => `url("data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><style>@media (prefers-reduced-motion:reduce){.m{display:none}}</style>'
    + '<rect width="40" height="20"/><rect class="m" y="20" width="40" height="20"/></svg>')}")`);
  const el = pageLoader(page);
  await el.evaluate((e: HTMLElement, i) => { e.style.animation = 'none'; e.style.setProperty('--base-loader-icon', i); }, icon);
  const normal = await shot(el);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(100);
  const reduced = await shot(el);
  const honoured = !normal.equals(reduced);
  info.annotations.push({ type: 'mask-svg-reduced-motion', description: `${info.project.name}: ${honoured ? 'honoured' : 'ignored'}` });
  console.log(`[${info.project.name}] prefers-reduced-motion inside a mask SVG: ${honoured ? 'honoured' : 'ignored'}`);
});
