import { h, svg, clear, section, intro, note, btn, seg, select, field, input, kv, renderItems, saveBar, needProfile, fmtDate, fmtDateTime, toast, bars, questionBox } from '../core/ui.js';
import * as A from '../core/astro.js';
import * as C from '../core/chart.js';
import * as store from '../core/store.js';
import { PLANET_TEXT, SIGN_TEXT, HOUSE_TEXT, ASPECT_TEXT, placementText, cap, TRANSIT_TEXT, NAKSHATRAS, DASHA, DASHA_TEXT, ESOTERIC_RULER, LOTS, LUNATION_TYPES, FIXED_STARS } from '../data/astro-text.js';
import { CITIES } from '../data/cities.js';
import { lifePath, reduce } from '../core/numerology.js';
import { zodiacYear, ANIMALS, branchRelation } from '../core/chinese.js';

const G = (n) => (A.GLYPH[n] || n) + (n.length > 2 && A.GLYPH[n] && !['Chiron'].includes(n) ? '︎' : '');
const pos = (lon) => A.fmtDeg(lon);
const sname = (lon) => A.SIGNS[A.signOf(lon)];

export function natalChart(ctx, opts = {}) {
  const p = ctx.profile;
  if (!C.hasBirth(p)) return null;
  return C.computeChart(p, { zodiac: opts.zodiac || ctx.settings.zodiac, houseSystem: opts.houses || ctx.settings.houses, ...opts });
}
function requireBirth(root, ctx) {
  if (!C.hasBirth(ctx.profile)) { needProfile(root, 'your birth date (and ideally time and place)'); return false; }
  return true;
}
function timeNote(chart) {
  if (!chart.timeKnown) return note('Birth time unknown: houses, Ascendant and Midheaven are omitted, and the Moon may be off by up to 7 degrees.');
  if (!chart.houses) return note('Add a birth place to your profile to calculate houses and the Ascendant.');
  return null;
}

// ---------- Chart wheel ----------
export function wheel(chart, { outer = null, size = 340 } = {}) {
  const c = size / 2, R0 = c - 4, R1 = R0 - 26, R2 = R1 - 52, R3 = R2 - 4;
  const asc = chart.houses ? chart.houses.asc : 0;
  const pt = (lon, r) => { const t = (180 + lon - asc) * Math.PI / 180; return [c + r * Math.cos(t), c - r * Math.sin(t)]; };
  const s = svg('svg', { viewBox: `0 0 ${size} ${size}`, role: 'img', 'aria-label': 'Chart wheel' });
  const line = (a, b, attrs = {}) => svg('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: 'currentColor', 'stroke-opacity': 0.25, ...attrs });
  s.append(svg('circle', { cx: c, cy: c, r: R0, fill: 'none', stroke: 'currentColor', 'stroke-opacity': 0.35 }),
    svg('circle', { cx: c, cy: c, r: R1, fill: 'none', stroke: 'currentColor', 'stroke-opacity': 0.35 }),
    svg('circle', { cx: c, cy: c, r: R3, fill: 'none', stroke: 'currentColor', 'stroke-opacity': 0.2 }));
  for (let i = 0; i < 12; i++) {
    s.append(line(pt(i * 30, R0), pt(i * 30, R1)));
    const [x, y] = pt(i * 30 + 15, (R0 + R1) / 2);
    s.append(svg('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 10, 'letter-spacing': '0.05em', fill: 'currentColor', 'fill-opacity': 0.7 }, A.SIGN_ABBR[i].toUpperCase()));
  }
  if (chart.houses) {
    chart.houses.cusps.forEach((cu, i) => {
      const angular = i % 3 === 0;
      s.append(line(pt(cu, R1), pt(cu, angular ? 0 : R3), { 'stroke-opacity': angular ? 0.5 : 0.18 }));
      const [x, y] = pt(cu + 4, R3 + 8);
      s.append(svg('text', { x, y, 'font-size': 8, 'text-anchor': 'middle', fill: 'currentColor', 'fill-opacity': 0.45 }, String(i + 1)));
    });
    for (const [lbl, lon] of [['AC', chart.houses.asc], ['MC', chart.houses.mc]]) { const [x, y] = pt(lon, R0 + 0.1); s.append(svg('circle', { cx: x, cy: y, r: 2.5, fill: 'currentColor' })); }
  }
  // aspects
  const inner = R3 - 50;
  for (const a of chart.aspects.filter((x) => !['Asc', 'MC'].includes(x.a) && !['Asc', 'MC'].includes(x.b)).slice(0, 24)) {
    const la = chart.bodies[a.a].lon, lb = chart.bodies[a.b].lon;
    if (a.aspect === 'Conjunction') continue;
    s.append(line(pt(la, inner), pt(lb, inner), { 'stroke-opacity': a.nature === 'tension' ? 0.55 : 0.28, 'stroke-dasharray': a.nature === 'flow' ? '3 3' : null }));
  }
  s.append(svg('circle', { cx: c, cy: c, r: inner, fill: 'none', stroke: 'currentColor', 'stroke-opacity': 0.15 }));
  // planets, spread to avoid overlap
  const place = (bodies, r, fs) => {
    const list = bodies.map((b) => ({ name: b.name, lon: b.lon, d: b.lon, retro: b.retro })).sort((a, b) => a.lon - b.lon);
    for (let it = 0; it < 30; it++) for (let i = 0; i < list.length; i++) {
      const a = list[i], b = list[(i + 1) % list.length];
      const gap = A.norm(b.d - a.d);
      if (gap < 7 && list.length > 1) { a.d = A.norm(a.d - (7 - gap) / 2); b.d = A.norm(b.d + (7 - gap) / 2); }
    }
    for (const b of list) {
      const [x, y] = pt(b.d, r);
      s.append(line(pt(b.lon, R3), pt(b.lon, R3 - 5), { 'stroke-opacity': 0.6 }));
      s.append(svg('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': fs, fill: 'currentColor' }, G(b.name)));
      const [x2, y2] = pt(b.d, r - fs - 1);
      s.append(svg('text', { x: x2, y: y2, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 7.5, fill: 'currentColor', 'fill-opacity': 0.55 }, Math.floor(b.lon % 30) + (b.retro ? 'r' : '')));
    }
  };
  place(A.PLANETS.map((n) => ({ ...chart.bodies[n], name: n })), R3 - 15, 15);
  if (outer) place(outer, R1 + 13, 11);
  return h('div', { class: 'wheel', style: { maxWidth: '380px', margin: '10px auto' } }, s);
}

function placementsTable(chart, { dignity = false } = {}) {
  const rows = [...A.PLANETS, 'SouthNode'].map((n) => {
    const b = chart.bodies[n];
    return h('tr', null, h('td', null, `${G(n === 'SouthNode' ? 'Node' : n)} ${n === 'Node' ? 'North Node' : n === 'SouthNode' ? 'South Node' : n}`), h('td', null, pos(b.lon) + (b.retro ? ' R' : '')), h('td', null, b.house ? String(b.house) : ''), dignity ? h('td', null, C.dignity(n, b.sign)) : null);
  });
  if (chart.houses) rows.push(h('tr', null, h('td', null, 'Ascendant'), h('td', null, pos(chart.houses.asc)), h('td', null, '1')), h('tr', null, h('td', null, 'Midheaven'), h('td', null, pos(chart.houses.mc)), h('td', null, '10')));
  return h('div', { class: 'scroll-x' }, h('table', { class: 't' }, h('thead', null, h('tr', null, h('th', null, 'Body'), h('th', null, 'Position'), h('th', null, 'House'), dignity ? h('th', null, 'Dignity') : null)), h('tbody', null, rows)));
}

function chartSettings(ctx, rerender) {
  return h('div', null,
    seg([['tropical', 'Tropical'], ['sidereal', 'Sidereal (Lahiri)']], ctx.settings.zodiac, (v) => { store.setSettings({ zodiac: v }); ctx.settings.zodiac = v; rerender(); }),
    seg([['placidus', 'Placidus'], ['whole', 'Whole sign'], ['equal', 'Equal']], ctx.settings.houses, (v) => { store.setSettings({ houses: v }); ctx.settings.houses = v; rerender(); }));
}

// ---------- Natal ----------
export function natal(root, ctx) {
  if (!requireBirth(root, ctx)) return;
  const body = h('div');
  root.append(chartSettings(ctx, draw), body);
  function draw() {
    clear(body);
    const ch = natalChart(ctx);
    const b = ch.bodies;
    const big3 = [
      { h: `Sun in ${A.SIGNS[b.Sun.sign]}`, sub: b.Sun.house ? `house ${b.Sun.house}` : '', text: placementText('Sun', b.Sun.sign, b.Sun.house) },
      { h: `Moon in ${A.SIGNS[b.Moon.sign]}`, sub: b.Moon.house ? `house ${b.Moon.house}` : '', text: placementText('Moon', b.Moon.sign, b.Moon.house) },
    ];
    if (ch.houses) big3.push({ h: `${A.SIGNS[A.signOf(ch.houses.asc)]} rising`, text: `You meet the world ${SIGN_TEXT[A.signOf(ch.houses.asc)].style}. Chart ruler: ${C.RULER[A.signOf(ch.houses.asc)]} in ${A.SIGNS[b[C.RULER[A.signOf(ch.houses.asc)]].sign]}.` });
    const bal = C.balance(ch);
    const items = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Node', 'Chiron'].map((n) => ({
      h: `${n === 'Node' ? 'North Node' : n} in ${A.SIGNS[b[n].sign]}`, sub: [b[n].house ? `house ${b[n].house}` : '', b[n].retro ? 'retrograde' : '', C.dignity(n, b[n].sign)].filter(Boolean).join(', '),
      text: placementText(n, b[n].sign, b[n].house) + (n === 'Chiron' ? ' (Chiron position is approximate.)' : ''),
    }));
    const asp = ch.aspects.filter((a) => a.orb < 6).slice(0, 14).map((a) => ({ h: `${a.a} ${a.aspect.toLowerCase()} ${a.b}`, sub: `orb ${a.orb.toFixed(1)}`, text: `${cap(PLANET_TEXT[a.a].kw)} and ${PLANET_TEXT[a.b].kw} ${ASPECT_TEXT[a.aspect]}.` }));
    const T = (ch.jd - 2451545) / 36525;
    const stars = [];
    for (const [name, lon0, nature] of FIXED_STARS) {
      const lon = A.norm(lon0 + 1.397 * T - ch.ayanamsa);
      for (const n of ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']) if (A.angDist(lon, b[n].lon) < 1.5) stars.push({ h: `${n} conjunct ${name}`, text: `Traditionally ${nature}.` });
      if (ch.houses) for (const [an, al] of [['Ascendant', ch.houses.asc], ['Midheaven', ch.houses.mc]]) if (A.angDist(lon, al) < 1.5) stars.push({ h: `${an} conjunct ${name}`, text: `Traditionally ${nature}.` });
    }
    body.append(timeNote(ch) || '', wheel(ch),
      h('p', { class: 'hint', style: { textAlign: 'center' } }, `${fmtDateTime(ch.date)} ${ch.place ? '- ' + (ch.place.name || '') : ''} - ${ch.zodiac}${ch.houses ? ', ' + ch.houses.system : ''}`),
      section('The big three', renderItems(big3)),
      section('Balance', h('div', { class: 'label' }, 'Elements'), bars(bal.el, { Fire: 'Fire', Earth: 'Earth', Air: 'Air', Water: 'Water' }), h('div', { class: 'label' }, 'Modalities'), bars(bal.md, { Cardinal: 'Cardinal', Fixed: 'Fixed', Mutable: 'Mutable' })),
      section('Placements', placementsTable(ch, { dignity: true }), renderItems(items)),
      section('Aspects', renderItems(asp)),
      stars.length ? section('Fixed stars', renderItems(stars)) : null,
      saveBar(() => ({ tool: 'natal', title: 'Birth chart', items: [...big3, ...items, ...asp] })));
    const domEl = Object.entries(bal.el).sort((x, y) => y[1] - x[1])[0][0];
    store.saveResult('natal', { sun: b.Sun.sign, moon: b.Moon.sign, asc: ch.houses ? A.signOf(ch.houses.asc) : null, element: domEl, el: bal.el });
  }
  draw();
}

// ---------- Transits ----------
export function transits(root, ctx) {
  if (!requireBirth(root, ctx)) return;
  const dIn = input({ type: 'date', value: new Date().toISOString().slice(0, 10) });
  const body = h('div');
  root.append(intro('Transits compare where the planets are now with where they were when you were born. Slow planets describe the long chapters; fast planets the daily weather.'), field('Date', dIn), body);
  dIn.addEventListener('change', draw);
  function draw() {
    clear(body);
    const ch = natalChart(ctx);
    const [y, m, d] = dIn.value.split('-').map(Number);
    const j = A.jd(new Date(y, m - 1, d, 12));
    const tr = C.transitsTo(ch, j);
    const items = tr.aspects.filter((a) => a.transit !== 'Moon').slice(0, 16).map((a) => ({
      h: `${a.transit} ${a.aspect.toLowerCase()} natal ${a.natal}`, sub: `orb ${a.orb.toFixed(1)}`,
      text: `${a.transit} ${TRANSIT_TEXT[a.transit] || 'touches'} your ${PLANET_TEXT[a.natal].kw}. The ${a.aspect.toLowerCase()} suggests energies that ${ASPECT_TEXT[a.aspect]}.`,
    }));
    const moon = tr.aspects.filter((a) => a.transit === 'Moon').slice(0, 3);
    const j0 = A.jd(new Date());
    const up = C.upcomingTransits(ch, j0, 365).slice(0, 30).map((t) => ({ h: `${t.transit} ${t.aspect.toLowerCase()} ${t.natal}`, sub: fmtDate(A.fromJd(t.jd)), text: `${t.transit} ${TRANSIT_TEXT[t.transit] || 'touches'} your ${PLANET_TEXT[t.natal].kw}.` }));
    body.append(wheel(ch, { outer: tr.bodies.filter((b) => b.name !== 'Node') }), h('p', { class: 'hint', style: { textAlign: 'center' } }, 'Inner ring: natal. Outer ring: transiting planets.'),
      section('Active transits', items.length ? renderItems(items) : h('p', { class: 'muted' }, 'No close transits on this date.')),
      moon.length ? section('Today\'s Moon', renderItems(moon.map((a) => ({ h: `Moon ${a.aspect.toLowerCase()} ${a.natal}`, text: `A passing emotional tone around your ${PLANET_TEXT[a.natal].kw}.` })))) : null,
      section('Exact hits in the next twelve months', note('Slow planets, Chiron and the Node making exact aspects to your personal planets and angles. A retrograde planet can hit the same point up to three times.'), renderItems(up)),
      saveBar(() => ({ tool: 'transits', title: `Transits for ${dIn.value}`, items })));
    store.saveResult('transits', { themes: items.slice(0, 8).flatMap((i) => (PLANET_TEXT[i.h.split(' ')[0]] || { themes: [] }).themes), list: up.slice(0, 10).map((u) => u.h + ' ' + u.sub) });
  }
  draw();
}

// ---------- Vedic ----------
const SOUTH_GRID = [11, 0, 1, 2, 10, -1, -1, 3, 9, -1, -1, 4, 8, 7, 6, 5];
function southIndian(ch, lagnaSign) {
  const cells = SOUTH_GRID.map((sg, i) => {
    if (sg < 0) return i === 5 ? h('div', { style: { gridColumn: '2 / span 2', gridRow: '2 / span 2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: '16px' } }, 'Rashi') : null;
    const inSign = Object.values(ch.bodies).filter((b) => A.PLANETS.includes(b.name) && b.name !== 'Chiron' && b.sign === sg).map((b) => b.name === 'Node' ? 'Ra' : b.name.slice(0, 2));
    if (ch.bodies.SouthNode.sign === sg) inSign.push('Ke');
    return h('div', { style: { border: '1px solid var(--line)', padding: '4px', minHeight: '64px', fontSize: '12px' } },
      h('div', { class: 'label', style: { fontSize: '9px' } }, A.SIGN_ABBR[sg] + (sg === lagnaSign ? ' / Lagna' : '')), h('div', null, inSign.join(' ')));
  }).filter(Boolean);
  return h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, auto)', margin: '14px 0' } }, cells);
}
function nakshatra(lon) { const i = Math.floor(lon / (360 / 27)); const pada = Math.floor((lon % (360 / 27)) / (360 / 108)) + 1; return { i, pada, data: NAKSHATRAS[i], frac: (lon % (360 / 27)) / (360 / 27) }; }
function dashas(moonLon, birthJd) {
  const nk = nakshatra(moonLon);
  let idx = nk.i % 9;
  const out = [];
  let t = birthJd - nk.frac * DASHA[idx][1] * 365.25;
  for (let k = 0; k < 10; k++) {
    const [lord, yrs] = DASHA[(idx + k) % 9];
    out.push({ lord, start: t, end: t + yrs * 365.25, yrs });
    t += yrs * 365.25;
  }
  return out;
}
export function vedic(root, ctx) {
  if (!requireBirth(root, ctx)) return;
  const ch = natalChart(ctx, { zodiac: 'sidereal', houses: 'whole' });
  const b = ch.bodies;
  const lagna = ch.houses ? A.signOf(ch.houses.asc) : b.Moon.sign;
  const mk = nakshatra(b.Moon.lon);
  const ds = dashas(b.Moon.lon, ch.jd);
  const now = A.jd(new Date());
  const cur = ds.find((d) => now >= d.start && now < d.end);
  const antar = [];
  if (cur) {
    const si = DASHA.findIndex(([l]) => l === cur.lord);
    let t = cur.start;
    for (let k = 0; k < 9; k++) { const [l, y] = DASHA[(si + k) % 9]; const len = cur.yrs * y / 120 * 365.25; antar.push({ lord: l, start: t, end: t + len }); t += len; }
  }
  const curAntar = antar.find((a) => now >= a.start && now < a.end);
  const karakaNames = ['Atmakaraka (soul)', 'Amatyakaraka (career, counsel)', 'Bhratrikaraka (siblings, courage)', 'Matrikaraka (mother, home)', 'Putrakaraka (children, creativity)', 'Gnatikaraka (rivals, obstacles)', 'Darakaraka (spouse, partners)'];
  const kar = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].map((n) => ({ n, d: b[n].lon % 30 })).sort((x, y) => y.d - x.d);
  const items = [
    { h: `Lagna (ascendant): ${A.SIGNS[lagna]}`, text: ch.houses ? `Sidereal rising sign; whole-sign houses count from here.` : 'Birth time or place unknown: the Moon sign (Chandra lagna) is used as the first house.' },
    { h: `Moon in ${mk.data[0]} nakshatra, pada ${mk.pada}`, sub: `ruled by ${mk.data[1]}, deity ${mk.data[2]}`, text: `The lunar mansion of ${mk.data[3]}. Your Moon sign (rashi) is ${A.SIGNS[b.Moon.sign]}.` },
    { h: `Sun in ${A.SIGNS[b.Sun.sign]}`, text: `Sidereally, your Sun is in ${A.SIGNS[b.Sun.sign]}, about ${ch.ayanamsa.toFixed(1)} degrees behind its tropical position.` },
  ];
  const dashaItems = [];
  if (cur) dashaItems.push({ h: `Current mahadasha: ${cur.lord}`, sub: `${fmtDate(A.fromJd(cur.start))} to ${fmtDate(A.fromJd(cur.end))}`, text: `A ${cur.yrs}-year period emphasizing ${DASHA_TEXT[cur.lord]}.` });
  if (curAntar) dashaItems.push({ h: `Current antardasha: ${curAntar.lord}`, sub: `until ${fmtDate(A.fromJd(curAntar.end))}`, text: `Within it, a sub-period of ${DASHA_TEXT[curAntar.lord]}.` });
  root.append(intro('Jyotish uses the sidereal zodiac, aligned to the stars (Lahiri ayanamsa), whole-sign houses, and the Moon\'s nakshatra for timing.'),
    timeNote(ch) || '', southIndian(ch, lagna),
    h('div', { class: 'scroll-x' }, h('table', { class: 't' }, h('thead', null, h('tr', null, h('th', null, 'Graha'), h('th', null, 'Sidereal'), h('th', null, 'Nakshatra'))),
      h('tbody', null, ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Node'].map((n) => { const nk = nakshatra(b[n].lon); return h('tr', null, h('td', null, n === 'Node' ? 'Rahu' : n), h('td', null, pos(b[n].lon) + (b[n].retro ? ' R' : '')), h('td', null, `${nk.data[0]} ${nk.pada}`)); }),
        h('tr', null, h('td', null, 'Ketu'), h('td', null, pos(b.SouthNode.lon)), h('td', null, `${nakshatra(b.SouthNode.lon).data[0]} ${nakshatra(b.SouthNode.lon).pada}`))))),
    section('Essentials', renderItems(items)),
    section('Vimshottari dasha', renderItems(dashaItems), h('div', { class: 'scroll-x' }, h('table', { class: 't' }, h('tbody', null, ds.map((d) => h('tr', { style: d === cur ? { fontWeight: 600 } : {} }, h('td', null, d.lord), h('td', null, `${A.fromJd(d.start).getFullYear()} to ${A.fromJd(d.end).getFullYear()}`), h('td', { class: 'muted' }, DASHA_TEXT[d.lord]))))))),
    section('Jaimini chara karakas', note('Ranked by degree within sign, using the seven visible planets.'), kv(kar.map((k, i) => [karakaNames[i], `${k.n} (${k.d.toFixed(1)} deg)`]))),
    saveBar(() => ({ tool: 'vedic', title: 'Vedic chart', items: [...items, ...dashaItems] })));
  store.saveResult('vedic', { nakshatra: mk.data[0], dasha: cur && cur.lord, antar: curAntar && curAntar.lord });
}

// ---------- Hellenistic ----------
const BOUNDS = [
  [['Jupiter', 6], ['Venus', 12], ['Mercury', 20], ['Mars', 25], ['Saturn', 30]], [['Venus', 8], ['Mercury', 14], ['Jupiter', 22], ['Saturn', 27], ['Mars', 30]],
  [['Mercury', 6], ['Jupiter', 12], ['Venus', 17], ['Mars', 24], ['Saturn', 30]], [['Mars', 7], ['Venus', 13], ['Mercury', 19], ['Jupiter', 26], ['Saturn', 30]],
  [['Jupiter', 6], ['Venus', 11], ['Saturn', 18], ['Mercury', 24], ['Mars', 30]], [['Mercury', 7], ['Venus', 17], ['Jupiter', 21], ['Mars', 28], ['Saturn', 30]],
  [['Saturn', 6], ['Mercury', 14], ['Jupiter', 21], ['Venus', 28], ['Mars', 30]], [['Mars', 7], ['Venus', 11], ['Mercury', 19], ['Jupiter', 24], ['Saturn', 30]],
  [['Jupiter', 12], ['Venus', 17], ['Mercury', 21], ['Saturn', 26], ['Mars', 30]], [['Mercury', 7], ['Jupiter', 14], ['Venus', 22], ['Saturn', 26], ['Mars', 30]],
  [['Mercury', 7], ['Venus', 13], ['Jupiter', 20], ['Mars', 25], ['Saturn', 30]], [['Venus', 12], ['Jupiter', 16], ['Mercury', 19], ['Mars', 28], ['Saturn', 30]],
];
const boundLord = (lon) => { const s = A.signOf(lon), d = lon % 30; return BOUNDS[s].find(([, e]) => d < e)[0]; };
const TRIPLICITY = { Fire: ['Sun', 'Jupiter'], Earth: ['Venus', 'Moon'], Air: ['Saturn', 'Mercury'], Water: ['Venus', 'Mars'] };
export function hellenistic(root, ctx) {
  if (!requireBirth(root, ctx)) return;
  const ch = natalChart(ctx, { zodiac: 'tropical', houses: 'whole' });
  if (!ch.houses) { root.append(timeNote(ch)); return; }
  const b = ch.bodies, asc = ch.houses.asc, day = ch.isDay;
  const fortune = A.norm(day ? asc + b.Moon.lon - b.Sun.lon : asc + b.Sun.lon - b.Moon.lon);
  const spirit = A.norm(day ? asc + b.Sun.lon - b.Moon.lon : asc + b.Moon.lon - b.Sun.lon);
  const L = {
    Fortune: fortune, Spirit: spirit,
    Eros: A.norm(day ? asc + b.Venus.lon - spirit : asc + spirit - b.Venus.lon),
    Necessity: A.norm(day ? asc + fortune - b.Mercury.lon : asc + b.Mercury.lon - fortune),
    Courage: A.norm(day ? asc + fortune - b.Mars.lon : asc + b.Mars.lon - fortune),
    Victory: A.norm(day ? asc + b.Jupiter.lon - spirit : asc + spirit - b.Jupiter.lon),
    Nemesis: A.norm(day ? asc + fortune - b.Saturn.lon : asc + b.Saturn.lon - fortune),
  };
  const birth = ch.date, now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age--;
  const profSign = (A.signOf(asc) + age) % 12, lord = C.RULER[profSign];
  const sectItems = [
    { h: day ? 'Day chart (diurnal)' : 'Night chart (nocturnal)', text: day ? 'The Sun was above the horizon. The Sun leads the sect; Jupiter is the benefic of sect and Saturn the more constructive malefic, while Mars is contrary to sect.' : 'The Sun was below the horizon. The Moon leads the sect; Venus is the benefic of sect and Mars the more constructive malefic, while Saturn is contrary to sect.' },
    { h: `Annual profection: age ${age}`, sub: `house ${age % 12 + 1}, ${A.SIGNS[profSign]}`, text: `This year activates the topics of house ${age % 12 + 1}: ${HOUSE_TEXT[age % 12]}. Lord of the year: ${lord}, currently in ${A.SIGNS[b[lord].sign]} in your ${b[lord].house}th house. Transits to and by ${lord} are especially significant this year.` },
  ];
  const condRows = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].map((n) => {
    const s = b[n].sign, el = SIGN_TEXT[s].el, tri = TRIPLICITY[el][day ? 0 : 1];
    return h('tr', null, h('td', null, n), h('td', null, A.SIGN_ABBR[s] + ' ' + Math.floor(b[n].deg)), h('td', null, C.dignity(n, s) || '-'), h('td', null, tri === n ? 'yes' : ''), h('td', null, boundLord(b[n].lon) === n ? 'yes' : boundLord(b[n].lon)), h('td', null, String(b[n].house)));
  });
  const lotItems = Object.entries(L).map(([k, v]) => ({ h: `Lot of ${k}`, sub: `${pos(v)}, house ${A.houseOf(v, ch.houses.cusps)}`, text: `Signifies ${LOTS[k]}. Its ruler is ${C.RULER[A.signOf(v)]}.` }));
  root.append(intro('Hellenistic astrology (roughly 1st century BCE to 7th century CE) uses whole-sign houses, sect, the seven visible planets, essential dignity, lots and time-lord techniques such as annual profections.'),
    renderItems(sectItems),
    section('Planetary condition', h('div', { class: 'scroll-x' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ...['Planet', 'Sign', 'Dignity', 'Triplicity', 'Bound', 'House'].map((x) => h('th', null, x)))), h('tbody', null, condRows))),
      note('Bounds are the Egyptian terms. "Bound" shows the planet ruling the degree; "yes" means the planet is in its own bound.')),
    section('Lots', renderItems(lotItems)),
    saveBar(() => ({ tool: 'hellenistic', title: 'Hellenistic chart', items: [...sectItems, ...lotItems] })));
  store.saveResult('hellenistic', { profectionHouse: age % 12 + 1, lord });
}

// ---------- Other lenses ----------
export function lenses(root, ctx) {
  if (!requireBirth(root, ctx)) return;
  const ch = natalChart(ctx, { zodiac: 'tropical' });
  const b = ch.bodies;
  const node = b.Node.lon;
  const drac = A.PLANETS.filter((n) => n !== 'Node').map((n) => [n, A.norm(b[n].lon - node)]);
  const elong = A.norm(b.Moon.lon - b.Sun.lon);
  const lt = LUNATION_TYPES[Math.floor(elong / 45)];
  const evo = [
    { h: `Pluto in ${A.SIGNS[b.Pluto.sign]}${b.Pluto.house ? ', house ' + b.Pluto.house : ''}`, text: `In evolutionary astrology, Pluto describes the soul's deepest desires and past patterns of security. Its house shows where intensity and transformation concentrate: ${b.Pluto.house ? HOUSE_TEXT[b.Pluto.house - 1] : 'add a birth time for the house'}.` },
    { h: `South Node in ${A.SIGNS[b.SouthNode.sign]}`, text: `Familiar ground: ${SIGN_TEXT[b.SouthNode.sign].kw}. Comfortable, but over-relied upon it becomes ${SIGN_TEXT[b.SouthNode.sign].shadow}.` },
    { h: `North Node in ${A.SIGNS[b.Node.sign]}`, text: `The growth edge: developing qualities that are ${SIGN_TEXT[b.Node.sign].kw}.` },
  ];
  const esoteric = ch.houses ? [{ h: `Esoteric ruler: ${ESOTERIC_RULER[A.signOf(ch.houses.asc)]}`, text: `In Alice Bailey's esoteric astrology, the rising sign shows the soul's purpose and is ruled by a different planet than in ordinary astrology. For ${A.SIGNS[A.signOf(ch.houses.asc)]} rising this is ${ESOTERIC_RULER[A.signOf(ch.houses.asc)]}; the ordinary ruler, ${C.RULER[A.signOf(ch.houses.asc)]}, describes the personality.` }] : [{ h: 'Esoteric astrology', text: 'Needs your birth time to find the rising sign.' }];
  const lunar = [
    { h: `Born under a ${lt[0]} Moon`, sub: `${elong.toFixed(0)} degrees from the Sun`, text: lt[1] },
    { h: `Moon in ${A.SIGNS[b.Moon.sign]}`, text: placementText('Moon', b.Moon.sign, b.Moon.house) },
  ];
  const sid = A.norm(b.Sun.lon - A.ayanamsa(ch.jd) - 0.883);
  root.append(
    section('Draconic chart', note('The draconic zodiac starts at the Moon\'s North Node, often read as the soul\'s intention beneath the personality.'),
      h('div', { class: 'scroll-x' }, h('table', { class: 't' }, h('tbody', null, drac.map(([n, l]) => h('tr', null, h('td', null, n), h('td', null, pos(l)))))))),
    section('Evolutionary astrology', renderItems(evo)),
    section('Esoteric astrology', renderItems(esoteric)),
    section('Lunar astrology', renderItems(lunar)),
    section('Sidereal (Western)', h('p', null, `With the Fagan-Bradley ayanamsa, your Sun is in ${sname(sid)} (${pos(sid)}). Sidereal astrology aligns signs with the constellations as they appear today.`)),
    saveBar(() => ({ tool: 'lenses', title: 'Other astrological lenses', items: [...evo, ...esoteric, ...lunar] })));
}

// ---------- Returns and progressions ----------
export function returns(root, ctx) {
  if (!requireBirth(root, ctx)) return;
  const ch = natalChart(ctx, { zodiac: 'tropical' });
  const yr = new Date().getFullYear();
  let year = yr;
  const yearSel = select([yr - 1, yr, yr + 1, yr + 2], year, { onchange: (e) => { year = +e.target.value; draw(); } });
  const body = h('div');
  root.append(intro('A solar return is the moment each year the Sun returns to its exact birth position; its chart describes the year from that birthday. Secondary progressions advance the chart one day for each year of life.'),
    field('Solar return year', yearSel), body);
  function draw() {
    clear(body);
    const natalSun = A.body('Sun', ch.jd).lon;
    const j = A.sunAt(natalSun, A.jd(new Date(Date.UTC(year, ch.date.getUTCMonth(), ch.date.getUTCDate() - 3))));
    const place = ctx.profile.currentPlace || ch.place;
    const sr = C.computeChart(ctx.profile, { jdOverride: j, place, houseSystem: ctx.settings.houses });
    const items = [{ h: `Solar return ${year}`, sub: fmtDateTime(A.fromJd(j)), text: place ? `Cast for ${place.name || 'your location'}.` : 'Add a place for houses.' }];
    if (sr.houses) {
      items.push({ h: `Return Ascendant: ${sname(sr.houses.asc)}`, text: `The year's approach: ${SIGN_TEXT[A.signOf(sr.houses.asc)].style}.` });
      items.push({ h: `Sun in the ${sr.bodies.Sun.house}th house`, text: `The focus of the year: ${HOUSE_TEXT[sr.bodies.Sun.house - 1]}.` });
      items.push({ h: `Moon in ${A.SIGNS[sr.bodies.Moon.sign]}, house ${sr.bodies.Moon.house}`, text: `Emotional needs this year center on ${HOUSE_TEXT[sr.bodies.Moon.house - 1]}.` });
    }
    // progressions
    const ageDays = (A.jd(new Date()) - ch.jd) / 365.2422;
    const pj = ch.jd + ageDays;
    const pS = A.body('Sun', pj).lon, pM = A.body('Moon', pj).lon;
    const pph = A.norm(pM - pS);
    let nextMoonSign = null;
    for (let k = 1; k <= 72; k++) { const l = A.body('Moon', pj + k * 0.5 / 12 * 1).lon; if (A.signOf(l) !== A.signOf(pM)) { nextMoonSign = { sign: A.signOf(l), date: new Date(Date.now() + k * 0.5 / 12 * 365.2422 * 86400000) }; break; } }
    const prog = [
      { h: `Progressed Sun in ${sname(pS)}`, sub: pos(pS), text: `Your evolving identity takes on qualities that are ${SIGN_TEXT[A.signOf(pS)].kw}.` },
      { h: `Progressed Moon in ${sname(pM)}`, sub: pos(pM), text: `For roughly two and a half years, emotional focus is ${SIGN_TEXT[A.signOf(pM)].kw}.${nextMoonSign ? ` It enters ${A.SIGNS[nextMoonSign.sign]} around ${fmtDate(nextMoonSign.date, { year: 'numeric', month: 'long' })}.` : ''}` },
      { h: `Progressed lunation: ${LUNATION_TYPES[Math.floor(pph / 45)][0]}`, text: `A 30-year cycle. ${LUNATION_TYPES[Math.floor(pph / 45)][1]}` },
    ];
    const lr = A.findCrossing((jj) => A.body('Moon', jj).lon, ch.bodies.Moon.lon + ch.ayanamsa, A.jd(new Date()), 0.5, 80);
    if (lr) prog.push({ h: 'Next lunar return', sub: fmtDateTime(A.fromJd(lr)), text: 'The Moon returns to its birth position each month; a good moment to set emotional intentions.' });
    body.append(sr.houses ? wheel(sr) : '', renderItems(items), section('Progressions', renderItems(prog)), saveBar(() => ({ tool: 'returns', title: `Solar return ${year}`, items: [...items, ...prog] })));
  }
  draw();
}

// ---------- Horary / Prashna ----------
function getLocation() {
  return new Promise((res, rej) => {
    if (!navigator.geolocation) return rej(new Error('Location unavailable'));
    navigator.geolocation.getCurrentPosition((p) => res({ lat: p.coords.latitude, lon: p.coords.longitude, name: 'Current location' }), rej, { timeout: 10000, maximumAge: 600000 });
  });
}
function applying(a, b, j) {
  // returns {aspect, orb, applying} for Ptolemaic aspects between bodies a and b
  const A1 = A.body(a, j), B1 = A.body(b, j), A2 = A.body(a, j + 0.1), B2 = A.body(b, j + 0.1);
  for (const asp of [0, 60, 90, 120, 180]) {
    const d1 = Math.abs(A.angDist(A1.lon, B1.lon) - asp), d2 = Math.abs(A.angDist(A2.lon, B2.lon) - asp);
    if (d1 < 8) return { aspect: { 0: 'Conjunction', 60: 'Sextile', 90: 'Square', 120: 'Trine', 180: 'Opposition' }[asp], orb: d1, applying: d2 < d1 };
  }
  return null;
}
function moonVoid(j) {
  const moon = A.body('Moon', j);
  const left = 30 - (moon.lon % 30);
  const hours = left / moon.speed * 24;
  for (const p of ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']) {
    const pl = A.body(p, j).lon;
    for (const asp of [0, 60, 90, 120, 180, 240, 270, 300]) {
      const target = A.norm(pl + asp);
      const ahead = A.norm(target - moon.lon);
      if (ahead > 0.01 && ahead < left) return { void: false, next: p, hours };
    }
  }
  return { void: true, hours };
}
export function horary(root, ctx) {
  let place = ctx.profile.currentPlace || ctx.profile.place || null, house = 7, system = 'western';
  const q = questionBox('Write your question precisely');
  const status = h('p', { class: 'hint' }, place ? `Location: ${place.name || place.lat.toFixed(2) + ', ' + place.lon.toFixed(2)}` : 'No location yet.');
  const out = h('div');
  const houseSel = select(HOUSE_TEXT.map((t, i) => [i + 1, `${i + 1}. ${t}`]), house, { onchange: (e) => (house = +e.target.value) });
  root.append(intro('Horary astrology answers a sincere question with a chart cast for the moment it is asked. Vedic Prashna works the same way in the sidereal zodiac.'),
    seg([['western', 'Western horary'], ['prashna', 'Vedic Prashna']], system, (v) => (system = v)),
    q.el, field('What is the question about?', houseSel), status,
    h('div', { class: 'actions' }, btn('Use my current location', async () => { try { place = await getLocation(); status.textContent = `Location: ${place.lat.toFixed(2)}, ${place.lon.toFixed(2)}`; const p = store.profile(); p.currentPlace = place; store.setProfile(p); } catch { toast('Location permission denied'); } }, 'ghost'),
      btn('Cast the chart now', go, 'primary')), out);
  function go() {
    if (!place) { toast('A location is needed'); return; }
    if (!q.value()) { toast('Write the question first'); return; }
    const j = A.jd(new Date());
    const zodiac = system === 'prashna' ? 'sidereal' : 'tropical';
    const ch = C.computeChart({}, { jdOverride: j, place, zodiac, houseSystem: system === 'prashna' ? 'whole' : 'placidus' });
    const ascSign = A.signOf(ch.houses.asc), ascDeg = ch.houses.asc % 30;
    const items = [];
    if (system === 'western') {
      if (ascDeg < 3) items.push({ h: 'Too early to judge', text: 'The Ascendant is in its first degrees: the matter is not yet developed. Consider asking later.' });
      if (ascDeg > 27) items.push({ h: 'Too late to judge', text: 'The Ascendant is in its final degrees: the matter is already decided or the question is premature.' });
      const v = moonVoid(j);
      if (v.void) items.push({ h: 'Moon void of course', text: `The Moon makes no further aspect before leaving its sign (about ${Math.round(v.hours)} hours). Traditionally, nothing will come of the matter.` });
      const ml = ch.bodies.Moon.lon; if (ml >= 195 && ml <= 225) items.push({ h: 'Moon in the via combusta', text: 'Between 15 Libra and 15 Scorpio: an unsettled, unpredictable situation.' });
      if ([1, 7].includes(ch.bodies.Saturn.house)) items.push({ h: `Saturn in the ${ch.bodies.Saturn.house === 1 ? 'first' : 'seventh'} house`, text: 'A traditional caution: the matter may be burdened or the judgment difficult.' });
      const qsLord = C.RULER[ascSign];
      const qdSign = A.signOf(ch.houses.cusps[house - 1]);
      const qdLord = C.RULER[qdSign];
      items.push({ h: `You are signified by ${qsLord}`, sub: `ruler of ${A.SIGNS[ascSign]} rising`, text: `${qsLord} is in ${A.SIGNS[ch.bodies[qsLord].sign]}, house ${ch.bodies[qsLord].house}. The Moon is your co-significator.` });
      items.push({ h: `The matter is signified by ${qdLord}`, sub: `ruler of house ${house}`, text: `${qdLord} is in ${A.SIGNS[ch.bodies[qdLord].sign]}, house ${ch.bodies[qdLord].house}.` });
      let verdict;
      if (qsLord === qdLord) verdict = 'The same planet rules both: the matter is closely tied to you and likely in your hands.';
      else {
        const a = applying(qsLord, qdLord, j), mA = applying('Moon', qdLord, j);
        if (a && a.applying) verdict = `${qsLord} and ${qdLord} are applying to a ${a.aspect.toLowerCase()} (${a.orb.toFixed(1)} deg). The matter perfects${['Square', 'Opposition'].includes(a.aspect) ? ', but with difficulty' : ''}.`;
        else if (mA && mA.applying) verdict = `The Moon applies to a ${mA.aspect.toLowerCase()} with ${qdLord}: the matter can come about${['Square', 'Opposition'].includes(mA.aspect) ? ' after obstacles' : ''}.`;
        else if (a) verdict = `${qsLord} and ${qdLord} are separating from a ${a.aspect.toLowerCase()}: the opportunity may have passed.`;
        else verdict = 'The significators make no applying aspect: the matter is unlikely to perfect on its own.';
      }
      items.push({ h: 'Judgment', text: verdict });
    } else {
      const lagnaLord = C.RULER[ascSign];
      const ll = ch.bodies[lagnaLord];
      const kendra = [1, 4, 7, 10].includes(ll.house), trikona = [1, 5, 9].includes(ll.house), dusthana = [6, 8, 12].includes(ll.house);
      const dig = C.dignity(lagnaLord, ll.sign);
      const nk = nakshatra(ch.bodies.Moon.lon);
      let score = (kendra ? 1 : 0) + (trikona ? 1 : 0) - (dusthana ? 1 : 0) + (['Domicile', 'Exaltation'].includes(dig) ? 1 : 0) - (['Fall', 'Detriment'].includes(dig) ? 1 : 0) + (ch.bodies.Moon.house && [6, 8, 12].includes(ch.bodies.Moon.house) ? -1 : 0);
      items.push({ h: `Prashna lagna: ${A.SIGNS[ascSign]}`, text: `Lagna lord ${lagnaLord} sits in house ${ll.house}${dig ? ' in ' + dig.toLowerCase() : ''}.` });
      items.push({ h: `Moon in ${nk.data[0]}`, text: `The nakshatra of ${nk.data[3]} colors the question.` });
      items.push({ h: 'Indication', text: score >= 2 ? 'Favorable: a strong lagna lord well placed supports success.' : score <= -1 ? 'Unfavorable for now: the lagna lord is weak or hidden. Wait and ask again.' : 'Mixed: success depends on effort and timing.' });
    }
    clear(out);
    out.append(wheel(ch), h('p', { class: 'hint', style: { textAlign: 'center' } }, fmtDateTime(new Date())), renderItems(items), saveBar(() => ({ tool: 'horary', title: system === 'prashna' ? 'Prashna' : 'Horary', question: q.value(), items })));
  }
}

// ---------- Electional ----------
const PURPOSES = {
  launch: { name: 'Start a project or business', signs: [0, 4, 9, 1], day: ['Sun', 'Jupiter'], avoid: ['Mercury', 'Mars'] },
  love: { name: 'A date, proposal or wedding', signs: [1, 6, 3, 11], day: ['Venus', 'Moon'], avoid: ['Venus'] },
  contract: { name: 'Sign a contract', signs: [2, 5, 6, 9], day: ['Mercury', 'Jupiter'], avoid: ['Mercury'] },
  travel: { name: 'Travel', signs: [8, 2, 10, 0], day: ['Mercury', 'Moon'], avoid: ['Mercury'] },
  creative: { name: 'Begin creative work', signs: [4, 6, 11, 1], day: ['Venus', 'Sun'], avoid: ['Venus'] },
  move: { name: 'Move home', signs: [3, 1, 9, 5], day: ['Moon', 'Saturn'], avoid: ['Mercury', 'Mars'] },
  money: { name: 'Money matters, investing', signs: [1, 9, 5, 7], day: ['Jupiter', 'Venus'], avoid: ['Mercury'] },
};
const WEEK = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
export function electional(root) {
  let purpose = 'launch';
  const out = h('div');
  root.append(intro('Electional astrology chooses a favorable moment to begin something. This scan of the next 60 days weighs the waxing Moon, the Moon\'s sign and aspects, retrogrades, eclipses and the planetary day.'),
    field('Purpose', select(Object.entries(PURPOSES).map(([k, v]) => [k, v.name]), purpose, { onchange: (e) => (purpose = e.target.value) })),
    h('div', { class: 'actions' }, btn('Find good days', go, 'primary')), out);
  function go() {
    const P = PURPOSES[purpose];
    const start = new Date(); start.setHours(10, 0, 0, 0);
    const ecl = A.lunations(A.jd(start), 70).filter((l) => l.eclipse).map((l) => l.jd);
    const days = [];
    for (let k = 1; k <= 60; k++) {
      const d = new Date(start.getTime() + k * 86400000), j = A.jd(d);
      let score = 0; const why = [];
      const ph = A.moonPhase(j);
      if (ph.waxing) { score += 2; why.push('waxing Moon'); } else { score -= 1; }
      const ms = A.signOf(A.body('Moon', j).lon);
      if (P.signs.includes(ms)) { score += 2; why.push(`Moon in ${A.SIGNS[ms]}`); }
      for (const p of P.avoid) if (A.body(p, j).retro) { score -= 3; why.push(`${p} retrograde (caution)`); }
      if (WEEK[d.getDay()] && P.day.includes(WEEK[d.getDay()])) { score += 1; why.push(`${WEEK[d.getDay()]}'s day`); }
      for (const p of ['Venus', 'Jupiter']) { const a = applying('Moon', p, j); if (a && a.applying && ['Trine', 'Sextile', 'Conjunction'].includes(a.aspect)) { score += 1.5; why.push(`Moon ${a.aspect.toLowerCase()} ${p}`); } }
      for (const p of ['Mars', 'Saturn']) { const a = applying('Moon', p, j); if (a && a.applying && ['Square', 'Opposition', 'Conjunction'].includes(a.aspect)) { score -= 1.5; why.push(`Moon ${a.aspect.toLowerCase()} ${p} (caution)`); } }
      if (moonVoid(j).void) { score -= 2; why.push('Moon void of course at 10am'); }
      if (ecl.some((e) => Math.abs(e - j) < 3)) { score -= 3; why.push('near an eclipse'); }
      days.push({ d, score, why });
    }
    const best = days.slice().sort((a, b) => b.score - a.score).slice(0, 8).sort((a, b) => a.d - b.d);
    const items = best.map((x) => ({ h: fmtDate(x.d, { weekday: 'long', month: 'long', day: 'numeric' }), sub: `score ${x.score.toFixed(1)}`, text: x.why.join(', ') + '.' }));
    clear(out);
    out.append(note('Evaluated at 10am each day. For an important election, refine the hour so a benefic rises or culminates.'), renderItems(items), saveBar(() => ({ tool: 'electional', title: `Electional: ${P.name}`, items })));
  }
}

// ---------- Relocation ----------
export function relocation(root, ctx) {
  if (!requireBirth(root, ctx)) return;
  const ch = natalChart(ctx, { zodiac: 'tropical' });
  if (!ch.timeKnown) { root.append(note('Astrocartography needs an accurate birth time.')); return; }
  const j = ch.jd, eps = A.obliquity(j), gm = A.gmst(j);
  const raOf = (lon) => A.norm(Math.atan2(Math.sin(lon * Math.PI / 180) * Math.cos(eps * Math.PI / 180), Math.cos(lon * Math.PI / 180)) * 180 / Math.PI);
  const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const MEANING = { Sun: 'visibility, vitality, recognition', Moon: 'home, belonging, emotional ease', Mercury: 'communication, learning, trade', Venus: 'love, beauty, pleasure, money', Mars: 'drive, competition, conflict', Jupiter: 'luck, growth, generosity', Saturn: 'hard work, structure, isolation', Uranus: 'freedom, surprise, instability', Neptune: 'inspiration, spirituality, confusion', Pluto: 'intensity, power, transformation' };
  const ANGLE = { MC: 'career and public life', IC: 'home and roots', ASC: 'self and body', DSC: 'relationships' };
  const byCity = [];
  for (const city of CITIES) {
    const hs = A.houses(j, city.lat, city.lon, 'equal');
    const hits = [];
    for (const p of planets) {
      const l = ch.bodies[p].lon;
      for (const [an, al] of [['ASC', hs.asc], ['DSC', A.norm(hs.asc + 180)], ['MC', hs.mc], ['IC', A.norm(hs.mc + 180)]]) if (A.angDist(l, al) < 3) hits.push({ p, an, orb: A.angDist(l, al) });
    }
    if (hits.length) byCity.push({ city, hits });
  }
  const mcLines = planets.map((p) => { let lon = A.norm(raOf(ch.bodies[p].lon) - gm); if (lon > 180) lon -= 360; return { p, lon }; });
  const items = byCity.map(({ city, hits }) => ({ h: city.name, text: hits.map((x) => `${x.p} on the ${x.an} (${ANGLE[x.an]}): ${MEANING[x.p]}`).join('. ') + '.' }));
  root.append(intro('Astrocartography shows where on Earth each planet was rising, setting or culminating at your birth. Near those lines, that planet\'s themes are said to become louder in your life.'),
    section('Cities on your lines', note(`From ${CITIES.length} world cities; within 3 degrees of an angle.`), items.length ? renderItems(items) : h('p', { class: 'muted' }, 'No listed cities fall on a planetary angle.')),
    section('Midheaven lines', note('The longitude where each planet sat on the Midheaven. The line runs north to south along it.'),
      h('div', { class: 'scroll-x' }, h('table', { class: 't' }, h('tbody', null, mcLines.map((m) => h('tr', null, h('td', null, m.p), h('td', null, `${Math.abs(m.lon).toFixed(1)} deg ${m.lon >= 0 ? 'E' : 'W'}`), h('td', { class: 'muted' }, MEANING[m.p]))))))),
    note('A full world map with curved rising and setting lines is a good candidate for a later version.'),
    saveBar(() => ({ tool: 'relocation', title: 'Astrocartography', items })));
}

// ---------- Compatibility ----------
const LP_GROUPS = [[1, 5, 7], [2, 4, 8], [3, 6, 9]];
export function synastry(root, ctx) {
  const p = ctx.profile;
  const nameB = input({ placeholder: 'Their name (optional)' });
  const dateA = input({ type: 'date', value: p.date || '' });
  const dateB = input({ type: 'date' });
  const timeB = input({ type: 'time' });
  const out = h('div');
  root.append(intro('Compare two people across astrology, numerology and the Chinese zodiac. Birth times are optional; without them the Moon is approximate.'),
    field('Your birth date', dateA), field('Their name', nameB), h('div', { class: 'row' }, field('Their birth date', dateB), field('Their birth time', timeB)),
    h('div', { class: 'actions' }, btn('Compare', go, 'primary')), out);
  function go() {
    if (!dateA.value || !dateB.value) { toast('Both birth dates are needed'); return; }
    const pa = dateA.value === p.date ? p : { date: dateA.value };
    const pb = { date: dateB.value, time: timeB.value, tz: p.tz };
    const ca = C.computeChart(pa, {}), cb = C.computeChart(pb, {});
    const names = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
    const asp = C.aspectsBetween(names.map((n) => ca.bodies[n]), names.map((n) => cb.bodies[n]), false, 0.75);
    let harmony = 0;
    asp.forEach((a) => { harmony += a.nature === 'flow' ? 1 : a.nature === 'tension' ? -0.6 : a.aspect === 'Conjunction' ? 0.8 : 0; });
    const key = asp.filter((a) => ['Sun', 'Moon', 'Venus', 'Mars'].includes(a.a) && ['Sun', 'Moon', 'Venus', 'Mars'].includes(a.b)).slice(0, 8);
    const B = nameB.value.trim() || 'Them';
    const el = (s) => SIGN_TEXT[s].el;
    const elRel = (x, y) => x === y ? 'the same element: instant understanding' : ([['Fire', 'Air'], ['Earth', 'Water']].some(([m, n]) => (x === m && y === n) || (x === n && y === m))) ? 'compatible elements that feed each other' : 'different elements that need translation';
    const lpa = reduce(lifePath(dateA.value).value, false), lpb = reduce(lifePath(dateB.value).value, false);
    const lpRel = lpa === lpb ? 'the same life path: shared lessons' : LP_GROUPS.some((g) => g.includes(lpa) && g.includes(lpb)) ? 'naturally harmonious numbers' : 'complementary numbers that challenge each other';
    const [ya, ma, da] = dateA.value.split('-').map(Number), [yb, mb, db] = dateB.value.split('-').map(Number);
    const za = zodiacYear(ya, ma, da), zb = zodiacYear(yb, mb, db);
    const items = [
      { h: 'Overall harmony', sub: `${asp.length} cross-aspects`, text: harmony > 3 ? 'Strongly harmonious: many easy connections.' : harmony > 0 ? 'Generally harmonious, with some growth points.' : harmony > -2 ? 'A dynamic mix of ease and friction.' : 'Challenging but magnetic: friction drives growth.' },
      { h: `Sun ${A.SIGN_ABBR[ca.bodies.Sun.sign]} and Sun ${A.SIGN_ABBR[cb.bodies.Sun.sign]}`, text: `${cap(elRel(el(ca.bodies.Sun.sign), el(cb.bodies.Sun.sign)))}.` },
      { h: `Moon ${A.SIGN_ABBR[ca.bodies.Moon.sign]} and Moon ${A.SIGN_ABBR[cb.bodies.Moon.sign]}`, text: `Emotionally, ${elRel(el(ca.bodies.Moon.sign), el(cb.bodies.Moon.sign))}.` },
      { h: `Venus ${A.SIGN_ABBR[ca.bodies.Venus.sign]} and Mars ${A.SIGN_ABBR[cb.bodies.Mars.sign]}`, text: `Attraction: ${elRel(el(ca.bodies.Venus.sign), el(cb.bodies.Mars.sign))}.` },
      ...key.map((a) => ({ h: `Your ${a.a} ${a.aspect.toLowerCase()} ${B === 'Them' ? 'their' : B + "'s"} ${a.b}`, sub: `orb ${a.orb.toFixed(1)}`, text: `${cap(PLANET_TEXT[a.a].kw)} meets ${PLANET_TEXT[a.b].kw}; they ${ASPECT_TEXT[a.aspect]}.` })),
      { h: `Life paths ${lpa} and ${lpb}`, text: cap(lpRel) + '.' },
      { h: `${ANIMALS[za.branch]} and ${ANIMALS[zb.branch]}`, text: branchRelation(za.branch, zb.branch) },
    ];
    clear(out);
    out.append(renderItems(items), saveBar(() => ({ tool: 'synastry', title: `Compatibility with ${B}`, items })));
  }
}

// ---------- Sky now ----------
export function sky(root, ctx) {
  const j = A.jd(new Date());
  const ps = A.positions(j);
  const ph = A.moonPhase(j);
  const v = moonVoid(j);
  const place = ctx.profile.currentPlace || ctx.profile.place;
  const rows = A.PLANETS.map((n) => h('tr', null, h('td', null, `${G(n)} ${n === 'Node' ? 'North Node' : n}`), h('td', null, pos(ps[n].lon)), h('td', null, ps[n].retro ? 'retrograde' : '')));
  const els = [intro('The sky right now, geocentric and tropical.'),
    kv([['Moon phase', `${ph.name}, ${Math.round(ph.illum * 100)}% lit`], ['Moon', `${sname(ps.Moon.lon)}${v.void ? ', void of course' : ''}`], ['Moon changes sign', `in about ${Math.round(v.hours)} hours`]]),
    h('div', { class: 'scroll-x', style: { marginTop: '16px' } }, h('table', { class: 't' }, h('tbody', null, rows)))];
  if (place) {
    const hs = A.houses(j, place.lat, place.lon, 'placidus');
    els.push(kv([['Rising now', pos(hs.asc)], ['Culminating', pos(hs.mc)]]));
    import('../core/calendars.js').then(({ planetaryHours }) => {
      const ph2 = planetaryHours(new Date(), place.lat, place.lon);
      if (!ph2) return;
      const nowJ = A.jd(new Date());
      const cur = ph2.hours.find((x) => nowJ >= x.start && nowJ < x.end);
      root.append(section('Planetary hours', kv([['Day ruler', ph2.ruler], ['Current hour', cur ? cur.planet : 'before sunrise'], ['Sunrise', fmtDateTime(A.fromJd(ph2.sunrise))], ['Sunset', fmtDateTime(A.fromJd(ph2.sunset))]]),
        h('div', { class: 'scroll-x' }, h('table', { class: 't' }, h('tbody', null, ph2.hours.map((x) => h('tr', { style: x === cur ? { fontWeight: 600 } : {} }, h('td', null, new Date(A.fromJd(x.start)).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })), h('td', null, x.planet), h('td', { class: 'muted' }, x.day ? 'day' : 'night'))))))));
    });
  } else els.push(note('Add a place in your profile, or use current location in Horary, to see rising signs and planetary hours.'));
  root.append(...els);
}
