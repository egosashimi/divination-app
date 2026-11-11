import { h, clear, section, note, renderItems, fmtDate, fmtDateTime, btn } from '../core/ui.js';
import * as A from '../core/astro.js';
import * as C from '../core/chart.js';
import * as N from '../core/numerology.js';
import * as Z from '../core/chinese.js';
import * as K from '../core/calendars.js';
import { daily, pick, randInt } from '../core/rng.js';
import { DECK, cardName } from '../data/tarot.js';
import { RUNES, HEXAGRAMS } from '../data/casting.js';
import { NUMBER } from '../data/lexicon.js';
import { PLANET_TEXT, TRANSIT_TEXT } from '../data/astro-text.js';
import { moonGlyph } from '../tools/nature.js';
import { runeGlyph } from '../core/marks.js';

const tile = (label, value, sub, href) => h(href ? 'a' : 'div', { href }, h('div', { class: 'label' }, label), h('div', { class: 'v' }, value), sub ? h('div', { class: 's' }, sub) : null);

export function render(root, ctx) {
  const p = ctx.profile, now = new Date(), j = A.jd(now);
  const name = (p.name || '').split(' ')[0];
  const ph = A.moonPhase(j);
  const sunLon = A.body('Sun', j).lon, moonLon = A.body('Moon', j).lon;
  const seed = p.name || p.date || 'anon';
  const r = daily('tarot', seed);
  const card = pick(DECK, r), rev = ctx.settings.reversals && r() < 0.3;
  const rune = pick(RUNES, daily('rune', seed));
  const hex = randInt(64, daily('hex', seed)) + 1;
  const dp = Z.dayPillar(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const my = K.maya(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const ruler = K.DAY_RULERS[now.getDay()];
  const hr = now.getHours();
  const greet = hr < 5 ? 'Good night' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';

  root.append(h('div', { class: 'today-head' },
    h('div', { class: 'label' }, `${greet}${name ? ', ' + name : ''}`),
    h('div', { class: 'date' }, now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }))));

  if (!C.hasBirth(p)) root.append(h('div', { class: 'note' }, 'Add your birth details in ', h('a', { href: '#/profile' }, 'Profile'), ' for personal numbers, transits and your chart. Everything stays on this device.'));

  root.append(h('div', { style: { display: 'flex', alignItems: 'center', gap: '16px', margin: '8px 0 18px' } }, moonGlyph(ph.elong, 64),
    h('div', null, h('div', { style: { fontFamily: 'var(--serif)', fontSize: '21px' } }, `${ph.name} in ${A.SIGNS[A.signOf(moonLon)]}`), h('div', { class: 'muted', style: { fontSize: '14px' } }, `${Math.round(ph.illum * 100)}% lit. Sun in ${A.SIGNS[A.signOf(sunLon)]}.`))));

  const grid = h('div', { class: 'daily' });
  if (p.date) {
    const pd = N.personalDay(p.date), py = N.personalYear(p.date);
    grid.append(tile('Personal day', String(pd), NUMBER[pd].kw, '#/t/numcycles'), tile('Personal year', String(py), NUMBER[py].kw, '#/t/numcycles'));
  } else {
    const ud = N.universalDay(now);
    grid.append(tile('Universal day', String(ud), (NUMBER[ud] || NUMBER[N.reduce(ud, false)]).kw, '#/t/numcycles'), tile('Planetary day', ruler, `${now.toLocaleDateString(undefined, { weekday: 'long' })} belongs to ${ruler}`));
  }
  grid.append(
    tile('Card of the day', cardName(card, ctx.settings.deck) + (rev ? ', reversed' : ''), rev ? card.rev : card.up, '#/t/tarot'),
    h('a', { href: '#/t/runes' }, h('div', { class: 'label' }, 'Rune of the day'), h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' } }, h('span', { class: 'glyph' }, runeGlyph(rune.path, 30)), h('div', null, h('div', { class: 'v', style: { margin: 0 } }, rune.name), h('div', { class: 's' }, rune.meaning)))),
    tile('Hexagram of the day', `${hex}. ${HEXAGRAMS[hex][1]}`, HEXAGRAMS[hex][2], '#/t/iching'),
    tile('Chinese day', `${Z.pillarHz(dp)} ${Z.pillarName(dp)}`, Z.pillarDesc(dp), '#/t/bazi'),
    tile('Maya day', `${my.number} ${K.TZ_SIGNS[my.sign]}`, 'Tzolkin', '#/t/maya'),
    p.date ? tile('Planetary day', ruler, `${now.toLocaleDateString(undefined, { weekday: 'long' })} belongs to ${ruler}`, '#/t/sky') : tile('Sky now', 'Positions', 'Planets and hours', '#/t/sky'));
  root.append(grid);

  root.append(section('Card of the day', renderItems([{ h: cardName(card, ctx.settings.deck), sub: rev ? 'reversed' : '', text: `${rev ? card.rev : card.up}. ${card.msg}` }])));

  const retro = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].filter((n) => A.body(n, j).retro);
  const items = [];
  if (retro.length) items.push({ h: 'Retrograde now', text: retro.join(', ') + '.' });
  const next = A.lunations(j, 15)[0];
  if (next) items.push({ h: `Next: ${next.name}`, sub: fmtDateTime(A.fromJd(next.jd)), text: `In ${A.SIGNS[A.signOf(next.moonLon)]}${next.eclipse ? '. ' + next.eclipse : ''}.` });
  if (C.hasBirth(p)) {
    try {
      const ch = C.computeChart(p, { zodiac: ctx.settings.zodiac, houseSystem: ctx.settings.houses });
      const tr = C.transitsTo(ch, j).aspects.filter((a) => a.transit !== 'Moon').slice(0, 3);
      tr.forEach((a) => items.push({ h: `${a.transit} ${a.aspect.toLowerCase()} your ${a.natal}`, sub: `orb ${a.orb.toFixed(1)}`, text: `${a.transit} ${TRANSIT_TEXT[a.transit] || 'touches'} your ${PLANET_TEXT[a.natal].kw}.` }));
    } catch (e) { console.warn(e); }
  }
  root.append(section('Sky and you', renderItems(items)));

  root.append(section('Quick start', h('div', { class: 'list' },
    [['dreams', 'Record a dream'], ['tarot', 'Draw tarot'], ['iching', 'Consult the I Ching'], ['natal', 'Your birth chart'], ['yearahead', 'Your year ahead']].map(([id, t]) => h('a', { class: 'li', href: `#/t/${id}` }, h('span', { class: 'li-t' }, t)))),
    h('div', { class: 'actions' }, h('a', { class: 'btn primary', href: '#/compass' }, 'Ask the Compass'))));
}
