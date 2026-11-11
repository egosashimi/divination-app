// Tarot: 22 major and 56 minor arcana. Meanings are concise original summaries
// of widely shared interpretations. Format: upright | reversed | message.
const MAJ = [
  ['The Fool', 'The Fool', 'Le Mat', 'beginnings, spontaneity, a leap of faith', 'recklessness, hesitation, naivety', 'A fresh start that asks for trust more than certainty.', ['beginning', 'change'], 'Air'],
  ['The Magician', 'The Magus', 'Le Bateleur', 'will, skill, resourcefulness, manifestation', 'manipulation, scattered energy, untapped talent', 'You already hold the tools; focus turns intention into result.', ['power', 'expression'], 'Air'],
  ['The High Priestess', 'The Priestess', 'La Papesse', 'intuition, mystery, inner knowing', 'secrets, disconnection from intuition, surface noise', 'The answer is quiet and inward. Listen before acting.', ['intuition', 'introspection'], 'Water'],
  ['The Empress', 'The Empress', "L'Imperatrice", 'abundance, nurture, creativity, the body', 'dependence, creative block, smothering', 'Growth comes through care, pleasure and patience.', ['abundance', 'expression'], 'Earth'],
  ['The Emperor', 'The Emperor', "L'Empereur", 'structure, authority, stability', 'rigidity, control, domination', 'Order and boundaries create safety for what you build.', ['structure', 'power'], 'Fire'],
  ['The Hierophant', 'The Hierophant', 'Le Pape', 'tradition, teaching, institutions, belief', 'rebellion, dogma, an unconventional path', 'Learn from established wisdom, or consciously depart from it.', ['structure', 'introspection'], 'Earth'],
  ['The Lovers', 'The Lovers', "L'Amoureux", 'union, choice, values, alignment', 'disharmony, misalignment, temptation', 'A choice that reveals what you truly value.', ['partnership', 'harmony'], 'Air'],
  ['The Chariot', 'The Chariot', 'Le Chariot', 'willpower, direction, victory', 'lack of direction, opposition, aggression', 'Harness opposing forces and move forward with resolve.', ['power', 'change'], 'Water'],
  ['Strength', 'Lust', 'La Force', 'courage, gentleness, inner strength', 'self-doubt, weakness, raw emotion', 'Patient compassion tames what force cannot.', ['power', 'healing'], 'Fire'],
  ['The Hermit', 'The Hermit', "L'Hermite", 'solitude, introspection, inner guidance', 'isolation, withdrawal, loneliness', 'Step back. Your own lamp shows the next step.', ['introspection'], 'Earth'],
  ['Wheel of Fortune', 'Fortune', 'La Roue de Fortune', 'cycles, fate, a turning point', 'resistance to change, bad luck, delays', 'Circumstances turn. Adapt to the new cycle.', ['change'], 'Fire'],
  ['Justice', 'Adjustment', 'La Justice', 'fairness, truth, cause and effect', 'unfairness, dishonesty, avoidance', 'Consequences follow choices. Act with integrity.', ['structure', 'harmony'], 'Air'],
  ['The Hanged Man', 'The Hanged Man', 'Le Pendu', 'surrender, pause, new perspective', 'stalling, resistance, martyrdom', 'Letting go of control reveals another angle.', ['introspection', 'transformation'], 'Water'],
  ['Death', 'Death', "L'Arcane sans nom", 'endings, transformation, transition', 'resistance to change, stagnation', 'Something must end so something else can begin.', ['transformation', 'completion'], 'Water'],
  ['Temperance', 'Art', 'Temperance', 'balance, moderation, blending', 'imbalance, excess, impatience', 'Integrate opposites slowly. The right mix takes time.', ['harmony', 'healing'], 'Fire'],
  ['The Devil', 'The Devil', 'Le Diable', 'attachment, shadow, materialism, bondage', 'release, breaking free, reclaiming power', 'Notice what binds you. The chains are often looser than they seem.', ['challenge', 'transformation'], 'Earth'],
  ['The Tower', 'The Tower', 'La Maison Dieu', 'sudden change, upheaval, revelation', 'averting disaster, fear of change, delayed collapse', 'False structures fall so truth can stand.', ['change', 'challenge'], 'Fire'],
  ['The Star', 'The Star', "L'Etoile", 'hope, renewal, inspiration', 'despair, disconnection, low faith', 'After the storm, healing and quiet hope return.', ['healing', 'intuition'], 'Air'],
  ['The Moon', 'The Moon', 'La Lune', 'illusion, dreams, the unconscious', 'confusion lifting, repressed fear, truth emerging', 'Not everything is as it appears. Trust instinct through uncertainty.', ['intuition', 'challenge'], 'Water'],
  ['The Sun', 'The Sun', 'Le Soleil', 'joy, success, vitality, clarity', 'temporary gloom, overconfidence, delayed success', 'Warmth and clarity. Things come into the light.', ['expression', 'abundance'], 'Fire'],
  ['Judgement', 'The Aeon', 'Le Jugement', 'awakening, reckoning, calling', 'self-doubt, ignoring the call, harsh self-judgment', 'Rise to a calling and review the past honestly.', ['transformation', 'beginning'], 'Fire'],
  ['The World', 'The Universe', 'Le Monde', 'completion, integration, fulfillment', 'incompletion, lack of closure, shortcuts', 'A cycle completes. Celebrate and prepare for the next.', ['completion', 'harmony'], 'Earth'],
];

const SUITS = [
  { key: 'wands', rws: 'Wands', thoth: 'Wands', mar: 'Batons', element: 'Fire', domain: 'energy, ambition and creativity' },
  { key: 'cups', rws: 'Cups', thoth: 'Cups', mar: 'Cups', element: 'Water', domain: 'emotion, love and intuition' },
  { key: 'swords', rws: 'Swords', thoth: 'Swords', mar: 'Swords', element: 'Air', domain: 'thought, conflict and truth' },
  { key: 'pentacles', rws: 'Pentacles', thoth: 'Disks', mar: 'Coins', element: 'Earth', domain: 'work, money and the body' },
];
const RANKS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];
const COURT = { rws: ['Page', 'Knight', 'Queen', 'King'], thoth: ['Princess', 'Prince', 'Queen', 'Knight'], mar: ['Valet', 'Knight', 'Queen', 'King'] };
const THOTH_TITLES = {
  wands: ['', 'Dominion', 'Virtue', 'Completion', 'Strife', 'Victory', 'Valour', 'Swiftness', 'Strength', 'Oppression'],
  cups: ['', 'Love', 'Abundance', 'Luxury', 'Disappointment', 'Pleasure', 'Debauch', 'Indolence', 'Happiness', 'Satiety'],
  swords: ['', 'Peace', 'Sorrow', 'Truce', 'Defeat', 'Science', 'Futility', 'Interference', 'Cruelty', 'Ruin'],
  pentacles: ['', 'Change', 'Works', 'Power', 'Worry', 'Success', 'Failure', 'Prudence', 'Gain', 'Wealth'],
};
const RANK_THEME = [['beginning'], ['partnership'], ['expression'], ['structure'], ['challenge'], ['harmony'], ['introspection'], ['power'], ['completion'], ['completion'], ['beginning'], ['change'], ['intuition'], ['structure']];

const MIN = {
  wands: [
    'inspiration, a new venture, the spark|delays, lack of motivation|A creative spark. Act while the fire is fresh.',
    'planning, future vision, decisions|fear of the unknown, poor planning|The world is in your hand. Choose a direction.',
    'expansion, foresight, progress|obstacles, short-sightedness|Your ships are out and early results appear.',
    'celebration, home, harmony|instability, transition at home|A milestone worth marking with others.',
    'conflict, competition, friction|avoiding conflict, resolution|Clashing ideas. Spar to sharpen, not to wound.',
    'victory, recognition, confidence|ego, a fall from grace|Public success. Acknowledge the support that carried you.',
    'defense, perseverance, standing your ground|overwhelm, giving up|Hold your position; you have the higher ground.',
    'speed, movement, news|delays, frustration|Things move fast. Messages and momentum arrive.',
    'resilience, persistence, the last stand|exhaustion, defensiveness|Wounded but standing. One more push.',
    'burden, responsibility, overload|release, delegating|You carry too much. Set some of it down.',
    'enthusiasm, exploration, a message|hesitation, false starts|A curious beginning. Follow the spark.',
    'action, adventure, boldness|haste, impulsiveness|Charge ahead, but watch for burnout.',
    'confidence, warmth, determination|jealousy, insecurity|Radiant self-assurance draws others in.',
    'leadership, vision, enterprise|impulsiveness, overbearing|Lead with vision and follow through.',
  ],
  cups: [
    'new feelings, love, intuition|blocked emotion, emptiness|Emotional renewal. The heart opens.',
    'partnership, attraction, mutual respect|imbalance, separation|A meeting of equals. The connection is mutual.',
    'friendship, celebration, community|overindulgence, gossip|Joy shared among friends.',
    'apathy, contemplation, reevaluation|renewed interest, acceptance|Something is offered while you look away.',
    'loss, grief, regret|acceptance, moving on|Mourn what spilled, but two cups still stand.',
    'nostalgia, innocence, memories|stuck in the past|The past offers sweetness. Do not live there.',
    'choices, fantasy, illusion|clarity, alignment|Many options shimmer; not all are real.',
    'walking away, seeking deeper meaning|fear of change, aimlessness|Leave what no longer fulfills you.',
    'contentment, wishes fulfilled|dissatisfaction, smugness|The wish card. Satisfaction is near.',
    'harmony, family, emotional fulfillment|disconnection, broken bonds|Lasting happiness and belonging.',
    'a creative message, sensitivity, curiosity|emotional immaturity|An intuitive message or a new feeling.',
    'romance, invitation, idealism|moodiness, unrealistic hopes|Follow the heart, but stay grounded.',
    'compassion, intuition, care|codependence, overwhelm|Emotional wisdom and deep empathy.',
    'emotional balance, diplomacy|manipulation, volatility|Calm mastery of feeling.',
  ],
  swords: [
    'clarity, truth, breakthrough|confusion, clouded judgment|A clear idea cuts through the fog.',
    'indecision, stalemate, avoidance|information overload, release|Remove the blindfold to choose.',
    'heartbreak, grief, painful truth|recovery, forgiveness|Pain that, once faced, begins to heal.',
    'rest, recovery, contemplation|restlessness, burnout|Pause and restore before the next effort.',
    'conflict, winning at a cost|reconciliation, regret|Ask whether the victory is worth it.',
    'transition, moving on, calmer waters|resistance, unfinished business|Leaving turbulence for steadier ground.',
    'strategy, secrecy, evasion|confession, conscience|Something is hidden. Act with care.',
    'restriction, self-limiting belief|release, new perspective|The bindings are looser than they feel.',
    'anxiety, worry, sleeplessness|hope, recovery from fear|Night fears are larger than reality.',
    'an ending, rock bottom, release|recovery, survival|The worst is over. Dawn follows.',
    'curiosity, vigilance, new ideas|gossip, haste|Watchful learning and fresh thinking.',
    'ambition, decisive action, speed|recklessness, aggression|Swift action driven by ideas.',
    'clarity, independence, honest boundaries|coldness, bitterness|Clear perception and direct speech.',
    'intellectual authority, truth, ethics|manipulation, harshness|Judgment guided by reason.',
  ],
  pentacles: [
    'opportunity, prosperity, a new venture|a missed chance, poor planning|A tangible opportunity takes root.',
    'balance, adaptability, juggling|overwhelm, disorganization|Keep things moving; flexibility is key.',
    'teamwork, craft, learning|lack of cooperation|Skilled collaboration builds something lasting.',
    'security, saving, control|greed, letting go|Holding tightly creates both safety and stagnation.',
    'hardship, isolation, need|recovery, help arrives|Help is nearer than it seems. Look for the lit window.',
    'generosity, giving and receiving|debt, strings attached|Resources flow. Balance giving and receiving.',
    'patience, investment, assessment|impatience, poor returns|Slow growth. Evaluate before harvesting.',
    'diligence, mastery, practice|perfectionism, lack of focus|Dedicated practice refines skill.',
    'independence, comfort, self-sufficiency|overwork, dependence|Enjoy the fruits of your discipline.',
    'legacy, family wealth, permanence|instability, family disputes|Long-term security and inheritance.',
    'study, ambition, a new skill|procrastination|A practical beginning or learning path.',
    'reliability, routine, steady progress|stagnation, boredom|Slow and steady carries you there.',
    'nurturing, practical care, comfort|self-neglect, imbalance|Warm, grounded resourcefulness.',
    'abundance, security, discipline|stubbornness, materialism|Mastery of the material world.',
  ],
};

export const DECK = [];
MAJ.forEach((m, i) => DECK.push({ id: 'M' + i, arcana: 'major', number: i, names: { rws: m[0], thoth: m[1], mar: m[2] }, up: m[3], rev: m[4], msg: m[5], themes: m[6], element: m[7] }));
SUITS.forEach((s) => MIN[s.key].forEach((line, r) => {
  const [up, rev, msg] = line.split('|');
  const names = {};
  for (const style of ['rws', 'thoth', 'mar']) {
    const suit = style === 'rws' ? s.rws : style === 'thoth' ? s.thoth : s.mar;
    const rank = r < 10 ? RANKS[r] : COURT[style][r - 10];
    names[style] = `${rank} of ${suit}`;
  }
  DECK.push({ id: s.key + r, arcana: 'minor', suit: s.key, rank: r + 1, names, up, rev, msg, themes: RANK_THEME[r], element: s.element, domain: s.domain, thothTitle: r > 0 && r < 10 ? THOTH_TITLES[s.key][r] : '' });
}));
export const SUIT_INFO = Object.fromEntries(SUITS.map((s) => [s.key, s]));

export const cardName = (c, style = 'rws') => c.names[style] || c.names.rws;
// Marseille and Thoth keep Strength/Justice at swapped numbers
export function cardNumber(c, style = 'rws') {
  if (c.arcana !== 'major') return null;
  if (style !== 'rws' && c.number === 8) return 11;
  if (style !== 'rws' && c.number === 11) return 8;
  return c.number;
}

export const SPREADS = {
  single: { name: 'Single card', pos: ['The message'] },
  three: { name: 'Past, present, future', pos: ['Past', 'Present', 'Future'] },
  sao: { name: 'Situation, action, outcome', pos: ['Situation', 'Action', 'Outcome'] },
  mbs: { name: 'Mind, body, spirit', pos: ['Mind', 'Body', 'Spirit'] },
  celtic: { name: 'Celtic Cross', pos: ['The present', 'The challenge', 'The foundation', 'The recent past', 'What may come', 'The near future', 'Your attitude', 'Environment', 'Hopes and fears', 'Likely outcome'] },
  relationship: { name: 'Relationship', pos: ['You', 'The other person', 'The connection', 'The challenge', 'The potential'] },
  career: { name: 'Career', pos: ['Where you stand', 'Your strengths', 'The obstacle', 'A hidden factor', 'The next step'] },
  decision: { name: 'Two paths', pos: ['The situation', 'Path A', 'Path B', 'Where A leads', 'Where B leads'] },
  timing: { name: 'Timing', pos: ['This week', 'This month', 'Within three months', 'Within six months'] },
  year: { name: 'Year ahead', pos: ['Theme of the year', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6', 'Month 7', 'Month 8', 'Month 9', 'Month 10', 'Month 11', 'Month 12'] },
  shadow: { name: 'Shadow work', pos: ['What I hide', 'Why I hide it', 'What it protects', 'Its hidden gift', 'How to integrate it'] },
  yesno: { name: 'Yes or no', pos: ['The answer'] },
};
