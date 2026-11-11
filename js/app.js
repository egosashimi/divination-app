import { h, clear } from './core/ui.js';
import * as store from './core/store.js';
import { GROUPS, TOOLS, toolById } from './registry.js';

const view = document.getElementById('view');
const titleEl = document.getElementById('title');
const backEl = document.getElementById('back');

function applyTheme() {
  const t = store.settings().theme;
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
}
applyTheme();
window.addEventListener('sc-settings', applyTheme);

function setTitle(t) { titleEl.textContent = t; document.title = t === 'Soul Compass' ? t : `${t} - Soul Compass`; }

function tabs(active) {
  document.querySelectorAll('nav.tabs a').forEach((a) => a.classList.toggle('on', a.dataset.tab === active));
}

async function route() {
  const hash = location.hash.slice(1) || '/today';
  const parts = hash.split('/').filter(Boolean);
  const root = clear(view);
  window.scrollTo(0, 0);
  backEl.hidden = true;
  const ctx = { profile: store.profile(), settings: store.settings(), setTitle };
  try {
    if (parts[0] === 'today') { tabs('today'); setTitle('Today'); (await import('./views/today.js')).render(root, ctx); }
    else if (parts[0] === 'explore' && parts[1]) { tabs('explore'); backEl.hidden = false; backEl.href = '#/explore'; renderGroup(root, parts[1]); }
    else if (parts[0] === 'explore') { tabs('explore'); setTitle('Explore'); renderExplore(root); }
    else if (parts[0] === 't') {
      const tool = toolById(parts[1]);
      if (!tool) throw new Error('Unknown reading');
      tabs('explore'); backEl.hidden = false; backEl.href = `#/explore/${tool.group}`;
      setTitle(tool.title);
      const mod = await import(`./tools/${tool.mod}.js`);
      const fn = mod[tool.fn || tool.id.replace(/-/g, '_')] || mod[tool.fn || tool.id];
      if (!fn) throw new Error('This reading is not available yet');
      const wrap = h('div', { class: 'tool' });
      root.append(wrap);
      await fn(wrap, { ...ctx, tool, arg: tool.arg, params: parts.slice(2) });
      store.set('lastTool', tool.id);
    }
    else if (parts[0] === 'compass') { tabs('compass'); setTitle('Compass'); (await import('./views/compass.js')).render(root, ctx); }
    else if (parts[0] === 'journal') { tabs('journal'); setTitle('Journal'); (await import('./views/journal.js')).render(root, ctx, parts[1]); }
    else if (parts[0] === 'profile') { tabs('profile'); setTitle('Profile'); (await import('./views/profile.js')).render(root, ctx); }
    else { location.hash = '#/today'; }
  } catch (err) {
    console.error(err);
    root.append(h('div', { class: 'empty-state' }, h('p', null, 'Something went wrong.'), h('p', { class: 'muted' }, String(err.message || err))));
  }
}

function renderExplore(root) {
  const q = h('input', { class: 'inp', type: 'search', placeholder: 'Search all readings', 'aria-label': 'Search' });
  const results = h('div');
  const list = h('div', { class: 'groups' });
  const dims = {};
  for (const g of GROUPS) (dims[g.dim] ||= []).push(g);
  for (const [dim, groups] of Object.entries(dims)) {
    list.append(h('div', { class: 'label dim' }, dim));
    for (const g of groups) {
      const count = TOOLS.filter((t) => t.group === g.id).length;
      list.append(h('a', { class: 'tile', href: `#/explore/${g.id}` }, h('div', null, h('h3', null, g.title), h('p', null, g.blurb)), h('span', { class: 'count' }, String(count))));
    }
  }
  q.addEventListener('input', () => {
    const s = q.value.trim().toLowerCase();
    clear(results);
    list.hidden = !!s;
    if (!s) return;
    const hits = TOOLS.filter((t) => (t.title + ' ' + t.blurb).toLowerCase().includes(s));
    results.append(h('div', { class: 'list' }, hits.length ? hits.map(toolLink) : h('p', { class: 'muted' }, 'No matches.')));
  });
  root.append(h('div', { class: 'search' }, q), results, list);
}
const toolLink = (t) => h('a', { class: 'li', href: `#/t/${t.id}` }, h('span', { class: 'li-t' }, t.title), h('span', { class: 'li-s' }, t.blurb));

function renderGroup(root, id) {
  const g = GROUPS.find((x) => x.id === id);
  if (!g) { location.hash = '#/explore'; return; }
  setTitle(g.title);
  root.append(h('p', { class: 'intro' }, g.blurb + '.'));
  root.append(h('div', { class: 'list' }, TOOLS.filter((t) => t.group === id).map(toolLink)));
}

window.addEventListener('hashchange', route);
route();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
