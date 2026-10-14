// Zero-dependency static server for the demo + e2e suite.
//
//   node demo/serve.mjs            → http://localhost:12510/demo/item-states.html
//
// Serves this repo root, plus the LOCAL builds of the sibling component repos so
// the demo shows real components reading the --base-* tokens from this checkout:
//
//   /vendor/web-multiselect/*  → ../web-multiselect/dist/*   (override: WEB_MULTISELECT_DIST)
//   /vendor/web-treeview/*     → ../web-treeview/dist/*      (override: WEB_TREEVIEW_DIST)
//
// Build those repos first (`npm run build` in each). If a dist is missing the
// demo still loads — it just shows a notice in that component's panel.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PORT = Number(process.env.PORT) || 12510;

const MOUNTS = {
  '/vendor/web-multiselect/': resolve(process.env.WEB_MULTISELECT_DIST || join(ROOT, '..', 'web-multiselect', 'dist')),
  '/vendor/web-treeview/': resolve(process.env.WEB_TREEVIEW_DIST || join(ROOT, '..', 'web-treeview', 'dist')),
};

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

/** Resolve a URL path to a file under `base`, refusing anything that escapes it. */
function within(base, rel) {
  const file = resolve(base, normalize(rel).replace(/^([/\\])+/, ''));
  return file === base || file.startsWith(base + sep) ? file : null;
}

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path === '/') path = '/demo/item-states.html';

  const mount = Object.keys(MOUNTS).find((m) => path.startsWith(m));
  const file = mount ? within(MOUNTS[mount], path.slice(mount.length)) : within(ROOT, path);

  try {
    if (!file || !(await stat(file)).isFile()) throw new Error('not a file');
    res.writeHead(200, {
      'content-type': TYPES[extname(file)] || 'application/octet-stream',
      'cache-control': 'no-store',
    });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end(`404 ${path}`);
  }
}).listen(PORT, () => {
  console.log(`base-css-variables demo → http://localhost:${PORT}/demo/item-states.html`);
});
