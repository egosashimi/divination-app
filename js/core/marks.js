import { h, svg } from './ui.js';

// Minimal line marks for suits and elements (no emoji, no images).
const P = {
  wands: 'M20 4V36M20 12L27 7M20 20L13 15M20 28L27 23',
  cups: 'M10 8H30C30 20 25 25 20 25C15 25 10 20 10 8ZM20 25V33M13 34H27',
  swords: 'M20 3V30M13 26H27M20 30V37',
  pentacles: 'M20 5A15 15 0 1 1 19.99 5M20 9L26.5 29L9.5 16.5H30.5L13.5 29Z',
  major: 'M20 5A15 15 0 1 1 19.99 5M20 12A8 8 0 1 1 19.99 12',
  H: 'M20 33C8 24 6 16 10 11C14 6 19 9 20 13C21 9 26 6 30 11C34 16 32 24 20 33Z',
  D: 'M20 4L31 20L20 36L9 20Z',
  C: 'M20 6A6 6 0 1 1 19.99 6M12 16A6 6 0 1 1 11.99 16M28 16A6 6 0 1 1 27.99 16M20 22V35M15 35H25',
  S: 'M20 5C30 15 34 22 28 27C24 30 21 27 20 25C19 27 16 30 12 27C6 22 10 15 20 5ZM20 25V35M15 35H25',
  Fire: 'M20 6L33 32H7Z', Water: 'M20 34L33 8H7Z', Air: 'M20 6L33 32H7ZM10 22H30', Earth: 'M20 34L33 8H7ZM10 18H30',
  star: 'M20 4L24 16H36L26 23L30 35L20 28L10 35L14 23L4 16H16Z',
  moon: 'M26 6A15 15 0 1 0 26 34A12 12 0 1 1 26 6Z',
  eye: 'M4 20C10 10 30 10 36 20C30 30 10 30 4 20ZM20 15A5 5 0 1 1 19.99 15',
};
export function mark(key, size = 34) {
  return svg('svg', { viewBox: '0 0 40 40', width: size, height: size, 'aria-hidden': 'true' }, svg('path', { d: P[key] || P.major }));
}
export function backPattern() {
  return svg('svg', { viewBox: '0 0 40 64', 'aria-hidden': 'true' },
    svg('rect', { x: 3, y: 3, width: 34, height: 58, rx: 2 }),
    svg('path', { d: 'M20 14L30 32L20 50L10 32Z' }),
    svg('circle', { cx: 20, cy: 32, r: 5 }));
}

// A flippable card. face: {num, name, foot, markKey}
export function card(face, { reversed = false, open = false, onOpen } = {}) {
  const el = h('div', { class: 'tc' + (open ? ' open' : ''), role: 'button', tabindex: 0, 'aria-label': open ? face.name : 'Face-down card' },
    h('div', { class: 'tc-in' },
      h('div', { class: 'tc-back' }, backPattern()),
      h('div', { class: 'tc-face' + (reversed ? ' rev' : '') },
        h('div', { class: 'tc-body' },
          h('div', { class: 'tc-num' }, face.num ?? ''),
          h('div', { class: 'tc-mark' }, mark(face.markKey)),
          h('div', { class: 'tc-name' }, face.name),
          h('div', { class: 'tc-foot' }, face.foot || '')))));
  const flip = () => { if (el.classList.contains('open')) return; el.classList.add('open'); el.setAttribute('aria-label', face.name); onOpen && onOpen(); };
  el.addEventListener('click', flip);
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
  el.flip = flip;
  return el;
}

export function runeGlyph(path, size = 56) {
  return svg('svg', { viewBox: '-1 -1 8 12', width: size * 0.66, height: size, 'aria-hidden': 'true', 'stroke-width': 0.55 }, svg('path', { d: path }));
}
export function oghamGlyph(aicme, count, size = 56) {
  const parts = ['M3 0V12'];
  for (let i = 0; i < count; i++) {
    const y = 2.2 + i * 1.6;
    if (aicme === 0) parts.push(`M3 ${y}H5.5`);
    if (aicme === 1) parts.push(`M0.5 ${y}H3`);
    if (aicme === 2) parts.push(`M0.8 ${y + 0.8}L5.2 ${y - 0.8}`);
    if (aicme === 3) parts.push(`M1.8 ${y}H4.2`);
  }
  return svg('svg', { viewBox: '-0.5 -0.5 7 13', width: size * 0.55, height: size, 'aria-hidden': 'true', 'stroke-width': 0.4 }, svg('path', { d: parts.join('') }));
}
export function hexagram(lines, changing = []) {
  return h('div', { class: 'hex', 'aria-label': 'Hexagram' }, lines.map((l, i) => h('div', { class: 'ln' + (changing.includes(i) ? ' chg' : '') },
    l ? h('span') : [h('span'), h('span')])));
}
export function geoFigure(rows) {
  return h('div', { class: 'geo-fig' }, rows.map((r) => h('div', null, r === 1 ? h('i') : [h('i'), h('i')])));
}
