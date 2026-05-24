const TOPIC_RULES = [
  { topic: 'AI/LLM',          keywords: ['ai', 'gpt', 'llm', 'chatgpt', 'openai', 'claude', 'anthropic', 'gemini', 'copilot', 'machine learning', 'neural', 'deepseek', 'model', 'agi', 'agents', 'agent', 'prompt', 'transformer', 'diffusion', 'midjourney', 'sora', 'grok', 'mistral'] },
  { topic: 'AI Coding',       keywords: ['cursor', 'copilot', 'vibe coding', 'vibe-coding', 'ai code', 'devin', 'codex', 'windsurf', 'cline', 'aider', 'bolt'] },
  { topic: 'React/Next.js',   keywords: ['react', 'nextjs', 'next.js', 'next js', 'jsx', 'tsx', 'remix', 'hooks'] },
  { topic: 'JavaScript',      keywords: ['javascript', 'typescript', 'node', 'nodejs', 'deno', 'bun', 'npm', 'ecmascript', 'es2025'] },
  { topic: 'Web Dev',         keywords: ['css', 'html', 'tailwind', 'frontend', 'web dev', 'browser', 'svelte', 'vue', 'angular', 'htmx', 'astro', 'nuxt'] },
  { topic: 'Cloud/Infra',     keywords: ['aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes', 'k8s', 'terraform', 'serverless', 'lambda', 'vercel', 'cloudflare', 'supabase', 'firebase'] },
  { topic: 'Database',        keywords: ['database', 'sql', 'postgres', 'mysql', 'mongo', 'redis', 'drizzle', 'prisma', 'orm', 'sqlite'] },
  { topic: 'Rust/Go/Systems', keywords: ['rust', 'golang', 'zig', 'cpp', 'c++', 'systems programming', 'wasm', 'webassembly'] },
  { topic: 'Security',        keywords: ['security', 'hack', 'vulnerability', 'breach', 'exploit', 'cyber', 'malware', 'phishing', 'encryption'] },
  { topic: 'Career/Industry', keywords: ['career', 'job', 'salary', 'layoff', 'interview', 'hired', 'startup', 'industry', 'developer', 'programmer', 'engineer'] },
  { topic: 'Linux/CLI',       keywords: ['linux', 'terminal', 'cli', 'bash', 'shell', 'command line', 'neovim', 'vim'] },
  { topic: 'Mobile',          keywords: ['ios', 'android', 'swift', 'kotlin', 'flutter', 'react native', 'mobile'] },
  { topic: 'Python',          keywords: ['python', 'django', 'flask', 'fastapi', 'pip', 'pytorch'] },
  { topic: 'DevOps/CI',       keywords: ['devops', 'ci/cd', 'pipeline', 'github actions', 'jenkins', 'deploy', 'monitoring'] },
  { topic: 'Big Tech News',   keywords: ['google', 'microsoft', 'apple', 'meta', 'amazon', 'nvidia', 'tesla'] },
];

function classifyVideo(title, tags, topicRules = TOPIC_RULES) {
  const text = [title, ...(tags || [])].join(' ').toLowerCase();
  const matched = [];
  for (const rule of topicRules) {
    if (rule.keywords.some(kw => text.includes(kw))) {
      matched.push(rule.topic);
    }
  }
  return matched.length > 0 ? matched : ['Other'];
}

function flattenVideosWithContext(channelData, topicRules = TOPIC_RULES) {
  const videos = [];
  for (const ch of channelData.channels) {
    for (const v of ch.videos) {
      const topics = classifyVideo(v.title, v.tags, topicRules);
      videos.push({
        ...v,
        channel: ch.name,
        subs: ch.subscribers,
        topics,
        performanceRatio: v.views / ch.subscribers,
        engagement: v.views > 0 ? v.likes / v.views : 0,
      });
    }
  }
  return videos;
}

function computeTopicRanking(videos) {
  const stats = {};
  for (const v of videos) {
    for (const topic of v.topics) {
      if (!stats[topic]) {
        stats[topic] = { videos: 0, totalPR: 0, totalEng: 0, totalViews: 0, channels: new Set(), prs: [] };
      }
      const s = stats[topic];
      s.videos++;
      s.totalPR += v.performanceRatio;
      s.totalEng += v.engagement;
      s.totalViews += v.views;
      s.channels.add(v.channel);
      s.prs.push(v.performanceRatio);
    }
  }

  return Object.entries(stats)
    .map(([topic, s]) => {
      const sorted = [...s.prs].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      return {
        topic,
        videos: s.videos,
        avgPR: s.totalPR / s.videos,
        medianPR: median,
        avgEngagement: s.totalEng / s.videos,
        avgViews: Math.round(s.totalViews / s.videos),
        channels: s.channels.size,
      };
    })
    .filter(t => t.videos >= 2)
    .sort((a, b) => b.avgPR - a.avgPR);
}

function computeOpportunityScore(topicRanking) {
  return topicRanking
    .map(t => ({ ...t, opportunity: t.avgPR / Math.sqrt(t.videos) }))
    .sort((a, b) => b.opportunity - a.opportunity);
}

function computeDurationSweetSpot(topicRanking, videos) {
  const results = [];
  for (const t of topicRanking) {
    const sorted = videos
      .filter(v => v.topics.includes(t.topic))
      .sort((a, b) => b.performanceRatio - a.performanceRatio);

    if (sorted.length < 2) continue;

    const mid = Math.ceil(sorted.length / 2);
    const top = sorted.slice(0, mid);
    const bottom = sorted.slice(mid);

    const avgTopDur = top.reduce((s, v) => s + v.duration, 0) / top.length;
    const avgBotDur = bottom.length > 0
      ? bottom.reduce((s, v) => s + v.duration, 0) / bottom.length
      : 0;

    const diff = avgTopDur - avgBotDur;
    const recommendation = diff < -30 ? 'shorter' : diff > 30 ? 'longer' : 'neutral';

    results.push({
      topic: t.topic,
      topHalfDuration: Math.round(avgTopDur),
      bottomHalfDuration: Math.round(avgBotDur),
      recommendation,
    });
  }
  return results;
}

function computeRecencyTrend(videos) {
  const now = new Date();
  const d30 = new Date(now - 30 * 86400000);
  const d90 = new Date(now - 90 * 86400000);

  const buckets = { recent: {}, older: {} };
  for (const v of videos) {
    const pub = new Date(v.publishedAt);
    const bucket = pub >= d30 ? 'recent' : pub >= d90 ? 'older' : null;
    if (!bucket) continue;
    for (const t of v.topics) {
      if (!buckets[bucket][t]) buckets[bucket][t] = { count: 0, totalPR: 0 };
      buckets[bucket][t].count++;
      buckets[bucket][t].totalPR += v.performanceRatio;
    }
  }

  const trends = [];
  const allTopics = new Set([...Object.keys(buckets.recent), ...Object.keys(buckets.older)]);
  for (const topic of allTopics) {
    const r = buckets.recent[topic];
    const o = buckets.older[topic];
    if (r && o) {
      const recentPR = r.totalPR / r.count;
      const olderPR = o.totalPR / o.count;
      const change = recentPR - olderPR;
      const direction = change > 0.02 ? 'rising' : change < -0.02 ? 'falling' : 'stable';
      trends.push({ topic, recentPR, olderPR, change, direction });
    }
  }
  return trends.sort((a, b) => b.change - a.change);
}

function runFullAnalysis(channelData, topicRules = TOPIC_RULES) {
  const videos = flattenVideosWithContext(channelData, topicRules);
  const topicRanking = computeTopicRanking(videos);
  const opportunities = computeOpportunityScore(topicRanking);
  const durationSweetSpot = computeDurationSweetSpot(topicRanking, videos);
  const recencyTrend = computeRecencyTrend(videos);

  return {
    videos,
    topicRanking,
    opportunities,
    durationSweetSpot,
    recencyTrend,
    analyzedAt: new Date().toISOString(),
  };
}

module.exports = {
  TOPIC_RULES,
  classifyVideo,
  flattenVideosWithContext,
  computeTopicRanking,
  computeOpportunityScore,
  computeDurationSweetSpot,
  computeRecencyTrend,
  runFullAnalysis,
};
