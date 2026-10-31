/**
 * Shared helpers for the example pages: the mock app (styled by
 * examples-mock.css, reading only --base-* tokens) and the vendor component
 * loader (/vendor/* is served by vite.config.ts from the sibling builds).
 */

const MOCK_HTML = `
  <div class="app-bar">
    <strong>Acme</strong>
    <input class="app-input" placeholder="Search orders…" aria-label="Search">
    <button type="button" class="app-btn app-btn--primary">New order</button>
  </div>
  <div class="app-body">
    <div class="app-nav" role="navigation">
      <a class="is-selected">Dashboard</a><a>Orders</a><a>Customers</a><a>Reports</a>
    </div>
    <div class="app-main">
      <div class="app-alert">3 orders wait for approval.</div>
      <div class="app-panel">
        <h4>Order #1042</h4>
        <p class="t2">Shipped to Prague · 2 items</p>
        <p class="t3">Updated 5 minutes ago</p>
        <div class="app-tags">
          <span class="app-tag app-tag--success">Paid</span>
          <span class="app-tag app-tag--warning">Pending</span>
          <span class="app-tag app-tag--danger">Overdue</span>
        </div>
        <div class="app-actions">
          <button type="button" class="app-btn app-btn--primary">Approve</button>
          <button type="button" class="app-btn app-btn--outline">Edit</button>
          <button type="button" class="app-btn app-btn--danger">Cancel</button>
          <a class="app-link" href="#" onclick="return false">Details</a>
        </div>
      </div>
    </div>
  </div>`;

/** A new mock app element; `mini` stacks it for narrow side-by-side panels. */
export function mockApp({ mini = false } = {}) {
  const app = document.createElement('div');
  app.className = mini ? 'app app--mini' : 'app';
  app.innerHTML = MOCK_HTML;
  return app;
}

// A nav click moves the selection, so the hover / selected states can be tried.
document.addEventListener('click', (event) => {
  const link = event.target.closest('.app-nav a');
  if (!link) return;
  for (const a of link.parentElement.children) a.classList.toggle('is-selected', a === link);
});

const VENDOR = {
  'web-multiselect': '/vendor/web-multiselect/multiselect.js',
  'web-treeview': '/vendor/web-treeview/web-treeview.js',
};

/**
 * Load a sibling component build. On failure, unhide its `[data-missing="tag"]`
 * notices and remove its elements, so the page still works without the build.
 */
export async function loadComponent(tag) {
  try {
    await import(/* @vite-ignore */ VENDOR[tag]);
    await customElements.whenDefined(tag);
    return true;
  } catch (err) {
    console.warn(`[demo] ${tag} not loaded from ${VENDOR[tag]}:`, err);
    document.querySelectorAll(`[data-missing="${tag}"]`).forEach((node) => { node.hidden = false; });
    document.querySelectorAll(tag).forEach((node) => node.remove());
    return false;
  }
}

/** The markup of a missing-build notice for `tag`. */
export const missingNotice = (tag) =>
  `<p class="notice" data-missing="${tag}" hidden>${tag} build not found — run <code>npm run build</code> in <code>../${tag}</code>.</p>`;

/** Sample tree nodes for web-treeview. */
export const TREE_NODES = [
  { id: 1, path: '1', displayValue: 'Orders' },
  { id: 2, path: '1.1', displayValue: '2026' },
  { id: 3, path: '1.1.1', displayValue: '#1042' },
  { id: 4, path: '1.1.2', displayValue: '#1043' },
  { id: 5, path: '2', displayValue: 'Customers' },
  { id: 6, path: '3', displayValue: 'Reports' },
];

/** Resolve a colour token to hex (any colour syntax) by painting it on a 1px canvas. */
const probe = document.createElement('div');
probe.style.display = 'none';
const ctx = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true });
export function resolveColor(token, scope = document.body) {
  if (probe.parentElement !== scope) scope.append(probe);
  probe.style.color = `var(${token})`;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = getComputedStyle(probe).color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  const hex = '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');
  return a === 255 ? hex : `${hex} at ${Math.round(a / 2.55)}%`;
}
