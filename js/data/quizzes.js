// Short self-report questionnaires. All items original except the Mini-IPIP
// (Donnellan et al., 2006), which is public domain via the IPIP.
export const ENNEAGRAM = {
  types: {
    1: ['The Reformer', 'Principled, purposeful and self-controlled. Seeks to be good and right.', 'Fear of being corrupt or defective.'],
    2: ['The Helper', 'Generous, warm and people-pleasing. Seeks to be loved.', 'Fear of being unwanted.'],
    3: ['The Achiever', 'Adaptable, driven and image-conscious. Seeks to be valuable.', 'Fear of being worthless.'],
    4: ['The Individualist', 'Expressive, sensitive and introspective. Seeks identity and significance.', 'Fear of having no identity.'],
    5: ['The Investigator', 'Perceptive, innovative and private. Seeks competence and understanding.', 'Fear of being helpless or incapable.'],
    6: ['The Loyalist', 'Committed, responsible and anxious. Seeks security and support.', 'Fear of being without support.'],
    7: ['The Enthusiast', 'Spontaneous, versatile and scattered. Seeks satisfaction and freedom.', 'Fear of deprivation and pain.'],
    8: ['The Challenger', 'Self-confident, decisive and confrontational. Seeks control of their own life.', 'Fear of being controlled or harmed.'],
    9: ['The Peacemaker', 'Receptive, reassuring and complacent. Seeks inner and outer peace.', 'Fear of loss and separation.'],
  },
  q: [
    ['I notice what is wrong and want to fix it.', 1], ['I hold myself to high standards.', 1], ['I feel irritated when others cut corners.', 1],
    ['I sense what others need before they ask.', 2], ['I like being needed.', 2], ['I find it hard to ask for help myself.', 2],
    ['I am motivated by success and recognition.', 3], ['I adapt my image to the situation.', 3], ['I am very productive and goal-driven.', 3],
    ['I feel different from other people.', 4], ['My emotions are deep and intense.', 4], ['I am drawn to beauty and melancholy.', 4],
    ['I need time alone to think and recharge.', 5], ['I like to understand things thoroughly before acting.', 5], ['I guard my time and energy.', 5],
    ['I anticipate what could go wrong.', 6], ['Loyalty matters enormously to me.', 6], ['I question authority but want reliable support.', 6],
    ['I keep my options open.', 7], ['I avoid boredom and pain by staying busy.', 7], ['I have many plans and ideas.', 7],
    ['I take charge naturally.', 8], ['I protect people I care about fiercely.', 8], ['I respect people who stand up to me.', 8],
    ['I avoid conflict to keep the peace.', 9], ['I can see all sides of an issue.', 9], ['I sometimes lose myself in others\' agendas.', 9],
  ].map(([q, k]) => ({ q, k: String(k) })),
};

export const TEMPERAMENTS = {
  info: {
    sanguine: ['Sanguine', 'Air, blood, spring', 'Sociable, optimistic, lively and talkative. Thrives on people and novelty.'],
    choleric: ['Choleric', 'Fire, yellow bile, summer', 'Ambitious, decisive, energetic and leader-like. Thrives on goals.'],
    melancholic: ['Melancholic', 'Earth, black bile, autumn', 'Thoughtful, detailed, sensitive and idealistic. Thrives on depth and order.'],
    phlegmatic: ['Phlegmatic', 'Water, phlegm, winter', 'Calm, steady, kind and patient. Thrives on peace and routine.'],
  },
  q: [
    ['I make friends easily.', 'sanguine'], ['I am the life of the room.', 'sanguine'], ['I get bored with routine.', 'sanguine'], ['I live in the moment.', 'sanguine'],
    ['I like to be in control.', 'choleric'], ['I make decisions quickly.', 'choleric'], ['I am goal-oriented and competitive.', 'choleric'], ['I get impatient with slowness.', 'choleric'],
    ['I notice details others miss.', 'melancholic'], ['I am a perfectionist.', 'melancholic'], ['I reflect deeply on things.', 'melancholic'], ['I am moved by art and music.', 'melancholic'],
    ['I stay calm under pressure.', 'phlegmatic'], ['I prefer harmony to conflict.', 'phlegmatic'], ['I am a patient listener.', 'phlegmatic'], ['I like a steady pace.', 'phlegmatic'],
  ].map(([q, k]) => ({ q, k })),
};

export const ARCHETYPES12 = {
  info: {
    innocent: ['Innocent', 'Seeks happiness and goodness; gift: faith and optimism.'], everyperson: ['Everyperson', 'Seeks belonging; gift: realism and empathy.'],
    hero: ['Hero', 'Seeks to prove worth through courage; gift: competence.'], caregiver: ['Caregiver', 'Seeks to protect and care; gift: compassion.'],
    explorer: ['Explorer', 'Seeks freedom and discovery; gift: authenticity.'], rebel: ['Rebel', 'Seeks revolution; gift: radical freedom.'],
    lover: ['Lover', 'Seeks intimacy and experience; gift: passion.'], creator: ['Creator', 'Seeks to create lasting value; gift: imagination.'],
    jester: ['Jester', 'Seeks joy and play; gift: lightness.'], sage: ['Sage', 'Seeks truth; gift: wisdom.'],
    magician: ['Magician', 'Seeks transformation; gift: vision.'], ruler: ['Ruler', 'Seeks order and control; gift: responsibility.'],
  },
  q: [
    ['I believe people are basically good.', 'innocent'], ['I prefer simple, honest things.', 'innocent'], ['I want to fit in and be one of the group.', 'everyperson'], ['I value being down to earth.', 'everyperson'],
    ['I rise to challenges.', 'hero'], ['I like to prove myself.', 'hero'], ['Helping others gives me meaning.', 'caregiver'], ['I put others first.', 'caregiver'],
    ['I crave new places and experiences.', 'explorer'], ['I feel stifled by routine.', 'explorer'], ['Rules are made to be broken.', 'rebel'], ['I challenge the status quo.', 'rebel'],
    ['I seek intimacy and beauty.', 'lover'], ['I follow my passions.', 'lover'], ['I need to make things.', 'creator'], ['I have a strong artistic vision.', 'creator'],
    ['I use humor to connect.', 'jester'], ['Life is meant to be enjoyed.', 'jester'], ['I seek to understand the truth.', 'sage'], ['I love learning for its own sake.', 'sage'],
    ['I believe I can change reality with vision.', 'magician'], ['I am drawn to transformation and mystery.', 'magician'], ['I like to lead and organize.', 'ruler'], ['I take responsibility for outcomes.', 'ruler'],
  ].map(([q, k]) => ({ q, k })),
};

// Mini-IPIP (public domain). k: [trait, +1/-1]
export const BIGFIVE = {
  info: {
    E: ['Extraversion', 'Sociability, assertiveness and positive energy.'], A: ['Agreeableness', 'Compassion, cooperation and trust.'],
    C: ['Conscientiousness', 'Organization, dependability and self-discipline.'], N: ['Neuroticism', 'Emotional reactivity and sensitivity to stress.'],
    O: ['Openness (Intellect)', 'Imagination, curiosity and openness to ideas.'],
  },
  q: [
    ['Am the life of the party.', 'E', 1], ['Sympathize with others\' feelings.', 'A', 1], ['Get chores done right away.', 'C', 1], ['Have frequent mood swings.', 'N', 1], ['Have a vivid imagination.', 'O', 1],
    ['Don\'t talk a lot.', 'E', -1], ['Am not interested in other people\'s problems.', 'A', -1], ['Often forget to put things back in their proper place.', 'C', -1], ['Am relaxed most of the time.', 'N', -1], ['Am not interested in abstract ideas.', 'O', -1],
    ['Talk to a lot of different people at parties.', 'E', 1], ['Feel others\' emotions.', 'A', 1], ['Like order.', 'C', 1], ['Get upset easily.', 'N', 1], ['Have difficulty understanding abstract ideas.', 'O', -1],
    ['Keep in the background.', 'E', -1], ['Am not really interested in others.', 'A', -1], ['Make a mess of things.', 'C', -1], ['Seldom feel blue.', 'N', -1], ['Do not have a good imagination.', 'O', -1],
  ].map(([q, t, w]) => ({ q, k: [[t, w]] })),
};

export const JUNGIAN = {
  q: [
    ['I recharge by being around people.', [['E', 1]]], ['I think out loud.', [['E', 1]]], ['I need quiet time to recover after socializing.', [['E', -1]]], ['I prefer a few deep friendships.', [['E', -1]]],
    ['I focus on facts and details.', [['S', 1]]], ['I trust experience over theory.', [['S', 1]]], ['I am drawn to possibilities and patterns.', [['S', -1]]], ['I often think about the future.', [['S', -1]]],
    ['I decide with logic first.', [['T', 1]]], ['Fairness matters more than harmony.', [['T', 1]]], ['I decide with my values and feelings.', [['T', -1]]], ['I consider how a decision affects people.', [['T', -1]]],
    ['I like plans and closure.', [['J', 1]]], ['I finish work before play.', [['J', 1]]], ['I like to keep my options open.', [['J', -1]]], ['I work in bursts close to deadlines.', [['J', -1]]],
  ].map(([q, k]) => ({ q, k })),
};

export const DISC = {
  info: {
    D: ['Dominance', 'Direct, results-oriented, decisive and competitive.'], I: ['Influence', 'Outgoing, enthusiastic, persuasive and optimistic.'],
    S: ['Steadiness', 'Patient, reliable, supportive and calm.'], C: ['Conscientiousness', 'Analytical, precise, careful and systematic.'],
  },
  q: [
    ['I get straight to the point.', 'D'], ['I like challenges and winning.', 'D'], ['I make fast decisions.', 'D'],
    ['I enjoy persuading people.', 'I'], ['I am enthusiastic and expressive.', 'I'], ['I love meeting new people.', 'I'],
    ['I am a dependable team player.', 'S'], ['I prefer stability to change.', 'S'], ['I am patient and a good listener.', 'S'],
    ['I check details carefully.', 'C'], ['I value accuracy and quality.', 'C'], ['I like clear rules and procedures.', 'C'],
  ].map(([q, k]) => ({ q, k })),
};

export const VALUES = ['Adventure', 'Authenticity', 'Balance', 'Beauty', 'Compassion', 'Community', 'Courage', 'Creativity', 'Curiosity', 'Family', 'Freedom', 'Friendship', 'Growth', 'Health', 'Honesty', 'Humor', 'Independence', 'Justice', 'Knowledge', 'Leadership', 'Love', 'Loyalty', 'Nature', 'Peace', 'Pleasure', 'Recognition', 'Security', 'Service', 'Spirituality', 'Wealth', 'Wisdom', 'Excellence'];

export const PROMPTS = {
  shadow: [
    'What quality in other people irritates you most? Where does it live in you?', 'What compliment do you find hardest to accept, and why?', 'What did you learn as a child was not allowed to be felt?',
    'When did you last feel jealous? What did that person have that you want?', 'What part of yourself do you hide at work?', 'What would you do if no one would ever judge you?',
    'What is a belief about yourself that you would not say out loud?', 'Which emotion do you avoid most: anger, sadness, fear or shame?', 'What story about your past do you tell to stay safe?',
    'Who do you envy, and what does that envy point you toward?', 'What do you criticize in others that you do yourself?', 'What is a mistake you have never forgiven yourself for?',
    'When do you feel most defensive? What are you protecting?', 'What would your harshest critic say, and is any part of it useful?', 'Which of your strengths could become a weakness when overused?',
    'What role do you play in your family, and do you want it?', 'What desire do you judge as selfish?', 'If your anger could speak calmly, what would it ask for?',
    'What do you pretend not to care about?', 'What would it cost you to change, and what does staying the same cost?',
  ],
  innerchild: [
    'What did you love to do at seven years old?', 'What did your younger self need to hear most often?', 'Describe a place where you felt completely safe as a child.',
    'What game could you play for hours?', 'What did you want to be when you grew up, and what was the feeling behind it?', 'What were you scolded for that was actually a gift?',
    'Write a short letter from your adult self to your younger self.', 'What small joy could you give your inner child this week?', 'Which adult made you feel seen? What did they do?',
    'What fear from childhood still shows up today?', 'What would your younger self think of your life now?', 'What toy, book or song do you remember most fondly?',
    'When did you first feel you had to be grown up?', 'How can you play today, even for five minutes?', 'What promise would you make to your inner child?',
  ],
  soul: [
    'If your life had a single lesson, what would it be?', 'What situations repeat in your life? What might they be teaching?', 'Imagine meeting a wise elder version of yourself. What do they say?',
    'If you had agreed to this life before birth, what would you have come to learn?', 'Which places, eras or cultures have always felt strangely familiar?', 'What talents arrived in you without training?',
    'What relationships feel fated, and what did they change in you?', 'What would you regret not doing at the end of your life?', 'Which fears seem older than your experiences?',
    'What do you do that makes time disappear?',
  ],
  sync: ['Did you notice a repeated number, word or image today?', 'Did a song, phrase or person appear just when you were thinking of it?', 'Did anything feel like an answer to a question you were holding?'],
};
