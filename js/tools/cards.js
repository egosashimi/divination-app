import { h, clear, section, intro, note, btn, seg, select, field, questionBox, renderItems, saveBar, roman, toast, kv, input } from '../core/ui.js';
import { card } from '../core/marks.js';
import { draw, rand } from '../core/rng.js';
import * as store from '../core/store.js';
import { DECK, SPREADS, cardName, cardNumber, SUIT_INFO } from '../data/tarot.js';
import { LENORMAND, PLAYING, PLAYING_SUITS, PLAYING_RANKS } from '../data/casting.js';
import { ORACLE_DECKS } from '../data/oracle.js';
import { THEMES } from '../data/lexicon.js';

const DECK_STYLES = [['rws', 'Rider-Waite'], ['thoth', 'Thoth'], ['mar', 'Marseille']];
const STYLE_NOTE = {
  rws: 'Rider-Waite-Smith (1909): illustrated pips, Strength at VIII and Justice at XI.',
  thoth: 'Thoth (Crowley and Harris): Adjustment at VIII, Lust at XI, Art, Aeon and Universe; courts are Knight, Queen, Prince and Princess.',
  mar: 'Tarot de Marseille: the older European pattern. Justice at VIII, Strength at XI, Death is the unnamed arcanum.',
};

export function tarotFace(c, style) {
  const n = cardNumber(c, style);
  return {
    num: c.arcana === 'major' ? (n === 0 ? '0' : roman(n)) : '',
    name: cardName(c, style),
    foot: c.arcana === 'major' ? 'Major arcana' : (style === 'thoth' && c.thothTitle ? c.thothTitle : c.element),
    markKey: c.arcana === 'major' ? 'major' : c.suit,
  };
}
export function tarotItem(c, rev, style, pos) {
  const name = cardName(c, style);
  return {
    pos, h: name, sub: rev ? 'reversed' : (c.arcana === 'major' ? 'Major arcana' : SUIT_INFO[c.suit].element),
    text: `${rev ? c.rev : c.up}. ${rev ? 'Reversed, the energy is blocked, internal or delayed: ' + c.msg.charAt(0).toLowerCase() + c.msg.slice(1) : c.msg}`,
  };
}
export function drawTarot(n, reversals = true, r = rand) {
  return draw(DECK, n, r).map((c) => ({ card: c, rev: reversals && r() < 0.3 }));
}

function tarotSummary(drawn, spreadKey) {
  const lines = [];
  const majors = drawn.filter((d) => d.card.arcana === 'major').length;
  const suits = {};
  drawn.forEach((d) => { if (d.card.suit) suits[d.card.suit] = (suits[d.card.suit] || 0) + 1; });
  const revs = drawn.filter((d) => d.rev).length;
  if (spreadKey === 'yesno') {
    const d = drawn[0];
    const neutral = ['M2', 'M12', 'M18', 'M10'].includes(d.card.id);
    lines.push(neutral ? 'Unclear. This card points to timing or hidden factors; ask again later.' : d.rev ? 'Leaning no, or not yet.' : 'Leaning yes.');
  }
  if (drawn.length >= 3) {
    if (majors / drawn.length >= 0.5) lines.push(`${majors} of ${drawn.length} cards are Major Arcana: significant, larger-than-daily themes are at work.`);
    else if (majors === 0) lines.push('No Major Arcana: this is in your hands, a matter of everyday choices.');
    const top = Object.entries(suits).sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] >= 2) lines.push(`${SUIT_INFO[top[0]].rws} dominate: the focus is ${SUIT_INFO[top[0]].domain}.`);
    if (revs / drawn.length > 0.5) lines.push('Many reversals: energy is turned inward, delayed or resisted.');
    const themes = {};
    drawn.forEach((d) => d.card.themes.forEach((t) => (themes[t] = (themes[t] || 0) + 1)));
    const tt = Object.entries(themes).sort((a, b) => b[1] - a[1]).filter(([, v]) => v >= 2).slice(0, 2);
    if (tt.length) lines.push('Recurring themes: ' + tt.map(([k]) => THEMES[k].toLowerCase()).join('; ') + '.');
  }
  return lines;
}

export function tarot(root, ctx) {
  let style = ctx.settings.deck, reversals = ctx.settings.reversals, spreadKey = ctx.params[0] || 'three';
  const q = questionBox();
  const spreadSel = select(Object.entries(SPREADS).map(([k, s]) => [k, `${s.name} (${s.pos.length})`]), spreadKey, { onchange: (e) => (spreadKey = e.target.value) });
  const styleNote = note(STYLE_NOTE[style]);
  const out = h('div');
  root.append(
    intro('Hold your question in mind, choose a spread and draw. Tap each card to turn it over.'),
    field('Spread', spreadSel),
    field('Deck', seg(DECK_STYLES, style, (v) => { style = v; store.setSettings({ deck: v }); styleNote.textContent = STYLE_NOTE[v]; })),
    seg([['on', 'Reversals on'], ['off', 'Reversals off']], reversals ? 'on' : 'off', (v) => { reversals = v === 'on'; store.setSettings({ reversals }); }),
    styleNote, q.el,
    h('div', { class: 'actions' }, btn('Shuffle and draw', () => doDraw(), 'primary')),
    out);

  function doDraw() {
    const sp = SPREADS[spreadKey];
    const drawn = drawTarot(sp.pos.length, reversals);
    clear(out);
    const grid = h('div', { class: 'spread' + (spreadKey === 'celtic' ? ' celtic' : '') });
    const reading = h('div');
    let opened = 0;
    const cards = drawn.map((d, i) => {
      const el = card(tarotFace(d.card, style), { reversed: d.rev, onOpen: () => { opened++; revTags[i].textContent = d.rev ? 'Reversed' : ''; if (opened === drawn.length) showReading(); } });
      return el;
    });
    const revTags = drawn.map(() => h('div', { class: 'revtag' }));
    drawn.forEach((d, i) => grid.append(h('div', { class: 'slot' }, h('div', { class: 'label' }, sp.pos[i]), cards[i], revTags[i])));
    out.append(grid, h('div', { class: 'actions' }, btn('Reveal all', () => cards.forEach((c) => c.flip()), 'ghost')), reading);
    function showReading() {
      clear(reading);
      const items = drawn.map((d, i) => tarotItem(d.card, d.rev, style, sp.pos[i]));
      const sum = tarotSummary(drawn, spreadKey);
      const r = { tool: 'tarot', title: `Tarot: ${sp.name}`, question: q.value(), items: [...(sum.length ? [{ h: 'Overview', text: sum.join(' ') }] : []), ...items], meta: { cards: drawn.map((d) => [d.card.id, d.rev]) } };
      reading.append(sum.length ? section('Overview', h('p', null, sum.join(' '))) : null, renderItems(items), saveBar(() => r));
      store.saveResult('tarot-last', { cards: drawn.map((d) => d.card.id), themes: drawn.flatMap((d) => d.card.themes), question: q.value() });
    }
  }
}

// ---------- Lenormand ----------
const LSPREADS = { one: ['Card of the day', 1], line3: ['Line of three', 3], line5: ['Line of five', 5], box: ['Nine-card box', 9], gt: ['Grand Tableau', 36] };
const lface = (c) => ({ num: String(c.n), name: c.name, foot: c.inset.replace(/([0-9AJQK]+)([HDCS])/, (_, r, s) => `${r} of ${{ H: 'hearts', D: 'diamonds', C: 'clubs', S: 'spades' }[s]}`), markKey: { H: 'H', D: 'D', C: 'C', S: 'S' }[c.inset.slice(-1)] });
const pairText = (a, b) => `${a.name} + ${b.name}: ${b.adj} ${a.noun}`;

export function lenormand(root, ctx) {
  let sp = 'line3', sig = ctx.profile.lenormandSig || 29;
  const q = questionBox();
  const out = h('div');
  root.append(intro('Lenormand reads cards in combination: each card is a noun, and its neighbor describes it. Direct and concrete.'),
    field('Spread', select(Object.entries(LSPREADS).map(([k, [n, c]]) => [k, `${n} (${c})`]), sp, { onchange: (e) => (sp = e.target.value) })),
    field('Your significator (for the Grand Tableau)', seg([[29, 'Woman (29)'], [28, 'Man (28)']], sig, (v) => { sig = +v; const p = store.profile(); p.lenormandSig = sig; store.setProfile(p); })),
    q.el, h('div', { class: 'actions' }, btn('Shuffle and draw', go, 'primary')), out);
  function go() {
    const [name, n] = LSPREADS[sp];
    const cards = draw(LENORMAND, n);
    clear(out);
    const items = [];
    if (sp === 'gt') {
      const grid = h('div', { class: 'spread', style: { gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px' } });
      cards.forEach((c, i) => grid.append(h('div', { class: 'slot', style: i === 32 ? { gridColumnStart: 3 } : {} }, card(lface(c), { open: true }))));
      out.append(grid);
      const idx = cards.findIndex((c) => c.n === sig);
      const rowOf = (i) => (i < 32 ? Math.floor(i / 8) : 4), colOf = (i) => (i < 32 ? i % 8 : i - 32 + 2);
      const near = cards.filter((c, i) => i !== idx && Math.abs(rowOf(i) - rowOf(idx)) <= 1 && Math.abs(colOf(i) - colOf(idx)) <= 1);
      items.push({ h: `Your card sits in the house of ${LENORMAND[idx].name}`, text: `The matter is colored by ${LENORMAND[idx].meaning.toLowerCase()}.` });
      items.push({ h: 'Closest to you', text: near.map((c) => `${c.name} (${c.meaning.toLowerCase()})`).join('; ') + '.' });
      const left = colOf(idx) === 0 ? 'Nothing stands behind you: a fresh slate.' : `Cards to your left (the past) number ${colOf(idx)}; to your right (the future) ${7 - Math.min(7, colOf(idx))}.`;
      items.push({ h: 'Past and future', text: left });
      ['Heart', 'Ring', 'Fish', 'Tree', 'Fox'].forEach((k) => {
        const i = cards.findIndex((c) => c.name === k);
        items.push({ h: `${k} in the house of ${LENORMAND[i].name}`, text: `${{ Heart: 'Love', Ring: 'Commitment', Fish: 'Money', Tree: 'Health', Fox: 'Work' }[k]} is shaped by ${LENORMAND[i].meaning.toLowerCase()}.` });
      });
    } else {
      const grid = h('div', { class: 'spread', style: sp === 'box' ? { gridTemplateColumns: 'repeat(3, 1fr)' } : {} });
      cards.forEach((c) => grid.append(h('div', { class: 'slot' }, card(lface(c), { open: true }))));
      out.append(grid);
      cards.forEach((c) => items.push({ h: c.name, sub: `#${c.n}`, text: c.meaning + '.' }));
      if (sp === 'line3' || sp === 'line5') {
        const mid = cards[Math.floor(n / 2)];
        items.unshift({ h: 'Focus', text: `The center card, ${mid.name}, is the heart of the matter: ${mid.meaning.toLowerCase()}.` });
        const pairs = []; for (let i = 0; i < n - 1; i++) pairs.push(pairText(cards[i], cards[i + 1]));
        items.splice(1, 0, { h: 'Combinations', text: pairs.join('. ') + '.' });
      }
      if (sp === 'box') {
        const c = cards;
        items.unshift({ h: 'Center', text: `${c[4].name}: ${c[4].meaning.toLowerCase()}.` },
          { h: 'Rows', text: `Above (conscious, what you think): ${c[0].name}, ${c[1].name}, ${c[2].name}. Middle (present): ${c[3].name}, ${c[4].name}, ${c[5].name}. Below (what is under control or underfoot): ${c[6].name}, ${c[7].name}, ${c[8].name}.` },
          { h: 'Columns', text: `Past: ${c[0].name}, ${c[3].name}, ${c[6].name}. Future: ${c[2].name}, ${c[5].name}, ${c[8].name}.` },
          { h: 'Corners', text: `The four corners summarize: ${pairText(c[0], c[8])}; ${pairText(c[2], c[6])}.` });
      }
    }
    const r = { tool: 'lenormand', title: `Lenormand: ${name}`, question: q.value(), items };
    out.append(renderItems(items), saveBar(() => r));
    store.saveResult('lenormand-last', { themes: cards.slice(0, 9).flatMap((c) => c.themes) });
  }
}

// ---------- Playing cards ----------
export function cartomancy(root) {
  const deck = [];
  PLAYING_SUITS.forEach((s) => PLAYING_RANKS.forEach((r, i) => deck.push({ s, r, i, meaning: PLAYING[s.key][i] })));
  let n = 3;
  const q = questionBox();
  const out = h('div');
  const positions = { 1: ['Answer'], 3: ['Past', 'Present', 'Future'], 5: ['You', 'Situation', 'Obstacle', 'Advice', 'Outcome'], 9: ['Past 1', 'Past 2', 'Past 3', 'Present 1', 'Present 2', 'Present 3', 'Future 1', 'Future 2', 'Future 3'] };
  root.append(intro('Traditional cartomancy with a standard 52-card deck. Hearts speak of love, diamonds of money and news, clubs of work and friends, spades of trials and change.'),
    seg([[1, 'One card'], [3, 'Three'], [5, 'Five'], [9, 'Nine']], n, (v) => (n = +v)), q.el,
    h('div', { class: 'actions' }, btn('Shuffle and draw', go, 'primary')), out);
  function go() {
    const cs = draw(deck, n);
    clear(out);
    const grid = h('div', { class: 'spread', style: n === 9 ? { gridTemplateColumns: 'repeat(3, 1fr)' } : {} });
    cs.forEach((c, i) => grid.append(h('div', { class: 'slot' }, h('div', { class: 'label' }, positions[n][i]), card({ num: c.r, name: `${c.r} of ${c.s.name}`, foot: c.s.domain.split(',')[0], markKey: c.s.key }, { open: true }))));
    const items = cs.map((c, i) => ({ pos: positions[n][i], h: `${c.r} of ${c.s.name}`, text: c.meaning + '.' }));
    const counts = {}; cs.forEach((c) => (counts[c.s.name] = (counts[c.s.name] || 0) + 1));
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (n >= 3 && top[1] >= 2) items.unshift({ h: 'Overview', text: `${top[0]} lead the reading: matters of ${PLAYING_SUITS.find((s) => s.name === top[0]).domain}.` });
    out.append(grid, renderItems(items), saveBar(() => ({ tool: 'cartomancy', title: 'Playing cards', question: q.value(), items })));
  }
}

// ---------- Oracle decks ----------
export function oracle(root, ctx) {
  let deckKey = ctx.arg || 'animal', n = 1;
  const q = questionBox();
  const out = h('div');
  const noteEl = note(ORACLE_DECKS[deckKey].note);
  root.append(intro('Oracle decks speak simply. Draw one card for the day or three for a fuller message.'),
    field('Deck', select(Object.entries(ORACLE_DECKS).map(([k, d]) => [k, d.name]), deckKey, { onchange: (e) => { deckKey = e.target.value; noteEl.textContent = ORACLE_DECKS[deckKey].note; } })),
    noteEl, seg([[1, 'One card'], [3, 'Three cards']], n, (v) => (n = +v)), q.el,
    h('div', { class: 'actions' }, btn('Draw', go, 'primary')), out);
  function go() {
    const d = ORACLE_DECKS[deckKey];
    const cs = draw(d.cards, n);
    clear(out);
    const pos = n === 3 ? ['What is', 'What helps', 'What is emerging'] : ['Your card'];
    const grid = h('div', { class: 'spread', style: { gridTemplateColumns: `repeat(${n}, minmax(0, 140px))`, justifyContent: 'center' } });
    cs.forEach(([name], i) => grid.append(h('div', { class: 'slot' }, h('div', { class: 'label' }, pos[i]), card({ name, foot: d.name, markKey: deckKey === 'moon' ? 'moon' : deckKey === 'angel' ? 'star' : 'eye' }))));
    const items = cs.map(([name, msg], i) => ({ pos: pos[i], h: name, text: msg }));
    out.append(grid, h('div', { class: 'actions' }, btn('Reveal', () => grid.querySelectorAll('.tc').forEach((c) => c.flip()), 'ghost')), renderItems(items), saveBar(() => ({ tool: 'oracle', title: `Oracle: ${d.name}`, question: q.value(), items })));
    store.saveResult('oracle-last', { themes: cs.flatMap((c) => c[2] || []) });
  }
}

// ---------- Tarot birth cards ----------
const MAJOR = DECK.filter((c) => c.arcana === 'major');
function birthPair(m, d, y) {
  let s = m + d + y;
  while (s > 22) s = String(s).split('').reduce((a, c) => a + +c, 0);
  const first = s === 22 ? 0 : s;
  let second = s;
  while (second > 9) second = String(second).split('').reduce((a, c) => a + +c, 0);
  return [first, second];
}
export function birthcards(root, ctx) {
  const p = ctx.profile;
  const dateIn = input({ type: 'date', value: p.date || '' });
  const out = h('div');
  root.append(intro('Tarot birth cards (after Mary K. Greer) translate your birth date into Major Arcana. The personality card shows how you appear and act; the soul card shows the deeper purpose.'),
    field('Birth date', dateIn), h('div', { class: 'actions' }, btn('Find my cards', go, 'primary')), out);
  function go() {
    if (!dateIn.value) { toast('Enter a date'); return; }
    const [y, m, d] = dateIn.value.split('-').map(Number);
    const [pers, soul] = birthPair(m, d, y);
    const yr = new Date().getFullYear();
    const [yc] = birthPair(m, d, yr);
    clear(out);
    const items = [];
    const show = (n, label) => { const c = MAJOR[n]; items.push({ pos: label, h: `${n === 0 ? 0 : roman(n)}. ${c.names.rws}`, text: `${c.up}. ${c.msg}` }); };
    show(pers, pers === soul ? 'Personality and soul card' : 'Personality card');
    if (pers !== soul) show(soul, 'Soul card');
    if (pers === soul) {
      const extra = [soul + 9, soul + 18].filter((x) => x <= 21);
      if (extra.length) items.push({ h: 'Constellation', text: `Your number also links ${extra.map((x) => MAJOR[x].names.rws).join(' and ')}, cards that share your root vibration of ${soul}.` });
    }
    show(yc === 22 ? 0 : yc, `Year card for ${yr}`);
    const grid = h('div', { class: 'spread', style: { gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 130px))', justifyContent: 'center' } });
    [pers, soul].filter((v, i, a) => a.indexOf(v) === i).forEach((n) => grid.append(h('div', { class: 'slot' }, card(tarotFace(MAJOR[n], 'rws'), { open: true }))));
    out.append(grid, renderItems(items), saveBar(() => ({ tool: 'birthcards', title: 'Tarot birth cards', items })));
    store.saveResult('birthcards', { pers, soul, themes: [...MAJOR[pers].themes, ...MAJOR[soul].themes] });
  }
  if (p.date) go();
}
