export const CHAKRAS = [
  { key: 'root', name: 'Root', sk: 'Muladhara', color: 'red', hex: '#b5483f', element: 'Earth', bija: 'LAM', loc: 'base of the spine', theme: 'safety, grounding, belonging', low: 'anxiety, insecurity, feeling unsupported', high: 'rigidity, hoarding, resistance to change', practice: 'Walk barefoot, eat warm root vegetables, keep a steady routine.', freq: 396, themes: ['structure'],
    q: ['I feel safe and secure in my daily life.', 'I feel connected to my body and the ground beneath me.', 'I trust that my basic needs will be met.'] },
  { key: 'sacral', name: 'Sacral', sk: 'Svadhisthana', color: 'orange', hex: '#c97a3a', element: 'Water', bija: 'VAM', loc: 'lower abdomen', theme: 'pleasure, creativity, emotion', low: 'numbness, creative block, guilt about pleasure', high: 'overindulgence, emotional volatility', practice: 'Dance, swim, create without judgment, honor your feelings.', freq: 417, themes: ['expression'],
    q: ['I allow myself to enjoy pleasure without guilt.', 'My creativity flows easily.', 'I can feel and express my emotions.'] },
  { key: 'solar', name: 'Solar plexus', sk: 'Manipura', color: 'yellow', hex: '#c9a93a', element: 'Fire', bija: 'RAM', loc: 'upper abdomen', theme: 'will, confidence, personal power', low: 'low self-esteem, passivity', high: 'control, aggression, perfectionism', practice: 'Set and keep a small promise to yourself; core work; sunlight.', freq: 528, themes: ['power'],
    q: ['I feel confident making decisions.', 'I follow through on what I set out to do.', 'I feel I have power over my own life.'] },
  { key: 'heart', name: 'Heart', sk: 'Anahata', color: 'green', hex: '#5f9a63', element: 'Air', bija: 'YAM', loc: 'center of the chest', theme: 'love, compassion, connection', low: 'loneliness, resentment, closing off', high: 'people-pleasing, over-giving', practice: 'Practice gratitude, forgive one small thing, spend time with loved ones.', freq: 639, themes: ['partnership', 'healing'],
    q: ['I give and receive love easily.', 'I feel compassion for myself.', 'I can forgive those who have hurt me.'] },
  { key: 'throat', name: 'Throat', sk: 'Vishuddha', color: 'blue', hex: '#4b7fae', element: 'Ether', bija: 'HAM', loc: 'throat', theme: 'expression, truth, communication', low: 'difficulty speaking up, fear of judgment', high: 'talking over others, harshness', practice: 'Sing, journal, say one honest thing kindly.', freq: 741, themes: ['expression'],
    q: ['I speak my truth even when it is difficult.', 'I feel heard by others.', 'I listen well.'] },
  { key: 'third', name: 'Third eye', sk: 'Ajna', color: 'indigo', hex: '#5a5aa6', element: 'Light', bija: 'OM', loc: 'between the brows', theme: 'intuition, insight, imagination', low: 'confusion, distrust of intuition', high: 'overthinking, fantasy, detachment', practice: 'Meditate, record dreams, spend time in darkness before sleep.', freq: 852, themes: ['intuition'],
    q: ['I trust my intuition.', 'I see situations clearly.', 'I remember and reflect on my dreams.'] },
  { key: 'crown', name: 'Crown', sk: 'Sahasrara', color: 'violet', hex: '#8a5fa6', element: 'Thought', bija: 'silence', loc: 'top of the head', theme: 'meaning, spirit, unity', low: 'cynicism, lack of purpose', high: 'spiritual bypassing, disconnection from the body', practice: 'Silent meditation, time in nature, contemplate what is larger than you.', freq: 963, themes: ['introspection'],
    q: ['I feel my life has meaning.', 'I feel connected to something larger than myself.', 'I can be still without restlessness.'] },
];
export const EXTRA_CHAKRAS = [
  ['Earth Star', 'Below the feet', 'Connection to the Earth and ancestry; deep grounding.'],
  ['Soul Star', 'Above the crown', 'Soul purpose and higher guidance.'],
  ['Stellar Gateway', 'Further above the crown', 'Connection to cosmic consciousness.'],
  ['Universal', 'Beyond the body', 'Unity with all of existence.'],
  ['Divine Gateway', 'Furthest point', 'Pure spirit and the source.'],
];

export const AURA = {
  red: ['Red', 'Grounded, passionate, physical and energetic. You learn by doing.', ['power']],
  orange: ['Orange', 'Adventurous, creative, social and sensual.', ['expression']],
  yellow: ['Yellow', 'Optimistic, intellectual, playful and bright.', ['expression']],
  green: ['Green', 'Healing, nurturing, growth-oriented and balanced.', ['healing']],
  blue: ['Blue', 'Calm, honest, communicative and caring.', ['harmony']],
  indigo: ['Indigo', 'Intuitive, sensitive, visionary and deep.', ['intuition']],
  violet: ['Violet', 'Imaginative, spiritual, idealistic and transformative.', ['transformation']],
  white: ['White', 'Pure, protective, spiritually open; often in transition.', ['beginning']],
  pink: ['Pink', 'Loving, gentle, devoted and kind.', ['partnership']],
  gold: ['Gold', 'Wise, generous, inspired and protective of others.', ['abundance']],
};
export const AURA_QUIZ = [
  { q: 'At a party you are most likely to', o: [['dance or play a game', 'red'], ['start a conversation with a stranger', 'orange'], ['crack jokes', 'yellow'], ['help the host', 'green'], ['have one deep conversation', 'blue'], ['notice the mood of the room', 'indigo']] },
  { q: 'Your ideal weekend', o: [['a hike or a sport', 'red'], ['a spontaneous trip', 'orange'], ['learning something new', 'yellow'], ['gardening or cooking', 'green'], ['quiet time with someone close', 'pink'], ['a museum, a concert, a ritual', 'violet']] },
  { q: 'When stressed you', o: [['need to move', 'red'], ['seek distraction', 'orange'], ['over-analyze', 'yellow'], ['take care of others', 'green'], ['withdraw to reflect', 'indigo'], ['pray or meditate', 'white']] },
  { q: 'Friends value you for', o: [['your energy', 'red'], ['your sense of adventure', 'orange'], ['your ideas', 'yellow'], ['your support', 'green'], ['your honesty', 'blue'], ['your wisdom', 'gold']] },
  { q: 'You feel most alive when', o: [['achieving something physical', 'red'], ['creating', 'orange'], ['solving a problem', 'yellow'], ['helping someone heal', 'green'], ['sensing something unseen', 'indigo'], ['imagining another world', 'violet']] },
  { q: 'Your greatest challenge', o: [['impatience', 'red'], ['follow-through', 'orange'], ['overthinking', 'yellow'], ['saying no', 'pink'], ['speaking up', 'blue'], ['staying grounded', 'violet']] },
  { q: 'A color you are drawn to now', o: [['red', 'red'], ['orange', 'orange'], ['yellow', 'yellow'], ['green', 'green'], ['blue', 'blue'], ['purple', 'violet'], ['pink', 'pink'], ['white', 'white'], ['gold', 'gold']] },
];

export const CRYSTALS = [
  ['Clear quartz', 'clarity, amplification', ['clarity', 'all']], ['Amethyst', 'calm, intuition, sleep', ['calm', 'intuition', 'sleep']], ['Rose quartz', 'love, self-compassion', ['love', 'healing']],
  ['Black tourmaline', 'protection, grounding', ['protection', 'grounding']], ['Citrine', 'confidence, abundance', ['abundance', 'confidence']], ['Carnelian', 'courage, creativity', ['creativity', 'confidence']],
  ['Lapis lazuli', 'truth, communication', ['communication', 'intuition']], ['Labradorite', 'transformation, intuition', ['intuition', 'change']], ['Moonstone', 'new beginnings, cycles', ['intuition', 'beginnings']],
  ['Smoky quartz', 'release, grounding', ['grounding', 'release']], ['Tiger\'s eye', 'focus, courage', ['confidence', 'focus']], ['Aventurine', 'luck, opportunity', ['abundance', 'luck']],
  ['Hematite', 'grounding, stability', ['grounding']], ['Selenite', 'cleansing, peace', ['calm', 'clarity']], ['Obsidian', 'shadow work, truth', ['protection', 'release']],
  ['Turquoise', 'protection, healing, travel', ['protection', 'healing']], ['Jade', 'harmony, luck', ['luck', 'calm']], ['Malachite', 'transformation, heart healing', ['change', 'healing']],
  ['Garnet', 'passion, vitality', ['love', 'confidence']], ['Fluorite', 'focus, order', ['focus', 'clarity']], ['Sodalite', 'logic, calm speech', ['communication', 'calm']],
  ['Pyrite', 'prosperity, will', ['abundance', 'focus']], ['Aquamarine', 'courage in speech, calm', ['communication', 'calm']], ['Blue lace agate', 'gentle expression', ['communication', 'calm']],
  ['Rhodonite', 'forgiveness, emotional balance', ['healing', 'love']], ['Sunstone', 'joy, leadership', ['confidence']], ['Lepidolite', 'anxiety relief', ['calm', 'sleep']],
  ['Shungite', 'purification', ['protection']], ['Bloodstone', 'endurance, courage', ['confidence', 'healing']], ['Kyanite', 'alignment, connection', ['clarity', 'communication']],
].map(([name, kw, tags]) => ({ name, kw, tags }));
export const INTENTIONS = ['calm', 'sleep', 'love', 'healing', 'protection', 'grounding', 'abundance', 'luck', 'confidence', 'creativity', 'communication', 'intuition', 'focus', 'clarity', 'change', 'release', 'beginnings'];

export const SOLFEGGIO = [[174, 'foundation, pain relief traditions'], [285, 'tissue and energy restoration traditions'], [396, 'releasing fear and guilt'], [417, 'facilitating change'], [528, 'transformation and love'], [639, 'relationships and connection'], [741, 'expression and solutions'], [852, 'intuition and spiritual order'], [963, 'oneness and the crown']];

export const ORGAN_CLOCK = [
  [3, 5, 'Lung', 'Metal', 'Deep breathing; grief and letting go surface.'], [5, 7, 'Large Intestine', 'Metal', 'Elimination; a good time to wake and release.'],
  [7, 9, 'Stomach', 'Earth', 'The best time for a substantial breakfast.'], [9, 11, 'Spleen', 'Earth', 'Mental focus and productive work.'],
  [11, 13, 'Heart', 'Fire', 'Connection and joy; a lighter lunch and a pause.'], [13, 15, 'Small Intestine', 'Fire', 'Sorting and digesting, physically and mentally.'],
  [15, 17, 'Bladder', 'Water', 'Hydrate; a second wind for study.'], [17, 19, 'Kidney', 'Water', 'Restore reserves; slow down.'],
  [19, 21, 'Pericardium', 'Fire', 'Intimacy, gentle social time.'], [21, 23, 'Triple Burner', 'Fire', 'Prepare for sleep; balance and wind down.'],
  [23, 1, 'Gallbladder', 'Wood', 'Rest; decision-making energy regenerates.'], [1, 3, 'Liver', 'Wood', 'Deep sleep and detoxification; restless waking may signal stress.'],
];

export const DOSHA = {
  vata: ['Vata', 'Air and ether', 'Creative, quick, light and changeable. Balance with warmth, routine and grounding food.'],
  pitta: ['Pitta', 'Fire and water', 'Focused, driven, sharp and warm. Balance with cooling foods, rest and play.'],
  kapha: ['Kapha', 'Earth and water', 'Steady, loyal, calm and strong. Balance with movement, stimulation and lighter food.'],
};
export const DOSHA_QUIZ = [
  ['My frame is', ['thin and light', 'vata'], ['medium and athletic', 'pitta'], ['broad and solid', 'kapha']],
  ['My skin tends to be', ['dry or cool', 'vata'], ['warm, sensitive or reddish', 'pitta'], ['smooth, oily or cool', 'kapha']],
  ['My appetite is', ['irregular', 'vata'], ['strong; I get irritable if hungry', 'pitta'], ['steady; I can skip meals', 'kapha']],
  ['Under stress I become', ['anxious or worried', 'vata'], ['irritable or critical', 'pitta'], ['withdrawn or stubborn', 'kapha']],
  ['My sleep is', ['light and easily disturbed', 'vata'], ['moderate and sound', 'pitta'], ['deep and long', 'kapha']],
  ['I prefer weather that is', ['warm and humid', 'vata'], ['cool', 'pitta'], ['warm and dry', 'kapha']],
  ['My speech is', ['fast, many topics', 'vata'], ['precise and persuasive', 'pitta'], ['slow and calm', 'kapha']],
  ['I learn', ['quickly but forget quickly', 'vata'], ['sharply and with focus', 'pitta'], ['slowly but remember long', 'kapha']],
  ['My energy comes in', ['bursts', 'vata'], ['steady intensity', 'pitta'], ['slow, steady endurance', 'kapha']],
  ['My hair is', ['dry, thin or frizzy', 'vata'], ['fine, early graying or thinning', 'pitta'], ['thick and lustrous', 'kapha']],
];

export const FIVE_EL_QUIZ = [
  ['I make plans and get frustrated when blocked.', 'Wood'], ['I am drawn to growth and new projects.', 'Wood'], ['Anger rises in me easily.', 'Wood'],
  ['I love connecting and being around people.', 'Fire'], ['I feel joy intensely and seek excitement.', 'Fire'], ['I struggle to calm down at night.', 'Fire'],
  ['I take care of others and worry about them.', 'Earth'], ['I crave sweets and comfort food.', 'Earth'], ['I overthink and ruminate.', 'Earth'],
  ['I value order, quality and clear standards.', 'Metal'], ['I carry grief or nostalgia.', 'Metal'], ['I am sensitive to dry air or catch colds easily.', 'Metal'],
  ['I need a lot of rest and solitude.', 'Water'], ['I am cautious; fear guides my choices.', 'Water'], ['I feel the cold easily.', 'Water'],
];
export const YINYANG_QUIZ = [
  ['I feel warm most of the time.', 'yang'], ['I am active and restless.', 'yang'], ['I speak loudly and quickly.', 'yang'], ['I get thirsty for cold drinks.', 'yang'], ['I sleep little but feel fine.', 'yang'],
  ['I feel cold easily.', 'yin'], ['I prefer quiet and rest.', 'yin'], ['I tire easily.', 'yin'], ['I prefer warm drinks and food.', 'yin'], ['I am introspective and slow to start.', 'yin'],
];

export const PLANTS = [
  ['Rose', 'love, beauty, secrecy (sub rosa)'], ['Lavender', 'calm, devotion, cleansing'], ['Sage', 'wisdom, purification, long life'], ['Rosemary', 'remembrance, protection, clarity'],
  ['Thyme', 'courage, strength'], ['Mint', 'refreshment, prosperity, hospitality'], ['Basil', 'love, protection, wealth'], ['Chamomile', 'patience in adversity, calm, sleep'],
  ['Mugwort', 'dreams, intuition, travel'], ['Yarrow', 'courage, healing, divination (I Ching stalks)'], ['St John\'s wort', 'light, protection, midsummer'], ['Vervain', 'enchantment, peace'],
  ['Oak', 'strength, endurance, the door'], ['Birch', 'renewal, new beginnings'], ['Rowan', 'protection against harm'], ['Hawthorn', 'hope, the heart, threshold of the otherworld'],
  ['Willow', 'grief, flexibility, the moon'], ['Elder', 'transformation, the wise woman'], ['Holly', 'protection, the winter king'], ['Ivy', 'fidelity, persistence'],
  ['Lily', 'purity, rebirth'], ['Lotus', 'enlightenment rising from the mud'], ['Sunflower', 'adoration, loyalty, longevity'], ['Poppy', 'remembrance, sleep, dreams'],
  ['Violet', 'modesty, faithfulness'], ['Marigold', 'grief, the sun, honoring the dead'], ['Jasmine', 'sensuality, grace, the moon'], ['Daisy', 'innocence, new beginnings'],
  ['Iris', 'messages, hope, wisdom'], ['Peony', 'prosperity, honor, bashfulness'], ['Cypress', 'mourning, eternity'], ['Bay laurel', 'victory, prophecy'],
  ['Mistletoe', 'peace, healing, fertility'], ['Fern', 'hidden things, magic'], ['Clover', 'luck (four-leaf), the trinity'], ['Myrtle', 'love and marriage'],
];

export const CELTIC_TREE_TEXT = {
  Birch: 'The achiever: driven, ambitious, a natural leader who starts things.', Rowan: 'The thinker: original, visionary, quietly influential.',
  Ash: 'The enchanter: imaginative, intuitive, connected to the larger picture.', Alder: 'The trailblazer: confident, energetic, a pathfinder.',
  Willow: 'The observer: sensitive, intuitive, attuned to cycles.', Hawthorn: 'The illusionist: more than meets the eye; creative and curious.',
  Oak: 'The stabilizer: strong, protective, a pillar for others.', Holly: 'The ruler: noble, competitive, generous in leadership.',
  Hazel: 'The knower: wise, analytical, a keeper of knowledge.', Vine: 'The equalizer: refined, balanced, appreciating beauty.',
  Ivy: 'The survivor: resilient, loyal, growing through adversity.', Reed: 'The inquisitor: deep, perceptive, a seeker of truth.',
  Elder: 'The seeker: free-spirited, adventurous, regenerative.',
};
export const FESTIVAL_TEXT = {
  Yule: 'The longest night and the return of the light. Rest, reflect and kindle hope.', Imbolc: 'The first stirrings of spring. Cleanse, plan and tend the inner flame.',
  Ostara: 'Balance of day and night as light grows. Plant seeds and begin.', Beltane: 'Fertility, vitality and union. Celebrate life and desire.',
  Litha: 'The longest day. Peak power, abundance and outward energy.', Lughnasadh: 'The first harvest. Gratitude for what has ripened and the work it took.',
  Mabon: 'Balance as darkness grows. Second harvest; give thanks and share.', Samhain: 'The thinning veil. Honor ancestors, release and turn inward.',
};
export const CORRESPONDENCES = [
  ['Fire', 'South (north in some southern traditions)', 'Summer', 'Wands', 'Salamander', 'Will, passion, transformation', 'Aries, Leo, Sagittarius'],
  ['Water', 'West', 'Autumn', 'Cups', 'Undine', 'Emotion, intuition, healing', 'Cancer, Scorpio, Pisces'],
  ['Air', 'East', 'Spring', 'Swords', 'Sylph', 'Thought, speech, freedom', 'Gemini, Libra, Aquarius'],
  ['Earth', 'North', 'Winter', 'Pentacles', 'Gnome', 'Body, wealth, stability', 'Taurus, Virgo, Capricorn'],
  ['Spirit', 'Center', 'All', 'Major Arcana', '', 'Unity, the self', ''],
];
