import * as store from './store.js';

// Optional children are written inline as `cond ? el : null`; make the native
// append/prepend skip null, undefined and false instead of printing "null".
for (const m of ['append', 'prepend']) {
  const orig = Element.prototype[m];
  Element.prototype[m] = function (...nodes) { return orig.apply(this, nodes.filter((n) => n != null && n !== false)); };
}

export function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  if (props) for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  append(el, kids);
  return el;
}
function append(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
}
export const clear = (el) => { el.replaceChildren(); return el; };
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function svg(tag, attrs = {}, ...kids) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
  for (const k of kids.flat()) if (k != null) el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  return el;
}

export const intro = (text) => h('p', { class: 'intro' }, text);
export const note = (text) => h('p', { class: 'note' }, text);
export const section = (title, ...kids) => h('section', { class: 'sec' }, title ? h('h2', null, title) : null, ...kids);
export const label = (text) => h('div', { class: 'label' }, text);
export const btn = (text, onclick, cls = '') => h('button', { class: 'btn ' + cls, type: 'button', onclick }, text);
export const row = (...kids) => h('div', { class: 'row' }, ...kids);
export const muted = (t) => h('span', { class: 'muted' }, t);

export function kv(pairs) {
  return h('dl', { class: 'kv' }, pairs.filter(Boolean).map(([k, v]) => [h('dt', null, k), h('dd', null, v)]));
}

export function field(lbl, input, hint) {
  return h('label', { class: 'field' }, h('span', { class: 'label' }, lbl), input, hint ? h('span', { class: 'hint' }, hint) : null);
}
export const input = (props = {}) => h('input', { class: 'inp', ...props });
export function select(options, value, props = {}) {
  return h('select', { class: 'inp', ...props }, options.map((o) => {
    const [v, t] = Array.isArray(o) ? o : [o, o];
    return h('option', { value: v, selected: String(v) === String(value) }, t);
  }));
}
export const textarea = (props = {}) => h('textarea', { class: 'inp', rows: 3, ...props });

// Segmented control
export function seg(options, value, onchange) {
  const wrap = h('div', { class: 'seg', role: 'tablist' });
  const render = (cur) => {
    clear(wrap);
    for (const o of options) {
      const [v, t] = Array.isArray(o) ? o : [o, o];
      wrap.append(h('button', { type: 'button', class: v === cur ? 'on' : '', onclick: () => { render(v); onchange(v); } }, t));
    }
  };
  render(value);
  return wrap;
}

export function questionBox(placeholder = 'Your question (optional)') {
  const t = textarea({ placeholder, rows: 2, class: 'inp q' });
  return { el: t, value: () => t.value.trim() };
}

let toastTimer;
export function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = h('div', { class: 'toast', role: 'status' }); document.body.append(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('Copied'); }
  catch {
    const ta = h('textarea', { style: { position: 'fixed', opacity: 0 } }, text);
    document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('Copied');
  }
}

// A structured reading: { tool, title, question, items:[{h, sub, text}] }
export function readingText(r) {
  const lines = [r.title + (r.question ? `\nQuestion: ${r.question}` : '')];
  for (const it of r.items || []) lines.push(`\n${it.h}${it.sub ? ' - ' + it.sub : ''}\n${it.text || ''}`.trimEnd());
  return lines.join('\n');
}
export function renderItems(items) {
  return h('div', { class: 'items' }, items.map((it) => h('div', { class: 'item' },
    it.pos ? h('div', { class: 'label' }, it.pos) : null,
    h('h3', null, it.h, it.sub ? h('span', { class: 'sub' }, ' ', it.sub) : null),
    it.text ? h('p', null, it.text) : null,
    it.extra || null)));
}
export function saveBar(getReading) {
  let saved = null;
  const b = btn('Save to journal', () => {
    const r = getReading();
    if (saved) { toast('Already saved'); return; }
    saved = store.add('readings', { tool: r.tool, title: r.title, question: r.question || '', text: readingText(r), meta: r.meta || null });
    if (r.onSave) r.onSave(saved);
    b.textContent = 'Saved'; b.disabled = true;
  });
  return h('div', { class: 'actions' }, b, btn('Copy', () => copyText(readingText(getReading())), 'ghost'));
}

// Generic Likert quiz. questions: [{q, k}] where k is a scoring key (or [key, weight]).
export function likert(questions, onDone, { scale = ['Not at all', 'Rarely', 'Sometimes', 'Often', 'Very much'], submit = 'See result' } = {}) {
  const answers = new Array(questions.length).fill(null);
  const form = h('div', { class: 'quiz' });
  questions.forEach((qq, i) => {
    const opts = h('div', { class: 'likert' });
    scale.forEach((s, v) => opts.append(h('button', {
      type: 'button', title: s, 'aria-label': s,
      onclick: (e) => { answers[i] = v; [...opts.children].forEach((c, ci) => c.classList.toggle('on', ci === v)); },
    }, String(v + 1))));
    form.append(h('div', { class: 'qrow' }, h('p', null, `${i + 1}. ${qq.q}`), opts));
  });
  form.append(h('p', { class: 'hint' }, `1 = ${scale[0]}, ${scale.length} = ${scale[scale.length - 1]}`));
  form.append(btn(submit, () => {
    const missing = answers.findIndex((a) => a == null);
    if (missing >= 0) { toast(`Question ${missing + 1} is unanswered`); form.querySelectorAll('.qrow')[missing].scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    const scores = {};
    questions.forEach((qq, i) => {
      const keys = Array.isArray(qq.k) ? qq.k : [qq.k];
      for (const k of keys) {
        const [key, w] = Array.isArray(k) ? k : [k, 1];
        const val = w < 0 ? (scale.length - 1 - answers[i]) : answers[i];
        scores[key] = (scores[key] || 0) + val * Math.abs(w);
      }
    });
    onDone(scores, answers);
  }, 'primary'));
  return form;
}

// Multiple-choice picker: one answer per question; each option carries tags.
export function choices(questions, onDone, submit = 'Interpret') {
  const answers = new Array(questions.length).fill(null);
  const form = h('div', { class: 'quiz' });
  questions.forEach((qq, i) => {
    const opts = h('div', { class: 'opts' });
    qq.o.forEach((o, oi) => opts.append(h('button', {
      type: 'button',
      onclick: () => { answers[i] = oi; [...opts.children].forEach((c, ci) => c.classList.toggle('on', ci === oi)); },
    }, o.t)));
    form.append(h('div', { class: 'qrow' }, h('p', null, qq.q), qq.hint ? h('p', { class: 'hint' }, qq.hint) : null, opts));
  });
  form.append(btn(submit, () => {
    const missing = answers.findIndex((a) => a == null);
    if (missing >= 0 && !questions[missing].optional) { toast('Please answer every question'); form.querySelectorAll('.qrow')[missing].scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    onDone(answers.map((a, i) => (a == null ? null : questions[i].o[a])));
  }, 'primary'));
  return form;
}

export function bars(scores, labels, max) {
  const m = max || Math.max(1, ...Object.values(scores));
  return h('div', { class: 'bars' }, Object.keys(labels).map((k) => h('div', { class: 'bar' },
    h('span', { class: 'bl' }, labels[k]),
    h('span', { class: 'bt' }, h('span', { class: 'bf', style: { width: `${Math.round(100 * (scores[k] || 0) / m)}%` } })),
    h('span', { class: 'bv' }, String(Math.round(scores[k] || 0))))));
}

// Camera / photo capture, stored locally in IndexedDB, downscaled.
export function photoCapture({ id, overlay, prompt = 'Take or choose a photo' } = {}) {
  const img = h('img', { alt: '', class: 'ph-img' });
  const frame = h('div', { class: 'ph-frame empty' }, img, overlay || null, h('div', { class: 'ph-empty' }, prompt));
  const file = h('input', { type: 'file', accept: 'image/*', capture: 'environment', class: 'hidden' });
  const show = (url) => { img.src = url; frame.classList.toggle('empty', !url); };
  if (id) store.getPhoto(id).then((u) => u && show(u)).catch(() => {});
  file.addEventListener('change', async () => {
    const f = file.files[0]; if (!f) return;
    const url = await downscale(f, 1200);
    show(url);
    if (id) { try { await store.putPhoto(id, url); toast('Photo saved on this device'); } catch { toast('Could not save photo'); } }
  });
  const wrap = h('div', { class: 'photo' }, frame,
    h('div', { class: 'actions' }, btn('Camera or library', () => file.click()),
      id ? btn('Remove', async () => { show(''); img.removeAttribute('src'); try { await store.delPhoto(id); } catch {} }, 'ghost') : null),
    file);
  return wrap;
}
function downscale(file, max) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      const s = Math.min(1, max / Math.max(im.width, im.height));
      const c = document.createElement('canvas');
      c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.82));
    };
    im.onerror = rej;
    im.src = url;
  });
}

export function needProfile(root, what = 'your birth date') {
  root.append(h('div', { class: 'empty-state' },
    h('p', null, `This reading uses ${what}.`),
    h('a', { class: 'btn primary', href: '#/profile' }, 'Add to profile')));
}

export const fmtDate = (d, opts = { year: 'numeric', month: 'short', day: 'numeric' }) => new Date(d).toLocaleDateString(undefined, opts);
export const fmtDateTime = (d) => new Date(d).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
export const roman = (n) => {
  if (n === 0) return '0';
  const m = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let s = '';
  for (const [v, r] of m) while (n >= v) { s += r; n -= v; }
  return s;
};
