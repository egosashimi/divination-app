// Unit checks for the calculation core. Run: node test/run.mjs
import assert from 'node:assert/strict';
import * as A from '../js/core/astro.js';
import * as Z from '../js/core/chinese.js';
import * as K from '../js/core/calendars.js';
import * as N from '../js/core/numerology.js';
import { kingWen, linesOf, HEXAGRAMS, RUNES, OGHAM, GEO, LENORMAND } from '../js/data/casting.js';
import { DECK } from '../js/data/tarot.js';
import { HD_GATE_ORDER, HD_CENTERS, HD_CHANNELS } from '../js/data/astro-text.js';

let n = 0;
const t = (name, fn) => { fn(); n++; };
const near = (a, b, tol, msg) => assert.ok(A.angDist(a, b) <= tol, `${msg}: ${a.toFixed(2)} vs ${b}`);

t('planets at J2000 match published ephemeris', () => {
  const j = A.jd(new Date(Date.UTC(2000, 0, 1, 12)));
  const exp = { Sun: 280.37, Moon: 223.32, Mercury: 271.89, Venus: 241.57, Mars: 327.96, Jupiter: 25.25, Saturn: 40.40, Uranus: 314.81, Neptune: 303.19, Pluto: 251.45 };
  for (const [k, v] of Object.entries(exp)) near(A.body(k, j).lon, v, 0.1, k);
});
t('Chinese new year incl. leap-month years', () => {
  const exp = { 1966: '1-21', 1985: '2-20', 2020: '1-25', 2023: '1-22', 2026: '2-17', 2033: '1-31', 2034: '2-19' };
  for (const [y, e] of Object.entries(exp)) { const c = Z.chineseNewYear(+y); assert.equal(`${c.m}-${c.d}`, e, `CNY ${y}`); }
});
t('day pillars', () => {
  assert.equal(Z.pillarName(Z.dayPillar(2000, 1, 1)), 'Wu Wu');
  assert.equal(Z.pillarName(Z.dayPillar(1949, 10, 1)), 'Jia Zi');
});
t('BaZi month and year at Lichun', () => {
  const b = Z.bazi(A.zonedToUtc(1990, 5, 15, 10, 0, 'Asia/Shanghai'), 'Asia/Shanghai', 'male');
  assert.equal(Z.pillarName(b.year), 'Geng Wu'); assert.equal(Z.pillarName(b.month), 'Xin Si'); assert.equal(Z.pillarName(b.hour), 'Xin Si');
  const before = Z.bazi(A.zonedToUtc(2024, 2, 3, 12, 0, 'Asia/Shanghai'), 'Asia/Shanghai');
  assert.equal(Z.pillarName(before.year), 'Gui Mao');
});
t('Maya long count 2012-12-21', () => { const m = K.maya(2012, 12, 21); assert.equal(m.longCount, '13.0.0.0.0'); assert.equal(m.number, 4); assert.equal(K.TZ_SIGNS[m.sign], 'Ahau'); });
t('Kua numbers', () => { assert.equal(Z.kua(1984, 'male'), 7); assert.equal(Z.kua(1984, 'female'), 8); assert.equal(Z.kua(2005, 'male'), 4); });
t('numerology', () => {
  assert.equal(N.lifePath('1990-05-15').value, 3);
  assert.equal(N.reduce(29), 11);
  assert.equal(N.nameNumbers('John Smith').expression, 8);
});
t('King Wen table is a permutation of 1..64', () => {
  const seen = new Set();
  for (let i = 0; i < 64; i++) { const lines = [0, 1, 2, 3, 4, 5].map((b) => (i >> b) & 1); seen.add(kingWen(lines)); }
  assert.equal(seen.size, 64);
  assert.equal(kingWen([1, 1, 1, 1, 1, 1]), 1); assert.equal(kingWen([0, 0, 0, 0, 0, 0]), 2);
  assert.equal(kingWen([1, 0, 1, 0, 1, 0]), 63); assert.equal(kingWen([0, 1, 0, 1, 0, 1]), 64);
  assert.deepEqual(linesOf(11), [1, 1, 1, 0, 0, 0]);
});
t('data sets complete', () => {
  assert.equal(DECK.length, 78); assert.equal(HEXAGRAMS.length, 65); assert.equal(RUNES.length, 24); assert.equal(OGHAM.length, 20);
  assert.equal(GEO.length, 16); assert.equal(new Set(GEO.map((g) => g.rows.join(''))).size, 16); assert.equal(LENORMAND.length, 36);
});
t('Human Design tables', () => {
  assert.equal(new Set(HD_GATE_ORDER).size, 64);
  assert.equal(Object.values(HD_CENTERS).flat().length, 64);
  assert.equal(HD_CHANNELS.length, 36);
});
t('timezone conversion handles DST', () => {
  assert.equal(A.zonedToUtc(1990, 7, 1, 12, 0, 'America/New_York').toISOString(), '1990-07-01T16:00:00.000Z');
  assert.equal(A.zonedToUtc(1990, 1, 1, 12, 0, 'America/New_York').toISOString(), '1990-01-01T17:00:00.000Z');
});
t('Placidus cusps satisfy the semi-arc condition', () => {
  const j = A.jd(new Date(Date.UTC(1990, 4, 15, 14, 30))), lat = 40.71, lon = -74.01;
  const hs = A.houses(j, lat, lon, 'placidus'), eps = A.obliquity(j), ramc = A.norm(A.gmst(j) + lon), R = Math.PI / 180;
  const ra = (l) => A.norm(Math.atan2(Math.sin(l * R) * Math.cos(eps * R), Math.cos(l * R)) / R);
  const sda = (l) => 90 + Math.asin(Math.tan(lat * R) * Math.tan(Math.asin(Math.sin(eps * R) * Math.sin(l * R)))) / R;
  const c11 = hs.cusps[10], c12 = hs.cusps[11];
  assert.ok(Math.abs(A.norm(ra(c11) - ramc) - sda(c11) / 3) < 0.01, 'cusp 11');
  assert.ok(Math.abs(A.norm(ra(c12) - ramc) - 2 * sda(c12) / 3) < 0.01, 'cusp 12');
  assert.ok(A.angDist(hs.cusps[0], hs.asc) < 1e-9 && A.angDist(hs.cusps[9], hs.mc) < 1e-9);
});
console.log(`${n} checks passed`);
