// Lenormand, I Ching, runes, Ogham, geomancy, playing cards, dice, lithomancy.

// [name, noun, adjective, meaning, playing-card inset, themes]
export const LENORMAND = [
  ['Rider', 'news', 'quick', 'News, a visitor, speed, something arriving', '9H', ['beginning']],
  ['Clover', 'luck', 'lucky', 'Small luck, a brief opportunity, lightness', '6D', ['abundance']],
  ['Ship', 'a journey', 'distant', 'Travel, distance, longing, trade', '10S', ['change']],
  ['House', 'home', 'stable', 'Home, family, security, the private sphere', 'KH', ['structure']],
  ['Tree', 'health', 'slow-growing', 'Health, growth, roots, long processes', '7H', ['healing']],
  ['Clouds', 'confusion', 'unclear', 'Uncertainty, mood, temporary trouble', 'KC', ['challenge']],
  ['Snake', 'a complication', 'winding', 'Complication, desire, a rival, a detour', 'QC', ['challenge']],
  ['Coffin', 'an ending', 'ending', 'Closure, rest, illness, transformation', '9D', ['completion', 'transformation']],
  ['Bouquet', 'a gift', 'pleasant', 'Gift, appreciation, beauty, invitation', 'QS', ['harmony']],
  ['Scythe', 'a sudden cut', 'sudden', 'Decision, harvest, danger, a sharp break', 'JD', ['change']],
  ['Whip', 'conflict', 'repeated', 'Argument, repetition, discipline, passion', 'JC', ['challenge']],
  ['Birds', 'conversation', 'nervous', 'Talk, pairs, nerves, chatter', '7D', ['partnership']],
  ['Child', 'a new beginning', 'new', 'New start, small things, innocence, a child', 'JS', ['beginning']],
  ['Fox', 'work', 'cunning', 'Work, strategy, caution, self-interest', '9C', ['power']],
  ['Bear', 'power', 'strong', 'Strength, a boss, protection, finances', '10C', ['power']],
  ['Stars', 'hope', 'clear', 'Clarity, guidance, goals, online networks', '6H', ['intuition']],
  ['Stork', 'change', 'improving', 'Change, movement, improvement, relocation', 'QH', ['change']],
  ['Dog', 'a friend', 'loyal', 'Friendship, loyalty, trust, support', '10H', ['partnership']],
  ['Tower', 'an institution', 'official', 'Authority, institutions, solitude, the long view', '6S', ['structure']],
  ['Garden', 'a gathering', 'public', 'Public life, society, events, networks', '8S', ['expression']],
  ['Mountain', 'an obstacle', 'blocked', 'Obstacle, delay, challenge, endurance', '8C', ['challenge']],
  ['Crossroads', 'a choice', 'alternative', 'Choice, options, a split path', 'QD', ['change']],
  ['Mice', 'loss', 'diminishing', 'Loss, worry, erosion, stress', '7C', ['challenge']],
  ['Heart', 'love', 'loving', 'Love, affection, warmth, care', 'JH', ['partnership', 'harmony']],
  ['Ring', 'a commitment', 'binding', 'Contract, commitment, cycles, union', 'AC', ['partnership', 'structure']],
  ['Book', 'a secret', 'hidden', 'Knowledge, secrets, study, the unknown', '10D', ['introspection']],
  ['Letter', 'a message', 'written', 'Documents, messages, communication', '7S', ['expression']],
  ['Man', 'a man', 'masculine', 'A man, or the querent', 'AH', []],
  ['Woman', 'a woman', 'feminine', 'A woman, or the querent', 'AS', []],
  ['Lily', 'peace', 'mature', 'Peace, maturity, sensuality, virtue', 'KS', ['harmony']],
  ['Sun', 'success', 'successful', 'Success, energy, warmth, victory', 'AD', ['abundance', 'expression']],
  ['Moon', 'recognition', 'emotional', 'Emotion, recognition, intuition, reputation', '8H', ['intuition']],
  ['Key', 'a solution', 'certain', 'Solution, certainty, importance, access', '8D', ['beginning']],
  ['Fish', 'money', 'abundant', 'Money, business, flow, independence', 'KD', ['abundance']],
  ['Anchor', 'stability', 'lasting', 'Stability, endurance, work, arrival', '9S', ['structure']],
  ['Cross', 'a burden', 'fated', 'Burden, duty, faith, suffering, destiny', '6C', ['challenge', 'introspection']],
].map(([name, noun, adj, meaning, inset, themes], i) => ({ n: i + 1, name, noun, adj, meaning, inset, themes }));

// Trigrams indexed by lines (bottom, middle, top) as bits: bottom = 1
export const TRIGRAMS = {
  '111': { name: 'Qian', image: 'Heaven', quality: 'creative strength' },
  '100': { name: 'Zhen', image: 'Thunder', quality: 'arousing movement' },
  '010': { name: 'Kan', image: 'Water', quality: 'danger and depth' },
  '001': { name: 'Gen', image: 'Mountain', quality: 'stillness' },
  '000': { name: 'Kun', image: 'Earth', quality: 'receptive devotion' },
  '011': { name: 'Xun', image: 'Wind', quality: 'gentle penetration' },
  '101': { name: 'Li', image: 'Fire', quality: 'clarity and clinging' },
  '110': { name: 'Dui', image: 'Lake', quality: 'joy and openness' },
};
const TORDER = ['111', '100', '010', '001', '000', '011', '101', '110'];
const KW = [
  [1, 25, 6, 33, 12, 44, 13, 10], [34, 51, 40, 62, 16, 32, 55, 54], [5, 3, 29, 39, 8, 48, 63, 60], [26, 27, 4, 52, 23, 18, 22, 41],
  [11, 24, 7, 15, 2, 46, 36, 19], [9, 42, 59, 53, 20, 57, 37, 61], [14, 21, 64, 56, 35, 50, 30, 38], [43, 17, 47, 31, 45, 28, 49, 58],
];
export function kingWen(lines) { // lines: array of 6 (bottom first), 1 = yang
  const lower = lines.slice(0, 3).join(''), upper = lines.slice(3).join('');
  return KW[TORDER.indexOf(upper)][TORDER.indexOf(lower)];
}
export function linesOf(n) {
  for (let u = 0; u < 8; u++) for (let l = 0; l < 8; l++) if (KW[u][l] === n) return [...TORDER[l], ...TORDER[u]].map(Number);
}

export const HEXAGRAMS = [null,
  ['Qian', 'The Creative', 'Sustained creative power. Persevere with integrity and initiative succeeds.', ['power', 'beginning']],
  ['Kun', 'The Receptive', 'Yield, support and follow. Success comes through devotion and receptivity.', ['harmony', 'intuition']],
  ['Zhun', 'Difficulty at the Beginning', 'Chaos precedes order. Persevere, gather helpers, and do not force matters.', ['beginning', 'challenge']],
  ['Meng', 'Youthful Folly', 'Inexperience. Seek a teacher and ask with sincerity, not repetition.', ['beginning', 'introspection']],
  ['Xu', 'Waiting', 'Wait with confidence and nourish yourself before the crossing.', ['introspection', 'structure']],
  ['Song', 'Conflict', 'Stop halfway. Seek mediation rather than pressing to the bitter end.', ['challenge']],
  ['Shi', 'The Army', 'Discipline and organization under worthy leadership.', ['structure', 'power']],
  ['Bi', 'Holding Together', 'Unity. Join with others around a sincere center.', ['partnership', 'harmony']],
  ['Xiao Chu', 'Small Taming', 'Gentle restraint. Small influences accumulate before rain falls.', ['structure', 'introspection']],
  ['Lu', 'Treading', 'Careful conduct. Step on the tiger\'s tail with courtesy and it will not bite.', ['challenge', 'structure']],
  ['Tai', 'Peace', 'Heaven and earth unite. Harmony, flow and flourishing.', ['harmony', 'abundance']],
  ['Pi', 'Standstill', 'Stagnation. Withdraw inward and keep your integrity.', ['challenge', 'introspection']],
  ['Tong Ren', 'Fellowship', 'Community with shared purpose, conducted openly.', ['partnership']],
  ['Da You', 'Great Possession', 'Abundance held with humility and generosity.', ['abundance']],
  ['Qian', 'Modesty', 'Modesty balances extremes and carries things through.', ['harmony']],
  ['Yu', 'Enthusiasm', 'Inspire and mobilize; move in harmony with the times.', ['expression']],
  ['Sui', 'Following', 'Adapt and follow what is right; rest when it is time to rest.', ['change', 'harmony']],
  ['Gu', 'Work on What Has Been Spoiled', 'Repair what decayed through neglect. Think before and after.', ['healing', 'transformation']],
  ['Lin', 'Approach', 'Growth is approaching. Act while conditions are favorable.', ['beginning', 'abundance']],
  ['Guan', 'Contemplation', 'Observe deeply and become an example to others.', ['introspection']],
  ['Shi He', 'Biting Through', 'Decisive action removes the obstacle. Justice is served.', ['power', 'challenge']],
  ['Bi', 'Grace', 'Beauty and form. Adornment should serve substance.', ['expression']],
  ['Bo', 'Splitting Apart', 'Decline. It is not the time to act; let things run their course.', ['completion', 'challenge']],
  ['Fu', 'Return', 'The turning point. Light returns after darkness.', ['beginning', 'healing']],
  ['Wu Wang', 'Innocence', 'Act without hidden motives. Spontaneity aligned with what is right.', ['beginning']],
  ['Da Chu', 'Great Taming', 'Restrain and store great strength. Study and prepare.', ['structure', 'power']],
  ['Yi', 'Nourishment', 'Attend to what you feed your body, mind and words.', ['healing']],
  ['Da Guo', 'Great Exceeding', 'The ridgepole sags under weight. Act decisively but gently.', ['challenge', 'change']],
  ['Kan', 'The Abysmal', 'Danger repeated. Sincerity and steady flow carry you through.', ['challenge', 'intuition']],
  ['Li', 'The Clinging', 'Clarity and light. Depend on what is right.', ['expression', 'intuition']],
  ['Xian', 'Influence', 'Mutual attraction. Receptivity creates connection.', ['partnership']],
  ['Heng', 'Duration', 'Endurance and constancy within change.', ['structure', 'partnership']],
  ['Dun', 'Retreat', 'Strategic withdrawal preserves strength.', ['introspection', 'completion']],
  ['Da Zhuang', 'Great Power', 'Strength is available. Use it rightly and with restraint.', ['power']],
  ['Jin', 'Progress', 'Rapid advancement and recognition, like the sun rising.', ['abundance', 'expression']],
  ['Ming Yi', 'Darkening of the Light', 'Hard times. Keep your light hidden and inner truth intact.', ['challenge', 'introspection']],
  ['Jia Ren', 'The Family', 'Roles, loyalty and order within the household.', ['structure', 'partnership']],
  ['Kui', 'Opposition', 'Divergence. Small matters still succeed.', ['challenge', 'partnership']],
  ['Jian', 'Obstruction', 'An obstacle ahead. Turn inward and seek allies.', ['challenge']],
  ['Xie', 'Deliverance', 'Tension releases. Forgive, simplify and move on.', ['healing', 'change']],
  ['Sun', 'Decrease', 'Simplify. Giving up excess makes room for sincerity.', ['completion']],
  ['Yi', 'Increase', 'Gain. Act, help others, and cross the great water.', ['abundance', 'beginning']],
  ['Guai', 'Breakthrough', 'Resolute declaration. Confront openly, without force.', ['change', 'power']],
  ['Gou', 'Coming to Meet', 'An unexpected encounter or temptation. Stay discerning.', ['partnership', 'challenge']],
  ['Cui', 'Gathering Together', 'Assembly around a shared purpose and leader.', ['partnership']],
  ['Sheng', 'Pushing Upward', 'Gradual, effortful rise, like a tree growing.', ['abundance', 'structure']],
  ['Kun', 'Oppression', 'Exhaustion. Words are not believed; keep inner faith.', ['challenge']],
  ['Jing', 'The Well', 'The source that sustains everyone. Maintain it.', ['healing', 'structure']],
  ['Ge', 'Revolution', 'Change when the time is ripe, and it will be trusted.', ['transformation', 'change']],
  ['Ding', 'The Cauldron', 'Nourishment, culture and refinement.', ['transformation', 'abundance']],
  ['Zhen', 'The Arousing', 'Shock that awakens. Afterward, laughter.', ['change']],
  ['Gen', 'Keeping Still', 'Stillness. Rest the mind and the back.', ['introspection']],
  ['Jian', 'Development', 'Gradual progress, step by step.', ['structure', 'partnership']],
  ['Gui Mei', 'The Marrying Maiden', 'A subordinate position. Act with tact and patience.', ['partnership', 'challenge']],
  ['Feng', 'Abundance', 'Fullness at its peak. Be like the sun at midday.', ['abundance']],
  ['Lu', 'The Wanderer', 'The traveler. Be modest, cautious and correct.', ['change', 'introspection']],
  ['Xun', 'The Gentle', 'Penetrating influence, like wind. Persistence wins.', ['intuition']],
  ['Dui', 'The Joyous', 'Joy, openness and shared exchange.', ['harmony', 'expression']],
  ['Huan', 'Dispersion', 'Dissolve rigidity and reunite what was scattered.', ['change', 'healing']],
  ['Jie', 'Limitation', 'Healthy limits. Not too severe.', ['structure']],
  ['Zhong Fu', 'Inner Truth', 'Sincerity that moves even the stubborn.', ['intuition', 'harmony']],
  ['Xiao Guo', 'Small Exceeding', 'Attend to small things. Modesty over ambition.', ['introspection']],
  ['Ji Ji', 'After Completion', 'Order is achieved. Stay vigilant; decline follows peaks.', ['completion']],
  ['Wei Ji', 'Before Completion', 'Nearly there. Careful transition from chaos to order.', ['beginning', 'change']],
];
export const LINE_PLACES = [
  'Line 1 (the beginning): the first stirring of the matter; caution and humble starts.',
  'Line 2 (inner response): your private attitude; the place of the dutiful helper.',
  'Line 3 (the threshold): transition between inner and outer; risk of overreach.',
  'Line 4 (outer approach): nearness to authority; adjustment and responsibility.',
  'Line 5 (the ruler): the leading position; mature influence and command.',
  'Line 6 (culmination): the matter peaks or passes beyond; step back.',
];

// Runes: [name, sound, meaning, reversed (null = cannot reverse), themes, strokes]
export const RUNES = [
  ['Fehu', 'f', 'Wealth, earned value, abundance in motion', 'Loss, greed, depletion of resources', ['abundance'], 'M2 0V10M2 4L5.5 1M2 7L5.5 4'],
  ['Uruz', 'u', 'Strength, vitality, raw primal energy', 'Weakness, misdirected force, illness', ['power', 'healing'], 'M1 10V0L5 3V10'],
  ['Thurisaz', 'th', 'Protection, reactive force, a threshold', 'Danger, impulsive defense, compulsion', ['challenge'], 'M1.5 0V10M1.5 3L5 5L1.5 7'],
  ['Ansuz', 'a', 'Communication, insight, ancestral wisdom', 'Miscommunication, manipulation, deceit', ['expression', 'intuition'], 'M1.5 0V10M1.5 0L5 3M1.5 3L5 6'],
  ['Raidho', 'r', 'Journey, rhythm, right action', 'Disruption, stalled travel, injustice', ['change'], 'M1.5 0V10M1.5 0L5 2.5L1.5 5L5 10'],
  ['Kenaz', 'k', 'Knowledge, creativity, illumination', 'Blocked creativity, loss of clarity', ['expression'], 'M4.5 2L1.5 5L4.5 8'],
  ['Gebo', 'g', 'Gift, partnership, generous exchange', null, ['partnership'], 'M0.5 0L5.5 10M5.5 0L0.5 10'],
  ['Wunjo', 'w', 'Joy, harmony, belonging', 'Sorrow, alienation, strife', ['harmony'], 'M1.5 0V10M1.5 0L5 2.5L1.5 5'],
  ['Hagalaz', 'h', 'Disruption, uncontrollable forces, hail that melts into water', null, ['challenge', 'transformation'], 'M1 0V10M5 0V10M1 4L5 6'],
  ['Nauthiz', 'n', 'Need, constraint, endurance through difficulty', null, ['challenge', 'introspection'], 'M3 0V10M1 3.5L5 6.5'],
  ['Isa', 'i', 'Stillness, a standstill, focus, ice', null, ['introspection'], 'M3 0V10'],
  ['Jera', 'j', 'Harvest, cycles, the reward for patient effort', null, ['completion', 'abundance'], 'M2.6 1L0.6 3.5L2.6 6M3.4 4L5.4 6.5L3.4 9'],
  ['Eihwaz', 'ei', 'Endurance, transformation, the yew between worlds', null, ['transformation'], 'M3 0V10M3 0L5 2M3 10L1 8'],
  ['Perthro', 'p', 'Mystery, chance, what is hidden', 'Secrets kept, stagnation, loneliness', ['intuition'], 'M1 0V10M1 0L3 2.5L5 0M1 10L3 7.5L5 10'],
  ['Algiz', 'z', 'Protection, the higher self, sanctuary', 'Vulnerability, hidden danger', ['healing', 'intuition'], 'M3 0V10M3 4L0.5 1M3 4L5.5 1'],
  ['Sowilo', 's', 'Success, wholeness, the power of the sun', null, ['expression', 'abundance'], 'M4 0L1 3.5L5 6.5L2 10'],
  ['Tiwaz', 't', 'Justice, courage, honorable sacrifice', 'Imbalance, cowardice, defeat', ['power', 'structure'], 'M3 0V10M0.5 3L3 0L5.5 3'],
  ['Berkano', 'b', 'Birth, growth, nurturing, renewal', 'Stagnation, family worry', ['beginning', 'healing'], 'M1.5 0V10M1.5 0L5 2.5L1.5 5L5 7.5L1.5 10'],
  ['Ehwaz', 'e', 'Movement, trust, partnership, progress', 'Restlessness, mistrust, a hasty move', ['partnership', 'change'], 'M1 10V0L3 3L5 0V10'],
  ['Mannaz', 'm', 'The self, humanity, community', 'Isolation, self-deception', ['introspection', 'partnership'], 'M1 0V10M5 0V10M1 0L5 4M5 0L1 4'],
  ['Laguz', 'l', 'Flow, intuition, emotion, water', 'Confusion, poor judgment, overwhelm', ['intuition'], 'M1.5 0V10M1.5 0L5 3'],
  ['Ingwaz', 'ng', 'Gestation, inner growth, completion of a phase', null, ['completion', 'beginning'], 'M3 2L5.5 5L3 8L0.5 5Z'],
  ['Dagaz', 'd', 'Breakthrough, awakening, the dawn', null, ['transformation', 'beginning'], 'M0.5 0V10M5.5 0V10M0.5 0L5.5 10M5.5 0L0.5 10'],
  ['Othala', 'o', 'Heritage, home, inheritance, belonging', 'Rootlessness, rigid tradition', ['structure'], 'M3 0L5.5 4L1 10M3 0L0.5 4L5 10'],
].map(([name, sound, meaning, rev, themes, path]) => ({ name, sound, meaning, rev, themes, path }));

// Ogham: [name, letter, tree, meaning, aicme, count, themes]
export const OGHAM = [
  ['Beith', 'B', 'Birch', 'New beginnings, cleansing, the first step', 0, 1, ['beginning']],
  ['Luis', 'L', 'Rowan', 'Protection, insight, quickening', 0, 2, ['intuition']],
  ['Fearn', 'F', 'Alder', 'Foundation, guidance, standing firm', 0, 3, ['structure']],
  ['Saille', 'S', 'Willow', 'Intuition, flow, the moon and tides', 0, 4, ['intuition']],
  ['Nion', 'N', 'Ash', 'Connection between worlds, the larger pattern', 0, 5, ['partnership']],
  ['Huath', 'H', 'Hawthorn', 'Restraint, a test, protection of the threshold', 1, 1, ['challenge']],
  ['Duir', 'D', 'Oak', 'Strength, endurance, a doorway', 1, 2, ['power']],
  ['Tinne', 'T', 'Holly', 'Balance, challenge met with courage', 1, 3, ['challenge']],
  ['Coll', 'C', 'Hazel', 'Wisdom, creativity, inspiration', 1, 4, ['expression']],
  ['Quert', 'Q', 'Apple', 'Choice, beauty, wholeness', 1, 5, ['harmony']],
  ['Muin', 'M', 'Vine', 'Harvest, prophecy, inner development', 2, 1, ['abundance']],
  ['Gort', 'G', 'Ivy', 'Persistence, the spiral path, growth through tenacity', 2, 2, ['structure']],
  ['nGetal', 'Ng', 'Reed', 'Direct action, healing, purpose', 2, 3, ['healing']],
  ['Straif', 'Z', 'Blackthorn', 'Strife, fate, unavoidable change', 2, 4, ['challenge', 'change']],
  ['Ruis', 'R', 'Elder', 'Endings that lead to renewal', 2, 5, ['completion', 'transformation']],
  ['Ailm', 'A', 'Fir', 'Clarity, overview, high perspective', 3, 1, ['introspection']],
  ['Onn', 'O', 'Gorse', 'Gathering resources, optimism', 3, 2, ['abundance']],
  ['Ur', 'U', 'Heather', 'Passion, healing, generosity', 3, 3, ['healing']],
  ['Edad', 'E', 'Aspen', 'Endurance, facing fear, resilience', 3, 4, ['challenge']],
  ['Idad', 'I', 'Yew', 'Death and rebirth, the eternal', 3, 5, ['transformation']],
].map(([name, letter, tree, meaning, aicme, count, themes]) => ({ name, letter, tree, meaning, aicme, count, themes }));

// Geomancy: rows head, neck, body, feet; 1 = single point (odd), 2 = two points (even)
export const GEO = [
  ['Via', [1, 1, 1, 1], 'The Way', 'Journey, change, movement. Good for travel; neutral or unstable for permanence.', 'Moon', ['change']],
  ['Populus', [2, 2, 2, 2], 'The People', 'A crowd, the collective, passivity. Reflects whatever surrounds it.', 'Moon', ['partnership']],
  ['Acquisitio', [2, 1, 2, 1], 'Gain', 'Gain, acquisition, success in obtaining.', 'Jupiter', ['abundance']],
  ['Amissio', [1, 2, 1, 2], 'Loss', 'Loss, things slipping away; favourable only for letting go.', 'Venus', ['completion']],
  ['Fortuna Major', [2, 2, 1, 1], 'Greater Fortune', 'Lasting success won through inner strength.', 'Sun', ['power', 'abundance']],
  ['Fortuna Minor', [1, 1, 2, 2], 'Lesser Fortune', 'Quick, outside help; success that does not last.', 'Sun', ['change']],
  ['Laetitia', [1, 2, 2, 2], 'Joy', 'Happiness, health, rising fortunes.', 'Jupiter', ['harmony']],
  ['Tristitia', [2, 2, 2, 1], 'Sorrow', 'Sadness, delay, but also stability and depth.', 'Saturn', ['challenge', 'structure']],
  ['Puella', [1, 2, 1, 1], 'The Girl', 'Harmony, beauty, pleasantness; sometimes fickle.', 'Venus', ['harmony']],
  ['Puer', [1, 1, 2, 1], 'The Boy', 'Energy, aggression, courage; rash action.', 'Mars', ['power', 'challenge']],
  ['Albus', [2, 2, 1, 2], 'White', 'Peace, wisdom, clear thought; slow and careful.', 'Mercury', ['introspection']],
  ['Rubeus', [2, 1, 2, 2], 'Red', 'Passion, anger, danger; good only for matters of force.', 'Mars', ['challenge']],
  ['Carcer', [1, 2, 2, 1], 'The Prison', 'Restriction, delay, being bound; good for security.', 'Saturn', ['structure', 'challenge']],
  ['Conjunctio', [2, 1, 1, 2], 'Union', 'Meeting, combination, reconciliation.', 'Mercury', ['partnership']],
  ['Caput Draconis', [2, 1, 1, 1], 'Head of the Dragon', 'Beginnings, entrances, good fortune for new things.', 'North Node', ['beginning']],
  ['Cauda Draconis', [1, 1, 1, 2], 'Tail of the Dragon', 'Endings, exits, good for things that should end.', 'South Node', ['completion']],
].map(([name, rows, english, meaning, ruler, themes]) => ({ name, rows, english, meaning, ruler, themes }));
export const GEO_HOUSES = ['Self, life, the querent', 'Money, possessions', 'Siblings, short trips, messages', 'Home, land, endings', 'Children, pleasure, creativity', 'Health, work, service', 'Partners, open enemies, others', 'Death, shared resources, fear', 'Long journeys, faith, learning', 'Career, reputation, authority', 'Friends, hopes, benefactors', 'Hidden matters, sorrow, retreat'];

// Playing cards (cartomancy). Suit domains: hearts love, diamonds money, clubs work, spades trials.
export const PLAYING_SUITS = [
  { key: 'H', name: 'Hearts', domain: 'love, family and feeling', element: 'Water' },
  { key: 'D', name: 'Diamonds', domain: 'money, news and practical matters', element: 'Earth' },
  { key: 'C', name: 'Clubs', domain: 'work, ambition and friendship', element: 'Fire' },
  { key: 'S', name: 'Spades', domain: 'trials, change and the mind', element: 'Air' },
];
export const PLAYING_RANKS = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];
export const PLAYING = {
  H: ['Love, home, a new emotional beginning', 'Partnership, a meeting of hearts', 'Caution in affection; a choice of the heart', 'Restlessness at home; a desire for change', 'Jealousy or indecision in feeling', 'Kindness, nostalgia, an old friend returns', 'An unreliable person or wavering affection', 'An invitation, a gathering, a visit', 'The wish card: your wish is granted', 'Happiness and good fortune in love', 'A warm, loyal young person or friend', 'A kind, affectionate woman', 'A warm, generous man; good counsel'],
  D: ['Money news, a letter, a ring', 'A business partnership; disapproval at home', 'Legal or financial dealings; be careful', 'An inheritance or improvement in finances', 'Prosperity and success through enterprise', 'Financial quarrels or early marriage trouble', 'Gossip or a minor loss; a gamble', 'Late success; travel bringing gain', 'A surprise involving money', 'A change in finances; travel', 'A messenger, a bearer of news', 'A sociable, talkative woman', 'A powerful man of business'],
  C: ['Wealth, success, a new venture', 'Opposition; disappointment to overcome', 'A second chance; progress through others', 'A change for the worse; take care with plans', 'A new friend or ally; a fortunate meeting', 'Help in business; teamwork succeeds', 'Prosperity, unless a rival interferes', 'Desire for money; reckless choices', 'Stubbornness; an unexpected gain', 'Unexpected money or a journey', 'A reliable friend; a helpful young person', 'A confident, capable woman', 'An honest, generous man; a mentor'],
  S: ['Endings, change, a major transformation', 'Separation, a difficult choice', 'Heartbreak, a rival, a parting', 'Rest, recovery, a small illness', 'Setbacks that lead to success', 'Gradual improvement; a journey over water', 'Advice ignored; a warning', 'Trouble ahead; plans need revision', 'Anxiety, disappointment, a bad dream', 'Worry or misfortune; a burden to release', 'A well-meaning but immature person', 'A clever, independent woman', 'An ambitious man; authority'],
};

// Three-dice divination, traditional sums 3 to 18
export const DICE3 = {
  3: 'A pleasant surprise is on its way.', 4: 'A disappointment; do not take it to heart.', 5: 'A wish will be fulfilled, perhaps through a stranger.',
  6: 'A loss of something; let it go gracefully.', 7: 'Setbacks or gossip; guard your words.', 8: 'Criticism or blame; stand by your integrity.',
  9: 'Union, reconciliation, a commitment.', 10: 'A birth or a new beginning; career rises.', 11: 'A parting or departure, perhaps temporary.',
  12: 'Good news by message soon.', 13: 'If you persist on this path, sorrow; reconsider.', 14: 'A new friend or admirer appears.',
  15: 'Be cautious; avoid temptation and haste.', 16: 'A journey that proves worthwhile.', 17: 'A change of plans, often through travel or water.', 18: 'The best throw: success and happiness.',
};

// Lithomancy: a contemporary 13-stone set
export const STONES = [
  ['Sun', 'Vitality, success, the self in full light'], ['Moon', 'Emotion, intuition, cycles, the inner life'], ['Mercury', 'Communication, travel, learning'],
  ['Venus', 'Love, beauty, harmony, pleasure'], ['Mars', 'Action, courage, conflict, drive'], ['Jupiter', 'Growth, luck, expansion, teachers'],
  ['Saturn', 'Time, limits, discipline, delays'], ['Home', 'Family, roots, domestic life'], ['Love', 'Romance and close bonds'],
  ['Luck', 'Fortune and chance'], ['Magic', 'The unexpected, spiritual matters'], ['News', 'Messages and information'], ['Life', 'Health and life direction'],
].map(([name, meaning]) => ({ name, meaning }));
