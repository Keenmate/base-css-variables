import { test, expect, type Page } from '@playwright/test';

/**
 * Derivation contract: a derived --base-* token must FOLLOW its source at
 * runtime. Each spec overrides one source token on :root and checks that every
 * dependent resolves to the new value — so a pasted literal (the old
 * `--base-input-border-focus: … #0ea5e9`, `--base-success-bg: #10b981`) fails.
 *
 * Probes paint a real property (border / background / outline) from the token
 * and compare against the same value computed by the browser directly.
 */

const PAGE = '/demo/item-states.html';

async function open(page: Page, scheme: 'light' | 'dark' = 'light'): Promise<void> {
  await page.goto(PAGE);
  await page.waitForFunction(() => (window as any).__demo?.ready === true);
  await page.evaluate((s) => { document.documentElement.style.colorScheme = s; }, scheme);
}

const setRoot = (page: Page, vars: Record<string, string>) =>
  page.evaluate((v) => {
    for (const [k, val] of Object.entries(v)) document.documentElement.style.setProperty(k, val);
  }, vars);

/** Computed `prop` of a fresh element styled with `css`. */
const paint = (page: Page, css: string, prop: string) =>
  page.evaluate(([c, p]) => {
    const el = document.createElement('div');
    el.style.cssText = c;
    document.body.appendChild(el);
    const out = getComputedStyle(el).getPropertyValue(p);
    el.remove();
    return out;
  }, [css, prop]);

const bg = (page: Page, value: string) => paint(page, `background-color: ${value}`, 'background-color');
const borderColor = (page: Page, shorthand: string) => paint(page, `border: ${shorthand}`, 'border-top-color');
const color = (page: Page, value: string) => paint(page, `color: ${value}`, 'color');

const RED = 'rgb(255, 0, 0)';
const GREEN = 'rgb(0, 128, 0)';

test('primary: tints, input borders and item states follow --base-primary-color', async ({ page }) => {
  await open(page);
  await setRoot(page, { '--base-primary-color': RED });

  expect(await borderColor(page, 'var(--base-input-border-focus)')).toBe(RED);
  expect(await borderColor(page, 'var(--base-input-border-hover)')).toBe(RED);
  expect(await paint(page, 'box-shadow: var(--base-input-box-shadow-focus)', 'box-shadow')).toBe(`${await color(page, `color-mix(in srgb, ${RED} 5%, transparent)`)} 0px 0px 0px 3px`);
  expect(await bg(page, 'var(--base-primary-bg-subtle)')).toBe(await bg(page, `color-mix(in srgb, ${RED} 10%, transparent)`));
  expect(await bg(page, 'var(--base-primary-bg-subtle-hover)')).toBe(await bg(page, `color-mix(in srgb, ${RED} 15%, transparent)`));
  expect(await bg(page, 'var(--base-selected-bg)')).toBe(await bg(page, `color-mix(in srgb, ${RED} 10%, transparent)`));
  expect(await paint(page, 'outline: var(--base-focused-outline)', 'outline-color')).toBe(RED);
});

test('primary tint is mode-aware like the role tints (dark 20% / 30%)', async ({ page }) => {
  await open(page, 'dark');
  await setRoot(page, { '--base-primary-color': RED });
  expect(await bg(page, 'var(--base-primary-bg-subtle)')).toBe(await bg(page, `color-mix(in srgb, ${RED} 20%, transparent)`));
  expect(await bg(page, 'var(--base-primary-bg-subtle-hover)')).toBe(await bg(page, `color-mix(in srgb, ${RED} 30%, transparent)`));
});

test('shadow: the dropdown shadow follows --base-shadow-color', async ({ page }) => {
  await open(page);
  expect(await paint(page, 'box-shadow: var(--base-dropdown-box-shadow)', 'box-shadow')).toBe('rgba(0, 0, 0, 0.15) 0px 8px 16px 0px');
  await open(page, 'dark');
  expect(await paint(page, 'box-shadow: var(--base-dropdown-box-shadow)', 'box-shadow')).toBe('rgba(0, 0, 0, 0.4) 0px 8px 16px 0px');
  await setRoot(page, { '--base-shadow-color': RED });
  expect(await paint(page, 'box-shadow: var(--base-dropdown-box-shadow)', 'box-shadow')).toBe(`${RED} 0px 8px 16px 0px`);
});

test('border: every border token follows --base-border-color', async ({ page }) => {
  await open(page);
  await setRoot(page, { '--base-border-color': GREEN });

  expect(await borderColor(page, 'var(--base-border)')).toBe(GREEN);
  expect(await borderColor(page, 'var(--base-dropdown-border)')).toBe(GREEN);
});

test('control border: input / checkbox outline mixes text-color-1 into main-bg (light 45% / dark 35%), not the divider', async ({ page }) => {
  for (const [scheme, pct] of [['light', 45], ['dark', 35]] as const) {
    await open(page, scheme);
    await setRoot(page, { '--base-text-color-1': RED, '--base-main-bg': GREEN, '--base-border-color': 'blue' });
    const want = await borderColor(page, `1px solid color-mix(in srgb, ${RED} ${pct}%, ${GREEN})`);
    expect(await borderColor(page, '1px solid var(--base-input-border-color)')).toBe(want);
    expect(await borderColor(page, 'var(--base-input-border)')).toBe(want);
    expect(await borderColor(page, '1px solid var(--base-checkbox-border-color)')).toBe(want);
  }
});

test('surfaces + text: input / dropdown tokens follow their source', async ({ page }) => {
  await open(page);
  await setRoot(page, { '--base-text-color-1': RED, '--base-text-color-3': GREEN, '--base-main-bg': RED });

  expect(await color(page, 'var(--base-input-text-color)')).toBe(RED);
  expect(await color(page, 'var(--base-input-icon-color)')).toBe(GREEN);
  expect(await bg(page, 'var(--base-dropdown-bg)')).toBe(RED);
});

const ALL_ROLES = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'] as const;

// Every role has the same derived set; each step follows the role's -color.
for (const role of ALL_ROLES) {
  for (const [scheme, mix, tint, tintHover] of [['light', 'black', 10, 15], ['dark', 'white', 20, 30]] as const) {
    test(`${role}: hover / active / tints (${scheme}) follow --base-${role}-color`, async ({ page }) => {
      await open(page, scheme);
      await setRoot(page, { [`--base-${role}-color`]: RED });

      expect(await bg(page, `var(--base-${role}-color-hover)`)).toBe(await bg(page, `color-mix(in srgb, ${mix} 15%, ${RED})`));
      expect(await bg(page, `var(--base-${role}-color-active)`)).toBe(await bg(page, `color-mix(in srgb, ${mix} 30%, ${RED})`));
      expect(await bg(page, `var(--base-${role}-bg-subtle)`)).toBe(await bg(page, `color-mix(in srgb, ${RED} ${tint}%, transparent)`));
      expect(await bg(page, `var(--base-${role}-bg-subtle-hover)`)).toBe(await bg(page, `color-mix(in srgb, ${RED} ${tintHover}%, transparent)`));
    });
  }
}

test('every role defines the same seven tokens', async ({ page }) => {
  await open(page);
  const parts = ['-color', '-color-hover', '-color-active', '-bg-subtle', '-bg-subtle-hover', '-text-color'];
  const names = ALL_ROLES.flatMap((r) => [...parts.map((x) => `--base-${r}${x}`), `--base-on-${r}-text-color`]);
  const missing = await page.evaluate((ns) => {
    const cs = getComputedStyle(document.documentElement);
    return ns.filter((n) => cs.getPropertyValue(n).trim() === '');
  }, names);
  expect(missing).toEqual([]);
});

for (const role of ['primary', 'secondary'] as const) {
  for (const [scheme, mix, pct] of [['light', 'black', 45], ['dark', 'white', 25]] as const) {
    test(`${role}: text color (${scheme}) follows the fill and reads on the main surface`, async ({ page }) => {
      await open(page, scheme);
      const fg = await color(page, `var(--base-${role}-text-color)`);
      const surface = await bg(page, 'var(--base-main-bg)');
      const lum = (c: string) => {
        const scale = c.startsWith('color(srgb') ? 1 : 255;  // color-mix() serializes as color(srgb 0–1 …)
        const [r, g, b] = c.replace('color(srgb', '').match(/[\d.]+/g)!.slice(0, 3).map((v) => {
          const x = +v / scale;
          return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const [hi, lo] = [lum(fg), lum(surface)].sort((a, b) => b - a);
      expect((hi + 0.05) / (lo + 0.05)).toBeGreaterThanOrEqual(4.5);

      await setRoot(page, { [`--base-${role}-color`]: RED });
      expect(await color(page, `var(--base-${role}-text-color)`)).toBe(await color(page, `color-mix(in srgb, ${mix} ${pct}%, ${RED})`));
    });
  }
}

test('2.0.0 removed / renamed names are not defined', async ({ page }) => {
  await open(page);
  const roles = ['success', 'danger', 'warning', 'info'];
  const gone = [
    '--base-accent-color', '--base-accent-color-hover', '--base-accent-color-active',
    '--base-accent-color-light', '--base-accent-color-light-hover', '--base-text-color-on-accent',
    '--base-primary-color-light', '--base-primary-color-light-hover', '--base-text-on-primary',
    '--base-text-on-secondary', '--base-text-inverted', '--base-inverse-text', '--base-inverse-bg', '--base-inverse-text-color',
    '--base-input-color', '--base-input-clear-color', '--base-input-clear-bg-hover', '--base-tooltip-color',
    ...roles.flatMap((r) => [`--base-${r}-bg`, `--base-${r}-bg-light`, `--base-${r}-text-light`,
      `--base-${r}-border`, `--base-${r}-text`, `--base-text-on-${r}`]),
    ...Array.from({ length: 9 }, (_, i) => [`--base-color-${i + 1}`, `--base-color-${i + 1}-text`,
      `--base-palette-${i + 1}-text`, `--base-text-on-palette-${i + 1}`]).flat(),
  ];
  const defined = await page.evaluate((names) => {
    const cs = getComputedStyle(document.documentElement);
    return names.filter((n) => cs.getPropertyValue(n).trim() !== '');
  }, gone);
  expect(defined).toEqual([]);
});

test('text levels and surfaces follow the inputs (main-bg, text-color-1)', async ({ page }) => {
  await open(page);
  const before = {
    t2: await color(page, 'var(--base-text-color-2)'),
    elev: await bg(page, 'var(--base-elevated-bg)'),
    border: await borderColor(page, '1px solid var(--base-border-color)'),
  };
  await setRoot(page, { '--base-main-bg': 'rgb(255, 250, 230)', '--base-text-color-1': 'rgb(80, 20, 20)' });
  expect(await color(page, 'var(--base-text-color-2)')).toBe(await color(page, 'color-mix(in srgb, rgb(80, 20, 20) 75%, rgb(255, 250, 230))'));
  expect(await bg(page, 'var(--base-elevated-bg)')).not.toBe(before.elev);
  expect(await borderColor(page, '1px solid var(--base-border-color)')).not.toBe(before.border);
  expect(before.t2).not.toBe(await color(page, 'var(--base-text-color-2)'));
});

test('dark mode: hover differs from the elevated surface, faint text from the border', async ({ page }) => {
  await open(page, 'dark');
  expect(await bg(page, 'var(--base-hover-bg)')).not.toBe(await bg(page, 'var(--base-elevated-bg)'));
  expect(await color(page, 'var(--base-text-color-4)')).not.toBe(await borderColor(page, '1px solid var(--base-border-color)'));
});

test('.base-scope recalculates derived tokens for a re-themed subtree; a plain element does not', async ({ page }) => {
  await open(page);
  const tintIn = (cls: string) =>
    page.evaluate((c) => {
      const scope = document.createElement('div');
      scope.className = c;
      scope.style.setProperty('--base-primary-color', 'rgb(255, 0, 0)');
      const probe = document.createElement('div');
      probe.style.background = 'var(--base-primary-bg-subtle)';
      scope.append(probe);
      document.body.append(scope);
      const v = getComputedStyle(probe).backgroundColor;
      scope.remove();
      return v;
    }, cls);
  const red10 = await bg(page, 'color-mix(in srgb, rgb(255, 0, 0) 10%, transparent)');
  expect(await tintIn('base-scope')).toBe(red10);
  // Without the scope hook the tint was resolved on :root (primary blue) — the documented limitation.
  expect(await tintIn('')).not.toBe(red10);
});

/** Text colour painted from `on` over the background painted from `fill`, as sRGB bytes. */
const pair = (page: Page, on: string, fill: string) =>
  page.evaluate(([o, f]) => {
    const el = document.createElement('div');
    el.style.cssText = `color: ${o}; background-color: ${f}`;
    document.body.appendChild(el);
    const cs = getComputedStyle(el);
    const cv = document.createElement('canvas'); cv.width = cv.height = 1;
    const ctx = cv.getContext('2d')!;
    const px = (c: string) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3); };
    const out = { text: px(cs.color), fill: px(cs.backgroundColor) };
    el.remove();
    return out;
  }, [on, fill]);

/** APCA 0.0.98G-4g |Lc| of `text` on `bg` (sRGB bytes). */
const apca = (text: number[], bg: number[]) => {
  const Ys = (c: number[]) => 0.2126729 * (c[0] / 255) ** 2.4 + 0.7151522 * (c[1] / 255) ** 2.4 + 0.0721750 * (c[2] / 255) ** 2.4;
  const clampY = (y: number) => (y > 0.022 ? y : y + (0.022 - y) ** 1.414);
  const t = clampY(Ys(text)), b = clampY(Ys(bg));
  if (b > t) { const s = (b ** 0.56 - t ** 0.57) * 1.14; return s < 0.1 ? 0 : (s - 0.027) * 100; }
  const s = (b ** 0.65 - t ** 0.62) * 1.14;
  return s > -0.1 ? 0 : -(s + 0.027) * 100;
};
const WHITE = [255, 255, 255], BLACK = [0, 0, 0];

test('reduced motion: the four durations are 0s; otherwise 0.1s / 0.15s / 0.25s / 0.3s', async ({ page }) => {
  const read = () => page.evaluate(() => ['fast', 'normal', 'medium', 'slow']
    .map((d) => getComputedStyle(document.documentElement).getPropertyValue(`--base-duration-${d}`).trim()));
  await open(page);
  expect(await read()).toEqual(['0.1s', '0.15s', '0.25s', '0.3s']);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await read()).toEqual(['0s', '0s', '0s', '0s']);
});

test('on-fill text: black or white, whichever reads better by APCA, following the fill', async ({ page }) => {
  await open(page);
  // navy → white, yellow → black; sky blue and red-500 → white (WCAG 2 would pick black);
  // amber → black; the greys either side of the APCA tie (Ys 0.342 ≈ #a3a3a3)
  for (const [fill, expected] of [['#1e3a8a', WHITE], ['#fde047', BLACK], ['#0ea5e9', WHITE], ['#ef4444', WHITE],
    ['#f59e0b', BLACK], ['#a0a0a0', WHITE], ['#a6a6a6', BLACK]] as const) {
    await setRoot(page, { '--base-primary-color': fill });
    const { text } = await pair(page, 'var(--base-on-primary-text-color)', 'var(--base-primary-color)');
    expect(text, fill).toEqual(expected);
  }
});

test('on-fill text: every default role and palette fill gets the better APCA pick, light and dark', async ({ page }) => {
  const roles = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'].map((r) => [`--base-on-${r}-text-color`, `--base-${r}-color`]);
  const slots = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => [`--base-on-palette-${i}-text-color`, `--base-palette-${i}`]);
  for (const scheme of ['light', 'dark'] as const) {
    await open(page, scheme);
    for (const [on, fill] of [...roles, ...slots]) {
      const { text, fill: f } = await pair(page, `var(${on})`, `var(${fill})`);
      const best = Math.max(apca(WHITE, f), apca(BLACK, f));
      expect(apca(text, f), `${scheme} ${on}`).toBeCloseTo(best, 5);
      expect(best, `${scheme} ${on}`).toBeGreaterThanOrEqual(45);  // readable for bold / button-size text
    }
  }
});
