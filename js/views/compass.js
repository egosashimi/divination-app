import { h, clear, section, intro, note, btn, seg, field, renderItems, saveBar, copyText, toast, textarea } from '../core/ui.js';
import * as A from '../core/astro.js';
import * as C from '../core/chart.js';
import * as N from '../core/numerology.js';
import * as Z from '../core/chinese.js';
import * as store from '../core/store.js';
import { THEMES, NUMBER, PERSONAL_YEAR } from '../data/lexicon.js';
import { PLANET_TEXT, SIGN_TEXT } from '../data/astro-text.js';
import { drawTarot } from '../tools/cards.js';
import { cardName } from '../data/tarot.js';
import { HEXAGRAMS, kingWen } from '../data/casting.js';
import { DREAM } from '../data/symbols.js';
import { recurringSymbols } from '../tools/inner.js';
import { rand } from '../core/rng.js';

const OPPOSITES = [['beginning', 'completion'], ['change', 'structure'], ['expression', 'introspection'], ['abundance', 'challenge'], ['power', 'harmony']];
const GUIDANCE = {
  beginning: 'Start something. The traditions favor initiative over waiting.', partnership: 'Work through relationships; what you need comes with and through others.',
  expression: 'Be seen and heard. Create, speak and share.', structure: 'Build foundations. Patience, plans and discipline pay.',
  change: 'Stay flexible. Movement and the unexpected are part of the path.', harmony: 'Tend what you love: home, care and balance.',
  introspection: 'Go inward. Study, rest and reflection bring the answers.', power: 'Own your ambition and act with authority.',
  completion: 'Finish and release. Make room for the next cycle.', transformation: 'Allow deep change; something is being remade.',
  intuition: 'Trust intuition and dreams over logic for now.', healing: 'Prioritize recovery and gentleness.',
  abundance: 'Opportunities are open; say yes to growth.', challenge: 'Expect tests; they are strengthening you.',
};
const EL_THEME = { Wood: ['abundance', 'beginning'], Fire: ['expression'], Earth: ['structure', 'harmony'], Metal: ['completion', 'structure'], Water: ['intuition', 'introspection'] };
const WEST_THEME = { Fire: ['power', 'expression'], Earth: ['structure', 'abundance'], Air: ['expression', 'partnership'], Water: ['intuition', 'healing'] };

export function gather(p, settings, horizon, question) {
  const voices = [];
  const add = (system, line, themes, element = null) => voices.push({ system, line, themes: [...new Set(themes.filter(Boolean))], element });
  const res = store.results();
  const j0 = A.jd(new Date());
  if (C.hasBirth(p)) {
    const ch = C.computeChart(p, { zodiac: settings.zodiac, houseSystem: settings.houses });
    const bal = C.balance(ch);
    const dom = Object.entries(bal.el).sort((a, b) => b[1] - a[1])[0][0];
    const asc = ch.houses ? `, ${A.SIGNS[A.signOf(ch.houses.asc)]} rising` : '';
    add('Western astrology (natal)', `Sun ${A.SIGNS[ch.bodies.Sun.sign]}, Moon ${A.SIGNS[ch.bodies.Moon.sign]}${asc}; ${dom} is the dominant element.`, WEST_THEME[dom], dom);
    const days = horizon === 'day' ? 2 : horizon === 'month' ? 31 : 365;
    const tr = C.upcomingTransits(ch, j0 - (horizon === 'day' ? 30 : 0), days + (horizon === 'day' ? 30 : 0)).filter((t) => t.transit !== 'Node').slice(0, 8);
    const now = C.transitsTo(ch, j0).aspects.filter((a) => !['Moon'].includes(a.transit)).slice(0, 5);
    const list = horizon === 'day' ? now.map((a) => `${a.transit} ${a.aspect.toLowerCase()} ${a.natal}`) : tr.map((t) => `${t.transit} ${t.aspect.toLowerCase()} ${t.natal} (${A.fromJd(t.jd).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })})`);
    const th = (horizon === 'day' ? now.map((a) => a.transit) : tr.map((t) => t.transit)).flatMap((n) => PLANET_TEXT[n].themes);
    add('Transits', list.length ? list.join('; ') + '.' : 'A quiet sky for you: no major transits.', th);
  }
  if (p.date) {
    const lp = N.lifePath(p.date).value, py = N.personalYear(p.date), pm = N.personalMonth(p.date);
    const n = horizon === 'day' ? N.personalDay(p.date) : horizon === 'month' ? pm : py;
    add('Numerology', `Life path ${lp}. ${horizon === 'year' ? 'Personal year' : horizon === 'month' ? 'Personal month' : 'Personal day'} ${n}: ${NUMBER[n].kw}. ${horizon === 'year' ? PERSONAL_YEAR[py] : ''}`, [...NUMBER[n].themes, ...(NUMBER[lp] || NUMBER[N.reduce(lp, false)]).themes]);
    const [y, m, d] = p.date.split('-').map(Number);
    const zy = Z.zodiacYear(y, m, d);
    const el = Z.stemElement(zy.stem);
    let line = `${el} ${Z.ANIMALS[zy.branch]}.`;
    let th = EL_THEME[el];
    if (res.bazi) { line += ` Day master ${res.bazi.dayMaster}${res.bazi.strong ? ' (strong)' : ' (weaker)'}.`; th = [...th, ...EL_THEME[res.bazi.element]]; }
    const cy = Z.zodiacYear(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
    line += ` This is a ${Z.stemElement(cy.stem)} ${Z.ANIMALS[cy.branch]} year. ${Z.branchRelation(zy.branch, cy.branch)}`;
    add('Chinese astrology', line, th, res.bazi ? res.bazi.element : el);
  }
  if (res.humandesign) add('Human Design', `${res.humandesign.type}, ${res.humandesign.authority} authority, profile ${res.humandesign.profile}.`, res.humandesign.themes || []);
  // Fresh draws for this question
  const tarot = drawTarot(3, settings.reversals);
  const pos = horizon === 'year' ? ['The coming months', 'The challenge', 'Where it leads'] : ['Situation', 'Advice', 'Outcome'];
  add('Tarot (drawn now)', tarot.map((t, i) => `${pos[i]}: ${cardName(t.card, settings.deck)}${t.rev ? ' reversed' : ''} (${t.rev ? t.card.rev : t.card.up})`).join('; ') + '.', tarot.flatMap((t) => t.card.themes),
    (() => { const c = {}; tarot.forEach((t) => (c[t.card.element] = (c[t.card.element] || 0) + 1)); return Object.entries(c).sort((a, b) => b[1] - a[1])[0][0]; })());
  const lines = [0, 1, 2, 3, 4, 5].map(() => { let s = 0; for (let i = 0; i < 3; i++) s += rand() < 0.5 ? 3 : 2; return s; });
  const hx = kingWen(lines.map((v) => (v % 2 ? 1 : 0)));
  const ch2 = lines.some((v) => v === 6 || v === 9) ? kingWen(lines.map((v) => (v === 6 ? 1 : v === 9 ? 0 : v % 2 ? 1 : 0))) : null;
  add('I Ching (cast now)', `${hx}. ${HEXAGRAMS[hx][1]}: ${HEXAGRAMS[hx][2]}${ch2 ? ` Moving toward ${ch2}. ${HEXAGRAMS[ch2][1]}.` : ''}`, [...HEXAGRAMS[hx][3], ...(ch2 ? HEXAGRAMS[ch2][3] : [])]);
  const rec = recurringSymbols().slice(0, 4);
  if (rec.length) add('Dreams', `Recurring symbols: ${rec.map(([s, c]) => `${s} (${c})`).join(', ')}.`, rec.flatMap(([s]) => (DREAM.find((d) => d[0] === s) || [])[4] || []));
  const quiz = [];
  if (res.enneagram) quiz.push([`Enneagram ${res.enneagram.label}`, res.enneagram.themes]);
  if (res.ayurveda) quiz.push([`${res.ayurveda.dosha} dosha`, res.ayurveda.themes]);
  if (res.chakras) quiz.push([`lowest chakra ${res.chakras.lowest}`, res.chakras.themes]);
  if (res.aura) quiz.push([`${res.aura.color} aura`, res.aura.themes]);
  if (res.wuxing) quiz.push([`${res.wuxing.element} constitution`, res.wuxing.themes]);
  if (quiz.length) add('Self-assessments', cap(quiz.map((q) => q[0]).join(', ')) + '.', quiz.flatMap((q) => q[1] || []));
  const body = ['palm', 'face', 'iris', 'tongue'].filter((k) => res[k]);
  if (body.length) add('Body readings', body.map((k) => `${k}: ${res[k].picks.slice(0, 3).join('; ')}`).join('. ') + '.', body.flatMap((k) => res[k].themes || []));
  return { voices, question, horizon };
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function synthesize({ voices }) {
  const bySys = {};
  voices.forEach((v) => v.themes.forEach((t) => (bySys[t] ||= new Set()).add(v.system)));
  const ranked = Object.entries(bySys).map(([t, s]) => [t, [...s]]).sort((a, b) => b[1].length - a[1].length);
  const agree = ranked.filter(([, s]) => s.length >= 2).slice(0, 4);
  const tensions = OPPOSITES.filter(([a, b]) => bySys[a] && bySys[b])
    .map(([a, b]) => ({ a, b, sa: [...bySys[a]].filter((x) => !bySys[b].has(x)), sb: [...bySys[b]].filter((x) => !bySys[a].has(x)) }))
    .filter((t) => t.sa.length && t.sb.length)
    .sort((x, y) => Math.min(y.sa.length, y.sb.length) - Math.min(x.sa.length, x.sb.length) || (y.sa.length + y.sb.length) - (x.sa.length + x.sb.length))
    .slice(0, 2);
  const els = voices.filter((v) => v.element);
  return { ranked, agree, tensions, els };
}

export function aiPrompt(g, s) {
  return [
    'You are an insightful, grounded guide versed in astrology, numerology, tarot, the I Ching, Chinese metaphysics, Human Design and Jungian dream work.',
    'Write one coherent interpretation for me. Identify recurring themes, explain where the traditions agree and where they differ, and end with practical, kind suggestions. Treat these systems as symbolic lenses, not certainties.',
    '',
    `Question: ${g.question || '(general guidance)'}`,
    `Time frame: ${{ day: 'today', month: 'the next month', year: 'the next 12 months' }[g.horizon]}`,
    '',
    'Readings:',
    ...g.voices.map((v) => `- ${v.system}: ${v.line}`),
    '',
    `Themes found in more than one system: ${s.agree.map(([t, sy]) => `${THEMES[t]} (${sy.join(', ')})`).join('; ') || 'none'}`,
    `Tensions: ${s.tensions.map((t) => `${t.a} vs ${t.b}`).join('; ') || 'none'}`,
  ].join('\n');
}

export function render(root, ctx) {
  let horizon = 'year';
  const q = textarea({ placeholder: 'What should I understand about the next twelve months?', rows: 2 });
  const out = h('div');
  root.append(intro('The Compass gathers every system you have used, draws fresh cards and a hexagram for your question, and finds where the traditions agree and where they pull in different directions.'),
    field('Your question', q), seg([['day', 'Today'], ['month', 'This month'], ['year', 'Next 12 months']], horizon, (v) => (horizon = v)),
    h('div', { class: 'actions' }, btn('Read the Compass', go, 'primary')), out);
  if (!C.hasBirth(ctx.profile)) root.insertBefore(note('Add your birth details in Profile so astrology, numerology and Chinese astrology can join the reading.'), out);
  function go() {
    clear(out);
    const g = gather(ctx.profile, ctx.settings, horizon, q.value.trim());
    const s = synthesize(g);
    const items = [];
    if (s.agree.length) {
      items.push({ h: 'Where the traditions agree', text: s.agree.map(([t, sy]) => `${THEMES[t]}: ${sy.length} systems (${sy.join(', ')}).`).join(' ') });
      items.push({ h: 'Guidance', text: s.agree.slice(0, 2).map(([t]) => GUIDANCE[t]).join(' ') });
    } else items.push({ h: 'No strong consensus', text: 'The systems speak in different voices this time. Read each below and notice which resonates most.' });
    if (s.tensions.length) items.push({ h: 'Where they differ', text: s.tensions.map((t) => `${THEMES[t.a]} (${t.sa.join(', ')}) against ${THEMES[t.b].toLowerCase()} (${t.sb.join(', ')}).`).join(' ') + ' Tension is not contradiction: often both are true at different levels, or in sequence.' });
    if (s.els.length >= 2) {
      const west = s.els.filter((e) => ['Fire', 'Earth', 'Air', 'Water'].includes(e.element));
      const same = west.length >= 2 && west.every((e) => e.element === west[0].element);
      items.push({ h: 'Elements', text: s.els.map((e) => `${e.system}: ${e.element}`).join('; ') + '. ' + (same ? `The Western-element systems agree on ${west[0].element}.` : 'Western and Chinese element systems are different frameworks: Chinese Wood and Metal have no direct Western equivalent, so read them side by side rather than as matches.') });
    }
    out.append(section('Synthesis', renderItems(items)),
      section('Each voice', renderItems(g.voices.map((v) => ({ h: v.system, text: v.line, extra: v.themes.length ? h('div', { style: { marginTop: '6px' } }, v.themes.map((t) => h('span', { class: 'chip' }, t))) : null })))),
      section('Go deeper with AI', note('A combined interpretation written by an AI could be added later as a paid feature. For now, copy this prompt into any AI assistant you use. Review what it contains before sharing.'),
        h('div', { class: 'actions' }, btn('Copy AI prompt', () => copyText(aiPrompt(g, s)), 'ghost'))),
      saveBar(() => ({ tool: 'compass', title: 'Compass reading', question: g.question, items: [...items, ...g.voices.map((v) => ({ h: v.system, text: v.line }))] })));
    if (g.voices.length < 4) out.prepend(note('Only a few systems contributed. Add birth details and try a few readings and self-assessments to enrich the Compass.'));
  }
}
