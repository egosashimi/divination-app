import { h, clear, seg, btn, fmtDate, fmtDateTime, input, toast } from '../core/ui.js';
import * as store from '../core/store.js';
import { dreamEntry } from '../tools/inner.js';

export function render(root, ctx, tab = 'readings') {
  const body = h('div');
  const q = input({ type: 'search', placeholder: 'Search the journal' });
  root.append(seg([['readings', 'Readings'], ['dreams', 'Dreams'], ['notes', 'Reflections'], ['sync', 'Synchronicities']], tab, (v) => { tab = v; history.replaceState(null, '', `#/journal/${v}`); draw(); }), q, body);
  q.addEventListener('input', draw);
  function draw() {
    clear(body);
    const s = q.value.trim().toLowerCase();
    const match = (x) => !s || JSON.stringify(x).toLowerCase().includes(s);
    if (tab === 'readings') {
      const rs = store.list('readings').filter(match);
      if (!rs.length) return body.append(empty('Readings you save appear here.', '#/explore', 'Explore readings'));
      rs.forEach((r) => body.append(h('details', { class: 'entry' },
        h('summary', null, h('h3', null, r.title), h('div', { class: 'meta' }, fmtDateTime(r.at) + (r.question ? ` - ${r.question}` : ''))),
        h('pre', null, r.text),
        h('div', { class: 'actions' }, btn('Delete', () => { if (confirm('Delete this reading?')) { store.remove('readings', r.id); draw(); } }, 'ghost small')))));
    } else if (tab === 'dreams') {
      const ds = store.list('dreams').filter(match);
      body.append(h('div', { class: 'actions' }, h('a', { class: 'btn primary small', href: '#/t/dreams' }, 'New dream')));
      if (!ds.length) return body.append(empty('No dreams recorded yet.'));
      ds.forEach((d) => body.append(dreamEntry(d, false, draw)));
    } else if (tab === 'notes') {
      const ns = store.list('notes').filter(match);
      if (!ns.length) return body.append(empty('Shadow work, inner child and other reflections appear here.', '#/t/shadow', 'Start shadow work'));
      ns.forEach((n) => body.append(h('details', { class: 'entry' }, h('summary', null, h('h3', null, n.prompt), h('div', { class: 'meta' }, `${fmtDate(n.at)} - ${n.kind}`)), h('pre', null, n.text),
        h('div', { class: 'actions' }, btn('Delete', () => { if (confirm('Delete this entry?')) { store.remove('notes', n.id); draw(); } }, 'ghost small')))));
    } else {
      const ss = store.list('sync').filter(match);
      body.append(h('div', { class: 'actions' }, h('a', { class: 'btn primary small', href: '#/t/sync' }, 'Log a synchronicity')));
      if (!ss.length) return body.append(empty('No synchronicities logged yet.'));
      ss.forEach((x) => body.append(h('div', { class: 'entry' }, h('div', { class: 'meta' }, `${fmtDate(x.at)} - ${x.moon || ''}`), h('p', null, x.text), (x.tags || []).map((t) => h('span', { class: 'chip' }, t)),
        h('div', { class: 'actions' }, btn('Delete', () => { store.remove('sync', x.id); draw(); }, 'ghost small')))));
    }
  }
  draw();
}
const empty = (t, href, label) => h('div', { class: 'empty-state' }, h('p', null, t), href ? h('a', { class: 'btn', href }, label) : null);
