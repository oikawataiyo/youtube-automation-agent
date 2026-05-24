/**
 * Psychology domain configuration for the moyo channel.
 * Defines benchmark channels, topic classification rules,
 * and pillar mapping for demand analysis.
 */

const PSYCHOLOGY_CHANNELS = [
  { name: 'Psych2Go',             id: 'UCkJEpR7JmS36tajD34Gp4VA' },
  { name: 'Einzelganger',         id: 'UCgOHBq3rfGDBnt4Q9jbYfNQ' },
  { name: 'Sisyphus 55',          id: 'UC4jPmRMsrPBAOhBjpkYwxMg' },
  { name: 'The School of Life',   id: 'UC0RhatS1pyxInC00YKjjBqQ' },
  { name: 'HealthyGamerGG',       id: 'UClHVl2N3jPEbkNJVx-ItQIQ' },
  { name: 'Therapy in a Nutshell', id: 'UCpuMgMFVBCAhZMiX_gJMYyg' },
  { name: 'Sprouts',              id: 'UCchpoPAf80WVAI4MWwcfRRw' },
  { name: 'Better Ideas',         id: 'UC2MhCN-0jKYRVKJPCaVhOdg' },
];

const PSYCHOLOGY_TOPIC_RULES = [
  { topic: 'Anxiety & Stress',          keywords: ['anxiety', 'panic', 'worry', 'cortisol', 'fight or flight', 'anxious', 'stress', 'nervous', 'phobia', 'social anxiety'] },
  { topic: 'Relationships & Attachment', keywords: ['attachment', 'avoidant', 'breakup', 'codependent', 'boundaries', 'relationship', 'partner', 'love', 'dating', 'marriage', 'toxic relationship', 'anxious attachment', 'secure attachment'] },
  { topic: 'Narcissism & Manipulation',  keywords: ['narcissist', 'gaslighting', 'love bombing', 'dark triad', 'manipulation', 'narcissism', 'manipulator', 'toxic person', 'psychopath', 'sociopath', 'emotional abuse', 'covert narcissist'] },
  { topic: 'Cognitive Biases',           keywords: ['bias', 'fallacy', 'heuristic', 'dunning-kruger', 'anchoring', 'cognitive bias', 'logical fallacy', 'confirmation bias', 'sunk cost', 'framing effect'] },
  { topic: 'Self-Improvement',           keywords: ['habits', 'discipline', 'motivation', 'goals', 'mindset', 'self-improvement', 'growth', 'productivity', 'success', 'confidence', 'self-esteem', 'self-discipline'] },
  { topic: 'Depression & Mood',          keywords: ['depression', 'serotonin', 'dopamine', 'burnout', 'anhedonia', 'depressed', 'sad', 'mood', 'bipolar', 'seasonal affective', 'melancholy'] },
  { topic: 'Social Psychology',          keywords: ['conformity', 'bystander effect', 'milgram', 'social proof', 'obedience', 'group', 'crowd', 'peer pressure', 'social influence', 'herd mentality'] },
  { topic: 'Neuroscience & Brain',       keywords: ['brain', 'amygdala', 'neuroplasticity', 'prefrontal cortex', 'neuroscience', 'neuron', 'hippocampus', 'cognitive', 'neural', 'synaptic'] },
  { topic: 'Modern Life & Technology',   keywords: ['social media', 'doomscrolling', 'phone addiction', 'loneliness', 'screen time', 'internet', 'algorithm', 'digital', 'online', 'technology', 'remote work'] },
  { topic: 'Procrastination & Habits',   keywords: ['procrastination', 'willpower', 'avoidance', 'routine', 'procrastinate', 'lazy', 'habit', 'delay', 'distraction', 'focus'] },
  { topic: 'Trauma & PTSD',             keywords: ['trauma', 'ptsd', 'cptsd', 'dissociation', 'childhood trauma', 'traumatic', 'flashback', 'hypervigilance', 'trigger', 'adverse childhood'] },
  { topic: 'Personality Types',          keywords: ['introvert', 'extrovert', 'mbti', 'big five', 'enneagram', 'personality', 'temperament', 'infj', 'infp', 'intj', 'hsp', 'highly sensitive'] },
  { topic: 'Mindfulness & Meditation',   keywords: ['mindfulness', 'meditation', 'breathing', 'grounding', 'mindful', 'calm', 'present moment', 'body scan', 'relaxation', 'zen'] },
  { topic: 'Philosophy & Meaning',       keywords: ['existential', 'nihilism', 'stoicism', 'absurdism', 'purpose', 'meaning', 'philosophy', 'existentialism', 'stoic', 'camus', 'nietzsche', 'kierkegaard', 'sartre'] },
];

const PILLAR_TOPIC_MAP = {
  'Anxiety & Stress':          'health',
  'Relationships & Attachment': 'behavior',
  'Narcissism & Manipulation':  'dark',
  'Cognitive Biases':           'biases',
  'Self-Improvement':           'health',
  'Depression & Mood':          'health',
  'Social Psychology':          'behavior',
  'Neuroscience & Brain':       'biases',
  'Modern Life & Technology':   'modern',
  'Procrastination & Habits':   'behavior',
  'Trauma & PTSD':             'health',
  'Personality Types':          'behavior',
  'Mindfulness & Meditation':   'health',
  'Philosophy & Meaning':       'modern',
};

/**
 * Enrich topic ranking data with pillar information.
 * @param {Array} topicRanking - output from computeTopicRanking
 * @returns {Array} topicRanking with pillar field added
 */
function mapTopicsToPillars(topicRanking) {
  return topicRanking.map(t => ({
    ...t,
    pillar: PILLAR_TOPIC_MAP[t.topic] || null,
  }));
}

module.exports = {
  PSYCHOLOGY_CHANNELS,
  PSYCHOLOGY_TOPIC_RULES,
  PILLAR_TOPIC_MAP,
  mapTopicsToPillars,
};
