import { h, clear, section, intro, note, btn, field, input, textarea, renderItems, saveBar, photoCapture, toast } from '../core/ui.js';
import * as store from '../core/store.js';
import { SHAPES, OBSERVATION, DREAM } from '../data/symbols.js';
import { uid } from '../core/store.js';

// Shared observation reading: photo + guidance + pick the shapes you see.
function observation(root, ctx) {
  const o = OBSERVATION[ctx.arg];
  const id = 'obs-' + uid();
  const chosen = new Map();
  const zones = o.zones;
  const zoneOf = new Map();
  const listEl = h('div', { class: 'opts' });
  const filter = input({ type: 'search', placeholder: 'Filter shapes' });
  const picked = h('div');
  const notes = textarea({ placeholder: 'Anything else you notice: colors, feelings, words', rows: 3 });
  const out = h('div');
  const renderList = () => {
    clear(listEl);
    const f = filter.value.trim().toLowerCase();
    SHAPES.filter(([n]) => !f || n.toLowerCase().includes(f)).forEach(([n, m]) => listEl.append(h('button', {
      type: 'button', class: chosen.has(n) ? 'on' : '', onclick: () => { chosen.has(n) ? chosen.delete(n) : chosen.set(n, m); renderList(); renderPicked(); },
    }, n)));
  };
  const renderPicked = () => {
    clear(picked);
    for (const [n] of chosen) {
      const sel = h('select', { class: 'inp', style: { marginTop: '6px' }, onchange: (e) => zoneOf.set(n, e.target.value) }, h('option', { value: '' }, 'Where is it? (optional)'), zones.map((z) => h('option', { value: z, selected: zoneOf.get(n) === z }, z.split(':')[0])));
      picked.append(h('div', { class: 'item' }, h('h3', null, n), h('p', null, chosen.get(n)), ctx.arg === 'tea' || ctx.arg === 'coffee' || ctx.arg === 'wax' ? sel : null));
    }
  };
  filter.addEventListener('input', renderList);
  root.append(h('p', { class: 'label' }, o.subtitle), intro(o.intro),
    section('Where to look', h('ul', { class: 'muted', style: { paddingLeft: '18px', fontSize: '14px' } }, zones.map((z) => h('li', null, z)))),
    section('Photograph it', photoCapture({ id, prompt: 'Optional: capture what you see' }), note('Photos stay on this device. Automatic shape recognition could be added later with an AI service.')),
    section('Shapes you see', filter, h('div', { style: { margin: '10px 0' } }, listEl), picked, field('Notes', notes)),
    h('div', { class: 'actions' }, btn('Interpret', interpret, 'primary')), out);
  renderList();
  function interpret() {
    if (!chosen.size && !notes.value.trim()) { toast('Pick at least one shape, or add a note'); return; }
    const items = [...chosen].map(([n, m]) => ({ h: n, sub: zoneOf.get(n) ? zoneOf.get(n).split(':')[0] : '', text: m + (zoneOf.get(n) ? ' ' + zoneOf.get(n).split(':')[1].trim() + '.' : '') }));
    if (notes.value.trim()) items.push({ h: 'Your notes', text: notes.value.trim() });
    clear(out);
    out.append(renderItems(items), saveBar(() => ({ tool: ctx.tool.id, title: o.name, items, meta: { photo: id } })));
  }
}
export const obs_tea = (r, c) => observation(r, c);
export const obs_coffee = (r, c) => observation(r, c);
export const obs_wax = (r, c) => observation(r, c);
export const obs_fire = (r, c) => observation(r, c);
export const obs_water = (r, c) => observation(r, c);
export const obs_clouds = (r, c) => observation(r, c);
export const obs_mirror = (r, c) => observation(r, c);

// Cledonism: chance words heard after asking a question.
export function cledon(root) {
  const q = textarea({ placeholder: 'The question you were holding', rows: 2 });
  const words = textarea({ placeholder: 'The words you overheard, saw on a sign, or heard in a song', rows: 3 });
  const out = h('div');
  root.append(intro('Cledonism (kledon) reads the first chance words you hear after asking a question: a stranger\'s remark, a song lyric, a sign. Ask, go about your day, and write down what you catch.'),
    field('Question', q), field('What you heard', words), h('div', { class: 'actions' }, btn('Reflect', go, 'primary')), out);
  function go() {
    const t = words.value.trim();
    if (!t) { toast('Write the words you heard'); return; }
    const lower = t.toLowerCase();
    const hits = DREAM.filter(([s, alias]) => [s, ...alias.split(' ')].filter(Boolean).some((w) => new RegExp(`\\b${w.toLowerCase()}\\b`).test(lower)));
    const items = [{ h: `"${t}"`, text: 'Read it first as a literal answer, then as a metaphor. What is the first feeling it gives you?' }];
    hits.forEach(([s, , trad, psy]) => items.push({ h: s, text: `${trad} ${psy}` }));
    if (!hits.length) items.push({ h: 'Reflection', text: 'No common symbols detected. Underline the single word that stands out and ask what it means to you.' });
    clear(out);
    out.append(renderItems(items), saveBar(() => ({ tool: 'cledon', title: 'Overheard words', question: q.value.trim(), items })));
  }
}
