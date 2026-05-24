const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'analysis', 'niche-recommendations.json');

const WEIGHTS = {
  demandPR:         0.30,
  newChannelGrowth: 0.25,
  genreOpportunity: 0.20,
  engagementRate:   0.10,
  scaleEfficiency:  0.10,
  recencyTrend:     0.05,
};

function normalize(values) {
  if (values.length === 0) return [];
  if (values.length === 1) return [1.0];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0.5);
  return values.map(v => (v - min) / (max - min));
}

function computeGenreOpportunity(demandPR, competitionDensity) {
  const channelCount = competitionDensity.channelCount || 1;
  const largeRatio = competitionDensity.largeChannelRatio || 0;
  return demandPR / (Math.sqrt(channelCount) * (1 + largeRatio));
}

function scoreRegion(metrics) {
  if (metrics.length === 0) return [];

  const rawValues = {
    demandPR: metrics.map(m => m.demandPR),
    newChannelGrowth: metrics.map(m => m.newChannelGrowth),
    genreOpportunity: metrics.map(m => computeGenreOpportunity(m.demandPR, m.competition)),
    engagementRate: metrics.map(m => m.engagementRate),
    scaleEfficiency: metrics.map(m => m.scaleEfficiency),
    recencyTrend: metrics.map(m => m.recencyTrend.change),
  };

  const normalized = {};
  for (const [key, values] of Object.entries(rawValues)) {
    normalized[key] = normalize(values);
  }

  const scored = metrics.map((m, i) => {
    const breakdown = {};
    let finalScore = 0;

    for (const [factor, weight] of Object.entries(WEIGHTS)) {
      const val = normalized[factor][i];
      breakdown[factor] = { normalized: Math.round(val * 1000) / 1000, weight, weighted: Math.round(val * weight * 1000) / 1000 };
      finalScore += val * weight;
    }

    return {
      categoryName: m.categoryName,
      finalScore: Math.round(finalScore * 1000) / 1000,
      breakdown,
      metrics: {
        avgViews: m.avgViews,
        demandPR: Math.round(m.demandPR * 1000) / 1000,
        engagementRate: Math.round(m.engagementRate * 10000) / 10000,
        uploadCadenceDays: m.uploadCadenceDays,
        newChannelGrowth: m.newChannelGrowth,
        scaleEfficiency: m.scaleEfficiency,
        recencyDirection: m.recencyTrend.direction,
        channelCount: m.competition.channelCount,
        largeChannelRatio: Math.round(m.competition.largeChannelRatio * 100) / 100,
      },
    };
  });

  return scored.sort((a, b) => b.finalScore - a.finalScore);
}

function generateInsights(scored) {
  return scored.map((item, rank) => {
    const insights = [];
    const m = item.metrics;

    if (m.demandPR > 1) {
      insights.push(`High organic reach: videos average ${m.demandPR.toFixed(1)}x the subscriber count in views`);
    }

    if (m.scaleEfficiency > 0.5) {
      insights.push('Small channels compete well against large ones in this genre');
    } else if (m.scaleEfficiency < 0.2) {
      insights.push('Large channels dominate; harder for newcomers');
    }

    if (m.recencyDirection === 'rising') {
      insights.push('Trending upward — growing audience demand');
    } else if (m.recencyDirection === 'falling') {
      insights.push('Demand is declining recently');
    }

    if (m.uploadCadenceDays > 0) {
      insights.push(`Typical upload frequency: every ${m.uploadCadenceDays} days`);
    }

    if (m.newChannelGrowth > 50) {
      insights.push(`New channels grow fast: ~${Math.round(m.newChannelGrowth)} subs/day`);
    }

    if (m.engagementRate > 0.05) {
      insights.push('High engagement rate — active audience');
    }

    return {
      rank: rank + 1,
      ...item,
      insights,
    };
  });
}

function scoreCrossRegion(analysisData, regionScores) {
  const regionKeys = Object.keys(regionScores);
  if (regionKeys.length < 2) return [];

  const crossMap = {};
  for (const region of regionKeys) {
    for (const item of regionScores[region]) {
      if (!crossMap[item.categoryName]) {
        crossMap[item.categoryName] = { regions: {}, scores: [] };
      }
      crossMap[item.categoryName].regions[region] = item.finalScore;
      crossMap[item.categoryName].scores.push(item.finalScore);
    }
  }

  return Object.entries(crossMap)
    .filter(([, data]) => data.scores.length >= 2)
    .map(([name, data]) => ({
      categoryName: name,
      avgScore: Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 1000) / 1000,
      regionScores: data.regions,
      globalViability: data.scores.every(s => s >= 0.3) ? 'strong' : 'regional',
    }))
    .sort((a, b) => b.avgScore - a.avgScore);
}

function runScoring(analysisData, { topN = 10 } = {}) {
  const result = {
    scoredAt: new Date().toISOString(),
    weights: WEIGHTS,
    regions: {},
    crossRegion: [],
  };

  const regionScores = {};

  for (const [region, metrics] of Object.entries(analysisData.regions)) {
    const scored = scoreRegion(metrics);
    const withInsights = generateInsights(scored);
    result.regions[region] = withInsights.slice(0, topN);
    regionScores[region] = scored;
  }

  result.crossRegion = scoreCrossRegion(analysisData, regionScores).slice(0, topN);

  return result;
}

function saveToFile(data, filePath = OUTPUT_FILE) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function loadFromFile(filePath = OUTPUT_FILE) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

module.exports = {
  WEIGHTS,
  normalize,
  computeGenreOpportunity,
  scoreRegion,
  generateInsights,
  scoreCrossRegion,
  runScoring,
  saveToFile,
  loadFromFile,
  OUTPUT_FILE,
};
