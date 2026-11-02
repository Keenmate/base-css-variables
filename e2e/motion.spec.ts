import { test, expect, type Page } from '@playwright/test';

/**
 * Motion levels (`[data-motion="none | snappy | smooth"]`) and reduced motion, measured as the
 * computed transition duration of an element that reads --base-duration-normal. The values are
 * the reference for web-components-core's MOTION_PRESETS (its motion.test.ts compares them).
 */

const PAGE = '/examples-motion.html';

/** Opens the motion page and adds a probe inside each fixture wrapper. */
async function open(page: Page): Promise<void> {
  await page.goto(PAGE);
  await page.waitForFunction(() => (window as any).__demo?.ready === true);
  await page.evaluate(() => {
    const probe = '<span class="probe" style="display: block; transition: opacity var(--base-duration-normal)"></span>';
    const fixture = document.createElement('div');
    fixture.id = 'motion-fixture';
    fixture.innerHTML = `
      <section data-case="unset">${probe}</section>
      <section data-case="none" data-motion="none">${probe}</section>
      <section data-case="snappy" data-motion="snappy">${probe}</section>
      <section data-case="smooth" data-motion="smooth">${probe}</section>
      <section data-case="none-in-smooth" data-motion="smooth"><div data-motion="none">${probe}</div></section>
      <section data-case="smooth-in-none" data-motion="none"><div data-motion="smooth">${probe}</div></section>`;
    document.body.append(fixture);
  });
}

type Probe = { duration: string; scroll: string; fast: string; slow: string; loader: string };

const probe = (page: Page, name: string): Promise<Probe> =>
  page.evaluate((n) => {
    const el = document.querySelector(`[data-case="${n}"] .probe`)!;
    const cs = getComputedStyle(el);
    const v = (t: string) => cs.getPropertyValue(t).trim();
    return {
      duration: cs.transitionDuration,
      scroll: v('--base-scroll-behavior'),
      fast: v('--base-duration-fast'),
      slow: v('--base-duration-slow'),
      loader: v('--base-loader-duration'),
    };
  }, name);

test('each level sets the speeds and the scroll behaviour', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await open(page);
  expect(await probe(page, 'unset')).toEqual({ duration: '0.15s', scroll: 'smooth', fast: '0.1s', slow: '0.3s', loader: '0.8s' });
  expect(await probe(page, 'none')).toEqual({ duration: '0s', scroll: 'auto', fast: '0s', slow: '0s', loader: '0.8s' });
  expect(await probe(page, 'snappy')).toEqual({ duration: '0.08s', scroll: 'smooth', fast: '0.05s', slow: '0.15s', loader: '0.8s' });
  expect(await probe(page, 'smooth')).toEqual({ duration: '0.25s', scroll: 'smooth', fast: '0.15s', slow: '0.45s', loader: '0.8s' });
});

test('the nearest level wins, for speeds and scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await open(page);
  expect(await probe(page, 'none-in-smooth')).toMatchObject({ duration: '0s', scroll: 'auto' });
  expect(await probe(page, 'smooth-in-none')).toMatchObject({ duration: '0.25s', scroll: 'smooth' });
});

test('a level on <html> reaches everything without its own', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await open(page);
  await page.selectOption('#ctl-page-level', 'snappy');
  expect(await probe(page, 'unset')).toMatchObject({ duration: '0.08s', scroll: 'smooth' });
  expect(await probe(page, 'smooth')).toMatchObject({ duration: '0.25s' });
  await page.selectOption('#ctl-page-level', '');
  expect(await probe(page, 'unset')).toMatchObject({ duration: '0.15s' });
});

test('reduced motion beats every level, smooth included; the loader slows', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  for (const name of ['unset', 'none', 'snappy', 'smooth', 'none-in-smooth', 'smooth-in-none']) {
    expect(await probe(page, name), name).toEqual({ duration: '0s', scroll: 'auto', fast: '0s', slow: '0s', loader: '1.5s' });
  }
});

test('MO04 boxes show their level', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await open(page);
  const readouts = await page.locator('#levels .level-readout').allTextContents();
  expect(readouts).toEqual([
    'normal 0.15s · scroll smooth',
    'normal 0s · scroll auto',
    'normal 0.08s · scroll smooth',
    'normal 0.25s · scroll smooth',
    'normal 0.25s · scroll smooth',
    'normal 0s · scroll auto',
  ]);
});
