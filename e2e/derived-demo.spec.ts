import { test, expect } from '@playwright/test';

/**
 * Smoke test for the dev page demo/derived.html (current vs formula-derived contract).
 * Locks the two problems the formulas exist to fix: in dark mode hover must differ from the
 * elevated surface, and the faintest text must differ from the border color.
 */
test('derived demo renders and fixes the dark-mode collisions', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/demo/derived.html');
  await page.waitForFunction(() => (window as any).__derived?.ready === true);
  expect(errors).toEqual([]);

  const paint = (panel: string, css: string, prop: string) =>
    page.locator(panel).evaluate((el, [c, p]) => {
      const d = document.createElement('div');
      d.style.cssText = c;
      el.append(d);
      const v = getComputedStyle(d).getPropertyValue(p);
      d.remove();
      return v;
    }, [css, prop]);

  // The contract itself is derived now: no collision in its dark mode either.
  expect(await paint('#cur-d', 'background: var(--base-hover-bg)', 'background-color')).not.toBe(
    await paint('#cur-d', 'background: var(--base-elevated-bg)', 'background-color'),
  );
  // Derived: hover (a translucent overlay) never equals the elevated surface; text-4 != border.
  expect(await paint('#der-d', 'background: var(--base-hover-bg)', 'background-color')).not.toBe(
    await paint('#der-d', 'background: var(--base-elevated-bg)', 'background-color'),
  );
  expect(await paint('#der-d', 'color: var(--base-text-color-4)', 'color')).not.toBe(
    await paint('#der-d', 'color: var(--base-border-color)', 'color'),
  );
});

test('derived demo loads a compiled pure-admin theme into both modes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/demo/derived.html');
  await page.waitForFunction(() => (window as any).__derived?.ready === true);
  const res = await page.request.get('/vendor/pure-admin-themes/nato/dist/nato.css');
  test.skip(!res.ok(), 'pure-admin-themes build not available next to this repo');

  await page.selectOption('#theme', 'nato');
  await expect(page.locator('#theme-note')).toContainText('nato');
  const mainBg = (id: string) => page.locator(id).evaluate((el) => getComputedStyle(el).getPropertyValue('--base-main-bg').trim());
  // NATO: white light mode, navy dark mode (from its .pc-mode-dark blocks) — both panels must differ.
  expect(await mainBg('#cur-l')).not.toBe(await mainBg('#cur-d'));
  expect(await mainBg('#der-d')).toBe(await mainBg('#cur-d'));
  expect(errors).toEqual([]);
});
