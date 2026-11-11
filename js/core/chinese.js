import * as A from './astro.js';

export const STEMS = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'];
export const STEMS_HZ = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const BRANCHES = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'];
export const BRANCHES_HZ = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const ANIMALS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
export const ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
export const stemElement = (s) => ELEMENTS[Math.floor(s / 2)];
export const BRANCH_EL = ['Water', 'Earth', 'Wood', 'Wood', 'Earth', 'Fire', 'Fire', 'Earth', 'Metal', 'Metal', 'Earth', 'Water'];
export const polarity = (i) => (i % 2 === 0 ? 'Yang' : 'Yin');
// Hidden stems inside each branch (main qi first)
export const HIDDEN = [[9], [5, 9, 7], [0, 2, 4], [1], [4, 1, 9], [2, 4, 6], [3, 5], [5, 3, 1], [6, 8, 4], [7], [4, 7, 3], [8, 0]];

export const pillar = (i) => ({ i: ((i % 60) + 60) % 60, stem: ((i % 10) + 10) % 10, branch: ((i % 12) + 12) % 12 });
export const pillarName = (p) => `${STEMS[p.stem]} ${BRANCHES[p.branch]}`;
export const pillarHz = (p) => STEMS_HZ[p.stem] + BRANCHES_HZ[p.branch];
export const pillarDesc = (p) => `${polarity(p.stem)} ${stemElement(p.stem)} ${ANIMALS[p.branch]}`;
const fromStemBranch = (s, b) => { for (let i = 0; i < 60; i++) if (i % 10 === s && i % 12 === b) return pillar(i); };

// Local wall-clock components for a UTC date in a zone.
export function localParts(date, tz) {
  const off = A.tzOffsetMinutes(date, tz);
  const t = new Date(date.getTime() + off * 60000);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), h: t.getUTCHours(), mi: t.getUTCMinutes() };
}
const jdn = (y, m, d) => Math.floor(Date.UTC(y, m - 1, d) / 86400000 + 2440587.5 + 0.5);

export function dayPillar(y, m, d) { return pillar(jdn(y, m, d) + 49); }

// Jie (month-starting) solar terms: Sun at 315 + 30k.
export function bazi(dateUtc, tz, sex = '') {
  const j = A.jd(dateUtc);
  const sun = A.body('Sun', j).lon;
  const lp = localParts(dateUtc, tz);
  // year pillar changes at Lichun (Sun 315)
  const lichun = A.sunAt(315, A.jd(new Date(Date.UTC(lp.y, 0, 15))));
  const solarYear = j >= lichun ? lp.y : lp.y - 1;
  const year = pillar(solarYear - 4);
  const mIdx = Math.floor(A.norm(sun - 315) / 30);
  const firstStem = ((year.stem % 5) * 2 + 2) % 10;
  const month = fromStemBranch((firstStem + mIdx) % 10, (2 + mIdx) % 12);
  const day = dayPillar(lp.y, lp.m, lp.d);
  const hb = Math.floor((lp.h + 1) / 2) % 12;
  const hour = fromStemBranch((((day.stem % 5) * 2) + hb) % 10, hb);
  // Luck pillars
  let luck = null;
  if (sex === 'male' || sex === 'female') {
    const forward = (year.stem % 2 === 0) === (sex === 'male');
    const prevTerm = 315 + 30 * mIdx, nextTerm = prevTerm + 30;
    let days;
    if (forward) days = A.sunAt(A.norm(nextTerm), j) - j;
    else { const t = A.sunAt(A.norm(prevTerm), j - 40); days = j - t; }
    const startAge = days / 3;
    const pillars = [];
    for (let k = 1; k <= 8; k++) {
      const p = pillar(month.i + (forward ? k : -k));
      pillars.push({ ...p, age: Math.round((startAge + (k - 1) * 10) * 10) / 10 });
    }
    luck = { forward, startAge, pillars };
  }
  const counts = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  for (const p of [year, month, day, hour]) { counts[stemElement(p.stem)] += 1; counts[BRANCH_EL[p.branch]] += 1; }
  return { year, month, day, hour, luck, counts, dayMaster: day.stem, solarYear };
}

const GEN = { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' };
const CTRL = { Wood: 'Earth', Earth: 'Water', Water: 'Fire', Fire: 'Metal', Metal: 'Wood' };
export const generates = (e) => GEN[e];
export const controls = (e) => CTRL[e];
export function tenGod(dm, stem) {
  const a = stemElement(dm), b = stemElement(stem), same = dm % 2 === stem % 2;
  if (a === b) return same ? 'Friend' : 'Rob Wealth';
  if (GEN[a] === b) return same ? 'Eating God' : 'Hurting Officer';
  if (CTRL[a] === b) return same ? 'Indirect Wealth' : 'Direct Wealth';
  if (CTRL[b] === a) return same ? 'Seven Killings' : 'Direct Officer';
  return same ? 'Indirect Resource' : 'Direct Resource';
}

// Chinese New Year from the traditional rules: the month holding the winter
// solstice is month 11; in a 13-month year the first month without a principal
// term (zhongqi) is the leap month. Dates are reckoned in Beijing time.
const bjDay = (j) => Math.floor(j + 0.5 + 8 / 24);
const bjMidnight = (day) => day - 0.5 - 8 / 24;
function newMoonOnOrBefore(j) {
  let nm = A.nextLunation(j - 32, 0), last = nm;
  while (nm && bjDay(nm) <= bjDay(j)) { last = nm; nm = A.nextLunation(nm + 1, 0); }
  return last;
}
export function chineseNewYear(y) {
  const ws1 = A.sunAt(270, A.jd(new Date(Date.UTC(y - 1, 11, 1))));
  const ws2 = A.sunAt(270, A.jd(new Date(Date.UTC(y, 11, 1))));
  const m11a = newMoonOnOrBefore(ws1), m11b = newMoonOnOrBefore(ws2);
  const months = [m11a];
  while (true) { const n = A.nextLunation(months[months.length - 1] + 1, 0); if (bjDay(n) >= bjDay(m11b)) break; months.push(n); }
  months.push(m11b);
  let leapIdx = -1;
  if (months.length - 1 === 13) {
    for (let i = 1; i < months.length - 1; i++) {
      const a = Math.floor(A.body('Sun', bjMidnight(bjDay(months[i]))).lon / 30);
      const b = Math.floor(A.body('Sun', bjMidnight(bjDay(months[i + 1]))).lon / 30);
      if (a === b) { leapIdx = i; break; }
    }
  }
  let count = 0, cny = months[2];
  for (let i = 1; i < months.length; i++) { if (i === leapIdx) continue; if (++count === 2) { cny = months[i]; break; } }
  const bj = new Date(A.fromJd(bjMidnight(bjDay(cny)) + 0.5).getTime() + 8 * 3600000);
  return { y: bj.getUTCFullYear(), m: bj.getUTCMonth() + 1, d: bj.getUTCDate() };
}
export function zodiacYear(y, m, d) {
  const cny = chineseNewYear(y);
  const before = m < cny.m || (m === cny.m && d < cny.d);
  const yy = before ? y - 1 : y;
  return { ...pillar(yy - 4), lunarYear: yy, cny };
}

export function kua(year, sex) {
  const r = ((year % 9) + 9) % 9;
  let k = sex === 'female' ? (r + 4) % 9 : (11 - r) % 9;
  if (k === 0) k = 9;
  if (k === 5) k = sex === 'female' ? 8 : 2;
  return k;
}
export const KUA_DIRS = {
  1: ['SE', 'E', 'S', 'N', 'W', 'NE', 'NW', 'SW'], 2: ['NE', 'W', 'NW', 'SW', 'E', 'SE', 'S', 'N'],
  3: ['S', 'N', 'SE', 'E', 'SW', 'NW', 'NE', 'W'], 4: ['N', 'S', 'E', 'SE', 'NW', 'SW', 'W', 'NE'],
  6: ['W', 'NE', 'SW', 'NW', 'SE', 'E', 'N', 'S'], 7: ['NW', 'SW', 'NE', 'W', 'N', 'S', 'SE', 'E'],
  8: ['SW', 'NW', 'W', 'NE', 'S', 'N', 'E', 'SE'], 9: ['E', 'SE', 'N', 'S', 'NE', 'W', 'SW', 'NW'],
};
export const KUA_LABELS = [
  ['Sheng Qi', 'vitality and success'], ['Tian Yi', 'health and support'], ['Yan Nian', 'relationships and longevity'], ['Fu Wei', 'stability and clarity'],
  ['Huo Hai', 'minor setbacks'], ['Wu Gui', 'friction and loss'], ['Liu Sha', 'scattered energy'], ['Jue Ming', 'depletion'],
];

// Compatibility by branch
export function branchRelation(a, b) {
  if (a === b) return 'Same sign: easy recognition, shared blind spots.';
  if ((a + 6) % 12 === b) return 'Clash (six apart): strong pull and friction; growth through difference.';
  if ((a % 4) === (b % 4)) return 'Trine (same triad): natural allies with shared drive.';
  const sixHarm = [[0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10]];
  if (sixHarm.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) return 'Harm pairing: small misunderstandings need patience.';
  const sixCombo = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
  if (sixCombo.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) return 'Secret friend (six harmony): quiet, supportive bond.';
  return 'Neutral: the relationship takes its tone from other factors.';
}
