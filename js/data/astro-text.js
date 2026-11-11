export const PLANET_TEXT = {
  Sun: { kw: 'identity, vitality, purpose', text: 'your core self and what makes you feel alive', themes: ['expression', 'power'] },
  Moon: { kw: 'emotion, needs, instinct', text: 'your emotional needs and what makes you feel safe', themes: ['intuition'] },
  Mercury: { kw: 'mind, speech, learning', text: 'how you think, speak and learn', themes: ['expression'] },
  Venus: { kw: 'love, value, beauty', text: 'what you love, value and find beautiful', themes: ['partnership', 'harmony'] },
  Mars: { kw: 'drive, desire, courage', text: 'how you act, assert and pursue', themes: ['power'] },
  Jupiter: { kw: 'growth, faith, opportunity', text: 'where you expand, trust and find meaning', themes: ['abundance'] },
  Saturn: { kw: 'structure, limits, mastery', text: 'where you meet responsibility and build mastery over time', themes: ['structure', 'challenge'] },
  Uranus: { kw: 'awakening, freedom, disruption', text: 'where you break patterns and seek freedom', themes: ['change'] },
  Neptune: { kw: 'dreams, dissolution, spirit', text: 'where you dream, idealize and dissolve boundaries', themes: ['intuition', 'introspection'] },
  Pluto: { kw: 'power, depth, transformation', text: 'where you face intensity and are remade', themes: ['transformation'] },
  Node: { kw: 'direction, growth edge', text: 'the direction of growth this life leans toward', themes: ['beginning'] },
  SouthNode: { kw: 'familiar gifts, release', text: 'familiar talents and habits to draw on, then release', themes: ['completion'] },
  Chiron: { kw: 'wound, healing, teaching', text: 'a tender place that becomes a source of wisdom', themes: ['healing'] },
  Asc: { kw: 'approach, body, first impression', text: 'how you meet the world and begin things', themes: ['beginning'] },
  MC: { kw: 'vocation, reputation, aim', text: 'your public direction and aspirations', themes: ['power'] },
};

export const SIGN_TEXT = [
  { kw: 'bold, direct, pioneering', el: 'Fire', mode: 'Cardinal', style: 'with directness and courage, eager to begin', shadow: 'impatience' },
  { kw: 'steady, sensual, loyal', el: 'Earth', mode: 'Fixed', style: 'steadily and sensually, valuing security', shadow: 'stubbornness' },
  { kw: 'curious, versatile, talkative', el: 'Air', mode: 'Mutable', style: 'through curiosity, variety and conversation', shadow: 'scattered focus' },
  { kw: 'protective, feeling, nurturing', el: 'Water', mode: 'Cardinal', style: 'protectively and through feeling and care', shadow: 'defensiveness' },
  { kw: 'radiant, generous, proud', el: 'Fire', mode: 'Fixed', style: 'warmly and dramatically, wanting to shine', shadow: 'pride' },
  { kw: 'precise, helpful, discerning', el: 'Earth', mode: 'Mutable', style: 'carefully and usefully, refining details', shadow: 'over-criticism' },
  { kw: 'harmonious, fair, relational', el: 'Air', mode: 'Cardinal', style: 'diplomatically, seeking balance and partnership', shadow: 'indecision' },
  { kw: 'intense, private, transformative', el: 'Water', mode: 'Fixed', style: 'intensely and privately, seeking depth', shadow: 'control' },
  { kw: 'adventurous, philosophical, candid', el: 'Fire', mode: 'Mutable', style: 'expansively, seeking meaning and adventure', shadow: 'restlessness' },
  { kw: 'ambitious, disciplined, practical', el: 'Earth', mode: 'Cardinal', style: 'with discipline and long-term ambition', shadow: 'rigidity' },
  { kw: 'independent, inventive, humanitarian', el: 'Air', mode: 'Fixed', style: 'independently and inventively, for the collective', shadow: 'detachment' },
  { kw: 'imaginative, compassionate, fluid', el: 'Water', mode: 'Mutable', style: 'imaginatively and compassionately, sensing the unseen', shadow: 'escapism' },
];

export const HOUSE_TEXT = [
  'self, body and approach to life', 'money, possessions and self-worth', 'communication, siblings and local life', 'home, family and roots',
  'creativity, romance, children and play', 'work, health and daily routines', 'partnership and close relationships', 'shared resources, intimacy and transformation',
  'travel, study, belief and meaning', 'career, reputation and public life', 'friends, groups and hopes', 'solitude, the unconscious and spiritual retreat',
];

export const ASPECT_TEXT = {
  Conjunction: 'blend and intensify each other',
  Opposition: 'pull in opposite directions, seeking balance through awareness',
  Trine: 'flow together easily, a natural talent',
  Square: 'create friction that drives growth',
  Sextile: 'support each other when you make the effort',
  Quincunx: 'require ongoing adjustment, like two languages that do not translate neatly',
};

export function placementText(planet, sign, house) {
  const p = PLANET_TEXT[planet], s = SIGN_TEXT[sign];
  let t = `${cap(p.text)} expresses ${s.style}.`;
  if (house) t += ` This plays out most in the area of ${HOUSE_TEXT[house - 1]}.`;
  return t;
}
export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const TRANSIT_TEXT = {
  Jupiter: 'opens doors and invites growth around', Saturn: 'tests, structures and matures', Uranus: 'awakens and unsettles', Neptune: 'softens, inspires or blurs',
  Pluto: 'deepens and transforms', Chiron: 'touches old wounds so they can heal around', Node: 'points destiny-like events toward', Sun: 'spotlights', Mercury: 'brings thoughts and messages to',
  Venus: 'brings sweetness and attraction to', Mars: 'energizes and provokes', Moon: 'colors the mood of',
};

// Vedic nakshatras: [name, ruler, deity, meaning]
export const NAKSHATRAS = [
  ['Ashwini', 'Ketu', 'Ashvins', 'swift healing, new starts'], ['Bharani', 'Venus', 'Yama', 'bearing, restraint, transformation'], ['Krittika', 'Sun', 'Agni', 'cutting clarity, purification'],
  ['Rohini', 'Moon', 'Brahma', 'growth, beauty, fertility'], ['Mrigashira', 'Mars', 'Soma', 'searching, curiosity'], ['Ardra', 'Rahu', 'Rudra', 'storm, renewal through upheaval'],
  ['Punarvasu', 'Jupiter', 'Aditi', 'return, restoration'], ['Pushya', 'Saturn', 'Brihaspati', 'nourishment, care'], ['Ashlesha', 'Mercury', 'Nagas', 'embrace, hypnotic insight'],
  ['Magha', 'Ketu', 'Pitris', 'ancestry, dignity'], ['Purva Phalguni', 'Venus', 'Bhaga', 'pleasure, creativity'], ['Uttara Phalguni', 'Sun', 'Aryaman', 'patronage, alliances'],
  ['Hasta', 'Moon', 'Savitar', 'skill of the hand'], ['Chitra', 'Mars', 'Tvashtar', 'craft, brilliance'], ['Swati', 'Rahu', 'Vayu', 'independence, flexibility'],
  ['Vishakha', 'Jupiter', 'Indra-Agni', 'determined purpose'], ['Anuradha', 'Saturn', 'Mitra', 'devotion, friendship'], ['Jyeshtha', 'Mercury', 'Indra', 'seniority, protection'],
  ['Mula', 'Ketu', 'Nirriti', 'getting to the root'], ['Purva Ashadha', 'Venus', 'Apas', 'invincibility, purification'], ['Uttara Ashadha', 'Sun', 'Vishvadevas', 'lasting victory'],
  ['Shravana', 'Moon', 'Vishnu', 'listening, learning'], ['Dhanishta', 'Mars', 'Vasus', 'rhythm, wealth'], ['Shatabhisha', 'Rahu', 'Varuna', 'healing, secrecy'],
  ['Purva Bhadrapada', 'Jupiter', 'Aja Ekapada', 'fiery transformation'], ['Uttara Bhadrapada', 'Saturn', 'Ahir Budhnya', 'depth, wisdom'], ['Revati', 'Mercury', 'Pushan', 'safe passage, completion'],
];
export const DASHA = [['Ketu', 7], ['Venus', 20], ['Sun', 6], ['Moon', 10], ['Mars', 7], ['Rahu', 18], ['Jupiter', 16], ['Saturn', 19], ['Mercury', 17]];
export const DASHA_TEXT = {
  Ketu: 'detachment, spirituality, letting go', Venus: 'relationships, comfort, art and pleasure', Sun: 'authority, visibility, the father',
  Moon: 'emotions, home, the public, the mother', Mars: 'energy, property, courage and conflict', Rahu: 'ambition, the unfamiliar, sudden rises',
  Jupiter: 'wisdom, children, teachers and expansion', Saturn: 'work, endurance, karma and maturity', Mercury: 'learning, commerce and communication',
};

// Esoteric rulers (after Alice Bailey)
export const ESOTERIC_RULER = ['Mercury', 'Vulcan', 'Venus', 'Neptune', 'Sun (veiling Neptune)', 'Moon (veiling Vulcan)', 'Uranus', 'Mars', 'Earth', 'Saturn', 'Jupiter', 'Pluto'];

export const LOTS = {
  Fortune: 'body, circumstance and material fortune',
  Spirit: 'mind, action and what you choose to do',
  Eros: 'desire and what you long for',
  Necessity: 'constraint and what you must face',
  Courage: 'boldness and conflict',
  Victory: 'faith, success and alliances',
  Nemesis: 'what you cannot avoid and must reckon with',
};

// Prenatal lunation phases (after Dane Rudhyar)
export const LUNATION_TYPES = [
  ['New Moon', 'Instinctive, spontaneous, oriented to new beginnings and self-projection.'],
  ['Crescent', 'Pushing forward against inertia; asserting the new against the old.'],
  ['First Quarter', 'Crisis in action; a builder who thrives on challenge and decisive moves.'],
  ['Gibbous', 'Analytical and refining; perfecting methods toward a meaningful goal.'],
  ['Full Moon', 'Relational and illuminated; seeking meaning and balance through others.'],
  ['Disseminating', 'Sharing what has been learned; a teacher and communicator.'],
  ['Last Quarter', 'Crisis in consciousness; reorienting values and letting old forms go.'],
  ['Balsamic', 'Visionary and future-oriented; completing a cycle and seeding the next.'],
];

export const FIXED_STARS = [
  // [name, longitude J2000 (tropical), nature]
  ['Algol', 56.17, 'intensity and the power to confront fear'], ['Alcyone', 60.0, 'vision and grief turned to insight'], ['Aldebaran', 69.79, 'integrity, success through honor'],
  ['Rigel', 76.83, 'teaching, ambition, technical skill'], ['Betelgeuse', 88.75, 'fortune and martial success'], ['Sirius', 104.08, 'fame, devotion, burning ambition'],
  ['Castor', 110.23, 'intellect, writing, sudden turns'], ['Pollux', 113.22, 'courage, boldness, sharp words'], ['Procyon', 115.78, 'quick rise, quick action'],
  ['Regulus', 149.83, 'leadership, honor if revenge is avoided'], ['Zosma', 161.32, 'victim and healer of injustice'], ['Denebola', 171.62, 'nonconformity, dissent'],
  ['Spica', 203.83, 'gifts, talent, protection'], ['Arcturus', 204.23, 'pathfinding, prosperity through new ways'], ['Antares', 249.77, 'intensity, obsession, courage'],
  ['Vega', 285.32, 'charisma, artistry'], ['Altair', 301.78, 'boldness, ambition'], ['Fomalhaut', 333.87, 'idealism, a dream to keep pure'],
  ['Deneb Algedi', 323.55, 'justice, the law-giver'], ['Scheat', 359.37, 'independent thought, risk'], ['Achernar', 345.3, 'success, the end of a river'],
];

// Human Design
export const HD_GATE_ORDER = [41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60];
export const HD_CENTERS = {
  Head: [64, 61, 63], Ajna: [47, 24, 4, 17, 43, 11], Throat: [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16],
  G: [1, 13, 25, 46, 2, 15, 10, 7], Heart: [21, 40, 26, 51], Sacral: [5, 14, 29, 59, 9, 3, 42, 27, 34],
  SolarPlexus: [6, 37, 22, 36, 30, 55, 49], Spleen: [48, 57, 44, 50, 32, 28, 18], Root: [53, 60, 52, 19, 39, 41, 58, 38, 54],
};
export const HD_CHANNELS = [[1, 8], [2, 14], [3, 60], [4, 63], [5, 15], [6, 59], [7, 31], [9, 52], [10, 20], [10, 34], [10, 57], [11, 56], [12, 22], [13, 33], [16, 48], [17, 62], [18, 58], [19, 49], [20, 34], [20, 57], [21, 45], [23, 43], [24, 61], [25, 51], [26, 44], [27, 50], [28, 38], [29, 46], [30, 41], [32, 54], [34, 57], [35, 36], [37, 40], [39, 55], [42, 53], [47, 64]];
export const HD_CENTER_TEXT = {
  Head: ['inspiration and mental pressure', 'You have a consistent way of being inspired and pressured to think about certain questions.', 'You take in others\' questions and inspiration; not every question is yours to answer.'],
  Ajna: ['conceptualizing and certainty', 'You process ideas in a fixed, reliable way.', 'You can see many perspectives; you need not be certain.'],
  Throat: ['expression and manifestation', 'You have a consistent voice and way of making things happen.', 'Your voice changes with company; wait to be invited to speak on big matters.'],
  G: ['identity, love and direction', 'You have a stable sense of who you are and where you are going.', 'Place and people shape your direction; the right environment matters greatly.'],
  Heart: ['willpower and worth', 'You have consistent willpower; keep promises you can sustain.', 'Nothing to prove. Avoid making promises to show your worth.'],
  Sacral: ['life force and work energy', 'You have sustainable energy for what you respond to.', 'You do not have consistent work energy; rest before you are exhausted.'],
  SolarPlexus: ['emotion and feeling waves', 'You ride an emotional wave; clarity comes over time.', 'You amplify others\' emotions; you can be a calm observer.'],
  Spleen: ['instinct, health and timing', 'You have reliable in-the-moment instincts.', 'You may hold on to things that feel safe; notice what is not good for you.'],
  Root: ['pressure, drive and stress', 'You handle pressure in a consistent way.', 'You can feel rushed by others\' pressure; not everything is urgent.'],
};
export const HD_TYPES = {
  Manifestor: { strategy: 'Inform before you act', signature: 'Peace', notSelf: 'Anger', text: 'You are designed to initiate. Your impact is strongest when you let others know what you are about to do, which reduces resistance.' },
  Generator: { strategy: 'Wait to respond', signature: 'Satisfaction', notSelf: 'Frustration', text: 'You have sustainable life-force energy. Let life bring things to you and notice your gut response before committing.' },
  'Manifesting Generator': { strategy: 'Wait to respond, then inform', signature: 'Satisfaction', notSelf: 'Frustration and anger', text: 'You combine sustainable energy with speed. Respond first, then move quickly, skipping steps where it is wise.' },
  Projector: { strategy: 'Wait for the invitation', signature: 'Success', notSelf: 'Bitterness', text: 'You are designed to guide and see others deeply. Your insight lands when you are recognized and invited.' },
  Reflector: { strategy: 'Wait a lunar cycle', signature: 'Surprise', notSelf: 'Disappointment', text: 'You sample and reflect your environment. Major decisions benefit from about a month of reflection.' },
};
export const HD_PROFILE_LINES = ['Investigator', 'Hermit', 'Martyr', 'Opportunist', 'Heretic', 'Role Model'];
export const HD_AUTH = {
  Emotional: 'Wait for clarity over your emotional wave; do not decide at a high or low.',
  Sacral: 'Trust your immediate gut response, the sounds and pulls of yes and no.',
  Splenic: 'Trust the quiet, in-the-moment instinct; it speaks once.',
  'Ego Manifested': 'Speak from what you truly want and will commit to.',
  'Ego Projected': 'Notice what you want when you talk it through with the right people.',
  'Self-Projected': 'Talk it out and listen to what your own voice says about direction.',
  'Mental (Environmental)': 'Talk decisions through with trusted others and notice how environments feel.',
  Lunar: 'Let the Moon cycle through all gates, about 28 days, before major decisions.',
};
