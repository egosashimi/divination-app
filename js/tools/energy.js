import { h, svg, clear, section, intro, note, btn, seg, field, select, kv, renderItems, saveBar, needProfile, likert, choices, bars, photoCapture, toast } from '../core/ui.js';
import * as A from '../core/astro.js';
import * as C from '../core/chart.js';
import * as store from '../core/store.js';
import { CHAKRAS, EXTRA_CHAKRAS, AURA, AURA_QUIZ, CRYSTALS, INTENTIONS, SOLFEGGIO, ORGAN_CLOCK, YINYANG_QUIZ } from '../data/energy.js';
import { HD_GATE_ORDER, HD_CENTERS, HD_CHANNELS, HD_CENTER_TEXT, HD_TYPES, HD_PROFILE_LINES, HD_AUTH } from '../data/astro-text.js';
import { HEXAGRAMS } from '../data/casting.js';
import { daily, pick } from '../core/rng.js';

// ---------- Chakras ----------
export function chakras(root) {
  const out = h('div');
  const qs = CHAKRAS.flatMap((c) => c.q.map((q) => ({ q, k: c.key })));
  root.append(intro('The seven-chakra model comes from tantric yoga traditions, adapted in modern Western practice. Answer honestly for how you feel lately.'),
    likert(qs, (sc) => {
      const max = 12;
      const ranked = CHAKRAS.map((c) => ({ c, v: sc[c.key] })).sort((a, b) => a.v - b.v);
      const items = ranked.slice(0, 2).map(({ c, v }) => ({ h: `${c.name} (${c.sk})`, sub: `${Math.round(100 * v / max)}%`, text: `Theme: ${c.theme}. When underactive: ${c.low}. Practice: ${c.practice} Sound: ${c.bija}. Color: ${c.color}.` }));
      const strong = ranked[ranked.length - 1].c;
      items.push({ h: `Strongest: ${strong.name}`, text: `Your ${strong.theme} is a resource. If it becomes too dominant: ${strong.high}.` });
      clear(out);
      out.append(chakraFigure(sc, max), bars(Object.fromEntries(CHAKRAS.map((c) => [c.key, sc[c.key]])), Object.fromEntries(CHAKRAS.map((c) => [c.key, c.name])), max), renderItems(items), saveBar(() => ({ tool: 'chakras', title: 'Chakra check-in', items })));
      store.saveResult('chakras', { lowest: ranked[0].c.name, highest: strong.name, themes: [...ranked[0].c.themes] });
    }, { submit: 'See my balance' }), out,
    section('Twelve-chakra systems', note('Several modern systems add transpersonal chakras above the crown and below the feet. Names and positions vary between authors.'), renderItems(EXTRA_CHAKRAS.map(([n, w, t]) => ({ h: n, sub: w, text: t })))));
}
function chakraFigure(sc, max) {
  const s = svg('svg', { viewBox: '0 0 120 260', width: 120, height: 260, style: 'display:block;margin:10px auto' });
  s.append(svg('line', { x1: 60, y1: 14, x2: 60, y2: 246, stroke: 'currentColor', 'stroke-opacity': 0.2 }));
  [...CHAKRAS].reverse().forEach((c, i) => { const y = 22 + i * 36, r = 5 + 9 * (sc[c.key] / max); s.append(svg('circle', { cx: 60, cy: y, r, fill: c.hex, 'fill-opacity': 0.85 }), svg('text', { x: 82, y: y + 3, 'font-size': 9, fill: 'currentColor' }, c.name)); });
  return s;
}

// ---------- Aura ----------
export function aura(root) {
  const out = h('div');
  root.append(intro('Aura colors are a contemporary system linking personality with a color field said to surround each person. This questionnaire finds the color that best matches you now.'),
    choices(AURA_QUIZ.map(({ q, o }) => ({ q, o: o.map(([t, k]) => ({ t, k })) })), (ans) => {
      const sc = {}; ans.forEach((a) => a && (sc[a.k] = (sc[a.k] || 0) + 1));
      const ranked = Object.entries(sc).sort((a, b) => b[1] - a[1]);
      const [k1] = ranked[0], k2 = ranked[1] ? ranked[1][0] : k1;
      const items = [{ h: AURA[k1][0], sub: 'primary', text: AURA[k1][1] }];
      if (k2 !== k1) items.push({ h: AURA[k2][0], sub: 'secondary', text: AURA[k2][1] });
      clear(out);
      out.append(renderItems(items), section('Aura portrait', note('An artistic visualization of your result, not a measurement. Take a portrait and the colors are painted around it.'), auraPortrait(k1, k2)), saveBar(() => ({ tool: 'aura', title: 'Aura colors', items })));
      store.saveResult('aura', { color: AURA[k1][0], themes: AURA[k1][2] });
    }, 'See my aura'), out);
}
const AURA_HEX = { red: '#d0453a', orange: '#e68a3a', yellow: '#e8cf4a', green: '#4fae68', blue: '#3f86d6', indigo: '#5a4fc4', violet: '#a35ad0', white: '#f4f1ea', pink: '#ec8fb8', gold: '#d8b44a' };
function auraPortrait(k1, k2) {
  const canvas = h('canvas', { width: 600, height: 800, style: { width: '100%', borderRadius: '10px', display: 'none' } });
  const file = h('input', { type: 'file', accept: 'image/*', capture: 'user', class: 'hidden' });
  file.addEventListener('change', () => {
    const f = file.files[0]; if (!f) return;
    const img = new Image(); img.onload = () => {
      const ctx = canvas.getContext('2d');
      const s = Math.max(600 / img.width, 800 / img.height);
      ctx.drawImage(img, (600 - img.width * s) / 2, (800 - img.height * s) / 2, img.width * s, img.height * s);
      ctx.globalCompositeOperation = 'screen';
      const g = (x, y, r, col) => { const gr = ctx.createRadialGradient(x, y, r * 0.2, x, y, r); gr.addColorStop(0, col + '00'); gr.addColorStop(0.55, col + 'aa'); gr.addColorStop(1, col + '00'); ctx.fillStyle = gr; ctx.fillRect(0, 0, 600, 800); };
      g(300, 330, 420, AURA_HEX[k1]); g(140, 560, 300, AURA_HEX[k2]); g(470, 180, 260, AURA_HEX[k2]);
      ctx.globalCompositeOperation = 'source-over';
      canvas.style.display = 'block'; URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(f);
  });
  return h('div', null, h('div', { class: 'actions' }, btn('Take a portrait', () => file.click()), btn('Save image', () => { const a = h('a', { href: canvas.toDataURL('image/jpeg', 0.9), download: 'aura.jpg' }); a.click(); }, 'ghost')), canvas, file);
}

// ---------- Human Design ----------
const GATE_START = 302;
export function gateOf(lon) {
  const off = A.norm(lon - GATE_START);
  const idx = Math.floor(off / 5.625);
  const line = Math.floor((off % 5.625) / 0.9375) + 1;
  return { gate: HD_GATE_ORDER[idx], line };
}
export function humanDesignData(p) {
  const jp = C.birthJd(p);
  const sunP = A.body('Sun', jp).lon;
  const jd = A.findCrossing((j) => A.body('Sun', j).lon, A.norm(sunP - 88), jp - 100, 1, 20);
  const names = ['Sun', 'Earth', 'Moon', 'Node', 'SouthNode', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const act = (j) => names.map((n) => {
    let lon;
    if (n === 'Earth') lon = A.norm(A.body('Sun', j).lon + 180);
    else if (n === 'SouthNode') lon = A.norm(A.body('Node', j).lon + 180);
    else lon = A.body(n, j).lon;
    return { name: n, ...gateOf(lon) };
  });
  const pers = act(jp), des = act(jd);
  const gates = new Set([...pers, ...des].map((x) => x.gate));
  const channels = HD_CHANNELS.filter(([a, b]) => gates.has(a) && gates.has(b));
  const centerOf = (g) => Object.keys(HD_CENTERS).find((c) => HD_CENTERS[c].includes(g));
  const defined = new Set(channels.flatMap(([a, b]) => [centerOf(a), centerOf(b)]));
  const adj = {}; Object.keys(HD_CENTERS).forEach((c) => (adj[c] = new Set()));
  channels.forEach(([a, b]) => { adj[centerOf(a)].add(centerOf(b)); adj[centerOf(b)].add(centerOf(a)); });
  const reach = (from, to) => { const seen = new Set([from]); const q = [from]; while (q.length) { const c = q.shift(); if (c === to) return true; adj[c].forEach((n) => { if (!seen.has(n)) { seen.add(n); q.push(n); } }); } return false; };
  const motorToThroat = ['Heart', 'SolarPlexus', 'Root', 'Sacral'].some((m) => defined.has(m) && reach(m, 'Throat'));
  let type;
  if (!defined.size) type = 'Reflector';
  else if (defined.has('Sacral')) type = motorToThroat ? 'Manifesting Generator' : 'Generator';
  else type = motorToThroat ? 'Manifestor' : 'Projector';
  let auth;
  if (type === 'Reflector') auth = 'Lunar';
  else if (defined.has('SolarPlexus')) auth = 'Emotional';
  else if (defined.has('Sacral')) auth = 'Sacral';
  else if (defined.has('Spleen')) auth = 'Splenic';
  else if (defined.has('Heart')) auth = reach('Heart', 'Throat') ? 'Ego Manifested' : 'Ego Projected';
  else if (defined.has('G') && reach('G', 'Throat')) auth = 'Self-Projected';
  else auth = 'Mental (Environmental)';
  const profile = `${pers[0].line}/${des[0].line}`;
  const cross = [pers[0].gate, pers[1].gate, des[0].gate, des[1].gate];
  return { pers, des, gates, channels, defined, type, auth, profile, cross, designDate: A.fromJd(jd), centerOf };
}
const CENTER_POS = { Head: [100, 24], Ajna: [100, 70], Throat: [100, 122], G: [100, 178], Heart: [140, 200], Sacral: [100, 250], SolarPlexus: [160, 240], Spleen: [40, 240], Root: [100, 300] };
function bodygraph(d) {
  const s = svg('svg', { viewBox: '0 0 200 330', width: 220, height: 360, style: 'display:block;margin:10px auto' });
  d.channels.forEach(([a, b]) => { const [x1, y1] = CENTER_POS[d.centerOf(a)], [x2, y2] = CENTER_POS[d.centerOf(b)]; s.append(svg('line', { x1, y1, x2, y2, stroke: 'currentColor', 'stroke-width': 3, 'stroke-opacity': 0.75 })); });
  Object.entries(CENTER_POS).forEach(([c, [x, y]]) => {
    const def = d.defined.has(c);
    s.append(svg('rect', { x: x - 17, y: y - 13, width: 34, height: 26, rx: 4, fill: def ? 'currentColor' : 'var(--bg)', stroke: 'currentColor', 'fill-opacity': def ? 0.85 : 1 }));
    s.append(svg('text', { x, y: y + 3, 'text-anchor': 'middle', 'font-size': 7, fill: def ? 'var(--bg)' : 'currentColor' }, c === 'SolarPlexus' ? 'Solar' : c));
  });
  return s;
}
export function humandesign(root, ctx) {
  const p = ctx.profile;
  if (!p.date) { needProfile(root, 'your birth date, time and place'); return; }
  const d = humanDesignData(p);
  const T = HD_TYPES[d.type];
  const [pl, dl] = d.profile.split('/').map(Number);
  const items = [
    { h: d.type, sub: `Strategy: ${T.strategy}`, text: `${T.text} Signature: ${T.signature}. Not-self theme: ${T.notSelf}.` },
    { h: `${d.auth} authority`, text: HD_AUTH[d.auth] },
    { h: `Profile ${d.profile}`, sub: `${HD_PROFILE_LINES[pl - 1]} / ${HD_PROFILE_LINES[dl - 1]}`, text: `Your conscious role is the ${HD_PROFILE_LINES[pl - 1]}; your unconscious, bodily role is the ${HD_PROFILE_LINES[dl - 1]}.` },
    { h: `Incarnation cross ${d.cross.slice(0, 2).join('/')} | ${d.cross.slice(2).join('/')}`, text: `Your life theme is built from gates ${d.cross.join(', ')} (I Ching: ${d.cross.map((g) => HEXAGRAMS[g][1]).join(', ')}).` },
  ];
  const centers = Object.keys(HD_CENTERS).map((c) => ({ h: `${c === 'SolarPlexus' ? 'Solar Plexus' : c}: ${d.defined.has(c) ? 'defined' : 'open'}`, sub: HD_CENTER_TEXT[c][0], text: HD_CENTER_TEXT[c][d.defined.has(c) ? 1 : 2] }));
  const ch = d.channels.map(([a, b]) => `${a}-${b}`).join(', ') || 'none';
  root.append(intro('Human Design, created by Ra Uru Hu in 1987, blends astrology, the I Ching, the chakra system and Kabbalah. It uses your birth moment (personality, conscious) and the moment the Sun was 88 degrees earlier (design, unconscious).'),
    !p.time ? note('Without a birth time, the Moon and possibly the type and profile may be wrong.') : null,
    bodygraph(d), renderItems(items),
    section('Centers', renderItems(centers)),
    section('Channels and gates', kv([['Defined channels', ch], ['Design date', d.designDate.toLocaleDateString()]]),
      h('div', { class: 'scroll-x', style: { marginTop: '12px' } }, h('table', { class: 't' }, h('thead', null, h('tr', null, h('th', null, ''), h('th', null, 'Personality'), h('th', null, 'Design'))),
        h('tbody', null, d.pers.map((x, i) => h('tr', null, h('td', null, x.name === 'Node' ? 'North Node' : x.name === 'SouthNode' ? 'South Node' : x.name), h('td', null, `${x.gate}.${x.line}`), h('td', null, `${d.des[i].gate}.${d.des[i].line}`))))))),
    note('Gate and channel names and longer descriptions are part of the proprietary Human Design system; here gates are labelled by their I Ching hexagrams.'),
    saveBar(() => ({ tool: 'humandesign', title: 'Human Design', items: [...items, ...centers] })));
  store.saveResult('humandesign', { type: d.type, authority: d.auth, profile: d.profile, themes: { Manifestor: ['beginning', 'power'], Generator: ['structure', 'abundance'], 'Manifesting Generator': ['change', 'power'], Projector: ['introspection', 'partnership'], Reflector: ['intuition', 'harmony'] }[d.type] });
}

export function genekeys(root, ctx) {
  const p = ctx.profile;
  if (!p.date) { needProfile(root, 'your birth date and time'); return; }
  const d = humanDesignData(p);
  const pers = Object.fromEntries(d.pers.map((x) => [x.name, x])), des = Object.fromEntries(d.des.map((x) => [x.name, x]));
  const seq = [
    ['Activation sequence', [['Life\'s work', pers.Sun, 'Your core gift to the world'], ['Evolution', pers.Earth, 'The challenge that grounds you'], ['Radiance', des.Sun, 'What keeps you healthy and shining'], ['Purpose', des.Earth, 'Your deepest calling']]],
    ['Venus sequence', [['Attraction', des.Moon, 'Who you attract'], ['IQ', des.Venus, 'Your mental patterning'], ['EQ', des.Mars, 'Your emotional patterning'], ['SQ', pers.Venus, 'Your spiritual intelligence']]],
    ['Pearl sequence', [['Vocation', des.Mars, 'Your natural field of work'], ['Culture', des.Jupiter, 'Where you flourish in groups'], ['Pearl', pers.Jupiter, 'Your prosperity']]],
  ];
  root.append(intro('Gene Keys, developed by Richard Rudd, reads the same 64 positions as Human Design as a contemplative path from shadow to gift to siddhi. Here are your keys and lines; the full texts are found in Rudd\'s published work.'),
    ...seq.map(([t, rows]) => section(t, renderItems(rows.map(([name, x, desc]) => ({ h: `${name}: Key ${x.gate}.${x.line}`, sub: desc, text: `Hexagram ${x.gate}, ${HEXAGRAMS[x.gate][1]}: ${HEXAGRAMS[x.gate][2]}` }))))),
    saveBar(() => ({ tool: 'genekeys', title: 'Gene Keys profile', items: seq.flatMap(([, rows]) => rows.map(([name, x]) => ({ h: `${name}: Key ${x.gate}.${x.line}`, text: HEXAGRAMS[x.gate][1] }))) })));
}

// ---------- Meridian clock ----------
export function meridians(root) {
  const now = new Date(), hr = now.getHours();
  const cur = ORGAN_CLOCK.find(([a, b]) => (a < b ? hr >= a && hr < b : hr >= a || hr < b));
  const S = 280, c = S / 2, R = 110;
  const s = svg('svg', { viewBox: `0 0 ${S} ${S}`, width: '100%', style: 'max-width:300px;display:block;margin:10px auto' });
  s.append(svg('circle', { cx: c, cy: c, r: R, fill: 'none', stroke: 'currentColor', 'stroke-opacity': 0.3 }));
  ORGAN_CLOCK.forEach(([a, , organ], i) => {
    const ang = ((a + 1) / 24) * 2 * Math.PI - Math.PI / 2;
    const on = organ === cur[2];
    s.append(svg('text', { x: c + (R - 22) * Math.cos(ang), y: c + (R - 22) * Math.sin(ang), 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': on ? 11 : 9, fill: 'currentColor', 'fill-opacity': on ? 1 : 0.55, 'font-weight': on ? 600 : 400 }, organ.replace('Large Intestine', 'L. Int.').replace('Small Intestine', 'S. Int.').replace('Triple Burner', 'T. Burner').replace('Gallbladder', 'G.B.').replace('Pericardium', 'Pericard.')));
    const a2 = (a / 24) * 2 * Math.PI - Math.PI / 2;
    s.append(svg('line', { x1: c + R * Math.cos(a2), y1: c + R * Math.sin(a2), x2: c + (R - 8) * Math.cos(a2), y2: c + (R - 8) * Math.sin(a2), stroke: 'currentColor', 'stroke-opacity': 0.4 }));
    void i;
  });
  const ha = ((hr + now.getMinutes() / 60) / 24) * 2 * Math.PI - Math.PI / 2;
  s.append(svg('line', { x1: c, y1: c, x2: c + (R - 40) * Math.cos(ha), y2: c + (R - 40) * Math.sin(ha), stroke: 'currentColor' }), svg('circle', { cx: c, cy: c, r: 3, fill: 'currentColor' }));
  root.append(intro('The Chinese body clock describes qi flowing through the twelve meridians in two-hour tides.'), s,
    renderItems([{ h: `Now: ${cur[2]} (${cur[0]}:00 to ${cur[1]}:00)`, sub: cur[3], text: cur[4] }]),
    section('The full day', renderItems(ORGAN_CLOCK.map(([a, b, o, e, t]) => ({ h: `${a}:00 to ${b}:00  ${o}`, sub: e, text: t })))));
}

export function yinyang(root) {
  const out = h('div');
  root.append(intro('Yin is cool, receptive, inward and still; yang is warm, active, outward and moving. Health in Chinese thought is their dynamic balance.'),
    likert(YINYANG_QUIZ.map(([q, k]) => ({ q, k })), (sc) => {
      const d = sc.yang - sc.yin;
      const items = [{ h: d > 4 ? 'Yang leaning' : d < -4 ? 'Yin leaning' : 'Balanced', sub: `yang ${sc.yang}, yin ${sc.yin}`, text: d > 4 ? 'Lots of heat and activity. Balance with rest, cooling foods, quiet and water.' : d < -4 ? 'Coolness and stillness dominate. Balance with warmth, movement, sunlight and warming foods.' : 'Your energies are in reasonable balance. Keep alternating effort with rest.' }];
      clear(out);
      out.append(bars(sc, { yang: 'Yang', yin: 'Yin' }, 20), renderItems(items), saveBar(() => ({ tool: 'yinyang', title: 'Yin and yang', items })));
      store.saveResult('yinyang', { balance: items[0].h });
    }), out);
}

// ---------- Breath and subtle body ----------
export function breath(root) {
  let pattern = 'box', timer = null;
  const P = { box: [['Inhale', 4], ['Hold', 4], ['Exhale', 4], ['Hold', 4]], nadi: [['Inhale left', 4], ['Hold', 4], ['Exhale right', 6], ['Inhale right', 4], ['Hold', 4], ['Exhale left', 6]], calm: [['Inhale', 4], ['Hold', 7], ['Exhale', 8]], coherent: [['Inhale', 5.5], ['Exhale', 5.5]] };
  const orb = h('div', { class: 'orb' }, h('span', null, 'Ready'));
  const label = orb.firstChild;
  const start = btn('Begin', () => (timer ? stop() : run()), 'primary');
  function run() {
    let i = 0; start.textContent = 'Stop';
    const step = () => {
      const seq = P[pattern], [t, sec] = seq[i % seq.length];
      label.textContent = t;
      orb.style.transitionDuration = sec + 's';
      orb.style.transform = t.startsWith('Inhale') ? 'scale(1)' : t.startsWith('Exhale') ? 'scale(0.55)' : orb.style.transform;
      i++; timer = setTimeout(step, sec * 1000);
    };
    step();
  }
  function stop() { clearTimeout(timer); timer = null; start.textContent = 'Begin'; label.textContent = 'Ready'; orb.style.transform = 'scale(0.55)'; }
  root.append(intro('In yoga, prana is life force moving through the nadis, subtle channels. The three principal nadis are ida (left, lunar, cooling), pingala (right, solar, warming) and sushumna (central), through which kundalini is said to rise.'),
    seg([['box', 'Box breathing'], ['nadi', 'Nadi shodhana'], ['calm', '4-7-8'], ['coherent', 'Coherent']], pattern, (v) => { pattern = v; if (timer) { stop(); } }),
    h('div', { class: 'breath' }, orb), h('div', { class: 'actions', style: { justifyContent: 'center' } }, start),
    note('Nadi shodhana (alternate nostril breathing): close the right nostril with the thumb to inhale left, close the left with the ring finger to exhale right, and continue alternating. Stop if you feel dizzy.'));
}

// ---------- Crystals ----------
export function crystals(root) {
  let intent = 'calm';
  const out = h('div');
  const today = pick(CRYSTALS, daily('crystal'));
  const draw = () => { clear(out); out.append(renderItems(CRYSTALS.filter((c) => c.tags.includes(intent) || c.tags.includes('all')).map((c) => ({ h: c.name, text: c.kw + '.' })))); };
  root.append(intro('Crystal traditions associate stones with qualities and intentions. These are folk and contemporary associations, not medical properties.'),
    renderItems([{ pos: 'Crystal of the day', h: today.name, text: today.kw + '.' }]),
    field('Intention', select(INTENTIONS, intent, { onchange: (e) => { intent = e.target.value; draw(); } })), out);
  draw();
}

// ---------- Sound ----------
let audio = null;
export function sound(root) {
  let current = null;
  const stopAll = () => { if (current) { current.forEach((n) => { try { n.stop(); } catch {} }); current = null; } };
  const play = (f, binaural = 0) => {
    stopAll();
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    const g = audio.createGain(); g.gain.value = 0; g.connect(audio.destination);
    g.gain.linearRampToValueAtTime(0.15, audio.currentTime + 1.2);
    const mk = (freq, pan) => { const o = audio.createOscillator(); o.type = 'sine'; o.frequency.value = freq; if (pan != null && audio.createStereoPanner) { const p = audio.createStereoPanner(); p.pan.value = pan; o.connect(p); p.connect(g); } else o.connect(g); o.start(); return o; };
    current = binaural ? [mk(f, -1), mk(f + binaural, 1)] : [mk(f)];
  };
  let beat = 0;
  root.append(intro('Sound healing traditions use tones, chants and drones. The solfeggio frequencies are a modern set of tones associated with chakras and intentions; their claimed effects are not scientifically established. Use low volume.'),
    seg([[0, 'Pure tone'], [6, 'Binaural theta (headphones)'], [10, 'Binaural alpha (headphones)']], beat, (v) => (beat = +v)),
    h('div', { class: 'list' }, SOLFEGGIO.map(([f, t]) => h('div', { class: 'li', style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } }, h('div', null, h('div', { class: 'li-t' }, `${f} Hz`), h('div', { class: 'li-s' }, t)), btn('Play', () => play(f, beat), 'small')))),
    h('div', { class: 'actions' }, btn('Stop', stopAll, 'ghost')),
    section('Chakra seed sounds', renderItems(CHAKRAS.map((c) => ({ h: `${c.bija}`, sub: c.name, text: `Chant on the out-breath, feeling the vibration at the ${c.loc}.` })))));
  window.addEventListener('hashchange', stopAll, { once: true });
}
