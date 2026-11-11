import * as A from './astro.js';

export const ASPECTS = [
  { name: 'Conjunction', angle: 0, orb: 8, nature: 'fusion' },
  { name: 'Opposition', angle: 180, orb: 8, nature: 'tension' },
  { name: 'Trine', angle: 120, orb: 7, nature: 'flow' },
  { name: 'Square', angle: 90, orb: 7, nature: 'tension' },
  { name: 'Sextile', angle: 60, orb: 5, nature: 'flow' },
  { name: 'Quincunx', angle: 150, orb: 3, nature: 'adjustment' },
];

export function hasBirth(p) { return !!(p && p.date); }
export function hasPlace(p) { return !!(p && p.place && isFinite(p.place.lat) && isFinite(p.place.lon)); }
export function birthDate(p) {
  const [y, m, d] = p.date.split('-').map(Number);
  const [hh, mm] = (p.time || '12:00').split(':').map(Number);
  const tz = p.tz || (p.place && p.place.tz) || Intl.DateTimeFormat().resolvedOptions().timeZone;
  return A.zonedToUtc(y, m, d, hh, mm, tz);
}
export const birthJd = (p) => A.jd(birthDate(p));

export function aspectsBetween(listA, listB, same = true, orbScale = 1) {
  const out = [];
  for (let i = 0; i < listA.length; i++) {
    for (let j = same ? i + 1 : 0; j < listB.length; j++) {
      const a = listA[i], b = listB[j];
      if (same && a.name === b.name) continue;
      if ((a.name === 'Node' && b.name === 'Node')) continue;
      const d = A.angDist(a.lon, b.lon);
      for (const asp of ASPECTS) {
        let orb = asp.orb * orbScale;
        if (['Sun', 'Moon'].includes(a.name) || ['Sun', 'Moon'].includes(b.name)) orb += 1 * orbScale;
        if (['Node', 'Chiron', 'Asc', 'MC'].includes(a.name) || ['Node', 'Chiron', 'Asc', 'MC'].includes(b.name)) orb = Math.min(orb, 4 * orbScale);
        const diff = Math.abs(d - asp.angle);
        if (diff <= orb) { out.push({ a: a.name, b: b.name, aspect: asp.name, nature: asp.nature, orb: diff, exact: d }); break; }
      }
    }
  }
  return out.sort((x, y) => x.orb - y.orb);
}

export function computeChart(p, { zodiac = 'tropical', houseSystem = 'placidus', jdOverride = null, place = null } = {}) {
  const j = jdOverride ?? birthJd(p);
  const pl = place || p.place;
  const timeKnown = jdOverride != null || !!p.time;
  const ay = zodiac === 'sidereal' ? A.ayanamsa(j) : 0;
  const raw = A.positions(j);
  const bodies = {};
  for (const [n, b] of Object.entries(raw)) bodies[n] = { ...b, lon: A.norm(b.lon - ay) };
  bodies.SouthNode = { name: 'SouthNode', lon: A.norm(bodies.Node.lon + 180), speed: 0, retro: false };
  let hs = null;
  if (timeKnown && pl && isFinite(pl.lat)) {
    hs = A.houses(j, pl.lat, pl.lon, houseSystem);
    hs = { ...hs, asc: A.norm(hs.asc - ay), mc: A.norm(hs.mc - ay), cusps: hs.cusps.map((c) => A.norm(c - ay)) };
    for (const b of Object.values(bodies)) b.house = A.houseOf(b.lon, hs.cusps);
  }
  for (const b of Object.values(bodies)) { b.sign = A.signOf(b.lon); b.deg = b.lon % 30; }
  const list = A.PLANETS.map((n) => bodies[n]);
  if (hs) list.push({ name: 'Asc', lon: hs.asc }, { name: 'MC', lon: hs.mc });
  const aspects = aspectsBetween(list, list, true);
  const sun = raw.Sun.lon;
  let isDay = null;
  if (hs) { const hSun = A.houseOf(bodies.Sun.lon, hs.cusps); isDay = hSun >= 7 && hSun <= 12; }
  return { jd: j, date: A.fromJd(j), timeKnown, bodies, houses: hs, aspects, zodiac, ayanamsa: ay, isDay, place: pl, tropicalSun: sun };
}

// Element/modality balance (traditional weights)
export const ELEMENT_OF_SIGN = ['Fire', 'Earth', 'Air', 'Water'];
export const MODE_OF_SIGN = ['Cardinal', 'Fixed', 'Mutable'];
export function balance(chart) {
  const w = { Sun: 3, Moon: 3, Mercury: 2, Venus: 2, Mars: 2, Jupiter: 1, Saturn: 1, Uranus: 0.5, Neptune: 0.5, Pluto: 0.5 };
  const el = { Fire: 0, Earth: 0, Air: 0, Water: 0 }, md = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  for (const [n, wt] of Object.entries(w)) { const s = chart.bodies[n].sign; el[ELEMENT_OF_SIGN[s % 4]] += wt; md[MODE_OF_SIGN[s % 3]] += wt; }
  if (chart.houses) { const s = A.signOf(chart.houses.asc); el[ELEMENT_OF_SIGN[s % 4]] += 3; md[MODE_OF_SIGN[s % 3]] += 3; }
  return { el, md };
}

export const RULER = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
export const MODERN_RULER = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Pluto', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
export const EXALT = { Sun: 0, Moon: 1, Mercury: 5, Venus: 11, Mars: 9, Jupiter: 3, Saturn: 6 };
export function dignity(name, sign) {
  if (!(name in EXALT)) return '';
  if (RULER[sign] === name) return 'Domicile';
  if (RULER[(sign + 6) % 12] === name) return 'Detriment';
  if (EXALT[name] === sign) return 'Exaltation';
  if ((EXALT[name] + 6) % 12 === sign) return 'Fall';
  return '';
}

// Transits of `now` positions to a natal chart.
export function transitsTo(natal, j, names = ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'Node', 'Moon']) {
  const ay = natal.zodiac === 'sidereal' ? A.ayanamsa(j) : 0;
  const tr = names.map((n) => { const b = A.body(n, j); return { ...b, lon: A.norm(b.lon - ay) }; });
  const nat = A.PLANETS.map((n) => natal.bodies[n]);
  if (natal.houses) nat.push({ name: 'Asc', lon: natal.houses.asc }, { name: 'MC', lon: natal.houses.mc });
  const asp = aspectsBetween(tr, nat, false, 0.25).map((x) => ({ ...x, transit: x.a, natal: x.b }));
  return { bodies: tr, aspects: asp };
}

// Find exact transit hits of slow planets to natal points over a window.
export function upcomingTransits(natal, j0, days, planets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'Node']) {
  const points = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].map((n) => ({ name: n, lon: natal.bodies[n].lon }));
  if (natal.houses) points.push({ name: 'Asc', lon: natal.houses.asc }, { name: 'MC', lon: natal.houses.mc });
  const ay0 = natal.zodiac === 'sidereal' ? A.ayanamsa(j0) : 0;
  const out = [];
  for (const tp of planets) for (const pt of points) for (const asp of [0, 90, 180, 120]) {
    const targets = asp === 0 || asp === 180 ? [asp] : [asp, -asp];
    for (const t of targets) {
      const lon = A.norm(pt.lon + t + ay0);
      for (const hit of A.passes(tp, lon, j0, days, tp === 'Jupiter' || tp === 'Node' ? 2 : 4)) {
        out.push({ jd: hit, transit: tp, natal: pt.name, aspect: { 0: 'Conjunction', 90: 'Square', 180: 'Opposition', 120: 'Trine' }[asp] });
      }
    }
  }
  return out.sort((a, b) => a.jd - b.jd);
}
