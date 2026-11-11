import { h, svg, clear, section, intro, note, btn, seg, field, input, select, kv, renderItems, saveBar, needProfile, toast, choices, likert, bars, fmtDate } from '../core/ui.js';
import * as Z from '../core/chinese.js';
import * as A from '../core/astro.js';
import * as C from '../core/chart.js';
import * as store from '../core/store.js';
import { ELEMENTS_C } from '../data/lexicon.js';
import { DOSHA, DOSHA_QUIZ, FIVE_EL_QUIZ } from '../data/energy.js';

const ANIMAL_TEXT = {
  Rat: 'Resourceful, quick-witted, charming and thrifty.', Ox: 'Diligent, dependable, patient and determined.', Tiger: 'Brave, competitive, confident and unpredictable.',
  Rabbit: 'Gentle, elegant, alert and kind.', Dragon: 'Confident, ambitious, energetic and charismatic.', Snake: 'Wise, enigmatic, intuitive and private.',
  Horse: 'Animated, active, energetic and free-spirited.', Goat: 'Calm, gentle, creative and sympathetic.', Monkey: 'Sharp, curious, playful and inventive.',
  Rooster: 'Observant, hardworking, courageous and frank.', Dog: 'Loyal, honest, prudent and protective.', Pig: 'Generous, compassionate, diligent and easygoing.',
};
const EL_THEME = { Wood: ['abundance', 'beginning'], Fire: ['expression'], Earth: ['structure', 'harmony'], Metal: ['completion', 'structure'], Water: ['intuition', 'introspection'] };
const tz = (p) => p.tz || (p.place && p.place.tz) || Intl.DateTimeFormat().resolvedOptions().timeZone;

export function chinese(root, ctx) {
  const p = ctx.profile;
  const dIn = input({ type: 'date', value: p.date || '' });
  const otherIn = input({ type: 'number', inputmode: 'numeric', placeholder: 'e.g. 1992' });
  const out = h('div'), comp = h('div');
  root.append(intro('The Chinese zodiac cycles through twelve animals and five elements, making a sixty-year cycle. The year begins at the lunar new year.'), field('Birth date', dIn),
    h('div', { class: 'actions' }, btn('Show', go, 'primary')), out,
    section('Compatibility', field('Another person\'s birth year', otherIn), h('div', { class: 'actions' }, btn('Compare', compare, 'ghost')), comp));
  let mine = null;
  function go() {
    if (!dIn.value) { toast('Enter a date'); return; }
    const [y, m, d] = dIn.value.split('-').map(Number);
    const zy = Z.zodiacYear(y, m, d);
    mine = zy;
    const el = Z.stemElement(zy.stem), an = Z.ANIMALS[zy.branch];
    const now = new Date(), cy = Z.zodiacYear(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const items = [
      { h: `${Z.polarity(zy.stem)} ${el} ${an}`, sub: `${Z.pillarHz(zy)} ${Z.pillarName(zy)}`, text: `${ANIMAL_TEXT[an]} ${el} adds ${ELEMENTS_C[el].split('(')[0].trim()}.` },
      { h: 'Lunar new year', text: `The ${zy.lunarYear} lunar year began on ${zy.cny.y}-${String(zy.cny.m).padStart(2, '0')}-${String(zy.cny.d).padStart(2, '0')}.${zy.lunarYear !== y ? ' You were born before it, so your sign belongs to the previous year.' : ''}` },
      { h: `This year: ${Z.stemElement(cy.stem)} ${Z.ANIMALS[cy.branch]}`, text: Z.branchRelation(zy.branch, cy.branch) + (zy.branch === cy.branch ? ' In tradition, your own year (ben ming nian) calls for extra care; red is worn for protection.' : '') },
    ];
    if (p.date === dIn.value && p.time) {
      const bz = Z.bazi(C.birthDate(p), tz(p));
      items.push({ h: `Inner animal: ${Z.ANIMALS[bz.month.branch]}`, text: 'From your birth month: how you are in love and private life.' });
      items.push({ h: `Secret animal: ${Z.ANIMALS[bz.hour.branch]}`, text: 'From your birth hour: your truest, most hidden self.' });
    }
    clear(out);
    out.append(renderItems(items), saveBar(() => ({ tool: 'chinese', title: 'Chinese zodiac', items })));
    store.saveResult('chinese', { animal: an, element: el, themes: EL_THEME[el] });
  }
  function compare() {
    if (!mine) go();
    const y = +otherIn.value;
    if (!y || !mine) return;
    const b = ((y - 4) % 12 + 12) % 12;
    clear(comp);
    comp.append(renderItems([{ h: `${Z.ANIMALS[mine.branch]} and ${Z.ANIMALS[b]}`, text: Z.branchRelation(mine.branch, b) + ' (Years are approximate near the new year.)' }]));
  }
  if (p.date) go();
}

const DM_TEXT = [
  'A tall tree: upright, principled and steadily growing.', 'Flowers and vines: flexible, adaptable and diplomatic.', 'The sun: generous, radiant and open.', 'A candle flame: warm, perceptive, a nurturing light.',
  'A mountain: stable, reliable and protective.', 'Fertile soil: nurturing, accommodating and resourceful.', 'Raw ore or a sword: decisive, strong and righteous.', 'Jewelry: refined, sensitive and precise.',
  'The ocean or a great river: dynamic, intelligent and free.', 'Rain and dew: gentle, intuitive and imaginative.',
];
function pillarCell(label, p, dm) {
  return h('div', { style: { textAlign: 'center', borderTop: '1px solid var(--line)', padding: '10px 0' } },
    h('div', { class: 'label' }, label),
    h('div', { style: { fontSize: '30px', fontFamily: 'var(--serif)', lineHeight: 1.2, margin: '6px 0' } }, Z.STEMS_HZ[p.stem], h('br'), Z.BRANCHES_HZ[p.branch]),
    h('div', { style: { fontSize: '12px' } }, `${Z.STEMS[p.stem]} ${Z.BRANCHES[p.branch]}`),
    h('div', { class: 'hint' }, `${Z.stemElement(p.stem)} / ${Z.ANIMALS[p.branch]}`),
    dm != null && label !== 'Day' ? h('div', { class: 'hint', style: { color: 'var(--accent)' } }, Z.tenGod(dm, p.stem)) : h('div', { class: 'hint', style: { color: 'var(--accent)' } }, label === 'Day' ? 'Day master' : ''));
}
export function bazi(root, ctx) {
  const p = ctx.profile;
  if (!p.date) { needProfile(root, 'your birth date, time and place'); return; }
  const bz = Z.bazi(C.birthDate(p), tz(p), p.sex);
  const dm = bz.dayMaster, dmEl = Z.stemElement(dm);
  const support = bz.counts[dmEl] + bz.counts[Object.keys(bz.counts).find((e) => Z.generates(e) === dmEl)];
  const strong = support >= 4;
  const useful = strong ? [Z.generates(dmEl), Z.controls(dmEl)] : [Object.keys(bz.counts).find((e) => Z.generates(e) === dmEl), dmEl];
  const items = [
    { h: `Day master: ${Z.STEMS[dm]} ${dmEl}`, sub: `${Z.polarity(dm)} ${dmEl}`, text: DM_TEXT[dm] },
    { h: strong ? 'A strong day master' : 'A weaker day master', text: `Of eight characters, ${support} support your ${dmEl} (same element or its resource). ${strong ? 'You benefit from outlets: expression, wealth and discipline.' : 'You benefit from support: learning, allies and rest.'} Helpful elements: ${useful.join(' and ')}. This is a simplified estimate; full analysis weighs seasons and hidden stems.` },
    { h: 'Element balance', text: Object.entries(bz.counts).map(([e, c]) => `${e} ${c}`).join(', ') + '.' },
  ];
  const missing = Object.entries(bz.counts).filter(([, c]) => !c).map(([e]) => e);
  if (missing.length) items.push({ h: `Missing: ${missing.join(', ')}`, text: missing.map((e) => `${e}: ${ELEMENTS_C[e]}`).join('. ') + '.' });
  const now = new Date();
  const birthY = C.birthDate(p).getFullYear();
  const ageNow = (now - C.birthDate(p)) / (365.2422 * 86400000);
  const luckEls = [];
  if (bz.luck) {
    const cur = bz.luck.pillars.filter((x) => x.age <= ageNow).pop();
    bz.luck.pillars.forEach((x) => luckEls.push(h('tr', { style: x === cur ? { fontWeight: 600 } : {} }, h('td', null, `${Math.floor(x.age)}`), h('td', null, `${birthY + Math.floor(x.age)}`), h('td', { style: { fontFamily: 'var(--serif)', fontSize: '18px' } }, Z.pillarHz(x)), h('td', null, Z.pillarDesc(x)), h('td', { class: 'muted' }, Z.tenGod(dm, x.stem)))));
    if (cur) items.push({ h: `Current luck pillar: ${Z.pillarDesc(cur)}`, text: `From about age ${Math.floor(cur.age)}. Its stem is your ${Z.tenGod(dm, cur.stem)}, coloring this decade.` });
  }
  const yr = Z.pillar(now.getFullYear() - 4);
  items.push({ h: `This year: ${Z.pillarDesc(yr)}`, text: `The year stem is your ${Z.tenGod(dm, yr.stem)}.` });
  root.append(intro('The Four Pillars of Destiny read the year, month, day and hour of birth as eight characters of stems and branches. The day stem, your day master, represents you.'),
    !p.time ? note('Birth time unknown: the hour pillar uses noon and may be wrong.') : null,
    h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' } }, pillarCell('Hour', bz.hour, dm), pillarCell('Day', bz.day, dm), pillarCell('Month', bz.month, dm), pillarCell('Year', bz.year, dm)),
    note('Pillars are read right to left: year (ancestry, early life), month (parents, career), day (self, spouse), hour (children, later life). The small labels are the ten gods: each stem\'s relationship to your day master.'),
    renderItems(items),
    section('Luck pillars', bz.luck ? h('div', { class: 'scroll-x' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ...['Age', 'Year', '', 'Pillar', 'Ten god'].map((x) => h('th', null, x)))), h('tbody', null, luckEls))) : note('Set your sex in your profile to calculate luck pillars; their direction depends on it.')),
    saveBar(() => ({ tool: 'bazi', title: 'Four Pillars', items })));
  store.saveResult('bazi', { dayMaster: `${Z.STEMS[dm]} ${dmEl}`, element: dmEl, strong, themes: EL_THEME[dmEl] });
}

const BAGUA = [['SE', 'Wealth and abundance', 'Wood'], ['S', 'Fame and reputation', 'Fire'], ['SW', 'Love and relationships', 'Earth'], ['E', 'Family and health', 'Wood'], ['C', 'Center: wellbeing', 'Earth'], ['W', 'Children and creativity', 'Metal'], ['NE', 'Knowledge and self-cultivation', 'Earth'], ['N', 'Career and life path', 'Water'], ['NW', 'Helpful people and travel', 'Metal']];
export function fengshui(root, ctx) {
  const p = ctx.profile;
  const yIn = input({ type: 'date', value: p.date || '' });
  let sex = p.sex || 'female';
  const out = h('div');
  root.append(intro('Your Kua (Gua) number, from the Eight Mansions school, gives four favorable and four unfavorable directions for sleeping, working and facing.'),
    field('Birth date', yIn), seg([['female', 'Female'], ['male', 'Male']], sex, (v) => { sex = v; go(); }), note('Traditional Kua calculation differs by sex. Choose the one you identify with, or compare both.'),
    h('div', { class: 'actions' }, btn('Calculate', go, 'primary')), out,
    section('The bagua map', h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '1px solid var(--line)' } }, BAGUA.map(([d, t, e]) => h('div', { style: { border: '1px solid var(--line)', padding: '10px 6px', textAlign: 'center', minHeight: '86px' } }, h('div', { class: 'label' }, d), h('div', { style: { fontFamily: 'var(--serif)', fontSize: '14px', margin: '4px 0' } }, t), h('div', { class: 'hint' }, e)))),
      note('Compass school orientation (north at the bottom, as traditionally drawn). Align the grid with your floor plan by compass direction.')));
  function go() {
    if (!yIn.value) return;
    const [y, m, d] = yIn.value.split('-').map(Number);
    const solarY = (m < 2 || (m === 2 && d < 4)) ? y - 1 : y;
    const k = Z.kua(solarY, sex);
    const dirs = Z.KUA_DIRS[k];
    const group = [1, 3, 4, 9].includes(k) ? 'East group' : 'West group';
    clear(out);
    out.append(h('div', { class: 'big' }, `Kua ${k}`), h('p', { class: 'muted' }, group),
      h('div', { class: 'scroll-x' }, h('table', { class: 't' }, h('tbody', null, dirs.map((dir, i) => h('tr', null, h('td', null, dir), h('td', null, Z.KUA_LABELS[i][0]), h('td', { class: 'muted' }, (i < 4 ? 'Favorable: ' : 'Unfavorable: ') + Z.KUA_LABELS[i][1])))))),
      note(`Sit and sleep facing ${dirs[0]} or ${dirs[1]} when you can. Avoid facing ${dirs[7]}.`));
    store.saveResult('kua', { kua: k, group });
  }
  if (p.date) go();
}

export function wuxing(root, ctx) {
  const S = 260, c = S / 2, R = 95;
  const order = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
  const pts = order.map((_, i) => [c + R * Math.cos((-90 + i * 72) * Math.PI / 180), c + R * Math.sin((-90 + i * 72) * Math.PI / 180)]);
  const s = svg('svg', { viewBox: `0 0 ${S} ${S}`, width: '100%', style: 'max-width:300px;display:block;margin:10px auto', stroke: 'currentColor', fill: 'none' });
  for (let i = 0; i < 5; i++) {
    s.append(svg('line', { x1: pts[i][0], y1: pts[i][1], x2: pts[(i + 1) % 5][0], y2: pts[(i + 1) % 5][1], 'stroke-opacity': 0.6 }));
    s.append(svg('line', { x1: pts[i][0], y1: pts[i][1], x2: pts[(i + 2) % 5][0], y2: pts[(i + 2) % 5][1], 'stroke-opacity': 0.25, 'stroke-dasharray': '3 3' }));
  }
  pts.forEach(([x, y], i) => { s.append(svg('circle', { cx: x, cy: y, r: 22, fill: 'var(--bg)' })); s.append(svg('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 11, fill: 'currentColor', stroke: 'none' }, order[i])); });
  const out = h('div');
  const bz = store.results().bazi;
  root.append(intro('Wu Xing describes five phases in constant motion. In the generating cycle (solid) each element feeds the next: wood feeds fire, fire makes earth, earth bears metal, metal carries water, water nourishes wood. In the controlling cycle (dashed) each restrains another.'),
    s, kv(order.map((e) => [e, ELEMENTS_C[e]])), bz ? note(`Your BaZi day master is ${bz.dayMaster}.`) : null,
    section('Your elemental constitution', likert(FIVE_EL_QUIZ.map(([q, k]) => ({ q, k })), (sc) => {
      clear(out);
      const top = Object.entries(sc).sort((a, b) => b[1] - a[1]);
      const items = [{ h: `Leading element: ${top[0][0]}`, text: ELEMENTS_C[top[0][0]] }, { h: `Least expressed: ${top[4][0]}`, text: `Nourish ${top[4][0]} through its season and color, or through the element that generates it (${order[(order.indexOf(top[4][0]) + 4) % 5]}).` }];
      out.append(bars(sc, Object.fromEntries(order.map((e) => [e, e]))), renderItems(items), saveBar(() => ({ tool: 'wuxing', title: 'Five Elements', items })));
      store.saveResult('wuxing', { element: top[0][0], scores: sc, themes: EL_THEME[top[0][0]] });
    })), out);
}

export function ayurveda(root) {
  const out = h('div');
  root.append(intro('Ayurveda describes three doshas, combinations of the five elements, that shape body and temperament. Most people are a blend. This is a traditional self-reflection, not medical advice.'),
    choices(DOSHA_QUIZ.map(([q, ...o]) => ({ q, o: o.map(([t, k]) => ({ t, k })) })), (ans) => {
      const sc = { vata: 0, pitta: 0, kapha: 0 };
      ans.forEach((a) => a && sc[a.k]++);
      const tot = ans.filter(Boolean).length || 1;
      const ranked = Object.entries(sc).sort((a, b) => b[1] - a[1]);
      const label = ranked[1][1] >= ranked[0][1] - 1 ? `${DOSHA[ranked[0][0]][0]}-${DOSHA[ranked[1][0]][0]}` : DOSHA[ranked[0][0]][0];
      const items = [{ h: label, sub: ranked.map(([k, v]) => `${DOSHA[k][0]} ${Math.round(100 * v / tot)}%`).join(', '), text: ranked.filter(([, v]) => v >= ranked[0][1] - 1).map(([k]) => `${DOSHA[k][0]} (${DOSHA[k][1]}): ${DOSHA[k][2]}`).join(' ') }];
      clear(out);
      out.append(bars(sc, { vata: 'Vata', pitta: 'Pitta', kapha: 'Kapha' }, DOSHA_QUIZ.length), renderItems(items), saveBar(() => ({ tool: 'ayurveda', title: 'Ayurveda dosha', items })));
      store.saveResult('ayurveda', { dosha: label, themes: { vata: ['change', 'expression'], pitta: ['power'], kapha: ['structure', 'harmony'] }[ranked[0][0]] });
    }, 'See my dosha'), out);
}

const VASTU = [
  ['North', 'Kubera, lord of wealth', 'Water', 'Cash, office, living room; keep light and open.'],
  ['North-east', 'Ishanya (Shiva)', 'Water', 'Prayer or meditation room; the most sacred corner. Keep clean, light and uncluttered.'],
  ['East', 'Indra and the rising sun', 'Air and sun', 'Main entrance, living room, windows for morning light.'],
  ['South-east', 'Agni, fire', 'Fire', 'Kitchen, electrical equipment.'],
  ['South', 'Yama', 'Earth', 'Bedrooms and heavy storage; keep walls solid.'],
  ['South-west', 'Nairutya', 'Earth', 'Master bedroom, the head of the household; heaviest furniture.'],
  ['West', 'Varuna, water', 'Water', 'Dining room, children\'s room, study.'],
  ['North-west', 'Vayu, wind', 'Air', 'Guest room, garage, storage for things that move.'],
  ['Center', 'Brahmasthan', 'Space', 'Keep open and free of heavy objects, pillars or toilets.'],
];
export function vastu(root) {
  root.append(intro('Vastu Shastra is the traditional Indian science of space, aligning buildings with the directions, the five elements and their presiding deities.'),
    renderItems(VASTU.map(([d, deity, el, room]) => ({ h: d, sub: `${deity}; ${el}`, text: room }))),
    note('General guidance: sleep with your head to the south or east; face east or north while working; keep the north-east light and the south-west heavy.'));
}

const TIB_EL = { Wood: 'Wood (shing)', Fire: 'Fire (me)', Earth: 'Earth (sa)', Metal: 'Iron (chag)', Water: 'Water (chu)' };
const LIFE_EL = ['Water', 'Earth', 'Wood', 'Wood', 'Earth', 'Fire', 'Fire', 'Earth', 'Metal', 'Metal', 'Earth', 'Water'];
const MOTHER = { Wood: 'Water', Fire: 'Wood', Earth: 'Fire', Metal: 'Earth', Water: 'Metal' };
export function tibetan(root, ctx) {
  const p = ctx.profile;
  if (!p.date) { needProfile(root); return; }
  const [y, m, d] = p.date.split('-').map(Number);
  const zy = Z.zodiacYear(y, m, d);
  const el = Z.stemElement(zy.stem), life = LIFE_EL[zy.branch];
  const items = [
    { h: `${zy.stem % 2 === 0 ? 'Male' : 'Female'} ${TIB_EL[el]} ${Z.ANIMALS[zy.branch]}`, text: 'Tibetan astrology (kartsi and nagtsi) shares the sixty-year cycle with Chinese astrology, naming Metal as Iron and polarity as male and female.' },
    { h: `Life force (sok): ${TIB_EL[life]}`, text: 'Derived from your animal; it shows vitality and lifespan.' },
    { h: `Power (wangthang): ${TIB_EL[el]}`, text: 'Derived from the year element; it shows personal power, wealth and influence.' },
    { h: `Soul (la): ${TIB_EL[MOTHER[life]]}`, text: 'The mother element of the life force; it supports the inner spirit.' },
  ];
  root.append(intro('The Tibetan year begins at Losar, usually within a day or a month of the Chinese new year; this uses the Chinese date as an approximation.'),
    renderItems(items), note('Body (lu) and fortune (lungta) elements and the mewa nine-square system are not included yet.'), saveBar(() => ({ tool: 'tibetan', title: 'Tibetan year', items })));
}
