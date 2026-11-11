import { h, svg, clear, section, intro, note, btn, seg, field, input, kv, renderItems, saveBar, needProfile, toast, fmtDate } from '../core/ui.js';
import * as N from '../core/numerology.js';
import * as store from '../core/store.js';
import { NUMBER, PERSONAL_YEAR, SEPHIROTH, ANGEL_DIGITS, ANGEL_SPECIAL } from '../data/lexicon.js';

const numItem = (label, n, extra = '') => ({ pos: label, h: String(n), sub: NUMBER[n] ? NUMBER[n].kw : '', text: (NUMBER[n] ? NUMBER[n].text : '') + (extra ? ' ' + extra : '') });
const sysSeg = (ctx, cb) => seg([['pythagorean', 'Pythagorean'], ['chaldean', 'Chaldean']], ctx.settings.numerology, (v) => { store.setSettings({ numerology: v }); ctx.settings.numerology = v; cb(); });

export function numcore(root, ctx) {
  const p = ctx.profile;
  if (!p.date) { needProfile(root, 'your birth date and full birth name'); return; }
  const body = h('div');
  root.append(intro('Your core numbers come from your birth date and the full name on your birth certificate. Pythagorean is the modern Western system; Chaldean is older and treats names differently.'), sysSeg(ctx, draw), body);
  function draw() {
    clear(body);
    const name = p.birthName || p.name || '';
    const sys = ctx.settings.numerology;
    const lp = N.lifePath(p.date);
    const items = [numItem('Life path', lp.value, `Calculated from ${lp.parts.join(' + ')}.`), numItem('Birthday', N.birthdayNumber(p.date))];
    let nm = null;
    if (name) {
      nm = N.nameNumbers(name, sys);
      items.push(numItem('Expression (destiny)', nm.expression, `From every letter of "${name}". Your natural talents.`), numItem('Soul urge (heart\'s desire)', nm.soul, 'From the vowels. What you long for.'), numItem('Personality', nm.personality, 'From the consonants. How others first see you.'));
      items.push(numItem('Maturity', N.reduce(N.reduce(lp.value, false) + N.reduce(nm.expression, false)), 'Life path plus expression. Who you grow into after midlife.'));
      if (sys === 'chaldean') items.push({ pos: 'Chaldean compound', h: String(nm.raw.all), text: 'Chaldean numerologists read the compound total before reduction as the hidden influence of the name.' });
    } else items.push({ h: 'Add your birth name', text: 'Your full birth name unlocks expression, soul urge and personality numbers. Add it in your profile.' });
    const karmic = [...new Set([...lp.karmic, ...(nm ? nm.karmic : [])])];
    karmic.forEach((k) => items.push({ pos: 'Karmic debt', h: String(k), text: N.KARMIC[k] }));
    const masters = items.filter((i) => ['11', '22', '33'].includes(i.h));
    if (masters.length) items.push({ h: 'Master numbers present', text: 'Master numbers carry higher potential and higher pressure. They are often lived as their root (11 as 2, 22 as 4, 33 as 6) until maturity.' });
    const lpNum = N.reduce(lp.value, false);
    items.push({ pos: 'Kabbalistic correspondence', h: SEPHIROTH[lpNum], text: `On the Tree of Life your life path number ${lpNum} corresponds to the sephira ${SEPHIROTH[lpNum]}.` });
    body.append(h('div', { class: 'stat' }, [['Life path', lp.value], ['Expression', nm ? nm.expression : '-'], ['Soul urge', nm ? nm.soul : '-'], ['Personality', nm ? nm.personality : '-']].map(([k, v]) => h('div', null, h('div', { class: 'k' }, k), h('div', { class: 'v' }, String(v))))),
      renderItems(items), saveBar(() => ({ tool: 'numcore', title: 'Core numbers', items })));
    store.saveResult('numerology', { lifePath: lp.value, expression: nm && nm.expression, soul: nm && nm.soul, themes: [...(NUMBER[lp.value] || NUMBER[lpNum]).themes, ...(nm ? (NUMBER[nm.expression] || { themes: [] }).themes : [])] });
  }
  draw();
}

export function numcycles(root, ctx) {
  const p = ctx.profile;
  if (!p.date) { needProfile(root); return; }
  const now = new Date();
  const py = N.personalYear(p.date), pm = N.personalMonth(p.date), pd = N.personalDay(p.date);
  const birthY = +p.date.slice(0, 4), age = now.getFullYear() - birthY;
  const pins = N.pinnacles(p.date);
  const curPin = pins.find((x) => age >= x.from && (x.to == null || age < x.to));
  const next = [1, 2, 3].map((k) => ({ y: now.getFullYear() + k, n: N.personalYear(p.date, now.getFullYear() + k) }));
  const items = [
    { pos: `Personal year ${now.getFullYear()}`, h: String(py), text: PERSONAL_YEAR[py] },
    { pos: `Personal month (${now.toLocaleString(undefined, { month: 'long' })})`, h: String(pm), text: NUMBER[pm].kw + '.' },
    { pos: 'Personal day (today)', h: String(pd), text: NUMBER[pd].kw + '.' },
    { pos: 'The next years', h: next.map((x) => `${x.y}: ${x.n}`).join('   '), text: 'The nine-year cycle runs from beginnings (1) to completion (9).' },
  ];
  const pinItems = pins.map((x, i) => ({ pos: `${['First', 'Second', 'Third', 'Fourth'][i]} pinnacle, age ${x.from}${x.to ? ' to ' + x.to : ' onward'}${x === curPin ? ' (now)' : ''}`, h: `Pinnacle ${x.pinnacle}, challenge ${x.challenge}`, text: `Opportunity: ${NUMBER[x.pinnacle].kw}. Challenge: ${x.challenge === 0 ? 'the challenge of choice; all paths are open, so you must choose' : NUMBER[x.challenge].shadow}.` }));
  root.append(intro('Numerology describes life as nine-year cycles, plus four longer pinnacles, each with a matching challenge.'), renderItems(items), section('Pinnacles and challenges', renderItems(pinItems)), saveBar(() => ({ tool: 'numcycles', title: 'Personal cycles', items: [...items, ...pinItems] })));
  store.saveResult('numcycles', { personalYear: py, pinnacle: curPin && curPin.pinnacle, themes: NUMBER[py].themes });
}

const LOSHU_TEXT = {
  1: 'communication and self-expression', 2: 'intuition and sensitivity', 3: 'imagination and memory', 4: 'order and practicality', 5: 'balance and willpower (the center)',
  6: 'home, responsibility and care', 7: 'disappointment that teaches, spiritual learning', 8: 'attention to detail and method', 9: 'idealism, ambition and humanitarianism',
};
const PLANES = [['Mental plane', [4, 9, 2]], ['Emotional plane', [3, 5, 7]], ['Practical plane', [8, 1, 6]], ['Thought plane', [4, 3, 8]], ['Will plane', [9, 5, 1]], ['Action plane', [2, 7, 6]], ['Golden plane (success)', [4, 5, 6]], ['Silver plane (property)', [2, 5, 8]]];
export function loshu(root, ctx) {
  const dIn = input({ type: 'date', value: ctx.profile.date || '' });
  const out = h('div');
  root.append(intro('The Lo Shu square is a 3x3 magic square from ancient China in which every row, column and diagonal sums to 15. Placing the digits of a birth date on it shows strengths (present numbers) and lessons (missing numbers).'),
    field('Birth date', dIn), h('div', { class: 'actions' }, btn('Draw the grid', go, 'primary')), out);
  function go() {
    if (!dIn.value) { toast('Enter a date'); return; }
    const ls = N.loShu(dIn.value);
    const grid = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: '260px', margin: '20px auto', border: '1px solid var(--line)' } },
      ls.grid.flat().map((n) => h('div', { style: { aspectRatio: '1', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: '20px', color: ls.count[n] ? 'var(--ink)' : 'var(--line)' } }, ls.count[n] ? String(n).repeat(ls.count[n]) : String(n))));
    const present = Object.entries(ls.count).filter(([, c]) => c).map(([n, c]) => ({ h: `${n} ${c > 1 ? 'x' + c : ''}`, text: `${LOSHU_TEXT[n]}${c > 2 ? '; repeated three or more times this becomes intense' : ''}.` }));
    const missing = Object.entries(ls.count).filter(([, c]) => !c).map(([n]) => n);
    const planes = PLANES.filter(([, ns]) => ns.every((n) => ls.count[n])).map(([p]) => p);
    const items = [...present, { h: 'Missing numbers', text: missing.length ? missing.map((n) => `${n} (${LOSHU_TEXT[n]})`).join('; ') + '. Traditionally these are lessons to develop.' : 'None: every number is present.' },
      { h: 'Complete planes', text: planes.length ? planes.join(', ') + '.' : 'No complete planes.' }, { h: `Driver number ${ls.lp}`, text: 'The life path, often added to the grid as a ruling influence.' }];
    clear(out);
    out.append(grid, renderItems(items), saveBar(() => ({ tool: 'loshu', title: 'Lo Shu grid', items })));
  }
  if (ctx.profile.date) go();
}

export function names(root, ctx) {
  const nIn = input({ placeholder: 'Any name: yours, a business, a pet, a baby name', value: ctx.profile.name || '' });
  const out = h('div');
  root.append(intro('Name numerology (onomancy) converts letters into numbers. Compare names, nicknames or spellings.'), field('Name', nIn), sysSeg(ctx, go), h('div', { class: 'actions' }, btn('Calculate', go, 'primary')), out);
  function go() {
    const v = nIn.value.trim();
    if (!v) return;
    const r = N.nameNumbers(v, ctx.settings.numerology);
    const items = [numItem('Expression', r.expression), numItem('Soul urge (vowels)', r.soul), numItem('Personality (consonants)', r.personality)];
    const first = N.clean(v).replace(/ /g, '')[0];
    if (first) items.push({ pos: 'Cornerstone', h: first, text: 'The first letter is said to show how you approach new situations.' });
    clear(out);
    out.append(h('p', { class: 'hint' }, r.letters.map((l) => `${l.ch}${l.v}`).join(' ')), renderItems(items), saveBar(() => ({ tool: 'names', title: `Name: ${v}`, items })));
  }
  if (nIn.value) go();
}

const HOUSE_NUM = {
  1: 'Independence, new starts; good for self-starters.', 2: 'Partnership, peace and cooperation; a nurturing home.', 3: 'Social life, creativity and fun.', 4: 'Stability, structure and hard work; a solid base.',
  5: 'Change, travel and activity; rarely quiet.', 6: 'Family, care and beauty; the classic family home.', 7: 'Reflection, study and spirituality; a retreat.', 8: 'Ambition, prosperity and power; good for business.',
  9: 'Compassion, completion and generosity; welcoming to all.', 11: 'Inspiration and intuition; a spiritual home.', 22: 'Building and big projects; a home for visionaries.', 33: 'Healing and teaching; a home of service.',
};
export function address(root) {
  const a = input({ placeholder: 'e.g. 12B or 1407', inputmode: 'text' });
  const out = h('div');
  root.append(intro('Reduce your house or apartment number to a single digit. For apartments, the unit number usually matters most. Letters are converted with the Pythagorean values.'), field('House or unit number', a), h('div', { class: 'actions' }, btn('Calculate', go, 'primary')), out);
  function go() {
    const s = a.value.trim().toUpperCase();
    if (!s) return;
    let total = 0; for (const ch of s) total += /\d/.test(ch) ? +ch : N.letterValue(ch);
    const n = N.reduce(total);
    clear(out);
    const items = [{ h: `House number ${n}`, sub: NUMBER[n].kw, text: HOUSE_NUM[n] }];
    out.append(renderItems(items), saveBar(() => ({ tool: 'address', title: `House number ${s}`, items })));
  }
}

export function angel(root) {
  const a = input({ placeholder: 'e.g. 1111, 444, 1234', inputmode: 'numeric' });
  const out = h('div');
  root.append(intro('"Angel numbers" are repeating sequences people notice on clocks, receipts and plates, read as messages. A contemporary practice drawing on numerology.'), field('Number', a), h('div', { class: 'actions' }, btn('Read', go, 'primary')), out);
  function go() {
    const s = a.value.replace(/\D/g, '');
    if (!s) return;
    const items = [];
    if (ANGEL_SPECIAL[s]) items.push({ h: s, text: ANGEL_SPECIAL[s] });
    const digits = [...new Set(s.split(''))];
    if (digits.length === 1 && !ANGEL_SPECIAL[s]) items.push({ h: s, text: `An amplified message of ${ANGEL_DIGITS[digits[0]]}. The more repetitions, the louder the message.` });
    digits.forEach((d) => items.push({ h: d, text: cap1(ANGEL_DIGITS[d]) + '.' }));
    const r = N.reduce([...s].reduce((x, y) => x + +y, 0));
    items.push({ h: `Root number ${r}`, text: NUMBER[r] ? NUMBER[r].kw + '.' : '' });
    clear(out);
    out.append(renderItems(items), saveBar(() => ({ tool: 'angel', title: `Angel number ${s}`, items })));
  }
}
const cap1 = (x) => x.charAt(0).toUpperCase() + x.slice(1);

export function gematria(root) {
  const a = input({ placeholder: 'A word or phrase in English, Hebrew or Greek' });
  const out = h('div');
  root.append(intro('Gematria assigns numbers to letters so that words with equal values can be compared. Hebrew gematria is central to Kabbalah; Greek isopsephy is its classical cousin; English ciphers are modern adaptations.'), field('Text', a), h('div', { class: 'actions' }, btn('Calculate', go, 'primary')), out);
  function go() {
    const v = a.value.trim();
    if (!v) return;
    const g = N.gematria(v);
    const saved = store.get('gematria', []);
    if (!saved.find((x) => x.t === v)) { saved.unshift({ t: v, g }); store.set('gematria', saved.slice(0, 60)); }
    const matches = (k) => saved.filter((x) => x.t !== v && x.g[k] === g[k] && g[k] > 0).map((x) => x.t);
    const rows = [['English ordinal (a=1...z=26)', 'ordinal'], ['Full reduction (Pythagorean)', 'reduction'], ['Reverse ordinal', 'reverse'], ['English sumerian (x6)', 'sumerian'], ['Chaldean', 'chaldean'], ['Hebrew (mispar hechrechi)', 'hebrew'], ['Greek isopsephy', 'greek']];
    clear(out);
    out.append(h('div', { class: 'scroll-x' }, h('table', { class: 't' }, h('tbody', null, rows.filter(([, k]) => g[k] > 0).map(([l, k]) => h('tr', null, h('td', null, l), h('td', { style: { fontFamily: 'var(--serif)', fontSize: '18px' } }, String(g[k])), h('td', { class: 'muted' }, matches(k).slice(0, 3).join(', '))))))),
      note('The right column lists earlier entries with the same value. Your entries are kept on this device.'));
  }
}

export function geometry(root) {
  const S = 120;
  const fig = (title, text, draw) => {
    const s = svg('svg', { viewBox: `0 0 ${S * 2} ${S * 2}`, width: 180, height: 180, style: 'display:block;margin:10px auto', stroke: 'currentColor', fill: 'none', 'stroke-width': 1 });
    draw(s);
    return h('div', { class: 'item' }, s, h('h3', null, title), h('p', null, text));
  };
  const circ = (s, x, y, r) => s.append(svg('circle', { cx: x, cy: y, r }));
  root.append(intro('Sacred geometry studies forms that recur in nature, architecture and spiritual art. Each shape carries traditional meanings.'),
    fig('Vesica piscis', 'Two circles overlapping through each other\'s centers: the meeting of opposites and the womb of creation.', (s) => { circ(s, S - 30, S, 60); circ(s, S + 30, S, 60); }),
    fig('Seed of Life', 'Seven circles: the seven days of creation, and the template of growth.', (s) => { circ(s, S, S, 40); for (let i = 0; i < 6; i++) circ(s, S + 40 * Math.cos(i * Math.PI / 3), S + 40 * Math.sin(i * Math.PI / 3), 40); }),
    fig('Flower of Life', 'The Seed of Life extended: interconnection of all living things.', (s) => { const r = 26; circ(s, S, S, r * 3); for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) { const x = S + r * (a + b / 2), y = S + r * b * Math.sqrt(3) / 2; if (Math.hypot(x - S, y - S) <= r * 2.01) circ(s, x, y, r); } }),
    fig("Metatron's Cube", 'Thirteen circles joined by lines; it contains the five Platonic solids.', (s) => { const pts = [[S, S]]; for (let i = 0; i < 6; i++) { pts.push([S + 40 * Math.cos(i * Math.PI / 3 + Math.PI / 6), S + 40 * Math.sin(i * Math.PI / 3 + Math.PI / 6)]); pts.push([S + 80 * Math.cos(i * Math.PI / 3 + Math.PI / 6), S + 80 * Math.sin(i * Math.PI / 3 + Math.PI / 6)]); } pts.forEach(([x, y]) => circ(s, x, y, 12)); for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) s.append(svg('line', { x1: pts[i][0], y1: pts[i][1], x2: pts[j][0], y2: pts[j][1], 'stroke-opacity': 0.35 })); }),
    fig('Golden spiral', 'Growth by the golden ratio (1.618): shells, sunflowers, galaxies.', (s) => { let x = S + 20, y = S, a = 0, r = 2; let d = `M${x} ${y}`; for (let t = 0; t < 720; t += 5) { const th = t * Math.PI / 180; r = 2 * Math.pow(1.618, th / (Math.PI / 2)); d += `L${S + r * Math.cos(th) * 0.9} ${S + r * Math.sin(th) * 0.9}`; if (r > 110) break; } void a; s.append(svg('path', { d })); }),
    fig('Platonic triangle', 'The triangle: the first form that encloses space; the number three, spirit, mind and body.', (s) => s.append(svg('path', { d: `M${S} ${S - 90}L${S + 78} ${S + 45}L${S - 78} ${S + 45}Z` }))),
    fig('Square and circle', 'Earth (square) and heaven (circle), the problem of their union.', (s) => { s.append(svg('rect', { x: S - 70, y: S - 70, width: 140, height: 140 })); circ(s, S, S, 79); }));
}
