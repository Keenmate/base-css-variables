import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import type { Plugin } from 'vite';
import { defineComponentConfig } from '@keenmate/web-components-devkit/vite';

/**
 * Examples site for the --base-* contract (devkit preset: ports, layout, kit and
 * the examples build all come from package.json#kmwc). Nothing here ships.
 *
 *   npm run dev   → http://localhost:15300
 *
 * The pages show real components reading this checkout's tokens, so the dev
 * server also serves the LOCAL builds of sibling repos (build them first):
 *
 *   /vendor/web-multiselect/*   → ../web-multiselect/dist/*   (override: WEB_MULTISELECT_DIST)
 *   /vendor/web-treeview/*      → ../web-treeview/dist/*      (override: WEB_TREEVIEW_DIST)
 *   /vendor/pure-admin-themes/* → ../pure-admin-themes/*      (override: PURE_ADMIN_THEMES_DIR)
 *
 * A missing build only shows a notice in that component's panel.
 */
const VENDOR_MOUNTS: Record<string, string> = {
  '/vendor/web-multiselect/': resolve(process.env.WEB_MULTISELECT_DIST || '../web-multiselect/dist'),
  '/vendor/web-treeview/': resolve(process.env.WEB_TREEVIEW_DIST || '../web-treeview/dist'),
  '/vendor/pure-admin-themes/': resolve(process.env.PURE_ADMIN_THEMES_DIR || '../pure-admin-themes'),
};

const CONTENT_TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

/** Serve the sibling builds as plain files (not through Vite's module pipeline). */
function vendorMounts(): Plugin {
  // A block body: a function returned from configureServer would run as a post hook.
  const serve = (server: { middlewares: { use: Function } }): void => {
    server.middlewares.use((request: any, response: any, next: () => void) => {
      const path = decodeURIComponent(new URL(request.url, 'http://x').pathname);
      const mount = Object.keys(VENDOR_MOUNTS).find((prefix) => path.startsWith(prefix));
      if (!mount) return next();
      const base = VENDOR_MOUNTS[mount];
      const file = resolve(base, path.slice(mount.length));
      if (!(file.startsWith(base + sep)) || !existsSync(file) || !statSync(file).isFile()) {
        response.statusCode = 404;
        return response.end('not found');
      }
      response.setHeader('content-type', CONTENT_TYPES[extname(file)] || 'application/octet-stream');
      response.setHeader('cache-control', 'no-store');
      createReadStream(file).pipe(response);
    });
  };
  return { name: 'base-vendor-mounts', configureServer: serve, configurePreviewServer: serve };
}

export default defineComponentConfig({
  plugins: [vendorMounts()],
  overrides: {
    // IPv4: Vite's "localhost" can bind ::1 only, and Firefox (e2e) then sometimes gets
    // connection refused. A browser on localhost still reaches it.
    server: { host: '127.0.0.1', fs: { allow: [join(process.cwd(), '..')] } },
    preview: { host: '127.0.0.1' },
  },
});
