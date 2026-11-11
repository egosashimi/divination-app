import { h, clear, section, intro, note, btn, seg, field, input, textarea, renderItems, saveBar, toast, fmtDate, kv } from '../core/ui.js';
import * as store from '../core/store.js';
import { DREAM, SHAPES } from '../data/symbols.js';
import { PROMPTS } from '../data/quizzes.js';
import { pick, daily } from '../core/rng.js';
import { THEMES } from '../data/lexicon.js';
import * as A from '../core/astro.js';

export function detectSymbols(text) {
  const t = ' ' + text.toLowerCase().replace(/[^a-z\s'-]/g, ' ') + ' ';
  return DREAM.filter(([s, alias]) => [s, ...alias.split(' ')].filter(Boolean).some((w) => t.includes(' ' + w.toLowerCase() + ' ') || t.includes(' ' + w.toLowerCase() + 's ')));
}
export function recurringSymbols() {
  const counts = {};
  for (const d of store.list('dreams')) for (const s of d.symbols || []) counts[s] = (counts[s] || 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

export function dreams(root, ctx) {
  const title = input({ placeholder: 'Title' });
  const text = textarea({ placeholder: 'Describe the dream in the present tense, as much as you remember', rows: 7 });
  const date = input({ type: 'date', value: new Date().toISOString().slice(0, 10) });
  const flags = { lucid: false, recurring: false, nightmare: false };
  let mood = 'neutral';
  const detected = h('div');
  const list = h('div');
  text.addEventListener('input', () => {
    clear(detected);
    const hits = detectSymbols(text.value);
    if (hits.length) detected.append(h('div', { class: 'label', style: { marginTop: '8px' } }, 'Symbols detected'), h('div', null, hits.map(([s]) => h('span', { class: 'chip' }, s))));
  });
  const flagBtns = h('div', { class: 'opts' }, Object.keys(flags).map((k) => h('button', { type: 'button', onclick: (e) => { flags[k] = !flags[k]; e.currentTarget.classList.toggle('on', flags[k]); } }, k)));
  root.append(intro('Write dreams down as soon as you wake; details fade within minutes. Symbols are detected from the dictionary and tracked across entries, so recurring themes become visible.'),
    field('Date', date), title, h('div', { style: { height: '8px' } }), text, detected,
    field('Feeling on waking', seg(['joyful', 'peaceful', 'neutral', 'confused', 'anxious', 'sad'], mood, (v) => (mood = v))),
    flagBtns, h('div', { class: 'actions' }, btn('Save dream', save, 'primary')),
    section('Recurring symbols', h('div', { id: 'rec' })), section('Your dreams', list));
  function save() {
    if (!text.value.trim()) { toast('Write the dream first'); return; }
    const syms = detectSymbols(text.value).map(([s]) => s);
    const rec = store.add('dreams', { date: date.value, title: title.value.trim() || 'Untitled dream', text: text.value.trim(), mood, ...flags, symbols: syms });
    title.value = ''; text.value = ''; clear(detected);
    toast('Dream saved');
    renderList(rec.id);
  }
  function renderList(openId) {
    const rec = root.querySelector('#rec');
    clear(rec);
    const r = recurringSymbols().filter(([, c]) => c > 1).slice(0, 12);
    rec.append(r.length ? h('div', null, r.map(([s, c]) => h('span', { class: 'chip' }, `${s} x${c}`))) : h('p', { class: 'muted' }, 'Symbols that appear in more than one dream will show here.'));
    clear(list);
    const ds = store.list('dreams');
    if (!ds.length) { list.append(h('p', { class: 'muted' }, 'No dreams yet.')); return; }
    ds.forEach((d) => list.append(dreamEntry(d, d.id === openId, () => renderList())));
  }
  renderList();
}
export function dreamEntry(d, open, onChange) {
  const sy = DREAM.filter(([s]) => (d.symbols || []).includes(s));
  const tags = ['lucid', 'recurring', 'nightmare'].filter((k) => d[k]);
  return h('details', { class: 'entry', open: open || null },
    h('summary', null, h('h3', null, d.title), h('div', { class: 'meta' }, `${fmtDate(d.date)} - ${d.mood}${tags.length ? ' - ' + tags.join(', ') : ''}`)),
    h('pre', null, d.text),
    sy.length ? renderItems(sy.map(([s, , trad, psy]) => ({ h: s, text: `Traditional: ${trad} Psychological: ${psy}` }))) : null,
    h('div', { class: 'actions' }, btn('Delete', () => { if (confirm('Delete this dream?')) { store.remove('dreams', d.id); onChange && onChange(); } }, 'ghost small')));
}

export function dictionary(root) {
  const q = input({ type: 'search', placeholder: 'Search symbols' });
  let src = 'dream';
  const out = h('div');
  const draw = () => {
    clear(out);
    const s = q.value.trim().toLowerCase();
    if (src === 'dream') out.append(renderItems(DREAM.filter(([n, a]) => !s || (n + ' ' + a).toLowerCase().includes(s)).map(([n, , t, p]) => ({ h: n, text: `Traditional: ${t} Psychological: ${p}` }))));
    else out.append(renderItems(SHAPES.filter(([n]) => !s || n.toLowerCase().includes(s)).map(([n, m]) => ({ h: n, text: m }))));
  };
  q.addEventListener('input', draw);
  root.append(intro('Traditional dream books read symbols as omens; Jungian psychology reads them as messages from the unconscious, personal to the dreamer. Your own associations matter most.'),
    seg([['dream', 'Dream symbols'], ['shape', 'Tea leaf and shape symbols']], src, (v) => { src = v; draw(); }), q, out);
  draw();
}

function promptTool(root, key, introText, title) {
  const prompts = PROMPTS[key];
  let cur = pick(prompts, daily(key));
  const pEl = h('blockquote', { style: { fontFamily: 'var(--serif)', fontSize: '22px', lineHeight: 1.35, margin: '20px 0' } }, cur);
  const ans = textarea({ placeholder: 'Write freely. No one else will read this.', rows: 6 });
  const list = h('div');
  const renderList = () => {
    clear(list);
    store.list('notes').filter((n) => n.kind === key).forEach((n) => list.append(h('details', { class: 'entry' }, h('summary', null, h('h3', null, n.prompt), h('div', { class: 'meta' }, fmtDate(n.at))), h('pre', null, n.text),
      h('div', { class: 'actions' }, btn('Delete', () => { store.remove('notes', n.id); renderList(); }, 'ghost small')))));
  };
  root.append(intro(introText), pEl, h('div', { class: 'actions' }, btn('Another prompt', () => { cur = pick(prompts.filter((x) => x !== cur)); pEl.textContent = cur; }, 'ghost')), ans,
    h('div', { class: 'actions' }, btn('Save entry', () => { if (!ans.value.trim()) return; store.add('notes', { kind: key, prompt: cur, text: ans.value.trim() }); ans.value = ''; toast('Saved'); renderList(); }, 'primary')),
    section(`Past ${title} entries`, list));
  renderList();
}
export const shadow = (root) => promptTool(root, 'shadow', 'Shadow work, after Carl Jung, means meeting the parts of yourself you have disowned. What we reject in ourselves often carries energy we need. Go gently; if it brings up distress, pause or seek support.', 'shadow work');
export const innerchild = (root) => promptTool(root, 'innerchild', 'Inner child work reconnects you with the needs, joys and wounds of your younger self, so the adult you can offer what was missing.', 'inner child');

export function imagination(root) {
  const steps = [
    ['Settle', 'Sit comfortably. Breathe slowly for a minute. Let the day fall away.'],
    ['Invite an image', 'Recall an image from a dream, a strong feeling, or simply wait for one to appear. Do not choose it; let it come.'],
    ['Let it move', 'Watch the image as if it were alive. What does it do? Let it change on its own.'],
    ['Engage', 'Enter the scene. Speak to a figure. Ask: who are you? What do you want? What do you need from me?'],
    ['Listen and respond', 'Take its answer seriously, even if surprising. Respond honestly, as yourself.'],
    ['Record', 'Write down the dialogue. Jung considered recording essential.'],
    ['Integrate', 'Ask what you will do differently. Choose one small action that honors what you learned.'],
  ];
  const notes = textarea({ rows: 6, placeholder: 'Record the dialogue' });
  root.append(intro('Active imagination is Jung\'s method of dialoguing with figures from the unconscious while awake. It is a conversation, not a fantasy you steer.'),
    renderItems(steps.map(([t, x], i) => ({ pos: `Step ${i + 1}`, h: t, text: x }))), field('Your record', notes),
    h('div', { class: 'actions' }, btn('Save', () => { if (!notes.value.trim()) return; store.add('notes', { kind: 'imagination', prompt: 'Active imagination', text: notes.value.trim() }); notes.value = ''; toast('Saved to journal'); }, 'primary')));
}

export function sync(root) {
  const what = textarea({ placeholder: 'What happened?', rows: 3 });
  const tags = input({ placeholder: 'Numbers, words or symbols involved, separated by commas' });
  const feel = input({ placeholder: 'What were you thinking about at the time?' });
  const list = h('div'), stats = h('div');
  root.append(intro('Synchronicity, Jung\'s term for meaningful coincidence, is easier to see over time. Log each one, and patterns will emerge.'),
    h('p', { class: 'muted' }, pick(PROMPTS.sync, daily('sync'))),
    field('Event', what), field('Elements', tags), field('Context', feel),
    h('div', { class: 'actions' }, btn('Log it', () => {
      if (!what.value.trim()) return;
      store.add('sync', { text: what.value.trim(), tags: tags.value.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean), context: feel.value.trim(), moon: A.moonPhase(A.jd(new Date())).name });
      what.value = tags.value = feel.value = ''; toast('Logged'); draw();
    }, 'primary')),
    section('Patterns', stats), section('Log', list));
  function draw() {
    const items = store.list('sync');
    const counts = {}; items.forEach((i) => (i.tags || []).forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
    const moons = {}; items.forEach((i) => i.moon && (moons[i.moon] = (moons[i.moon] || 0) + 1));
    clear(stats);
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    stats.append(items.length ? kv([['Entries', String(items.length)], ['Repeated elements', top.filter(([, c]) => c > 1).map(([t, c]) => `${t} x${c}`).join(', ') || 'none yet'], ['Most common moon phase', Object.entries(moons).sort((a, b) => b[1] - a[1])[0]?.[0] || '-']]) : h('p', { class: 'muted' }, 'Nothing logged yet.'));
    clear(list);
    items.forEach((i) => list.append(h('div', { class: 'entry' }, h('div', { class: 'meta' }, `${fmtDate(i.at)} - ${i.moon || ''}`), h('p', null, i.text), i.tags?.length ? h('div', null, i.tags.map((t) => h('span', { class: 'chip' }, t))) : null, i.context ? h('p', { class: 'muted' }, i.context) : null)));
  }
  draw();
}

export function lucid(root) {
  const k = 'lucidChecks';
  const counter = h('div', { class: 'big', style: { textAlign: 'center' } }, String(store.get(k, 0)));
  root.append(intro('A lucid dream is one in which you know you are dreaming. These techniques, studied in sleep research, raise the odds.'),
    renderItems([
      { h: 'Reality checks', text: 'Several times a day, genuinely ask "am I dreaming?" Look at text twice (it changes in dreams), try to push a finger through your palm, check a clock. The habit carries into dreams.' },
      { h: 'Dream journal', text: 'Recalling dreams every morning is the foundation. Use the dream journal here.' },
      { h: 'MILD (mnemonic induction)', text: 'As you fall asleep, repeat "next time I dream, I will know I am dreaming" while picturing yourself becoming lucid in a recent dream.' },
      { h: 'Wake back to bed', text: 'Wake after about five hours of sleep, stay up 20 to 30 minutes thinking about lucid dreaming, then return to sleep with MILD.' },
      { h: 'Stabilizing', text: 'When lucid, stay calm: rub your hands together, touch surfaces, or spin to keep the dream from fading.' },
    ]),
    section('Reality checks today', counter, h('div', { class: 'actions', style: { justifyContent: 'center' } }, btn('I did a reality check', () => { const v = store.get(k, 0) + 1; store.set(k, v); counter.textContent = String(v); }, 'primary'), btn('Reset', () => { store.set(k, 0); counter.textContent = '0'; }, 'ghost'))));
}
