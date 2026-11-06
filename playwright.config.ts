import { getKmwcConfig } from '@keenmate/web-components-devkit';
import { definePlaywrightConfig, devices } from '@keenmate/web-components-devkit/playwright';

/**
 * Playwright config for the base-css-variables e2e suite (devkit preset).
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
// IPv4, like vite.config.ts: Vite's "localhost" can bind ::1 only, and Firefox then
// sometimes gets connection refused.
const DEV_URL = `http://127.0.0.1:${getKmwcConfig().ports.dev}`;

export default definePlaywrightConfig({
  use: { baseURL: DEV_URL },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // The loader (a mask image + animation) and the motion levels: checked in all three engines.
    { name: 'firefox', testMatch: /(loader|motion)\.spec\.ts/, use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testMatch: /(loader|motion)\.spec\.ts/, use: { ...devices['Desktop Safari'] } },
  ],
  webServer: { url: `${DEV_URL}/examples-item-states.html`, timeout: 30_000 },
});
