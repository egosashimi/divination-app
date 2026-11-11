import * as A from './astro.js';

const jdnOf = (y, m, d) => Math.floor(Date.UTC(y, m - 1, d) / 86400000 + 2440588);

export const TZ_SIGNS = ['Imix', 'Ik', 'Akbal', 'Kan', 'Chicchan', 'Cimi', 'Manik', 'Lamat', 'Muluc', 'Oc', 'Chuen', 'Eb', 'Ben', 'Ix', 'Men', 'Cib', 'Caban', 'Etznab', 'Cauac', 'Ahau'];
export const HAAB = ['Pop', 'Wo', 'Sip', 'Sotz', 'Sek', 'Xul', 'Yaxkin', 'Mol', 'Chen', 'Yax', 'Sak', 'Keh', 'Mak', 'Kankin', 'Muwan', 'Pax', 'Kayab', 'Kumku', 'Wayeb'];
export function maya(y, m, d) {
  const days = jdnOf(y, m, d) - 584283;
  const num = ((((days + 3) % 13) + 13) % 13) + 1;
  const sign = (((days + 19) % 20) + 20) % 20;
  const h = (((days + 348) % 365) + 365) % 365;
  let r = days; const lc = [];
  for (const u of [144000, 7200, 360, 20, 1]) { lc.push(Math.floor(r / u)); r %= u; }
  return { number: num, sign, haabDay: h % 20, haabMonth: Math.floor(h / 20), longCount: lc.join('.'), kin: ((num - 1) * 40 + sign) % 260 };
}
// Kin number 1..260 in the 260-day count, from number and sign.
export function kinIndex(num, sign) { for (let k = 0; k < 260; k++) if (k % 13 === num - 1 && k % 20 === sign) return k + 1; }

export const CELTIC_TREES = [
  ['Birch', [12, 24], [1, 20]], ['Rowan', [1, 21], [2, 17]], ['Ash', [2, 18], [3, 17]], ['Alder', [3, 18], [4, 14]],
  ['Willow', [4, 15], [5, 12]], ['Hawthorn', [5, 13], [6, 9]], ['Oak', [6, 10], [7, 7]], ['Holly', [7, 8], [8, 4]],
  ['Hazel', [8, 5], [9, 1]], ['Vine', [9, 2], [9, 29]], ['Ivy', [9, 30], [10, 27]], ['Reed', [10, 28], [11, 24]], ['Elder', [11, 25], [12, 23]],
];
export function celticTree(m, d) {
  const v = m * 100 + d;
  for (const [name, [m1, d1], [m2, d2]] of CELTIC_TREES) {
    const a = m1 * 100 + d1, b = m2 * 100 + d2;
    if (a <= b ? v >= a && v <= b : v >= a || v <= b) return name;
  }
  return 'Birch';
}

export const FESTIVALS = [
  { name: 'Ostara', lon: 0, kind: 'Spring equinox', trad: 'Mar 20-21' },
  { name: 'Beltane', lon: 45, kind: 'Cross-quarter', trad: 'May 1' },
  { name: 'Litha', lon: 90, kind: 'Summer solstice', trad: 'Jun 20-21' },
  { name: 'Lughnasadh', lon: 135, kind: 'Cross-quarter', trad: 'Aug 1' },
  { name: 'Mabon', lon: 180, kind: 'Autumn equinox', trad: 'Sep 22-23' },
  { name: 'Samhain', lon: 225, kind: 'Cross-quarter', trad: 'Oct 31' },
  { name: 'Yule', lon: 270, kind: 'Winter solstice', trad: 'Dec 21-22' },
  { name: 'Imbolc', lon: 315, kind: 'Cross-quarter', trad: 'Feb 1' },
];
// Returns upcoming festivals; southern hemisphere shifts the seasonal meaning by 180 degrees.
export function wheel(j0, southern = false, count = 8) {
  const out = [];
  for (const f of FESTIVALS) {
    const lon = southern ? A.norm(f.lon + 180) : f.lon;
    out.push({ ...f, jd: A.sunAt(lon, j0) });
  }
  return out.sort((a, b) => a.jd - b.jd).slice(0, count);
}

// Planetary day rulers (Sunday = Sun)
export const DAY_RULERS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const CHALDEAN_ORDER = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
export function planetaryHours(date, lat, lon) {
  const mid = A.jd(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())));
  const t = A.sunTimes(mid, lat, lon), t2 = A.sunTimes(mid + 1, lat, lon);
  if (!t || !t2) return null;
  const ruler = DAY_RULERS[date.getDay()];
  let idx = CHALDEAN_ORDER.indexOf(ruler);
  const hours = [];
  const dayLen = (t.set - t.rise) / 12, nightLen = (t2.rise - t.set) / 12;
  for (let i = 0; i < 24; i++) {
    const start = i < 12 ? t.rise + i * dayLen : t.set + (i - 12) * nightLen;
    hours.push({ planet: CHALDEAN_ORDER[(idx + i) % 7], start, end: start + (i < 12 ? dayLen : nightLen), day: i < 12 });
  }
  return { ruler, hours, sunrise: t.rise, sunset: t.set };
}
