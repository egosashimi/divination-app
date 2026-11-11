import { h, clear, section, intro, note, renderItems, saveBar, needProfile, fmtDate, kv } from '../core/ui.js';
import * as A from '../core/astro.js';
import * as C from '../core/chart.js';
import * as N from '../core/numerology.js';
import * as Z from '../core/chinese.js';
import * as store from '../core/store.js';
import { PERSONAL_YEAR, NUMBER } from '../data/lexicon.js';
import { PLANET_TEXT, TRANSIT_TEXT, HOUSE_TEXT } from '../data/astro-text.js';

const YEAR = 365.2422;
const CYCLE_TEXT = {
  'Jupiter return': 'A twelve-year renewal of growth, faith and opportunity. A good time to begin a new chapter.',
  'Saturn square': 'A test of the structures you are building; pressure that clarifies commitments.',
  'Saturn opposition': 'A halfway reckoning in the Saturn cycle; others mirror what needs to mature.',
  'Saturn return': 'The great coming-of-age. Responsibility, adulthood and a review of the life you have built.',
  'Uranus square': 'Restlessness and the urge to break free; a call to individuality.',
  'Uranus opposition': 'The midlife awakening: what has been suppressed asks to live.',
  'Neptune square': 'Disillusionment and new ideals; a softening of ambition toward meaning.',
  'Pluto square': 'Deep transformation of power and identity.',
  'Chiron return': 'Around age fifty: the old wound becomes the source of your wisdom and teaching.',
  'Nodal return': 'Every 18.6 years: destiny-like turning points, realignment with your path.',
  'Nodal reversal': 'Halfway in the nodal cycle: release the past, reorient toward growth.',
};

export function lifeEvents(ch, years = 95) {
  const j0 = ch.jd, days = years * YEAR;
  const tropical = (n) => A.body(n, ch.jd).lon;
  const ev = [];
  const add = (name, planet, offset, step = 4, minAge = 1) => {
    for (const j of A.passes(planet, A.norm(tropical(planet) + offset), j0 + 200, days, step)) {
      const age = (j - j0) / YEAR;
      if (age >= minAge) ev.push({ name, jd: j, age });
    }
  };
  add('Jupiter return', 'Jupiter', 0, 3);
  add('Saturn square', 'Saturn', 90); add('Saturn square', 'Saturn', -90); add('Saturn opposition', 'Saturn', 180); add('Saturn return', 'Saturn', 0, 4, 20);
  add('Uranus square', 'Uranus', 90, 5); add('Uranus square', 'Uranus', -90, 5); add('Uranus opposition', 'Uranus', 180, 5);
  add('Neptune square', 'Neptune', 90, 6); add('Neptune square', 'Neptune', -90, 6);
  add('Pluto square', 'Pluto', 90, 6); add('Pluto square', 'Pluto', -90, 6);
  add('Chiron return', 'Chiron', 0, 5, 30);
  add('Nodal return', 'Node', 0, 3, 10); add('Nodal reversal', 'Node', 180, 3, 5);
  // collapse retrograde triple passes within 400 days into one window
  ev.sort((a, b) => a.jd - b.jd);
  const out = [];
  for (const e of ev) {
    const prev = out.find((x) => x.name === e.name && e.jd - x.end < 400);
    if (prev) prev.end = e.jd; else out.push({ ...e, end: e.jd });
  }
  return out;
}

export function lifecycles(root, ctx) {
  const p = ctx.profile;
  if (!C.hasBirth(p)) { needProfile(root); return; }
  const ch = C.computeChart(p, { zodiac: 'tropical' });
  const now = A.jd(new Date());
  const ev = lifeEvents(ch);
  const next = ev.filter((e) => e.end >= now).slice(0, 4);
  const age = (now - ch.jd) / YEAR;
  const items = ev.map((e) => ({
    h: `${e.name}`, sub: `age ${Math.floor(e.age)}${e.end - e.jd > 30 ? ` (${fmtDate(A.fromJd(e.jd), { year: 'numeric', month: 'short' })} to ${fmtDate(A.fromJd(e.end), { year: 'numeric', month: 'short' })})` : ` (${fmtDate(A.fromJd(e.jd), { year: 'numeric', month: 'short' })})`}${e.end < now ? '' : e === next[0] ? ' - next' : ''}`,
    text: CYCLE_TEXT[e.name],
  }));
  const seven = Math.floor(age / 7);
  root.append(intro('Planetary cycles mark the developmental milestones of a life: returns, squares and oppositions of the slow planets to their own birth positions.'),
    section('Coming up', renderItems(next.map((e) => ({ h: e.name, sub: `${fmtDate(A.fromJd(e.jd))}, age ${Math.floor(e.age)}`, text: CYCLE_TEXT[e.name] })))),
    section('Seven-year cycles', h('p', null, `You are in your ${ordinal(seven + 1)} seven-year cycle (ages ${seven * 7} to ${seven * 7 + 7}). Many traditions, from Solon to Steiner, mark life in sevens; each brings a new emphasis.`)),
    section('Your whole timeline', renderItems(items)),
    saveBar(() => ({ tool: 'lifecycles', title: 'Life cycles', items })));
  store.saveResult('lifecycles', { next: next.map((e) => `${e.name} ${A.fromJd(e.jd).getFullYear()}`) });
}
const ordinal = (n) => n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th');

export function retroList(j0, days) {
  const out = [];
  for (const p of ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']) {
    const st = A.stations(p, j0 - 1, days);
    const startRetro = A.body(p, j0).retro;
    let open = startRetro ? { p, start: null } : null;
    for (const s of st) {
      if (s.type === 'stations retrograde') open = { p, start: s.jd, lon: s.lon };
      else { out.push({ p, start: open ? open.start : null, end: s.jd, lon: open ? open.lon : null, endLon: s.lon }); open = null; }
    }
    if (open) out.push({ p, start: open.start, end: null, lon: open.lon });
  }
  return out.sort((a, b) => (a.start ?? j0) - (b.start ?? j0));
}

export function retrogrades(root) {
  const j0 = A.jd(new Date());
  const rs = retroList(j0, 365);
  const ecl = A.lunations(j0, 365).filter((x) => x.eclipse);
  const MEAN = { Mercury: 'Review communication, contracts and travel plans; reconnect, revise, reflect.', Venus: 'Revisit relationships and values; old loves and old tastes return.', Mars: 'Rethink actions and anger; redo rather than start.', Jupiter: 'Inner growth over outer expansion.', Saturn: 'Review responsibilities and structures.', Uranus: 'Inner revolution; quiet rethinking of freedom.', Neptune: 'Illusions clarify; dreams turn inward.', Pluto: 'Deep inner transformation and examination of power.' };
  root.append(intro('A planet appears retrograde when Earth overtakes it, or it overtakes Earth. Astrologically these are periods of review and inner work for that planet\'s themes.'),
    section('Retrograde periods, next twelve months', renderItems(rs.map((r) => ({ h: `${r.p} retrograde`, sub: `${r.start ? fmtDate(A.fromJd(r.start)) : 'already retrograde'} to ${r.end ? fmtDate(A.fromJd(r.end)) : 'beyond this window'}${r.lon != null ? `, from ${A.fmtDeg(r.lon)}` : ''}`, text: MEAN[r.p] })))),
    section('Eclipses', note('Eclipse dates are computed from lunations close to the lunar nodes; types (total, partial, penumbral) are not distinguished.'),
      renderItems(ecl.map((e) => ({ h: e.eclipse, sub: fmtDate(A.fromJd(e.jd)), text: `In ${A.SIGNS[A.signOf(e.moonLon)]}. Eclipses mark accelerated change around the themes of the houses they fall in.` })))));
}

export function yearahead(root, ctx) {
  const p = ctx.profile;
  if (!C.hasBirth(p)) { needProfile(root); return; }
  const ch = C.computeChart(p, { zodiac: 'tropical' });
  const now = new Date(), j0 = A.jd(now);
  const py = N.personalYear(p.date);
  const tr = C.upcomingTransits(ch, j0, 365);
  const ecl = A.lunations(j0, 365).filter((x) => x.eclipse);
  const rs = retroList(j0, 365).filter((r) => ['Mercury', 'Venus', 'Mars'].includes(r.p));
  const cy = Z.zodiacYear(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const myZ = Z.zodiacYear(...p.date.split('-').map(Number));
  const birth = ch.date;
  let age = now.getFullYear() - birth.getFullYear(); if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age--;
  const prof = ch.houses ? { house: age % 12 + 1, lord: C.RULER[(A.signOf(ch.houses.asc) + age) % 12] } : null;
  const overview = [
    { h: `Personal year ${py}`, text: PERSONAL_YEAR[py] },
    prof ? { h: `Profected to the ${prof.house}th house`, text: `Hellenistic annual profection: the year highlights ${HOUSE_TEXT[prof.house - 1]}, with ${prof.lord} as lord of the year.` } : null,
    { h: `Chinese year of the ${Z.stemElement(cy.stem)} ${Z.ANIMALS[cy.branch]}`, text: Z.branchRelation(myZ.branch, cy.branch) },
  ].filter(Boolean);
  const big = tr.filter((t) => ['Saturn', 'Uranus', 'Neptune', 'Pluto', 'Jupiter'].includes(t.transit));
  const months = [];
  for (let k = 0; k < 12; k++) {
    const ms = new Date(now.getFullYear(), now.getMonth() + k, 1), me = new Date(now.getFullYear(), now.getMonth() + k + 1, 1);
    const a = A.jd(ms), b = A.jd(me);
    const lines = [];
    const pm = N.reduce(N.personalYear(p.date, ms.getFullYear()) + ms.getMonth() + 1, false);
    lines.push(`Personal month ${pm}: ${NUMBER[pm].kw}.`);
    A.lunations(a, b - a).filter((l) => l.name === 'New Moon' || l.name === 'Full Moon' || l.eclipse).forEach((l) => lines.push(`${l.eclipse || l.name} in ${A.SIGNS[A.signOf(l.moonLon)]} (${fmtDate(A.fromJd(l.jd), { month: 'short', day: 'numeric' })})${ch.houses ? `, your ${A.houseOf(l.moonLon, ch.houses.cusps)}th house` : ''}.`));
    tr.filter((t) => t.jd >= a && t.jd < b).forEach((t) => lines.push(`${t.transit} ${t.aspect.toLowerCase()} natal ${t.natal}.`));
    rs.forEach((r) => { if (r.start && r.start >= a && r.start < b) lines.push(`${r.p} turns retrograde.`); if (r.end && r.end >= a && r.end < b) lines.push(`${r.p} turns direct.`); });
    months.push({ h: ms.toLocaleString(undefined, { month: 'long', year: 'numeric' }), text: lines.join(' ') });
  }
  const majors = big.slice(0, 12).map((t) => ({ h: `${t.transit} ${t.aspect.toLowerCase()} ${t.natal}`, sub: fmtDate(A.fromJd(t.jd)), text: `${t.transit} ${TRANSIT_TEXT[t.transit]} your ${PLANET_TEXT[t.natal].kw}.` }));
  root.append(intro('Your next twelve months, combining numerology, astrology and the Chinese calendar.'),
    renderItems(overview), section('Major transits', majors.length ? renderItems(majors) : h('p', { class: 'muted' }, 'No major outer-planet hits this year: a steadier period.')),
    section('Eclipses', renderItems(ecl.map((e) => ({ h: e.eclipse, sub: fmtDate(A.fromJd(e.jd)), text: `In ${A.SIGNS[A.signOf(e.moonLon)]}${ch.houses ? `, activating your ${A.houseOf(e.moonLon, ch.houses.cusps)}th house: ${HOUSE_TEXT[A.houseOf(e.moonLon, ch.houses.cusps) - 1]}` : ''}.` })))),
    section('Month by month', renderItems(months)),
    saveBar(() => ({ tool: 'yearahead', title: 'Year ahead', items: [...overview, ...majors, ...months] })));
}
