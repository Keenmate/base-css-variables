import { readFileSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

const { dev: devPort } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).kmwc.ports;
const DEV_URL = `http://127.0.0.1:${devPort}`;

/**
 * Playwright config for the base-css-variables e2e suite.
 *
 * The package itself has no build — this suite only locks the --base-* contract
 * against regressions by driving the examples pages (root examples-*.html), served
 * by the devkit Vite preset on the registry port (package.json#kmwc.ports.dev).
 * vite.config.ts also mounts the LOCAL builds of the sibling component repos
 * (../web-treeview/dist, ../web-multiselect/dist) under /vendor/, so the component
 * specs prove real components read these tokens; they skip themselves when a
 * sibling build is missing. Nothing here ships (see `files` in package.json).
 *
 * Commands:
 *   npm run test:e2e:install   # one-time: download chromium, firefox, webkit
 *   npm run test:e2e           # headless run
 *   npm run test:e2e:headed    # watch the browser
 *   npm run dev                # just serve the examples
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
    baseURL: DEV_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // The loader is a mask image + animation: checked in all three engines.
    { name: 'firefox', testMatch: /loader\.spec\.ts/, use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testMatch: /loader\.spec\.ts/, use: { ...devices['Desktop Safari'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: `${DEV_URL}/examples-item-states.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
