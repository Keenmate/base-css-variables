import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Item-state contract: --base-outline-width, --base-selected-*, --base-focused-*.
 *
 * Model (Windows Explorer): focused = the ONE cursor item; selected = the
 * click / Ctrl / Shift-click set; checked = checkbox ticked (checkbox only, no row
 * tokens). These specs lock (1) the token defaults, (2) the reference consumer
 * in demo/item-states.html, and (3) that the real components render the SAME
 * look from the same tokens — including the inset ring tracking the width.
 */

const DEMO = '/demo/item-states.html';

async function open(page: Page): Promise<void> {
  await page.goto(DEMO);
  await page.waitForFunction(() => (window as any).__demo?.ready === true);
}

const rootVar = (page: Page, name: string) =>
  page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);

const setRootVar = (page: Page, name: string, value: string) =>
  page.evaluate(([n, v]) => document.documentElement.style.setProperty(n, v), [name, value]);

const style = (loc: Locator, prop: string) =>
  loc.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

/** outline-width / outline-offset as numbers (px). */
async function ring(loc: Locator): Promise<{ width: number; offset: number; style: string }> {
  return loc.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { width: parseFloat(cs.outlineWidth), offset: parseFloat(cs.outlineOffset), style: cs.outlineStyle };
  });
}

/** Resolve a CSS value the way the browser computes it, via a throwaway element. */
const resolve = (page: Page, prop: string, value: string) =>
  page.evaluate(([p, v]) => {
    const el = document.createElement('div');
    el.style.setProperty(p, v);
    document.body.append(el);
    const out = getComputedStyle(el).getPropertyValue(p);
    el.remove();
    return out;
  }, [prop, value]);

const refRow = (page: Page, label: string) => page.locator('#ref-list .ref-item', { hasText: label });

const hasComponent = (page: Page, name: 'tree' | 'multiselect') =>
  page.evaluate((n) => (window as any).__demo.components[n] as boolean, name);

test.beforeEach(async ({ page }) => open(page));

test.describe('token defaults', () => {
  test('ships the item-state tokens with the documented defaults', async ({ page }) => {
    expect(await rootVar(page, '--base-outline-width')).toBe('1px');
    expect(await rootVar(page, '--base-selected-bg')).toMatch(/color-mix\(in srgb, #3b82f6 10%, transparent\)/);
    expect(await rootVar(page, '--base-selected-bg-hover')).toMatch(/color-mix\(in srgb, #3b82f6 10%, transparent\)/);
    expect(await rootVar(page, '--base-selected-text-color')).toBe('currentColor');
    expect(await rootVar(page, '--base-selected-outline')).toBe('none');
    expect(await rootVar(page, '--base-focused-bg')).toBe('transparent');
    expect(await rootVar(page, '--base-focused-text-color')).toBe('currentColor');
    expect(await rootVar(page, '--base-focused-outline')).toBe('1px solid #3b82f6');
  });

  test('old names are gone (pre-release, the 1.0.7 -ring / -text names, rc03 highlighted → selected)', async ({ page }) => {
    for (const old of [
      '--base-highlighted-bg', '--base-highlighted-bg-hover', '--base-highlighted-text-color', '--base-highlighted-outline',
      '--base-selected-color', '--base-selected-border',
      '--base-focused-color', '--base-focused-border', '--base-item-ring-width',
      '--base-highlighted-color', '--base-highlighted-border',
      '--base-ring-width', '--base-highlighted-ring', '--base-focused-ring',
      '--base-highlighted-text', '--base-focused-text',
    ]) {
      expect(await rootVar(page, old), old).toBe('');
    }
  });

  test('--base-focused-outline composes from --base-outline-width', async ({ page }) => {
    await setRootVar(page, '--base-outline-width', '3px');
    expect(await rootVar(page, '--base-focused-outline')).toBe('3px solid #3b82f6');
  });

  test('selection tint follows a runtime --base-primary-color override', async ({ page }) => {
    await setRootVar(page, '--base-primary-color', '#ff0000');
    expect(await rootVar(page, '--base-selected-bg')).toMatch(/#ff0000 10%/);
    expect(await rootVar(page, '--base-focused-outline')).toBe('1px solid #ff0000');
  });
});

test.describe('reference list — Explorer interaction model', () => {
  const state = (page: Page, key: string) => page.locator(`#ref-state [data-state="${key}"]`);

  test('click focuses + selects one item; Ctrl adds; Shift ranges from the anchor', async ({ page }) => {
    await refRow(page, 'Music').click();
    await expect(page.locator('.ref-item--focused')).toHaveCount(1);
    await expect(refRow(page, 'Music')).toHaveClass(/ref-item--focused/);
    await expect(state(page, 'selected')).toHaveText('Music');

    await refRow(page, 'Videos').click({ modifiers: ['Control'] });
    await expect(state(page, 'selected')).toHaveText('Music, Videos');
    await expect(refRow(page, 'Videos')).toHaveClass(/ref-item--focused/);

    await refRow(page, 'Downloads').click();
    await refRow(page, 'Projects').click({ modifiers: ['Shift'] });
    await expect(state(page, 'selected')).toHaveText('Downloads, Music, Pictures, Projects');
    await expect(page.locator('.ref-item--focused')).toHaveCount(1);
  });

  test('Ctrl+arrow moves focus without touching the selected set; Shift+arrow extends it', async ({ page }) => {
    await refRow(page, 'Music').click();
    await page.keyboard.press('Control+ArrowDown');
    await expect(refRow(page, 'Pictures')).toHaveClass(/ref-item--focused/);
    await expect(refRow(page, 'Pictures')).not.toHaveClass(/ref-item--selected/);
    await expect(state(page, 'selected')).toHaveText('Music');

    await page.keyboard.press('Shift+ArrowDown');
    await expect(state(page, 'selected')).toHaveText('Music, Pictures, Projects');
  });

  test('without checkboxes, checked mirrors selected', async ({ page }) => {
    await refRow(page, 'Music').click();
    await refRow(page, 'Videos').click({ modifiers: ['Control'] });
    await expect(state(page, 'checked')).toHaveText(/^Music, Videos\s+\(mirrors selected\)$/);
  });

  test('with checkboxes, checking changes the checked set only — no row treatment', async ({ page }) => {
    await page.locator('#ctl-checkboxes').check();
    await refRow(page, 'Music').click();
    await refRow(page, 'Videos').locator('[data-checkbox]').click();

    await expect(state(page, 'checked')).toHaveText('Videos');
    await expect(state(page, 'selected')).toHaveText('Music');
    await expect(refRow(page, 'Videos')).toHaveAttribute('aria-checked', 'true');
    await expect(refRow(page, 'Videos')).not.toHaveClass(/ref-item--selected/);

    // A checked-but-not-selected row has no tint (move focus off it first).
    await refRow(page, 'Music').click();
    expect(await style(refRow(page, 'Videos'), 'background-color')).toBe('rgba(0, 0, 0, 0)');
  });
});

test.describe('reference list — rendering from the tokens', () => {
  test('selected row paints --base-selected-bg; focused row an inset 1px ring', async ({ page }) => {
    await refRow(page, 'Music').click();
    await refRow(page, 'Videos').click({ modifiers: ['Control'] });
    await page.mouse.move(0, 0); // no hover tint

    const selectedOnly = refRow(page, 'Music');
    const probe = await resolve(page, 'background-color', 'var(--base-selected-bg)');
    expect(await style(selectedOnly, 'background-color')).toBe(probe);
    expect((await ring(selectedOnly)).style).toBe('none');

    expect(await ring(refRow(page, 'Videos'))).toEqual({ width: 1, offset: -1, style: 'solid' });
  });

  test('a thicker --base-outline-width keeps the ring inset (offset = −width)', async ({ page }) => {
    await refRow(page, 'Music').click();
    await page.locator('#ctl-ring-width').fill('3');
    expect(await ring(refRow(page, 'Music'))).toEqual({ width: 3, offset: -3, style: 'solid' });
  });

  test('anti-pattern: a px hard-coded into --base-focused-outline spills (why the width token exists)', async ({ page }) => {
    await refRow(page, 'Music').click();
    await page.locator('#ctl-wrong').check();
    const r = await ring(refRow(page, 'Music'));
    expect(r.width).toBe(3);
    expect(r.offset).toBe(-1); // offset still tracks --base-outline-width → 2px of ring outside the row
  });

  test('the ring is an outline, so states never shift layout', async ({ page }) => {
    // Layout box relative to the list — viewport coords would also move if the page scrolls.
    const box = () => refRow(page, 'Music').evaluate((el: HTMLElement) =>
      ({ top: el.offsetTop, left: el.offsetLeft, width: el.offsetWidth, height: el.offsetHeight }));
    const before = await box();
    await refRow(page, 'Music').click();
    await page.locator('#ctl-ring-width').fill('4');
    await page.locator('#ctl-selected-ring').check();
    expect(await box()).toEqual(before);
  });
});

test.describe('corner radius (--base-border-radius-sm)', () => {
  test('rows follow the radius slider (reference list + web-treeview)', async ({ page }) => {
    const refRadius = () => style(refRow(page, 'Music'), 'border-top-left-radius');
    expect(await refRadius()).toBe('4px');
    await page.locator('#ctl-radius').fill('1.2');
    expect(await refRadius()).toBe('12px');

    test.skip(!(await hasComponent(page, 'tree')), 'build ../web-treeview first (npm run build)');
    const treeNode = page.locator('#tree .wtv__node-content', { hasText: /^\s*Music\s*$/ });
    expect(await style(treeNode, 'border-top-left-radius')).toBe('12px');
  });
});

test.describe('web-treeview reads the same tokens', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!(await hasComponent(page, 'tree')), 'build ../web-treeview first (npm run build)');
  });

  const node = (page: Page, label: string) =>
    page.locator('#tree .wtv__node-content', { hasText: new RegExp(`^\\s*${label}\\s*$`) });

  test('selected node matches the reference selected row', async ({ page }) => {
    await refRow(page, 'Music').click();
    await refRow(page, 'Videos').click({ modifiers: ['Control'] }); // focus off Music → selected only
    await node(page, 'Music').click({ modifiers: ['Control'] });
    await node(page, 'Videos').click({ modifiers: ['Control'] });
    await page.mouse.move(0, 0);

    await expect(node(page, 'Music')).toHaveClass(/wtv__node-content--(highlighted|selected)/);
    expect(await style(node(page, 'Music'), 'background-color'))
      .toBe(await style(refRow(page, 'Music'), 'background-color'));
  });

  test('focus ring follows --base-outline-width and stays inset', async ({ page }) => {
    await node(page, 'Pictures').click();
    await expect(node(page, 'Pictures')).toHaveClass(/wtv__node-content--focused/);
    expect(await ring(node(page, 'Pictures'))).toEqual({ width: 1, offset: -1, style: 'solid' });

    await page.locator('#ctl-ring-width').fill('3');
    expect(await ring(node(page, 'Pictures'))).toEqual({ width: 3, offset: -3, style: 'solid' });
    expect(await style(node(page, 'Pictures'), 'outline-color')).toBe(await resolve(page, 'color', 'var(--base-primary-color)'));
  });
});

test.describe('web-multiselect reads the same tokens', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!(await hasComponent(page, 'multiselect')), 'build ../web-multiselect first (npm run build)');
  });

  const ms = (page: Page) => page.locator('#ms');
  const option = (page: Page, value: string) => ms(page).locator(`.ms__option[data-value="${value}"]`);

  async function openDropdown(page: Page): Promise<void> {
    await ms(page).locator('.ms__input').click();
    await expect(ms(page).locator('.ms__dropdown')).toBeVisible();
  }

  test('picked option paints the same tint as a selected reference row', async ({ page }) => {
    await refRow(page, 'Music').click();
    await refRow(page, 'Videos').click({ modifiers: ['Control'] });
    await openDropdown(page);
    await page.mouse.move(0, 0);

    // Apple is pre-picked; make sure the cursor isn't on it.
    const apple = option(page, 'apple');
    await expect(apple).toHaveClass(/ms__option--selected/);
    await expect(apple).not.toHaveClass(/ms__option--focused/);
    expect(await style(apple, 'background-color'))
      .toBe(await style(refRow(page, 'Music'), 'background-color'));
  });

  test('cursor option gets the inset focus ring, following --base-outline-width', async ({ page }) => {
    await page.locator('#ctl-ring-width').fill('2');
    await openDropdown(page);
    await page.keyboard.press('ArrowDown');

    const focused = ms(page).locator('.ms__option--focused');
    await expect(focused).toHaveCount(1);
    expect(await ring(focused)).toEqual({ width: 2, offset: -2, style: 'solid' });
  });
});
