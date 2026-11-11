export const MASTERS = [11, 22, 33];
const digitSum = (n) => String(Math.abs(n)).split('').reduce((a, c) => a + +c, 0);
export function reduce(n, keepMasters = true) {
  while (n > 9 && !(keepMasters && MASTERS.includes(n))) n = digitSum(n);
  return n;
}
// Trace including intermediate values (for karmic debt detection)
export function reduceTrace(n) {
  const t = [n];
  while (n > 9 && !MASTERS.includes(n)) { n = digitSum(n); t.push(n); }
  return t;
}
export const KARMIC = { 13: 'Work and discipline: shortcuts tend to fail; steady effort pays.', 14: 'Freedom and moderation: learning balance with change and appetite.', 16: 'Ego and humility: structures built on pride are rebuilt on truth.', 19: 'Independence and help: learning to stand alone and to accept support.' };

const CHALDEAN = { A: 1, I: 1, J: 1, Q: 1, Y: 1, B: 2, K: 2, R: 2, C: 3, G: 3, L: 3, S: 3, D: 4, M: 4, T: 4, E: 5, H: 5, N: 5, X: 5, U: 6, V: 6, W: 6, O: 7, Z: 7, F: 8, P: 8 };
export function letterValue(ch, system = 'pythagorean') {
  const c = ch.toUpperCase();
  if (!/[A-Z]/.test(c)) return 0;
  if (system === 'chaldean') return CHALDEAN[c];
  return ((c.charCodeAt(0) - 65) % 9) + 1;
}
export const clean = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z ]/g, '');

function isVowelAt(s, i) {
  const c = s[i];
  if ('AEIOU'.includes(c)) return true;
  if (c !== 'Y') return false;
  const prev = s[i - 1] || ' ', next = s[i + 1] || ' ';
  return !'AEIOU'.includes(prev) && !'AEIOU'.includes(next);
}
export function nameNumbers(name, system = 'pythagorean') {
  const s = clean(name);
  let all = 0, vow = 0, con = 0;
  const letters = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] === ' ') continue;
    const v = letterValue(s[i], system), vowel = isVowelAt(s, i);
    all += v; if (vowel) vow += v; else con += v;
    letters.push({ ch: s[i], v, vowel });
  }
  // Chaldean tradition reads compound numbers; it does not keep 33 as a master.
  return {
    expression: reduce(all), soul: reduce(vow), personality: reduce(con),
    raw: { all, vow, con }, letters,
    karmic: [all, vow, con].flatMap((x) => reduceTrace(x)).filter((x) => KARMIC[x]),
  };
}

export function parseDate(iso) { const [y, m, d] = iso.split('-').map(Number); return { y, m, d }; }
export function lifePath(iso) {
  const { y, m, d } = parseDate(iso);
  const parts = [reduce(m), reduce(d), reduce(digitSum(y))];
  const total = parts.reduce((a, b) => a + b, 0);
  return { value: reduce(total), parts, karmic: reduceTrace(total).filter((x) => KARMIC[x]).concat(reduceTrace(d).filter((x) => KARMIC[x])) };
}
export const birthdayNumber = (iso) => reduce(parseDate(iso).d);
export function personalYear(iso, year = new Date().getFullYear()) {
  const { m, d } = parseDate(iso);
  return reduce(reduce(m, false) + reduce(d, false) + reduce(digitSum(year), false), false);
}
export const personalMonth = (iso, date = new Date()) => reduce(personalYear(iso, date.getFullYear()) + date.getMonth() + 1, false);
export const personalDay = (iso, date = new Date()) => reduce(personalMonth(iso, date) + date.getDate(), false);
export const universalDay = (date = new Date()) => reduce(digitSum(date.getFullYear()) + date.getMonth() + 1 + date.getDate());

export function pinnacles(iso) {
  const { y, m, d } = parseDate(iso);
  const M = reduce(m, false), D = reduce(d, false), Y = reduce(digitSum(y), false);
  const lp = reduce(lifePath(iso).value, false);
  const p1 = reduce(M + D), p2 = reduce(D + Y), p3 = reduce(p1 + p2), p4 = reduce(M + Y);
  const c1 = Math.abs(M - D), c2 = Math.abs(D - Y), c3 = Math.abs(c1 - c2), c4 = Math.abs(M - Y);
  const end1 = 36 - lp;
  return [
    { pinnacle: p1, challenge: c1, from: 0, to: end1 },
    { pinnacle: p2, challenge: c2, from: end1, to: end1 + 9 },
    { pinnacle: p3, challenge: c3, from: end1 + 9, to: end1 + 18 },
    { pinnacle: p4, challenge: c4, from: end1 + 18, to: null },
  ];
}

export function loShu(iso) {
  const digits = iso.replace(/\D/g, '').split('').map(Number).filter((x) => x > 0);
  const count = {}; for (let i = 1; i <= 9; i++) count[i] = 0;
  digits.forEach((x) => count[x]++);
  // add life path (driver/conductor practice)
  const lp = reduce(lifePath(iso).value, false);
  return { count, lp, grid: [[4, 9, 2], [3, 5, 7], [8, 1, 6]] };
}

// Gematria systems
const HEB = { 'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9, 'י': 10, 'כ': 20, 'ך': 20, 'ל': 30, 'מ': 40, 'ם': 40, 'נ': 50, 'ן': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'ף': 80, 'צ': 90, 'ץ': 90, 'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400 };
const GRK = { 'α': 1, 'β': 2, 'γ': 3, 'δ': 4, 'ε': 5, 'ϛ': 6, 'ζ': 7, 'η': 8, 'θ': 9, 'ι': 10, 'κ': 20, 'λ': 30, 'μ': 40, 'ν': 50, 'ξ': 60, 'ο': 70, 'π': 80, 'ϙ': 90, 'ρ': 100, 'σ': 200, 'ς': 200, 'τ': 300, 'υ': 400, 'φ': 500, 'χ': 600, 'ψ': 700, 'ω': 800 };
export function gematria(text) {
  const latin = clean(text).replace(/ /g, '');
  const ord = [...latin].reduce((a, c) => a + c.charCodeAt(0) - 64, 0);
  const red = [...latin].reduce((a, c) => a + letterValue(c), 0);
  const rev = [...latin].reduce((a, c) => a + 91 - c.charCodeAt(0), 0);
  const cha = [...latin].reduce((a, c) => a + letterValue(c, 'chaldean'), 0);
  const greekText = text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const heb = [...text].reduce((a, c) => a + (HEB[c] || 0), 0);
  const grk = [...greekText].reduce((a, c) => a + (GRK[c] || 0), 0);
  return { ordinal: ord, reduction: red, reverse: rev, sumerian: ord * 6, chaldean: cha, hebrew: heb, greek: grk };
}
