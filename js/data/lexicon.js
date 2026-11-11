// Shared theme vocabulary used by the Compass synthesis to compare systems.
export const THEMES = {
  beginning: 'New beginnings and initiative',
  partnership: 'Relationships, cooperation and choice',
  expression: 'Creativity, voice and visibility',
  structure: 'Foundations, discipline and order',
  change: 'Movement, freedom and change',
  harmony: 'Care, balance and responsibility',
  introspection: 'Reflection, solitude and study',
  power: 'Ambition, willpower and achievement',
  completion: 'Endings, release and closure',
  transformation: 'Deep change, death and rebirth',
  intuition: 'Intuition, dreams and the unseen',
  healing: 'Healing, rest and renewal',
  abundance: 'Growth, luck and abundance',
  challenge: 'Difficulty, tension and testing',
};

export const NUMBER = {
  1: { kw: 'independence, initiative, leadership', text: 'The pioneer. You learn to stand on your own and start what others only imagine.', shadow: 'stubbornness, isolation', themes: ['beginning', 'power'], tarot: 'The Magician' },
  2: { kw: 'cooperation, sensitivity, diplomacy', text: 'The partner. You read people well and bring others together.', shadow: 'over-dependence, indecision', themes: ['partnership', 'harmony'], tarot: 'The High Priestess' },
  3: { kw: 'expression, creativity, joy', text: 'The communicator. Your words and creativity lift others.', shadow: 'scattered energy, superficiality', themes: ['expression'], tarot: 'The Empress' },
  4: { kw: 'structure, work, reliability', text: 'The builder. Patient effort creates foundations that last.', shadow: 'rigidity, overwork', themes: ['structure'], tarot: 'The Emperor' },
  5: { kw: 'freedom, change, adventure', text: 'The explorer. Experience is your teacher and change your medium.', shadow: 'restlessness, excess', themes: ['change'], tarot: 'The Hierophant' },
  6: { kw: 'responsibility, care, harmony', text: 'The nurturer. You create beauty and safety for those you love.', shadow: 'perfectionism, self-sacrifice', themes: ['harmony', 'partnership'], tarot: 'The Lovers' },
  7: { kw: 'reflection, analysis, spirituality', text: 'The seeker. You need solitude and depth to find truth.', shadow: 'withdrawal, cynicism', themes: ['introspection', 'intuition'], tarot: 'The Chariot' },
  8: { kw: 'power, achievement, abundance', text: 'The executive. You learn to wield material and personal power wisely.', shadow: 'control, materialism', themes: ['power', 'abundance'], tarot: 'Strength' },
  9: { kw: 'compassion, completion, wisdom', text: 'The humanitarian. You serve a larger picture and learn to let go.', shadow: 'martyrdom, resentment', themes: ['completion', 'healing'], tarot: 'The Hermit' },
  11: { kw: 'intuition, inspiration, illumination', text: 'Master number 11. Heightened sensitivity and a calling to inspire.', shadow: 'nervous tension, self-doubt', themes: ['intuition', 'partnership'], tarot: 'Justice' },
  22: { kw: 'master building, vision made real', text: 'Master number 22. The capacity to build large, practical structures from a vision.', shadow: 'overwhelm, pressure', themes: ['structure', 'power'], tarot: 'The Fool' },
  33: { kw: 'master teaching, compassion', text: 'Master number 33. Teaching through love and service.', shadow: 'burden, martyrdom', themes: ['harmony', 'healing'], tarot: 'The World' },
};
export const PERSONAL_YEAR = {
  1: 'A year of beginnings. Plant seeds, start projects and act on your own initiative.',
  2: 'A year of patience and partnership. Cooperate, listen and let things develop.',
  3: 'A year of expression. Socialize, create and let yourself be seen.',
  4: 'A year of building. Work steadily, organize and lay foundations.',
  5: 'A year of change. Expect movement, travel and freedom; stay flexible.',
  6: 'A year of responsibility. Home, family and commitments take center stage.',
  7: 'A year of reflection. Study, rest and turn inward; avoid forcing outcomes.',
  8: 'A year of achievement. Career, money and recognition; reap what you built.',
  9: 'A year of completion. Release what is finished and make room for the next cycle.',
};
export const SEPHIROTH = { 1: 'Keter (Crown)', 2: 'Chokmah (Wisdom)', 3: 'Binah (Understanding)', 4: 'Chesed (Mercy)', 5: 'Gevurah (Severity)', 6: 'Tiferet (Beauty)', 7: 'Netzach (Victory)', 8: 'Hod (Splendor)', 9: 'Yesod (Foundation)', 10: 'Malkuth (Kingdom)' };

export const ANGEL_DIGITS = {
  0: 'wholeness, potential and the beginning of a cycle', 1: 'new beginnings and the power of your thoughts', 2: 'balance, trust and partnership',
  3: 'creativity, growth and support', 4: 'stability, protection and steady work', 5: 'change and freedom', 6: 'care, home and rebalancing priorities',
  7: 'insight, learning and spiritual alignment', 8: 'abundance, power and cycles of return', 9: 'completion, compassion and letting go',
};
export const ANGEL_SPECIAL = {
  '111': 'Your thoughts are seeding reality. Focus on what you want, not what you fear.',
  '222': 'Trust the process. Things are aligning even if you cannot see it yet.',
  '333': 'Support surrounds you. Express yourself and grow.',
  '444': 'You are protected and on solid ground. Keep building.',
  '555': 'Major change is underway. Let go of what holds you in place.',
  '666': 'Rebalance. Return attention to care, body and home.',
  '777': 'You are aligned with your path. Study and reflection are rewarded.',
  '888': 'Abundance and a cycle of reward. Receive gracefully.',
  '999': 'A chapter is closing. Complete it with compassion.',
  '000': 'A blank page. Infinite potential and a fresh cycle.',
  '1111': 'A gateway moment. Notice synchronicity and set clear intentions.',
  '1212': 'Step out of your comfort zone; your growth is supported.',
  '1010': 'Stay positive and keep moving forward on your path.',
  '1234': 'Step by step, things are progressing in order.',
  '1122': 'Partnership with your intentions; balance self and other.',
  '1221': 'Mirror number: what you give returns to you.',
  '1313': 'Creative change; transform through expression.',
  '1414': 'Build carefully; your foundations are being tested and strengthened.',
};

export const ELEMENTS_W = {
  Fire: 'action, passion, courage and inspiration', Earth: 'practicality, the body, patience and resources',
  Air: 'thought, communication, ideas and relationships', Water: 'emotion, intuition, empathy and the unconscious',
};
export const ELEMENTS_C = {
  Wood: 'growth, vision, flexibility and planning (Liver, spring, east, green)',
  Fire: 'joy, connection, warmth and expression (Heart, summer, south, red)',
  Earth: 'stability, nourishment, care and centering (Spleen, late summer, center, yellow)',
  Metal: 'clarity, structure, grief and letting go (Lungs, autumn, west, white)',
  Water: 'will, wisdom, fear and rest (Kidneys, winter, north, black or blue)',
};
