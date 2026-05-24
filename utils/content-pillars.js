/**
 * Content pillar definitions for the moyo psychology channel.
 * Each pillar has a weight (probability of selection), example topics,
 * and a style guide that shapes LLM script generation.
 */

const PILLARS = {
  behavior: {
    name: 'Why You Do That',
    weight: 0.40,
    description: 'Explains everyday behaviors through behavioral psychology',
    searchPatterns: [
      'why do I [behavior]',
      '[behavior] psychology explained',
      'psychology behind [behavior]',
    ],
    exampleTopics: [
      'Why you procrastinate more when you have more time',
      'The psychology of always being late',
      'Why you can\'t stop checking your phone before bed',
      'Why compliments make you uncomfortable',
      'Why you cringe at your past self',
      'Why you feel sleepy at work but awake at night',
      'Why you always pick the slowest line',
      'Why you overthink at 3am',
      'Why you remember embarrassing moments forever',
      'Why you keep choosing the wrong people',
    ],
    styleGuide: 'Start with a relatable scenario the viewer has experienced. Use "you" language. Explain the underlying mechanism (named effect/bias if one exists). Cite 3-5 studies. End with reframing — the behavior isn\'t a flaw, it\'s how your brain works.',
  },

  modern: {
    name: 'The Modern Mind',
    weight: 0.25,
    description: 'Psychology applied to modern life: technology, social media, remote work, dating apps',
    searchPatterns: [
      'psychology of [modern phenomenon]',
      'why [modern phenomenon] makes you feel [emotion]',
      '[modern phenomenon] mental health',
    ],
    exampleTopics: [
      'Why social media makes you feel behind in life',
      'The psychology of doomscrolling',
      'Why remote work makes you lonelier than you think',
      'Why dating apps make you worse at dating',
      'Why you feel guilty when you\'re not productive',
      'The psychology of information overload',
      'Why AI anxiety is the new climate anxiety',
      'Why notifications hijack your attention',
      'Why hustle culture is a trauma response',
      'The loneliness epidemic nobody talks about',
    ],
    styleGuide: 'Frame as a cultural diagnosis. Start with a specific modern scenario. Back up with research but make it feel like an essay, not a lecture. Acknowledge that the system is broken, not the individual. More Sisyphus55 than Psych2Go in tone.',
  },

  biases: {
    name: 'Mind Traps',
    weight: 0.20,
    description: 'Cognitive biases, logical fallacies, and mental models',
    searchPatterns: [
      '[bias name] explained',
      'cognitive bias [name]',
      'why your brain [error]',
    ],
    exampleTopics: [
      'The Dunning-Kruger effect is not what you think',
      'Survivorship bias is ruining your decisions',
      'Why your brain is terrible at statistics',
      'The sunk cost fallacy explained',
      'Anchoring bias: how stores manipulate your spending',
      'Confirmation bias: why you only hear what you believe',
      'The spotlight effect: nobody is watching you',
      'Loss aversion: why losing hurts more than winning feels good',
      'The halo effect: why attractive people seem smarter',
      'Availability heuristic: why you fear the wrong things',
    ],
    styleGuide: 'Name the bias clearly in the first 30 seconds. Give 2-3 vivid examples from daily life. Explain the evolutionary origin if known. Show how it\'s exploited (advertising, politics, relationships). End with a practical debiasing technique.',
  },

  dark: {
    name: 'Dark Patterns',
    weight: 0.10,
    description: 'Ethical exploration of manipulation, persuasion, and social engineering',
    searchPatterns: [
      'dark psychology [topic]',
      'how [manipulators] use [technique]',
      'signs of [manipulation type]',
    ],
    exampleTopics: [
      'How narcissists weaponize empathy',
      'The psychology of cult recruitment',
      'Why gaslighting works on smart people',
      'How advertisers exploit your insecurities',
      'The dark side of charisma',
      '5 manipulation tactics you fall for every day',
      'Why toxic relationships feel like addiction',
      'The psychology of scams: why smart people get fooled',
      'How social media algorithms exploit your emotions',
      'Love bombing: the manipulation behind excessive affection',
    ],
    styleGuide: 'Educational framing only — this is "how to recognize and defend against" not "how to use." Start with a shocking case or statistic. Explain the mechanism step by step. Always end with defense strategies. Tone: serious, not sensational.',
  },

  health: {
    name: 'Quiet Strength',
    weight: 0.05,
    description: 'Evidence-based mental health strategies without toxic positivity',
    searchPatterns: [
      'how to [mental health technique]',
      '[technique] for mental health',
      'evidence-based [mental health topic]',
    ],
    exampleTopics: [
      'CBT techniques you can use today',
      'How to break a rumination spiral',
      'The neuroscience of why journaling works',
      'Setting boundaries without guilt',
      'Why "just think positive" doesn\'t work',
      'How to stop catastrophizing',
      'The science of self-compassion',
      'Why therapy works (the neuroscience)',
      'How to rebuild motivation after burnout',
      'Sleep hygiene: what actually works according to research',
    ],
    styleGuide: 'No toxic positivity. Acknowledge that mental health is hard. Lead with neuroscience or clinical research. Give specific, actionable steps (not vague advice). Mention when professional help is appropriate. Tone: warm, honest, grounded.',
  },
};

const PILLAR_IDS = Object.keys(PILLARS);

/**
 * Select a pillar based on weighted probability.
 * @param {string[]} [recentPillars] - pillar IDs of recently published videos (for diversity)
 * @returns {{ id: string, pillar: object }}
 */
function selectPillar(recentPillars = []) {
  // Adjust weights to avoid repeating the most recent pillar
  const adjusted = {};
  let totalWeight = 0;

  for (const id of PILLAR_IDS) {
    let w = PILLARS[id].weight;
    // Halve weight if it was the most recent pillar
    if (recentPillars.length > 0 && recentPillars[0] === id) {
      w *= 0.5;
    }
    adjusted[id] = w;
    totalWeight += w;
  }

  // Weighted random selection
  let r = Math.random() * totalWeight;
  for (const id of PILLAR_IDS) {
    r -= adjusted[id];
    if (r <= 0) {
      return { id, pillar: PILLARS[id] };
    }
  }

  // Fallback
  return { id: PILLAR_IDS[0], pillar: PILLARS[PILLAR_IDS[0]] };
}

/**
 * Pick a random topic from a pillar's example list, avoiding recently used topics.
 * @param {object} pillar
 * @param {string[]} [usedTopics] - topics already covered
 * @returns {string}
 */
function selectTopic(pillar, usedTopics = []) {
  const usedSet = new Set(usedTopics.map(t => t.toLowerCase()));
  const available = pillar.exampleTopics.filter(
    t => !usedSet.has(t.toLowerCase())
  );

  if (available.length === 0) return pillar.exampleTopics[0];
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Select a pillar using demand signal multipliers.
 * Multiplies base weights by demand data (normalized 0.5-2.0 range),
 * then applies the same recency penalty as selectPillar.
 * @param {string[]} [recentPillars] - pillar IDs of recently published videos
 * @param {Object<string, number>} demandMultipliers - pillar ID -> multiplier (0.5-2.0)
 * @returns {{ id: string, pillar: object }}
 */
function selectPillarWithDemand(recentPillars = [], demandMultipliers = {}) {
  const adjusted = {};
  let totalWeight = 0;

  for (const id of PILLAR_IDS) {
    let w = PILLARS[id].weight;
    // Apply demand multiplier (clamped to 0.5-2.0)
    const multiplier = Math.max(0.5, Math.min(2.0, demandMultipliers[id] || 1.0));
    w *= multiplier;
    // Halve weight if it was the most recent pillar
    if (recentPillars.length > 0 && recentPillars[0] === id) {
      w *= 0.5;
    }
    adjusted[id] = w;
    totalWeight += w;
  }

  // Weighted random selection
  let r = Math.random() * totalWeight;
  for (const id of PILLAR_IDS) {
    r -= adjusted[id];
    if (r <= 0) {
      return { id, pillar: PILLARS[id] };
    }
  }

  return { id: PILLAR_IDS[0], pillar: PILLARS[PILLAR_IDS[0]] };
}

module.exports = { PILLARS, PILLAR_IDS, selectPillar, selectPillarWithDemand, selectTopic };
