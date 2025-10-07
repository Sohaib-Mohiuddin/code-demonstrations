// ----- tiny client-side router (SPA demo) -----
const views = [...document.querySelectorAll('[data-view]')];
const links = [...document.querySelectorAll('[data-route]')];

function show(id) {
  views.forEach(v => {
    const active = v.id === id;
    v.hidden = !active;
    v.classList.toggle('is-active', active);
  });
}
function onHashChange() { show(location.hash.slice(1) || 'home'); }
addEventListener('hashchange', onHashChange);
links.forEach(a => a.addEventListener('click', (e) => {
  // normal anchor behavior + hash routing (no full reload)
}));

onHashChange(); // init

// ----- SPA state demo -----
document.querySelectorAll('[data-increment]').forEach(btn => {
  const span = btn.querySelector('span');
  let count = 0;
  btn.addEventListener('click', () => { span.textContent = ++count; });
});

// ----- CSR fetch demo (simulated API) -----
const postsBtn = document.getElementById('load-posts');
const postsList = document.getElementById('posts');
postsBtn?.addEventListener('click', async () => {
  postsBtn.disabled = true;
  postsBtn.textContent = 'Loading…';
  // Simulate network; in class replace with real endpoint
  await new Promise(r => setTimeout(r, 500));
  const data = [
    { id: 1, title: 'CSR render', body: 'Rendered on the client after fetch. Modified for Demo' },
    { id: 2, title: 'SSR render', body: 'Rendered on the server before send.' },
    { id: 3, title: 'SSG render', body: 'Rendered at build time; cached on CDN.' }
  ];
  postsList.innerHTML = data.map(p => `<li><strong>${p.title}:</strong> ${p.body}</li>`).join('');
  postsBtn.textContent = 'Reload';
  postsBtn.disabled = false;
});

// ----- Cross-browser feature detection + polyfill pattern -----
document.getElementById('polyfill-test')?.addEventListener('click', async () => {
  const out = document.getElementById('polyfill-output');
  const featureOK = ('includes' in Array.prototype);
  if (!featureOK) {
    // Load a targeted polyfill only when needed (teachable moment)
    // In production, prefer bundler targets or polyfill.io
    await import('./polyfills/array-includes.js').catch(() => {});
  }
  const result = ['a','b','c'].includes('b');
  out.textContent = `Array.prototype.includes supported? ${featureOK}. Test result: ${result}`;
});

// ----- User-Perceived Performance demo -----
const log = (msg) => {
  const el = document.getElementById('perf-log');
  if (el) el.innerHTML = el.innerHTML + `<div>• ${new Date().toLocaleTimeString()} — ${msg}</div>`;
};

// LCP: observe when the largest contentful element paints (if supported)
try {
  if ('PerformanceObserver' in window) {
    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          log(`LCP at ${Math.round(entry.startTime)} ms (element: ${entry.element?.tagName || 'n/a'})`);
        }
      }
    });
    po.observe({ type: 'largest-contentful-paint', buffered: true });
  }
} catch { /* older browsers gracefully ignore */ }

// INP: very rough feel—log input response delay by measuring a heavy task
document.getElementById('simulate-work')?.addEventListener('click', () => {
  const start = performance.now();
  // block main thread intentionally (bad!) to simulate poor INP
  const endTime = start + 400; while (performance.now() < endTime) {}
  const delay = Math.round(performance.now() - start);
  log(`Simulated blocking work: ${delay} ms (worse interactivity)`);
});

// CLS: demo by adding content w/o reserved space (DON’T do this in prod)
setTimeout(() => {
  const fig = document.querySelector('.hero img');
  if (fig) {
    const bump = document.createElement('div');
    bump.style.height = '40px';
    // Toggle this line to illustrate layout shift:
    // document.querySelector('main').prepend(bump);
  }
}, 2000);
