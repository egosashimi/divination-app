import { h, svg, clear, section, intro, note, btn, seg, field, input, kv, renderItems, saveBar, fmtDate, fmtDateTime, toast } from '../core/ui.js';
import * as A from '../core/astro.js';
import * as K from '../core/calendars.js';
import * as store from '../core/store.js';
import { FESTIVAL_TEXT, CELTIC_TREE_TEXT, CORRESPONDENCES, PLANTS } from '../data/energy.js';

export function moonGlyph(elong, size = 80) {
  const r = size / 2 - 2, c = size / 2;
  const k = Math.cos(elong * Math.PI / 180);
  const waxing = elong < 180;
  const rx = Math.abs(k) * r;
  const sweepOuter = waxing ? 1 : 0;
  const d = `M${c} ${c - r} A${r} ${r} 0 0 ${sweepOuter} ${c} ${c + r} A${rx} ${r} 0 0 ${(k > 0) === waxing ? 0 : 1} ${c} ${c - r}Z`;
  return svg('svg', { viewBox: `0 0 ${size} ${size}`, width: size, height: size, 'aria-hidden': 'true' },
    svg('circle', { cx: c, cy: c, r, fill: 'var(--moon-dark)', stroke: 'currentColor', 'stroke-opacity': 0.35 }),
    svg('path', { d, fill: 'var(--moon-lit)' }));
}

export function moon(root, ctx) {
  const j = A.jd(new Date());
  const ph = A.moonPhase(j);
  const ml = A.body('Moon', j).lon;
  const ev = A.lunations(j, 32);
  const full = A.lunations(j, 400).filter((x) => x.name === 'Full Moon').slice(0, 12);
  const NAMES = ['Wolf Moon', 'Snow Moon', 'Worm Moon', 'Pink Moon', 'Flower Moon', 'Strawberry Moon', 'Buck Moon', 'Sturgeon Moon', 'Harvest or Corn Moon', 'Hunter\'s Moon', 'Beaver Moon', 'Cold Moon'];
  const PH_TEXT = {
    'New Moon': 'Seed intentions in darkness.', 'Waxing Crescent': 'Take the first steps; build momentum.', 'First Quarter': 'Decide and act through resistance.', 'Waxing Gibbous': 'Refine and adjust.',
    'Full Moon': 'Culmination, clarity and release of emotion.', 'Waning Gibbous': 'Share and give thanks.', 'Last Quarter': 'Let go of what did not work.', 'Waning Crescent': 'Rest, reflect and surrender.',
  };
  root.append(h('div', { style: { display: 'flex', alignItems: 'center', gap: '18px', margin: '8px 0 18px' } }, moonGlyph(ph.elong, 96),
    h('div', null, h('div', { style: { fontFamily: 'var(--serif)', fontSize: '26px' } }, ph.name), h('div', { class: 'muted' }, `${Math.round(ph.illum * 100)}% illuminated, Moon in ${A.SIGNS[A.signOf(ml)]}`))),
    h('p', null, PH_TEXT[ph.name]),
    section('The coming month', renderItems(ev.map((e) => ({ h: e.name, sub: fmtDateTime(A.fromJd(e.jd)), text: `In ${A.SIGNS[A.signOf(e.moonLon)]}${e.eclipse ? '. ' + e.eclipse + ' (approximate)' : ''}.` })))),
    section('Full moons this year', note('Traditional North American folk names by month, as popularized by almanacs.'), renderItems(full.map((e) => { const d = A.fromJd(e.jd); return { h: NAMES[d.getMonth()], sub: fmtDate(d), text: `Full Moon in ${A.SIGNS[A.signOf(e.moonLon)]}${e.eclipse ? ', lunar eclipse' : ''}.` }; }))));
}

export function wheel(root, ctx) {
  let south = (ctx.profile.place && ctx.profile.place.lat < 0) || false;
  const out = h('div');
  const draw = () => {
    clear(out);
    const fs = K.wheel(A.jd(new Date()), south);
    out.append(renderItems(fs.map((f) => ({ h: f.name, sub: `${fmtDate(A.fromJd(f.jd))} - ${f.kind}`, text: `${FESTIVAL_TEXT[f.name]} Traditionally ${f.trad}${south ? ' in the north' : ''}.` }))));
  };
  root.append(intro('The modern wheel of the year joins the solstices and equinoxes with four Celtic-rooted cross-quarter days. Dates here are astronomical: when the Sun reaches each point.'),
    seg([['n', 'Northern hemisphere'], ['s', 'Southern hemisphere']], south ? 's' : 'n', (v) => { south = v === 's'; draw(); }), out);
  draw();
}

export function celtic(root, ctx) {
  const d = input({ type: 'date', value: ctx.profile.date || '' });
  const out = h('div');
  root.append(intro('The Celtic tree calendar was popularized by Robert Graves in The White Goddess (1948). It is a modern system inspired by the Ogham alphabet, not a documented ancient practice.'), field('Birth date', d), h('div', { class: 'actions' }, btn('Find my tree', go, 'primary')), out);
  function go() {
    if (!d.value) return;
    const [, m, dd] = d.value.split('-').map(Number);
    const t = K.celticTree(m, dd);
    const row = K.CELTIC_TREES.find(([n]) => n === t);
    const items = [{ h: t, sub: `${fmtDate(new Date(2000, row[1][0] - 1, row[1][1]), { month: 'short', day: 'numeric' })} to ${fmtDate(new Date(2000, row[2][0] - 1, row[2][1]), { month: 'short', day: 'numeric' })}`, text: CELTIC_TREE_TEXT[t] }];
    clear(out); out.append(renderItems(items), saveBar(() => ({ tool: 'celtic', title: 'Celtic tree sign', items })));
  }
  if (d.value) go();
}

const SIGN_TEXT_MAYA = {
  Imix: 'Crocodile or water lily: primordial waters, nurturing, beginnings.', Ik: 'Wind: breath, spirit, communication.', Akbal: 'Night or house: the inner world, dreams, rest.', Kan: 'Seed or lizard: abundance, potential, growth.',
  Chicchan: 'Serpent: life force, instinct, vitality.', Cimi: 'Death: transformation, ancestors, release.', Manik: 'Deer: healing, the hand, accomplishment.', Lamat: 'Star or rabbit: harmony, abundance, beauty.',
  Muluc: 'Water: offering, emotion, purification.', Oc: 'Dog: loyalty, guidance, the heart.', Chuen: 'Monkey: play, art, craft.', Eb: 'Road or grass: the path of life, community.',
  Ben: 'Reed: home, authority, inner strength.', Ix: 'Jaguar: the earth, magic, shamanic vision.', Men: 'Eagle: vision, ambition, freedom.', Cib: 'Owl or vulture: wisdom, ancestors, forgiveness.',
  Caban: 'Earth: movement, synchronicity, the earth\'s rhythm.', Etznab: 'Flint: truth, clarity, cutting through.', Cauac: 'Storm: renewal, cleansing, transformation.', Ahau: 'Sun or lord: enlightenment, mastery, wholeness.',
};
export function maya(root, ctx) {
  const d = input({ type: 'date', value: ctx.profile.date || new Date().toISOString().slice(0, 10) });
  const out = h('div');
  root.append(intro('The 260-day Tzolkin combines 13 numbers with 20 day signs. It is still kept by Maya daykeepers in Guatemala. This uses the standard GMT correlation (584283). The Dreamspell count popular in New Age circles is a different, modern system.'),
    field('Date', d), h('div', { class: 'actions' }, btn('Calculate', go, 'primary')), out);
  function go() {
    const [y, m, dd] = d.value.split('-').map(Number);
    const r = K.maya(y, m, dd), t = K.maya(...new Date().toISOString().slice(0, 10).split('-').map(Number));
    const sign = K.TZ_SIGNS[r.sign];
    const items = [
      { h: `${r.number} ${sign}`, sub: 'Tzolkin day', text: `${SIGN_TEXT_MAYA[sign]} The number ${r.number} gives it ${r.number <= 4 ? 'a beginning, initiating quality' : r.number <= 9 ? 'a developing, active quality' : 'a mature, completing quality'}.` },
      { h: `${r.haabDay} ${K.HAAB[r.haabMonth]}`, sub: 'Haab', text: 'The 365-day solar count.' },
      { h: r.longCount, sub: 'Long Count', text: 'Days since the creation date of 13.0.0.0.0 (3114 BCE).' },
      { h: `Today: ${t.number} ${K.TZ_SIGNS[t.sign]}`, text: SIGN_TEXT_MAYA[K.TZ_SIGNS[t.sign]] },
    ];
    clear(out); out.append(renderItems(items), saveBar(() => ({ tool: 'maya', title: 'Maya Tzolkin', items })));
    if (d.value === ctx.profile.date) store.saveResult('maya', { sign, number: r.number });
  }
  go();
}

export function elements(root) {
  root.append(intro('Western ceremonial and folk traditions link the classical elements with directions, seasons, tools and spirits. Correspondences vary between traditions and hemispheres.'),
    renderItems(CORRESPONDENCES.map(([e, dir, season, tool, spirit, kw, signs]) => ({ h: e, text: `${kw}. Direction: ${dir}. Season: ${season}. Tarot suit: ${tool}.${spirit ? ' Elemental: ' + spirit + '.' : ''}${signs ? ' Signs: ' + signs + '.' : ''}` }))));
}

export function plants(root) {
  const q = input({ type: 'search', placeholder: 'Search plants' });
  const out = h('div');
  const draw = () => { clear(out); const s = q.value.toLowerCase(); out.append(renderItems(PLANTS.filter(([n, m]) => !s || (n + m).toLowerCase().includes(s)).map(([n, m]) => ({ h: n, text: m + '.' })))); };
  q.addEventListener('input', draw);
  root.append(intro('Folk and Victorian floriography meanings of plants and trees. Never ingest a plant on the basis of its symbolism.'), q, out);
  draw();
}
