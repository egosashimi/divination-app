import { h, clear, section, intro, note, btn, field, textarea, renderItems, saveBar, likert, bars, toast } from '../core/ui.js';
import * as store from '../core/store.js';
import { ENNEAGRAM, TEMPERAMENTS, ARCHETYPES12, BIGFIVE, JUNGIAN, DISC, VALUES, PROMPTS } from '../data/quizzes.js';
import * as C from '../core/chart.js';
import * as A from '../core/astro.js';
import { KARMIC, lifePath, reduceTrace } from '../core/numerology.js';
import { SIGN_TEXT } from '../data/astro-text.js';

const AGREE = ['Disagree strongly', 'Disagree', 'Neutral', 'Agree', 'Agree strongly'];
const prevNote = (key) => { const r = store.results()[key]; return r ? note(`Last result: ${r.label} (${new Date(r.at).toLocaleDateString()}).`) : null; };

function quizTool(root, { key, introText, qs, info, scale = AGREE, interpret }) {
  const out = h('div');
  root.append(intro(introText), prevNote(key), likert(qs, (sc) => {
    const r = interpret(sc);
    clear(out);
    out.append(bars(sc, Object.fromEntries(Object.keys(info).map((k) => [k, info[k][0]]))), renderItems(r.items), saveBar(() => ({ tool: key, title: r.title, items: r.items })));
    store.saveResult(key, { label: r.label, scores: sc, themes: r.themes || [] });
    out.scrollIntoView({ behavior: 'smooth' });
  }, { scale }), out);
}

export function enneagram(root) {
  const info = Object.fromEntries(Object.entries(ENNEAGRAM.types).map(([k, v]) => [k, [`${k} ${v[0]}`]]));
  quizTool(root, {
    key: 'enneagram', qs: ENNEAGRAM.q, info, introText: 'The Enneagram describes nine personality types, each organized around a core motivation and fear. This short version suggests your likely type and wing; reading the descriptions is the real test.',
    interpret: (sc) => {
      const top = Object.entries(sc).sort((a, b) => b[1] - a[1]);
      const t = +top[0][0];
      const wings = [t === 1 ? 9 : t - 1, t === 9 ? 1 : t + 1];
      const w = sc[wings[0]] >= sc[wings[1]] ? wings[0] : wings[1];
      const T = ENNEAGRAM.types[t];
      const TH = { 1: ['structure'], 2: ['harmony'], 3: ['power'], 4: ['expression'], 5: ['introspection'], 6: ['partnership'], 7: ['change'], 8: ['power'], 9: ['harmony'] };
      return {
        title: `Enneagram ${t}w${w}`, label: `${t}w${w} ${T[0]}`, themes: TH[t],
        items: [{ h: `Type ${t}: ${T[0]}`, sub: `wing ${w}`, text: `${T[1]} Core fear: ${T[2]}` }, { h: `Wing ${w}: ${ENNEAGRAM.types[w][0]}`, text: ENNEAGRAM.types[w][1] },
          { h: 'Next closest', text: top.slice(1, 3).map(([k]) => `${k} ${ENNEAGRAM.types[k][0]}`).join(', ') + '. If one of these fits better, trust that.' }],
      };
    },
  });
}
export function temperaments(root) {
  quizTool(root, {
    key: 'temperaments', qs: TEMPERAMENTS.q, info: TEMPERAMENTS.info, introText: 'The four temperaments come from Hippocrates and Galen, who linked personality with the four humors and elements.',
    interpret: (sc) => { const top = Object.entries(sc).sort((a, b) => b[1] - a[1]); const [a, b] = [TEMPERAMENTS.info[top[0][0]], TEMPERAMENTS.info[top[1][0]]]; return { title: `Temperament: ${a[0]}-${b[0]}`, label: `${a[0]}-${b[0]}`, items: [{ h: a[0], sub: a[1], text: a[2] }, { h: `Secondary: ${b[0]}`, sub: b[1], text: b[2] }] }; },
  });
}
export function archetypes(root) {
  quizTool(root, {
    key: 'archetypes', qs: ARCHETYPES12.q, info: ARCHETYPES12.info, introText: 'The twelve archetypes, popularized by Carol Pearson, build on Jung\'s idea of universal patterns in the psyche.',
    interpret: (sc) => { const top = Object.entries(sc).sort((a, b) => b[1] - a[1]).slice(0, 3); return { title: `Archetypes: ${top.map(([k]) => ARCHETYPES12.info[k][0]).join(', ')}`, label: ARCHETYPES12.info[top[0][0]][0], items: top.map(([k], i) => ({ pos: ['Leading', 'Supporting', 'Third'][i], h: ARCHETYPES12.info[k][0], text: ARCHETYPES12.info[k][1] })) }; },
  });
}
export function bigfive(root) {
  quizTool(root, {
    key: 'bigfive', qs: BIGFIVE.q, info: BIGFIVE.info, scale: ['Very inaccurate', 'Inaccurate', 'Neither', 'Accurate', 'Very accurate'],
    introText: 'The Big Five is the most widely researched model of personality. This is the 20-item Mini-IPIP (public domain). Describe yourself as you generally are now.',
    interpret: (sc) => ({
      title: 'Big Five', label: Object.entries(sc).map(([k, v]) => `${k}${Math.round(v / 16 * 100)}`).join(' '),
      items: Object.entries(BIGFIVE.info).map(([k, [n, d]]) => { const pct = Math.round(sc[k] / 16 * 100); return { h: `${n}: ${pct}%`, text: `${d} ${pct >= 65 ? 'You score high.' : pct <= 35 ? 'You score low.' : 'You score in the middle range.'}` }; }),
    }),
  });
}
export function jungian(root) {
  const info = { E: ['Extraversion'], S: ['Sensing'], T: ['Thinking'], J: ['Judging'] };
  quizTool(root, {
    key: 'jungian', qs: JUNGIAN.q, info, introText: 'Jung\'s psychological types describe preferences: where you get energy, how you take in information, how you decide and how you organize your life. This is an informal reflection, not an official assessment.',
    interpret: (sc) => {
      const L = [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']].map(([a, b]) => (sc[a] >= 8 ? a : b));
      const D = { E: 'energized by people and action', I: 'energized by reflection and solitude', S: 'focused on facts and the present', N: 'focused on patterns and possibilities', T: 'deciding with logic', F: 'deciding with values', J: 'preferring structure and closure', P: 'preferring flexibility and openness' };
      return { title: `Jungian type ${L.join('')}`, label: L.join(''), items: [{ h: L.join(''), text: L.map((x) => D[x]).join('; ') + '.' }, ...[['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']].map(([a, b]) => ({ h: `${a} or ${b}`, text: `${sc[a]} of 16: above 8 leans ${a}, below 8 leans ${b}. Scores near 8 mean you use both.` }))] };
    },
  });
}
export function disc(root) {
  quizTool(root, {
    key: 'disc', qs: DISC.q, info: DISC.info, introText: 'DISC, based on William Marston\'s 1928 model, describes behavioral style along four dimensions.',
    interpret: (sc) => { const top = Object.entries(sc).sort((a, b) => b[1] - a[1]).slice(0, 2); return { title: `DISC: ${top.map(([k]) => k).join('')}`, label: top.map(([k]) => k).join(''), items: top.map(([k], i) => ({ pos: i ? 'Secondary' : 'Primary', h: DISC.info[k][0], text: DISC.info[k][1] })) }; },
  });
}

export function values(root) {
  const picked = new Set(store.results().values?.list || []);
  const grid = h('div', { class: 'opts' });
  const out = h('div');
  const draw = () => { clear(grid); VALUES.forEach((v) => grid.append(h('button', { type: 'button', class: picked.has(v) ? 'on' : '', onclick: () => { picked.has(v) ? picked.delete(v) : picked.size < 5 ? picked.add(v) : toast('Choose up to five'); draw(); } }, v))); };
  root.append(intro('Values are a compass that does not change with the weather. Choose the five that matter most to you now.'), grid,
    h('div', { class: 'actions' }, btn('Save my values', () => {
      if (picked.size < 3) { toast('Choose at least three'); return; }
      const list = [...picked];
      store.saveResult('values', { label: list.join(', '), list });
      clear(out);
      out.append(renderItems(list.map((v, i) => ({ pos: `Value ${i + 1}`, h: v, text: `Where does ${v.toLowerCase()} show up in your week? Where is it missing?` }))), saveBar(() => ({ tool: 'values', title: 'Values compass', items: list.map((v) => ({ h: v })) })));
    }, 'primary')), out);
  draw();
}

export function purpose(root) {
  const saved = store.results().purpose || {};
  const fields = [['love', 'What do you love doing?'], ['good', 'What are you good at?'], ['need', 'What does the world need that you care about?'], ['paid', 'What could you be paid for?']];
  const ins = Object.fromEntries(fields.map(([k]) => [k, textarea({ rows: 3, value: saved[k] || '' })]));
  const out = h('div');
  root.append(intro('An ikigai-style map: purpose often lives where what you love, what you are good at, what the world needs and what sustains you overlap. List a few items in each.'),
    ...fields.map(([k, q]) => field(q, ins[k])),
    h('div', { class: 'actions' }, btn('Map it', () => {
      const v = Object.fromEntries(fields.map(([k]) => [k, ins[k].value.trim()]));
      store.saveResult('purpose', { label: 'Life purpose map', ...v });
      const words = (s) => new Set(s.toLowerCase().split(/[,;\n]+/).map((x) => x.trim()).filter(Boolean));
      const sets = fields.map(([k]) => words(v[k]));
      const all = [...new Set(sets.flatMap((s) => [...s]))];
      const overlap = all.filter((w) => sets.filter((s) => s.has(w)).length >= 2);
      const items = [
        { h: 'Passion', sub: 'love + good at', text: 'What energizes you and what you do well.' },
        { h: 'Mission', sub: 'love + world needs', text: 'What you care about giving.' },
        { h: 'Vocation', sub: 'world needs + paid', text: 'What the world will support.' },
        { h: 'Profession', sub: 'good at + paid', text: 'What you can offer reliably.' },
        { h: 'Overlaps you wrote', text: overlap.length ? overlap.join(', ') : 'No exact repeats. Look for items that echo each other in meaning, then try one small experiment this month that touches all four circles.' },
      ];
      clear(out);
      out.append(renderItems(items), saveBar(() => ({ tool: 'purpose', title: 'Life purpose map', items: [...fields.map(([k, q]) => ({ h: q, text: v[k] })), ...items] })));
    }, 'primary')), out);
}

export function soul(root, ctx) {
  const p = ctx.profile;
  const items = [];
  if (p.date) {
    const ch = C.computeChart(p, {});
    const sn = ch.bodies.SouthNode, nn = ch.bodies.Node;
    items.push({ h: `South Node in ${A.SIGNS[sn.sign]}`, sub: 'the past, the familiar', text: `In karmic astrology, the South Node describes gifts and habits carried in: ${SIGN_TEXT[sn.sign].kw}. Overused, they become ${SIGN_TEXT[sn.sign].shadow}.` });
    items.push({ h: `North Node in ${A.SIGNS[nn.sign]}`, sub: 'the direction of growth', text: `This life asks you to develop qualities that are ${SIGN_TEXT[nn.sign].kw}.` });
    items.push({ h: `Saturn in ${A.SIGNS[ch.bodies.Saturn.sign]}`, sub: 'the teacher', text: `Saturn shows lessons that mature with time, approached ${SIGN_TEXT[ch.bodies.Saturn.sign].style}.` });
    const lp = lifePath(p.date);
    const kd = [...new Set(lp.karmic)];
    if (kd.length) kd.forEach((k) => items.push({ h: `Karmic debt ${k}`, text: KARMIC[k] }));
  }
  const prompt = h('blockquote', { style: { fontFamily: 'var(--serif)', fontSize: '21px', lineHeight: 1.35, margin: '18px 0' } }, PROMPTS.soul[Math.floor(Math.random() * PROMPTS.soul.length)]);
  const ans = textarea({ rows: 5, placeholder: 'Reflect here' });
  root.append(intro('Ideas of soul contracts, past lives and the Akashic records belong to spiritual belief systems rather than established fact. They can be useful as lenses for reflection.'),
    items.length ? section('Karmic indicators', renderItems(items)) : note('Add your birth date in Profile to see karmic indicators from astrology and numerology.'),
    section('Reflection', prompt, h('div', { class: 'actions' }, btn('Another question', () => (prompt.textContent = PROMPTS.soul[Math.floor(Math.random() * PROMPTS.soul.length)]), 'ghost')), ans,
      h('div', { class: 'actions' }, btn('Save', () => { if (!ans.value.trim()) return; store.add('notes', { kind: 'soul', prompt: prompt.textContent, text: ans.value.trim() }); ans.value = ''; toast('Saved to journal'); }, 'primary'))),
    items.length ? saveBar(() => ({ tool: 'soul', title: 'Soul themes', items })) : null);
}
