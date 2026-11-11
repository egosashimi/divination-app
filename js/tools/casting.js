import { h, svg, clear, section, intro, note, btn, seg, select, field, questionBox, renderItems, saveBar, toast, textarea, input, kv } from '../core/ui.js';
import { runeGlyph, oghamGlyph, hexagram, geoFigure } from '../core/marks.js';
import { rand, randInt, draw, pick, shuffle, hash, seeded } from '../core/rng.js';
import * as store from '../core/store.js';
import { HEXAGRAMS, kingWen, TRIGRAMS, LINE_PLACES, RUNES, OGHAM, GEO, GEO_HOUSES, DICE3, STONES } from '../data/casting.js';
import { PASSAGES } from '../data/oracle.js';

// ---------- I Ching ----------
function castLine(method) {
  if (method === 'yarrow') { const x = rand() * 16; return x < 1 ? 6 : x < 6 ? 7 : x < 13 ? 8 : 9; }
  let s = 0; for (let i = 0; i < 3; i++) s += rand() < 0.5 ? 3 : 2; return s;
}
export function iching(root) {
  let method = 'coins', values = [];
  const q = questionBox('Your question, in a sentence');
  const hexWrap = h('div', { style: { margin: '20px 0' } });
  const out = h('div');
  const castBtn = btn('Cast line 1', () => castOne(), 'primary');
  root.append(intro('The Book of Changes describes the dynamics of a situation. Cast six lines from the bottom up. Each line is young (stable) or old (changing); changing lines turn into their opposites and reveal where the situation is heading.'),
    seg([['coins', 'Three coins'], ['yarrow', 'Yarrow-stalk odds']], method, (v) => (method = v)),
    q.el, h('div', { class: 'actions' }, castBtn, btn('Cast all six', () => { while (values.length < 6) castOne(true); finish(); }, 'ghost'), btn('Clear', reset, 'ghost')), hexWrap, out);
  function reset() { values = []; clear(hexWrap); clear(out); castBtn.textContent = 'Cast line 1'; castBtn.disabled = false; }
  function castOne(batch) {
    if (values.length >= 6) return;
    values.push(castLine(method));
    renderHex();
    castBtn.textContent = values.length < 6 ? `Cast line ${values.length + 1}` : 'Complete';
    castBtn.disabled = values.length >= 6;
    if (values.length === 6 && !batch) finish();
  }
  function renderHex() {
    clear(hexWrap);
    const lines = values.map((v) => (v === 7 || v === 9 ? 1 : 0));
    const ch = values.map((v, i) => (v === 6 || v === 9 ? i : -1)).filter((x) => x >= 0);
    hexWrap.append(hexagram(lines, ch), h('p', { class: 'hint', style: { textAlign: 'center', marginTop: '10px' } }, values.map((v) => ({ 6: 'old yin', 7: 'young yang', 8: 'young yin', 9: 'old yang' }[v])).join(', ')));
  }
  function finish() {
    renderHex();
    const lines = values.map((v) => (v === 7 || v === 9 ? 1 : 0));
    const changing = values.map((v, i) => (v === 6 || v === 9 ? i : -1)).filter((x) => x >= 0);
    const n = kingWen(lines), hx = HEXAGRAMS[n];
    const lower = TRIGRAMS[lines.slice(0, 3).join('')], upper = TRIGRAMS[lines.slice(3).join('')];
    const items = [{ h: `${n}. ${hx[1]}`, sub: hx[0], text: hx[2] }, { h: 'Trigrams', text: `${upper.image} (${upper.name}, ${upper.quality}) above ${lower.image} (${lower.name}, ${lower.quality}).` }];
    let rel = null;
    if (changing.length) {
      changing.forEach((i) => items.push({ h: `Changing line ${i + 1}`, sub: values[i] === 9 ? 'old yang becoming yin' : 'old yin becoming yang', text: LINE_PLACES[i] }));
      const l2 = lines.map((l, i) => (changing.includes(i) ? 1 - l : l));
      rel = kingWen(l2);
      const rh = HEXAGRAMS[rel];
      items.push({ h: `Becoming ${rel}. ${rh[1]}`, sub: rh[0], text: `The situation is moving toward this: ${rh[2]}` });
      hexWrap.append(h('div', { style: { marginTop: '18px', textAlign: 'center' } }, h('div', { class: 'label' }, 'Relating hexagram'), h('div', { style: { marginTop: '10px' } }, hexagram(l2))));
    } else items.push({ h: 'No changing lines', text: 'The situation is stable; the hexagram speaks as a whole.' });
    if (changing.length === 6) items.push({ h: 'All lines change', text: 'A complete reversal is underway. Read the relating hexagram as the primary message.' });
    clear(out);
    out.append(renderItems(items), saveBar(() => ({ tool: 'iching', title: `I Ching: ${n}. ${hx[1]}${rel ? ' to ' + rel + '. ' + HEXAGRAMS[rel][1] : ''}`, question: q.value(), items })));
    store.saveResult('iching-last', { hex: n, rel, themes: [...hx[3], ...(rel ? HEXAGRAMS[rel][3] : [])] });
  }
}

// ---------- Runes ----------
export function runes(root, ctx) {
  let mode = 'three';
  const q = questionBox();
  const out = h('div');
  root.append(intro('The Elder Futhark, the oldest runic alphabet, read as a symbolic oracle. A rune drawn upside down (merkstave) shows the shadow of its meaning; some runes look the same either way.'),
    seg([['one', 'Single rune'], ['three', 'Three runes'], ['five', 'Five-rune cross'], ['cast', 'Cast all']], mode, (v) => (mode = v)), q.el,
    h('div', { class: 'actions' }, btn('Draw', go, 'primary')), out);
  function go() {
    clear(out);
    if (mode === 'cast') return cast();
    const n = { one: 1, three: 3, five: 5 }[mode];
    const pos = { one: ['Guidance'], three: ['Situation', 'Challenge', 'Outcome'], five: ['Past', 'Present', 'Future', 'Foundation', 'Possibility'] }[mode];
    const rs = draw(RUNES, n).map((r) => ({ r, rev: r.rev && rand() < 0.35 }));
    const row = h('div', { class: 'glyphs' });
    rs.forEach(({ r, rev }, i) => row.append(h('div', { class: 'glyph' }, h('div', { class: 'label' }, pos[i]), h('div', { style: { transform: rev ? 'rotate(180deg)' : '' } }, runeGlyph(r.path, 64)), h('div', { class: 'gname' }, r.name), h('div', { class: 'hint' }, rev ? 'merkstave' : r.sound))));
    const items = rs.map(({ r, rev }, i) => ({ pos: pos[i], h: r.name, sub: rev ? 'merkstave' : '', text: rev ? r.rev + '.' : r.meaning + '.' }));
    out.append(row, renderItems(items), saveBar(() => ({ tool: 'runes', title: `Runes: ${mode}`, question: q.value(), items })));
    store.saveResult('runes-last', { themes: rs.flatMap((x) => x.r.themes) });
  }
  function cast() {
    const n = 9;
    const rs = draw(RUNES, n);
    const W = 320, R = 140;
    const board = svg('svg', { viewBox: `0 0 ${W} ${W}`, width: '100%', style: 'max-width:340px;display:block;margin:12px auto' },
      svg('circle', { cx: W / 2, cy: W / 2, r: R, stroke: 'currentColor', 'stroke-opacity': 0.3, fill: 'none' }),
      svg('circle', { cx: W / 2, cy: W / 2, r: R / 2.2, stroke: 'currentColor', 'stroke-opacity': 0.2, fill: 'none' }));
    const items = [];
    rs.forEach((r) => {
      const ang = rand() * Math.PI * 2, dist = Math.sqrt(rand()) * R * 1.15, faceUp = rand() < 0.6;
      const x = W / 2 + Math.cos(ang) * dist, y = W / 2 + Math.sin(ang) * dist;
      const g = svg('g', { transform: `translate(${x - 7},${y - 11}) scale(2)`, stroke: 'currentColor', fill: 'none', 'stroke-width': 0.6, opacity: dist > R ? 0.35 : faceUp ? 1 : 0.5 });
      g.append(faceUp ? svg('path', { d: r.path }) : svg('rect', { x: 0, y: 0, width: 6, height: 10, rx: 1 }));
      board.append(g);
      if (dist > R) return;
      if (!faceUp) { items.push({ h: `${r.name} (face down)`, text: 'Not yet active; a potential or hidden influence.' }); return; }
      items.push({ h: r.name, sub: dist < R / 2.2 ? 'center: most immediate' : 'outer ring: background', text: r.meaning + '.' });
    });
    items.sort((a, b) => (a.sub || '').localeCompare(b.sub || ''));
    out.append(board, note('Runes outside the circle are not read. Face-down runes are hidden potentials.'), renderItems(items), saveBar(() => ({ tool: 'runes', title: 'Rune cast', question: q.value(), items })));
  }
}

// ---------- Ogham ----------
export function ogham(root) {
  let n = 1;
  const q = questionBox();
  const out = h('div');
  root.append(intro('Ogham is the early medieval Irish alphabet, each letter (fid) traditionally linked with a tree. Modern practitioners draw feda as a divination system; tree associations largely come from later medieval and modern sources.'),
    seg([[1, 'One fid'], [3, 'Three feda']], n, (v) => (n = +v)), q.el, h('div', { class: 'actions' }, btn('Draw', go, 'primary')), out);
  function go() {
    clear(out);
    const pos = n === 3 ? ['Past', 'Present', 'Future'] : ['Guidance'];
    const fs = draw(OGHAM, n);
    const row = h('div', { class: 'glyphs' });
    fs.forEach((f, i) => row.append(h('div', { class: 'glyph' }, h('div', { class: 'label' }, pos[i]), oghamGlyph(f.aicme, f.count, 72), h('div', { class: 'gname' }, f.name), h('div', { class: 'hint' }, `${f.letter}, ${f.tree}`))));
    const items = fs.map((f, i) => ({ pos: pos[i], h: `${f.name}`, sub: f.tree, text: f.meaning + '.' }));
    out.append(row, renderItems(items), saveBar(() => ({ tool: 'ogham', title: 'Ogham', question: q.value(), items })));
    store.saveResult('ogham-last', { themes: fs.flatMap((f) => f.themes) });
  }
}

// ---------- Geomancy ----------
const geoAdd = (a, b) => a.map((x, i) => ((x + b[i]) % 2 === 0 ? 2 : 1));
const geoFind = (rows) => GEO.find((g) => g.rows.every((r, i) => r === rows[i]));
export function geomancy(root) {
  const q = questionBox('Your question, in a sentence');
  let house = 1;
  const out = h('div');
  root.append(intro('Geomancy generates four "mother" figures from random marks, then derives daughters, nieces, two witnesses and a judge. The judge answers the question; the witnesses show the past and future.'),
    q.el, field('Topic of the question (house)', select(GEO_HOUSES.map((t, i) => [i + 1, `${i + 1}. ${t}`]), house, { onchange: (e) => (house = +e.target.value) })),
    h('div', { class: 'actions' }, btn('Make the marks', go, 'primary')), out);
  function go() {
    const mothers = [0, 1, 2, 3].map(() => [0, 1, 2, 3].map(() => (randInt(12) + 4) % 2 === 0 ? 2 : 1));
    const daughters = [0, 1, 2, 3].map((r) => mothers.map((m) => m[r]));
    const nieces = [geoAdd(mothers[0], mothers[1]), geoAdd(mothers[2], mothers[3]), geoAdd(daughters[0], daughters[1]), geoAdd(daughters[2], daughters[3])];
    const right = geoAdd(nieces[0], nieces[1]), left = geoAdd(nieces[2], nieces[3]);
    const judge = geoAdd(right, left), recon = geoAdd(judge, mothers[0]);
    const all = [...mothers, ...daughters, ...nieces];
    clear(out);
    const shield = h('div', { class: 'geo-shield' });
    const cell = (rows, lbl) => { const f = geoFind(rows); return h('div', { class: 'cell' }, geoFigure(rows), h('div', null, lbl), h('div', { style: { color: 'var(--ink)' } }, f.name)); };
    [...daughters].reverse().forEach((d, i) => shield.append(cell(d, `D${4 - i}`)));
    [...mothers].reverse().forEach((m, i) => shield.append(cell(m, `M${4 - i}`)));
    const row2 = h('div', { class: 'geo-shield', style: { gridTemplateColumns: 'repeat(4, 1fr)' } });
    [...nieces].reverse().forEach((n, i) => row2.append(cell(n, `N${4 - i}`)));
    const row3 = h('div', { class: 'geo-shield', style: { gridTemplateColumns: 'repeat(3, 1fr)' } }, cell(left, 'Left witness'), cell(judge, 'Judge'), cell(right, 'Right witness'));
    const J = geoFind(judge), RW = geoFind(right), LW = geoFind(left), RC = geoFind(recon);
    const items = [
      { h: `Judge: ${J.name}`, sub: J.english, text: J.meaning },
      { h: `Right witness (the past, the querent): ${RW.name}`, sub: RW.english, text: RW.meaning },
      { h: `Left witness (the future, the quesited): ${LW.name}`, sub: LW.english, text: LW.meaning },
      { h: `Reconciler: ${RC.name}`, sub: RC.english, text: `A secondary judgment: ${RC.meaning}` },
    ];
    const q1 = geoFind(all[0]), qh = geoFind(all[house - 1]);
    let perf = 'No perfection: the figures of querent and quesited do not connect; the matter may not come about by itself.';
    if (house === 1) perf = 'The question concerns the querent; read the judge directly.';
    else if (all.slice(1).some((f, i) => i + 2 === house && geoFind(f) === q1)) perf = 'Occupation: the querent\'s figure also occupies the quesited house. Strong perfection; the matter is likely.';
    else {
      const adj = [house - 2, house].map((i) => (i + 12) % 12).map((i) => geoFind(all[i]));
      if (adj.includes(q1)) perf = 'Conjunction: the querent\'s figure moves beside the quesited house. Perfection; the matter can come about through effort.';
      else if (all.some((f, i) => i !== 0 && i !== house - 1 && geoFind(f) === q1) && all.some((f, i) => i !== 0 && i !== house - 1 && geoFind(f) === qh)) perf = 'Mutation or translation may connect them indirectly; the outcome depends on intermediaries.';
    }
    items.push({ h: `House ${house}: ${GEO_HOUSES[house - 1]}`, sub: qh.name, text: `${qh.meaning} ${perf}` });
    out.append(shield, row2, row3, note('Figures read top to bottom: head, neck, body, feet. One point is odd (active), two points even (passive).'), renderItems(items), saveBar(() => ({ tool: 'geomancy', title: `Geomancy: judge ${J.name}`, question: q.value(), items })));
    store.saveResult('geomancy-last', { themes: [...J.themes, ...LW.themes] });
  }
}

// ---------- Pendulum ----------
export function pendulum(root) {
  let mode = 'yesno';
  const q = questionBox('Ask a yes or no question');
  const opts = textarea({ placeholder: 'One option per line', rows: 4 });
  const optsWrap = h('div', { hidden: true }, field('Options for the chart', opts));
  const answer = h('div', { class: 'big', style: { textAlign: 'center', fontSize: '34px', minHeight: '40px' } });
  const pend = h('div', { class: 'pend' });
  const out = h('div');
  root.append(intro('Hold the phone still, breathe, and hold the question clearly. The pendulum swings, then settles. Traditionally the answer is said to come through tiny unconscious movements of the hand; here it is a random oracle in that spirit.'),
    seg([['yesno', 'Yes or no'], ['chart', 'Custom chart']], mode, (v) => { mode = v; optsWrap.hidden = v !== 'chart'; drawBase(); }),
    q.el, optsWrap, pend, answer, h('div', { class: 'actions', style: { justifyContent: 'center' } }, btn('Ask the pendulum', ask, 'primary')), out);
  let arm, bob, labels = [];
  function options() { return mode === 'yesno' ? ['Yes', 'No', 'Maybe', 'Ask again'] : opts.value.split('\n').map((s) => s.trim()).filter(Boolean); }
  function drawBase() {
    clear(pend);
    const o = options();
    const s = svg('svg', { viewBox: '0 0 300 260' });
    const cx = 150, cy = 30, L = 172;
    const n = Math.max(2, o.length);
    labels = o.map((t, i) => {
      const a = (-38 + (76 * i) / (n - 1)) * Math.PI / 180;
      const x = cx + Math.sin(a) * (L + 18), y = cy + Math.cos(a) * (L + 18);
      s.append(svg('line', { x1: cx + Math.sin(a) * (L - 10), y1: cy + Math.cos(a) * (L - 10), x2: cx + Math.sin(a) * (L + 2), y2: cy + Math.cos(a) * (L + 2), 'stroke-opacity': 0.4 }));
      s.append(svg('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, t.length > 12 ? t.slice(0, 11).toUpperCase() + '.' : t.toUpperCase()));
      return a;
    });
    arm = svg('g', { style: `transform-origin:${cx}px ${cy}px;transition:transform 0.9s cubic-bezier(.45,.05,.55,.95)` },
      svg('line', { x1: cx, y1: cy, x2: cx, y2: cy + L - 20 }), (bob = svg('path', { class: 'bob', d: `M${cx} ${cy + L - 4}L${cx - 7} ${cy + L - 20}H${cx + 7}Z` })));
    s.append(svg('circle', { cx, cy, r: 3, class: 'bob' }), arm);
    pend.append(s);
  }
  drawBase();
  opts.addEventListener('input', drawBase);
  function ask() {
    const o = options();
    if (o.length < 2) { toast('Add at least two options'); return; }
    answer.textContent = '';
    const choice = randInt(o.length);
    const target = -labels[choice] * 180 / Math.PI;
    let k = 0;
    const swings = [28, -24, 20, -16, 12];
    const step = () => {
      if (k < swings.length) { arm.style.transform = `rotate(${swings[k] + target * k / swings.length}deg)`; k++; setTimeout(step, 700); }
      else { arm.style.transform = `rotate(${target}deg)`; setTimeout(() => { answer.textContent = o[choice]; clear(out); out.append(saveBar(() => ({ tool: 'pendulum', title: 'Pendulum', question: q.value(), items: [{ h: o[choice], text: mode === 'yesno' ? '' : 'Chosen from: ' + o.join(', ') }] }))); }, 900); }
    };
    step();
  }
}

// ---------- Dice ----------
function die(n) {
  const pips = { 1: [[2, 2]], 2: [[1, 1], [3, 3]], 3: [[1, 1], [2, 2], [3, 3]], 4: [[1, 1], [3, 1], [1, 3], [3, 3]], 5: [[1, 1], [3, 1], [2, 2], [1, 3], [3, 3]], 6: [[1, 1], [3, 1], [1, 2], [3, 2], [1, 3], [3, 3]] }[n];
  return svg('svg', { viewBox: '0 0 40 40', width: 54, height: 54 }, svg('rect', { x: 2, y: 2, width: 36, height: 36, rx: 7, stroke: 'currentColor', fill: 'none' }), ...pips.map(([x, y]) => svg('circle', { cx: x * 10, cy: y * 10, r: 3, fill: 'currentColor' })));
}
export function dice(root) {
  const q = questionBox();
  const out = h('div');
  root.append(intro('Astragalomancy began with knucklebones; later traditions used three dice read by their total. Concentrate, then throw.'), q.el,
    h('div', { class: 'actions' }, btn('Throw three dice', go, 'primary')), out);
  function go() {
    const ds = [0, 1, 2].map(() => randInt(6) + 1), sum = ds.reduce((a, b) => a + b, 0);
    clear(out);
    const items = [{ h: `Total ${sum}`, text: DICE3[sum] }];
    if (ds[0] === ds[1] && ds[1] === ds[2]) items.push({ h: 'Triple', text: 'All three dice agree: the message is emphatic.' });
    else if (new Set(ds).size === 2) items.push({ h: 'A pair', text: 'Two dice agree: the matter has a strong second voice.' });
    out.append(h('div', { class: 'glyphs' }, ds.map(die)), renderItems(items), saveBar(() => ({ tool: 'dice', title: 'Dice', question: q.value(), items })));
  }
}

// ---------- Lots (cleromancy) ----------
export function lots(root) {
  let mode = 'coins';
  const q = questionBox('Ask a yes or no question');
  const opts = textarea({ placeholder: 'For lots: one option per line', rows: 3 });
  const out = h('div');
  root.append(intro('Cleromancy is the casting of lots, one of the oldest forms of divination. Use three coins for yes or no, or write your own lots and draw one.'),
    seg([['coins', 'Three coins'], ['lots', 'Draw a lot']], mode, (v) => (mode = v)), q.el, field('Your lots', opts), h('div', { class: 'actions' }, btn('Cast', go, 'primary')), out);
  function go() {
    clear(out);
    let items;
    if (mode === 'coins') {
      const cs = [0, 1, 2].map(() => rand() < 0.5);
      const heads = cs.filter(Boolean).length;
      const ans = { 3: 'Yes, emphatically.', 2: 'Yes, with some reservation.', 1: 'No, though not absolutely.', 0: 'No, emphatically.' }[heads];
      out.append(h('div', { class: 'glyphs' }, cs.map((hd) => h('div', { class: 'glyph' }, svg('svg', { viewBox: '0 0 40 40', width: 50, height: 50 }, svg('circle', { cx: 20, cy: 20, r: 17, stroke: 'currentColor', fill: hd ? 'currentColor' : 'none', 'fill-opacity': hd ? 0.12 : 0 }), svg('text', { x: 20, y: 25, 'text-anchor': 'middle', 'font-size': 13, fill: 'currentColor' }, hd ? 'H' : 'T')), h('div', { class: 'hint' }, hd ? 'heads' : 'tails')))));
      items = [{ h: ans, text: `${heads} of 3 heads.` }];
    } else {
      const o = opts.value.split('\n').map((s) => s.trim()).filter(Boolean);
      if (o.length < 2) { toast('Write at least two lots'); return; }
      const c = pick(o);
      items = [{ h: c, text: `Drawn from ${o.length} lots.` }];
    }
    out.append(renderItems(items), saveBar(() => ({ tool: 'lots', title: 'Casting lots', question: q.value(), items })));
  }
}

// ---------- Kau Cim ----------
const GRADES = [['Upper upper', 'Great fortune'], ['Upper', 'Good fortune'], ['Middle upper', 'Modest fortune'], ['Middle', 'Balanced'], ['Middle lower', 'Caution'], ['Lower', 'Difficulty']];
const KC_ADVICE = {
  0: ['Proceed confidently; heaven favors this.', 'Act now; helpers appear.', 'What was planted ripens.'],
  1: ['Steady effort brings reward.', 'Good news after a short wait.', 'Partnerships prove fortunate.'],
  2: ['Success comes, but slowly.', 'Small gains; avoid greed.', 'Keep faith and keep working.'],
  3: ['Neither gain nor loss; stay the course.', 'Wait for clearer signs.', 'Seek advice before deciding.'],
  4: ['Proceed carefully; check the details.', 'Delays are protective.', 'Guard words and money.'],
  5: ['Do not force this now.', 'Withdraw and conserve.', 'Patience and virtue will turn the tide.'],
};
const AREAS = ['Career', 'Wealth', 'Love', 'Health', 'Travel', 'Home'];
export function kaucim(root) {
  const q = questionBox('Hold your question; say it silently');
  const out = h('div');
  root.append(intro('Kau Cim (qiu qian) is practiced at temples in China and across East Asia: a cylinder of numbered bamboo sticks is shaken until one falls. The number is confirmed with moon blocks (jiaobei). Each temple has its own book of 100 poems; the guidance below is a generic reading, not a temple text.'),
    q.el, h('div', { class: 'actions' }, btn('Shake the sticks', shake, 'primary')), out);
  let stick = 0;
  function shake() {
    stick = randInt(100) + 1;
    clear(out);
    out.append(h('div', { class: 'big', style: { textAlign: 'center' } }, `No. ${stick}`), h('p', { class: 'muted', style: { textAlign: 'center' } }, 'A stick has fallen. Throw the moon blocks to confirm it.'),
      h('div', { class: 'actions', style: { justifyContent: 'center' } }, btn('Throw the moon blocks', blocks, 'primary')));
  }
  function blocks() {
    const a = rand() < 0.5, b = rand() < 0.5;
    if (a !== b) return reveal();
    toast(a ? 'Two flat sides: laughing blocks. Ask again more clearly.' : 'Two round sides: the answer is no. Shake again.');
    if (!a) shake();
  }
  function reveal() {
    const r = seeded(stick * 7919);
    const g = Math.min(5, Math.floor(Math.pow(r(), 1.3) * 6));
    const items = [{ h: `Stick ${stick}: ${GRADES[g][0]}`, sub: GRADES[g][1], text: KC_ADVICE[g][Math.floor(r() * 3)] }];
    AREAS.forEach((a) => { const gg = Math.max(0, Math.min(5, g + Math.floor(r() * 3) - 1)); items.push({ h: a, sub: GRADES[gg][1], text: KC_ADVICE[gg][Math.floor(r() * 3)] }); });
    clear(out);
    out.append(h('div', { class: 'big', style: { textAlign: 'center' } }, `No. ${stick}`), note('Confirmed: one flat and one round side (sheng bei).'), renderItems(items), saveBar(() => ({ tool: 'kaucim', title: `Fortune stick ${stick}`, question: q.value(), items })));
  }
}

// ---------- Casting stones ----------
export function stones(root) {
  const q = questionBox();
  const out = h('div');
  root.append(intro('Lithomancy is the casting of stones. This contemporary set uses thirteen stones for the seven classical planets and six life areas. Stones near the center are most immediate; stones that land close together speak to each other.'),
    q.el, h('div', { class: 'actions' }, btn('Cast the stones', go, 'primary')), out);
  function go() {
    const W = 320, R = 140, cx = W / 2;
    const placed = STONES.map((s) => { const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * R * 1.2; return { ...s, x: cx + Math.cos(a) * d, y: cx + Math.sin(a) * d, d }; });
    const s = svg('svg', { viewBox: `0 0 ${W} ${W}`, width: '100%', style: 'max-width:340px;display:block;margin:12px auto' }, svg('circle', { cx, cy: cx, r: R, stroke: 'currentColor', 'stroke-opacity': 0.3, fill: 'none' }));
    placed.forEach((p) => s.append(svg('g', { opacity: p.d > R ? 0.3 : 1 }, svg('circle', { cx: p.x, cy: p.y, r: 9, stroke: 'currentColor', fill: 'none' }), svg('text', { x: p.x, y: p.y + 22, 'text-anchor': 'middle', 'font-size': 10, fill: 'currentColor' }, p.name))));
    const inside = placed.filter((p) => p.d <= R).sort((a, b) => a.d - b.d);
    const items = inside.slice(0, 5).map((p, i) => ({ h: p.name, sub: i === 0 ? 'closest to center' : '', text: p.meaning + '.' }));
    const pairs = [];
    for (let i = 0; i < inside.length; i++) for (let j = i + 1; j < inside.length; j++) { const d = Math.hypot(inside[i].x - inside[j].x, inside[i].y - inside[j].y); if (d < 34) pairs.push(`${inside[i].name} with ${inside[j].name}`); }
    if (pairs.length) items.push({ h: 'Stones touching', text: pairs.join('; ') + '. Read these meanings together.' });
    const outside = placed.filter((p) => p.d > R).map((p) => p.name);
    if (outside.length) items.push({ h: 'Outside the circle', text: `${outside.join(', ')}: not active in this matter.` });
    clear(out);
    out.append(s, renderItems(items), saveBar(() => ({ tool: 'stones', title: 'Casting stones', question: q.value(), items })));
  }
}

// ---------- Bibliomancy ----------
export function biblio(root) {
  let mode = 'built';
  const q = questionBox();
  const own = textarea({ placeholder: 'Paste a chapter, poem or any text you love', rows: 6 });
  const pages = input({ type: 'number', inputmode: 'numeric', placeholder: 'Pages in your book', min: 1 });
  const opts = h('div');
  const out = h('div');
  const renderOpts = () => { clear(opts); if (mode === 'own') opts.append(field('Your text', own)); if (mode === 'book') opts.append(field('Your physical book', pages, 'You will get a page and line to open to.')); };
  root.append(intro('Bibliomancy asks a question and opens a text at random. Use the built-in public-domain passages, paste your own text, or let the app choose a page and line in a book you own.'),
    seg([['built', 'Built-in passages'], ['own', 'My own text'], ['book', 'A book I own']], mode, (v) => { mode = v; renderOpts(); }), opts, q.el,
    h('div', { class: 'actions' }, btn('Open at random', go, 'primary')), out);
  renderOpts();
  function go() {
    clear(out);
    let items;
    if (mode === 'built') { const [src, text] = pick(PASSAGES); items = [{ h: text, sub: '', text: src }]; }
    else if (mode === 'own') {
      const sents = own.value.replace(/\s+/g, ' ').match(/[^.!?]+[.!?]+["')\]]*/g) || [];
      if (!sents.length) { toast('Paste some text first'); return; }
      const i = randInt(sents.length);
      items = [{ h: sents[i].trim(), text: `Sentence ${i + 1} of ${sents.length}.` }];
    } else {
      const n = +pages.value;
      if (!n) { toast('Enter the number of pages'); return; }
      items = [{ h: `Page ${randInt(n) + 1}, line ${randInt(30) + 1}`, text: 'Open your book to this page, count down to the line, and read until the sentence ends.' }];
    }
    out.append(h('blockquote', { style: { fontFamily: 'var(--serif)', fontSize: '22px', lineHeight: 1.35, margin: '24px 0 8px' } }, items[0].h), h('p', { class: 'muted' }, items[0].text), saveBar(() => ({ tool: 'biblio', title: 'Bibliomancy', question: q.value(), items })));
  }
}
