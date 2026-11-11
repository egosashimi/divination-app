import { h, svg, clear, section, intro, note, choices, renderItems, saveBar, photoCapture } from '../core/ui.js';
import * as store from '../core/store.js';

const DISCLAIMER = 'Presented as a traditional, symbolic and cultural practice. It does not predict the future scientifically or diagnose any health condition.';
const MED = 'For any health concern, please see a qualified medical professional.';

function bodyReading(root, { tool, title, introText, photoId, overlay, diagram, questions, extraNote, med }) {
  const out = h('div');
  root.append(intro(introText), note(DISCLAIMER + (med ? ' ' + MED : '')),
    diagram || null,
    section('Photo', photoCapture({ id: photoId, overlay, prompt: 'Optional: photograph to study and keep' }), note('Your photo stays on this device. Automatic analysis would need an AI vision service; for now you compare it with the guide below.')),
    section('What do you see?', choices(questions, (ans) => {
      const items = ans.map((a, i) => (a ? { pos: questions[i].label || questions[i].q, h: a.t, text: a.r } : null)).filter(Boolean);
      clear(out);
      out.append(renderItems(items), extraNote ? note(extraNote) : null, saveBar(() => ({ tool, title, items, meta: { photo: photoId } })));
      store.saveResult(tool, { picks: items.map((x) => x.h), themes: ans.flatMap((a) => (a && a.th) || []) });
    })), out);
}
const Q = (q, label, o, extra = {}) => ({ q, label, o: o.map(([t, r, th]) => ({ t, r, th })), ...extra });

function palmDiagram() {
  const s = svg('svg', { viewBox: '0 0 200 240', width: 200, height: 240, style: 'display:block;margin:10px auto', fill: 'none', stroke: 'currentColor', 'stroke-width': 1 });
  s.append(svg('path', { d: 'M50 230V130C50 120 40 105 30 95C22 86 28 76 38 80C46 84 54 96 58 102V40C58 30 72 30 72 40V100M72 100V28C72 18 86 18 86 28V98M86 98V32C86 22 100 22 100 32V100M100 100V48C100 38 114 38 114 48V140C114 180 104 200 100 230', 'stroke-opacity': 0.5 }));
  s.append(svg('path', { d: 'M112 118C95 112 80 114 62 124', 'stroke-width': 1.6 }), svg('text', { x: 116, y: 116, 'font-size': 9, fill: 'currentColor', stroke: 'none' }, 'heart'));
  s.append(svg('path', { d: 'M60 132C78 138 94 146 110 156', 'stroke-width': 1.6 }), svg('text', { x: 114, y: 160, 'font-size': 9, fill: 'currentColor', stroke: 'none' }, 'head'));
  s.append(svg('path', { d: 'M60 132C66 160 66 190 74 224', 'stroke-width': 1.6 }), svg('text', { x: 36, y: 200, 'font-size': 9, fill: 'currentColor', stroke: 'none' }, 'life'));
  s.append(svg('path', { d: 'M90 226V150', 'stroke-dasharray': '3 3' }), svg('text', { x: 92, y: 200, 'font-size': 9, fill: 'currentColor', stroke: 'none' }, 'fate'));
  return s;
}

export function palm(root) {
  bodyReading(root, {
    tool: 'palm', title: 'Palmistry', photoId: 'palm', diagram: palmDiagram(),
    introText: 'Palmistry reads the shape of the hand, its major lines and its mounts. Western chirology and Indian Samudrika Shastra share many features. Read your dominant hand for the present and future, the other for inherited potential.',
    questions: [
      Q('Hand shape: compare palm length with finger length', 'Hand shape', [
        ['Square palm, short fingers (Earth)', 'Practical, grounded and reliable; you trust what you can touch.', ['structure']],
        ['Square palm, long fingers (Air)', 'Curious, communicative and intellectual; restless without ideas to explore.', ['expression']],
        ['Long palm, short fingers (Fire)', 'Energetic, passionate and instinctive; quick to act.', ['power']],
        ['Long palm, long fingers (Water)', 'Sensitive, intuitive and imaginative; emotionally perceptive.', ['intuition']]]),
      Q('Heart line (the top crease)', 'Heart line', [
        ['Ends under the index finger', 'Idealistic and content in love; high standards.', ['partnership']],
        ['Ends between index and middle fingers', 'Balanced in love; warm and open-hearted.', ['harmony']],
        ['Ends under the middle finger', 'Passionate but self-directed in love; you need your own space.', ['power']],
        ['Long and curving', 'Expresses feelings freely.', ['expression']],
        ['Short and straight', 'Private with feelings; shows love through action.', ['introspection']],
        ['Wavy or broken', 'An eventful emotional life; growth through past hurts.', ['healing']]]),
      Q('Head line (the middle crease)', 'Head line', [
        ['Long and straight', 'Clear, logical and focused thinking.', ['structure']],
        ['Sloping or curved downward', 'Creative, imaginative thinking.', ['expression']],
        ['Short', 'Prefers practical action over long deliberation.', ['power']],
        ['Starts separate from the life line', 'Independent and adventurous from an early age.', ['change']],
        ['Forked at the end (writer\'s fork)', 'Sees many sides; a gift for words and mediation.', ['expression']],
        ['Wavy', 'A restless mind with many interests.', ['change']]]),
      Q('Life line (around the base of the thumb)', 'Life line', [
        ['Long, deep and wide around the thumb', 'Strong vitality and enthusiasm. (Length does not indicate lifespan.)', ['power']],
        ['Close to the thumb', 'Energy is conserved; you need rest and comfort.', ['introspection']],
        ['Short or faint', 'Influenced by others; a call to claim your own direction. (Length does not indicate lifespan.)', ['partnership']],
        ['Broken or with a gap', 'A major change in way of life.', ['change']],
        ['Doubled by a second line', 'Extra resilience; a protective influence.', ['healing']]]),
      Q('Fate line (vertical line up the center)', 'Fate line', [
        ['Deep and clear', 'A strong sense of direction or vocation.', ['structure']],
        ['Starts from the base of the thumb', 'Early support from family shapes your path.', ['partnership']],
        ['Starts from the outer palm', 'Your path is shaped by the public and by others.', ['expression']],
        ['Breaks or shifts', 'Changes of career or direction.', ['change']],
        ['Absent', 'Freedom to make your own path, unattached to a set role.', ['beginning']]]),
      Q('Thumb', 'Thumb', [['Bends back easily', 'Adaptable and generous.', ['harmony']], ['Stiff and firm', 'Determined, steady and principled.', ['structure']], ['Long', 'Strong willpower.', ['power']]]),
      Q('Most prominent mount (the fleshy pads)', 'Mount', [
        ['Venus (base of thumb)', 'Love, warmth and sensuality.', ['partnership']], ['Jupiter (under index)', 'Ambition, leadership and confidence.', ['power']],
        ['Saturn (under middle)', 'Wisdom, responsibility, a serious streak.', ['structure']], ['Apollo (under ring)', 'Creativity, charm and success.', ['expression']],
        ['Mercury (under little finger)', 'Communication, commerce and wit.', ['expression']], ['Luna (outer edge, opposite thumb)', 'Imagination and intuition.', ['intuition']]]),
      Q('Auspicious marks (Samudrika Shastra), optional', 'Samudrika marks', [
        ['Fish shape near the wrist (matsya)', 'Prosperity and good fortune.', ['abundance']], ['Trident (trishula)', 'Success and spiritual strength.', ['power']],
        ['Lotus or flower shape', 'Grace, prosperity and wisdom.', ['harmony']], ['Conch shape', 'Learning and auspicious speech.', ['expression']]], { optional: true }),
    ],
  });
}

export function face(root) {
  bodyReading(root, {
    tool: 'face', title: 'Face reading', photoId: 'face',
    introText: 'Chinese face reading (mian xiang) associates face shapes with the five elements and features with life areas and ages. Western physiognomy has its own, separate history.',
    questions: [
      Q('Overall face shape', 'Face shape', [
        ['Long and rectangular (Wood)', 'Growth-oriented, principled and idealistic; a planner.', ['beginning']],
        ['Pointed chin, broad or peaked forehead (Fire)', 'Charismatic, expressive and passionate.', ['expression']],
        ['Square and broad, strong jaw (Earth)', 'Stable, reliable and caring; a natural support for others.', ['structure']],
        ['Oval with defined cheekbones (Metal)', 'Organized, refined and determined; a sense of justice.', ['power']],
        ['Round and soft (Water)', 'Adaptable, intuitive and wise; deep emotional currents.', ['intuition']]]),
      Q('Forehead (ages 15 to 30 in Chinese reading)', 'Forehead', [['High and broad', 'Early opportunities and quick intellect.', ['abundance']], ['Narrow', 'Success that builds with effort and age.', ['structure']], ['Rounded', 'Creative and imaginative thinking.', ['expression']]]),
      Q('Eyebrows', 'Eyebrows', [['Thick', 'Energetic and decisive.', ['power']], ['Thin or fine', 'Sensitive and diplomatic.', ['harmony']], ['Arched', 'Expressive and sociable.', ['expression']], ['Straight', 'Logical and direct.', ['structure']]]),
      Q('Eyes (ages 35 to 40)', 'Eyes', [['Large', 'Open, expressive and emotional.', ['expression']], ['Small or narrow', 'Focused, observant and private.', ['introspection']], ['Deep-set', 'Thoughtful and perceptive.', ['introspection']], ['Upturned at the outer corner', 'Optimistic and lively.', ['harmony']]]),
      Q('Nose (the wealth palace, ages 41 to 50)', 'Nose', [['Full, rounded tip', 'Good at gathering and keeping resources.', ['abundance']], ['Straight and narrow', 'Precise and principled with money.', ['structure']], ['Prominent bridge', 'Ambitious and self-reliant.', ['power']]]),
      Q('Mouth and lips (around age 60)', 'Mouth', [['Full lips', 'Generous, warm and sensual.', ['partnership']], ['Thin lips', 'Reserved and careful with words.', ['introspection']], ['Wide mouth', 'Sociable and expressive.', ['expression']]]),
      Q('Chin (later life)', 'Chin', [['Strong or square', 'Determined; a stable later life.', ['structure']], ['Pointed', 'Quick-witted and idealistic.', ['change']], ['Round', 'Warmth and family support in later life.', ['harmony']]]),
    ],
  });
}

function irisOverlay() {
  const s = svg('svg', { viewBox: '0 0 400 300', preserveAspectRatio: 'xMidYMid meet' });
  const c = [200, 150];
  [22, 48, 78, 110].forEach((r) => s.append(svg('circle', { cx: c[0], cy: c[1], r })));
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; s.append(svg('line', { x1: c[0] + 22 * Math.cos(a), y1: c[1] + 22 * Math.sin(a), x2: c[0] + 110 * Math.cos(a), y2: c[1] + 110 * Math.sin(a), 'stroke-opacity': 0.4 })); }
  s.append(svg('text', { x: 200, y: 34, 'text-anchor': 'middle' }, '12'), svg('text', { x: 316, y: 154 }, '3'), svg('text', { x: 196, y: 272 }, '6'), svg('text', { x: 78, y: 154 }, '9'));
  return s;
}
export function iris(root) {
  bodyReading(root, {
    tool: 'iris', title: 'Iris map', photoId: 'iris', overlay: irisOverlay(), med: true,
    introText: 'Iridology maps the iris into zones said to reflect parts of the body. Center your eye in the rings: the inner ring (around the pupil) is traditionally digestion, the middle rings circulation and organs, the outer ring skin and elimination; clock positions map body regions, with the head at 12.',
    extraNote: 'Controlled studies have not found iridology able to detect disease. One sign worth a doctor\'s visit: a pale ring around the iris edge (arcus) in someone under about 45 can relate to cholesterol.',
    questions: [
      Q('Iris color constitution', 'Constitution', [['Blue or gray (lymphatic)', 'Traditionally linked with a sensitive lymphatic and respiratory constitution.', ['healing']], ['Brown (hematogenic)', 'Traditionally linked with blood and circulation.', ['power']], ['Hazel, green or mixed (biliary)', 'Traditionally linked with digestion and the liver.', ['change']]]),
      Q('Texture of the fibers', 'Fibers', [['Tight and fine, like silk', 'A resilient constitution in the tradition.', ['structure']], ['Loose with gaps', 'Said to need more rest and support.', ['healing']]]),
      Q('Rings around the iris (nerve or stress rings)', 'Rings', [['None', 'A calm pattern in the tradition.', ['harmony']], ['One or two', 'Read as moderate tension.', ['challenge']], ['Several', 'Read as a sensitive, highly strung nervous system.', ['intuition']]]),
      Q('Spots or pigment flecks', 'Spots', [['None', 'No traditional markings.', []], ['A few', 'Read as zones to observe, by clock position.', ['introspection']]], { optional: true }),
      Q('Where are any markings concentrated?', 'Zone', [['Upper (11 to 1)', 'Head and mind in the traditional map.', ['introspection']], ['Outer side (2 to 4 or 8 to 10)', 'Limbs, chest and lungs in the traditional map.', ['change']], ['Lower (5 to 7)', 'Legs, kidneys and pelvis in the traditional map.', ['structure']], ['Inner ring around the pupil', 'Digestion in the traditional map.', ['healing']]], { optional: true }),
    ],
  });
}

export function tongue(root) {
  bodyReading(root, {
    tool: 'tongue', title: 'Tongue reading', photoId: 'tongue', med: true,
    introText: 'In Traditional Chinese Medicine the tongue\'s color, coating and shape are read as signs of the body\'s patterns. Look in natural light, before brushing, and without colored food or drink.',
    questions: [
      Q('Body color', 'Color', [['Pale pink, healthy', 'A balanced pattern.', ['harmony']], ['Pale', 'In TCM, associated with qi or blood deficiency and cold.', ['healing']], ['Red', 'In TCM, associated with heat.', ['power']], ['Purple or dusky', 'In TCM, associated with stagnation of qi or blood.', ['challenge']]]),
      Q('Coating', 'Coating', [['Thin and white', 'Normal in TCM.', ['harmony']], ['Thick and white', 'In TCM, associated with cold or dampness.', ['structure']], ['Yellow', 'In TCM, associated with heat.', ['power']], ['None or peeled patches', 'In TCM, associated with yin deficiency.', ['healing']]]),
      Q('Shape', 'Shape', [['Normal', 'A balanced pattern.', ['harmony']], ['Swollen with tooth marks at the edges', 'In TCM, associated with spleen qi deficiency and dampness.', ['healing']], ['Thin', 'In TCM, associated with blood or yin deficiency.', ['healing']], ['Cracks', 'In TCM, associated with dryness or long-standing yin deficiency.', ['introspection']]]),
      Q('Moisture', 'Moisture', [['Moist', 'Normal fluids.', ['harmony']], ['Dry', 'In TCM, associated with heat or depleted fluids.', ['challenge']], ['Very wet', 'In TCM, associated with cold or dampness.', ['intuition']]]),
    ],
  });
}

export function fingerprint(root) {
  const pat = [['Mostly loops', 'Adaptable, cooperative and easygoing; you fit into many settings.', ['harmony']], ['Mostly whorls', 'Independent and individualistic; you follow your own vision.', ['power']], ['Mostly arches', 'Practical, steady and reliable; you value security.', ['structure']], ['A mix', 'Versatile; you draw on different styles in different areas of life.', ['change']]];
  bodyReading(root, {
    tool: 'fingerprint', title: 'Fingerprints', photoId: 'fingerprint',
    introText: 'Fingerprint patterns are loops (lines enter and exit the same side), whorls (circular or spiral) and arches (lines flow across like a wave). Popular dermatoglyphic readings link them with temperament; there is no scientific support for that link.',
    questions: [
      Q('Across your ten fingers, which pattern dominates?', 'Overall', pat),
      Q('Your thumbs (willpower)', 'Thumbs', [['Loop', 'Flexible willpower.', ['harmony']], ['Whorl', 'Strong, independent will.', ['power']], ['Arch', 'Steady, persistent will.', ['structure']]]),
      Q('Your index fingers (ambition and leadership)', 'Index fingers', [['Loop', 'Leads through cooperation.', ['partnership']], ['Whorl', 'Leads from personal vision.', ['power']], ['Arch', 'Leads by example and reliability.', ['structure']]]),
    ],
  });
}

export function ear(root) {
  bodyReading(root, {
    tool: 'ear', title: 'Ear reading', photoId: 'ear',
    introText: 'In Chinese face reading the ears describe childhood fortune (roughly ages 1 to 14) and inborn vitality; long, thick lobes are classically auspicious, as on images of the Buddha.',
    questions: [
      Q('Size', 'Size', [['Large', 'Strong vitality and good early fortune.', ['abundance']], ['Medium', 'Balanced constitution.', ['harmony']], ['Small', 'Sensitive, quick and self-made.', ['power']]]),
      Q('Lobes', 'Lobes', [['Long and thick', 'Classically linked with longevity, generosity and wealth.', ['abundance']], ['Small or attached', 'Independence; resources built through effort.', ['structure']]]),
      Q('Position relative to the eyebrows', 'Position', [['Top above the brows', 'Quick mind and early achievement.', ['expression']], ['Level with the brows', 'Balanced judgment.', ['harmony']], ['Top below the eyes', 'A late bloomer; wisdom grows with time.', ['introspection']]]),
      Q('Shape', 'Shape', [['Rounded', 'Gentle and sociable.', ['harmony']], ['Pointed at the top', 'Alert, independent and unconventional.', ['change']], ['Protruding', 'Strong-willed and a good listener.', ['power']]]),
    ],
  });
}

export function foot(root) {
  bodyReading(root, {
    tool: 'foot', title: 'Foot reading', photoId: 'foot',
    introText: 'Popular foot reading names toe shapes after ancient cultures. These names are folklore: toe shape has no connection to ancestry. Read them as playful personality symbols.',
    questions: [
      Q('Toe shape', 'Toe shape', [
        ['Big toe longest, others slope down (Egyptian)', 'Romantic, private, a dreamer.', ['intuition']],
        ['Second toe longest (Greek)', 'Energetic, creative and a natural motivator.', ['expression']],
        ['First three toes about equal (Roman or square)', 'Balanced, social and outgoing.', ['harmony']],
        ['Big toe longest, others equal (Germanic)', 'Analytical and dependable.', ['structure']],
        ['Second toe longest, then a sharp drop (Celtic)', 'Driven and passionate.', ['power']]]),
      Q('Arch', 'Arch', [['High', 'Independent, self-reliant.', ['power']], ['Medium', 'Balanced.', ['harmony']], ['Flat', 'Sociable, supportive, grounded.', ['partnership']]]),
      Q('Gap between big toe and second toe', 'Toe gap', [['Wide', 'Takes time between thought and action.', ['introspection']], ['Close', 'Acts on ideas quickly.', ['change']]]),
    ],
  });
}
