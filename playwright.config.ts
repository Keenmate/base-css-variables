import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the base-css-variables e2e suite.
 *
 * The package itself has no build — this suite only locks the --base-* contract
 * against regressions by driving demo/*.html, served by the zero-dependency
 * demo/serve.mjs on :12510. That server also mounts the LOCAL builds of the
 * sibling component repos (../web-treeview/dist, ../web-multiselect/dist), so the
 * component specs prove real components read these tokens; they skip themselves
 * when a sibling build is missing. Nothing here ships (see `files` in package.json).
 *
 * Commands:
 *   npm run test:e2e:install   # one-time: download chromium
 *   npm run test:e2e           # headless run
 *   npm run test:e2e:headed    # watch the browser
 *   npm run demo               # just serve the demo
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: 'http://localhost:12510',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    command: 'node demo/serve.mjs',
    url: 'http://localhost:12510/demo/item-states.html',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
