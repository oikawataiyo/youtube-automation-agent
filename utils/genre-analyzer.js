const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'analysis', 'genre-analysis.json');

function median(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function flattenGenreVideos(channelData) {
  const videos = [];
  for (const genre of channelData.genres) {
    for (const ch of genre.channels) {
      for (const v of ch.videos) {
        const pr = ch.subscribers > 0 ? v.views / ch.subscribers : 0;
        const engagement = v.views > 0 ? (v.likes + v.comments) / v.views : 0;
        videos.push({
          ...v,
          categoryId: genre.categoryId,
          categoryName: genre.categoryName,
          channelName: ch.name,
          channelId: ch.channelId,
          subscribers: ch.subscribers,
          scaleTier: ch.scaleTier,
          channelPublishedAt: ch.publishedAt,
          performanceRatio: pr,
          engagement,
        });
      }
    }
  }
  return videos;
}

function computeGenreDemandPR(videos, categoryName) {
  const catVideos = videos.filter(v => v.categoryName === categoryName);
  if (catVideos.length === 0) return 0;
  return catVideos.reduce((s, v) => s + v.performanceRatio, 0) / catVideos.length;
}

function computeEngagementRate(videos, categoryName) {
  const catVideos = videos.filter(v => v.categoryName === categoryName);
  if (catVideos.length === 0) return 0;
  return catVideos.reduce((s, v) => s + v.engagement, 0) / catVideos.length;
}

function computeCompetitionDensity(channelData, categoryName) {
  const genre = channelData.genres.find(g => g.categoryName === categoryName);
  if (!genre) return { channelCount: 0, largeChannelRatio: 0 };

  const channels = genre.channels;
  const large = channels.filter(ch => ch.subscribers >= 1_000_000).length;

  return {
    channelCount: channels.length,
    largeChannelRatio: channels.length > 0 ? large / channels.length : 0,
  };
}

function computeUploadCadence(videos, categoryName) {
  const catVideos = videos.filter(v => v.categoryName === categoryName);
  const byChannel = {};
  for (const v of catVideos) {
    const key = v.channelId;
    if (!byChannel[key]) byChannel[key] = [];
    byChannel[key].push(new Date(v.publishedAt).getTime());
  }

  const gaps = [];
  for (const timestamps of Object.values(byChannel)) {
    if (timestamps.length < 2) continue;
    const sorted = [...timestamps].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      gaps.push((sorted[i] - sorted[i - 1]) / 86400000);
    }
  }

  return gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
}

function computeNewChannelGrowth(channelData, categoryName) {
  const genre = channelData.genres.find(g => g.categoryName === categoryName);
  if (!genre) return 0;

  const now = Date.now();
  const twoYearsMs = 2 * 365 * 86400000;
  const newChannels = genre.channels.filter(ch => {
    if (!ch.publishedAt) return false;
    return (now - new Date(ch.publishedAt).getTime()) < twoYearsMs;
  });

  if (newChannels.length === 0) return 0;

  const rates = newChannels.map(ch => {
    const ageDays = Math.max(1, (now - new Date(ch.publishedAt).getTime()) / 86400000);
    return ch.subscribers / ageDays;
  });

  return rates.reduce((a, b) => a + b, 0) / rates.length;
}

function computeScaleEfficiency(videos, categoryName) {
  const catVideos = videos.filter(v => v.categoryName === categoryName);
  const small = catVideos.filter(v => v.subscribers < 1_000_000 && v.subscribers >= 10_000);
  const large = catVideos.filter(v => v.subscribers >= 1_000_000);

  const smallPR = small.length > 0 ? small.reduce((s, v) => s + v.performanceRatio, 0) / small.length : 0;
  const largePR = large.length > 0 ? large.reduce((s, v) => s + v.performanceRatio, 0) / large.length : 0;

  return largePR > 0 ? smallPR / largePR : (smallPR > 0 ? 1 : 0);
}

function computeRecencyTrend(videos, categoryName) {
  const now = new Date();
  const d30 = new Date(now - 30 * 86400000);
  const d90 = new Date(now - 90 * 86400000);

  const catVideos = videos.filter(v => v.categoryName === categoryName);
  const recent = catVideos.filter(v => new Date(v.publishedAt) >= d30);
  const older = catVideos.filter(v => {
    const pub = new Date(v.publishedAt);
    return pub >= d90 && pub < d30;
  });

  const recentPR = recent.length > 0 ? recent.reduce((s, v) => s + v.performanceRatio, 0) / recent.length : 0;
  const olderPR = older.length > 0 ? older.reduce((s, v) => s + v.performanceRatio, 0) / older.length : 0;

  const change = recentPR - olderPR;
  const direction = change > 0.02 ? 'rising' : change < -0.02 ? 'falling' : 'stable';

  return { recentPR, olderPR, change, direction };
}

function analyzeRegion(channelData) {
  const videos = flattenGenreVideos(channelData);
  const categoryNames = [...new Set(channelData.genres.map(g => g.categoryName))];

  const metrics = categoryNames.map(name => {
    const competition = computeCompetitionDensity(channelData, name);
    const demandPR = computeGenreDemandPR(videos, name);
    const engagementRate = computeEngagementRate(videos, name);
    const uploadCadence = computeUploadCadence(videos, name);
    const newChannelGrowth = computeNewChannelGrowth(channelData, name);
    const scaleEfficiency = computeScaleEfficiency(videos, name);
    const recencyTrend = computeRecencyTrend(videos, name);

    const videoCount = videos.filter(v => v.categoryName === name).length;
    const avgViews = videoCount > 0
      ? Math.round(videos.filter(v => v.categoryName === name).reduce((s, v) => s + v.views, 0) / videoCount)
      : 0;

    return {
      categoryName: name,
      videoCount,
      avgViews,
      demandPR,
      engagementRate,
      competition,
      uploadCadenceDays: Math.round(uploadCadence * 10) / 10,
      newChannelGrowth: Math.round(newChannelGrowth * 100) / 100,
      scaleEfficiency: Math.round(scaleEfficiency * 1000) / 1000,
      recencyTrend,
    };
  });

  return metrics.sort((a, b) => b.demandPR - a.demandPR);
}

function runAnalysis(channelData, regions = ['US', 'JP']) {
  const result = {
    analyzedAt: new Date().toISOString(),
    regions: {},
    crossRegion: [],
  };

  for (const region of regions) {
    const regionData = channelData.regions[region];
    if (!regionData) continue;
    result.regions[region] = analyzeRegion(regionData);
  }

  const regionKeys = Object.keys(result.regions);
  if (regionKeys.length >= 2) {
    const allCategories = new Set();
    for (const key of regionKeys) {
      for (const m of result.regions[key]) {
        allCategories.add(m.categoryName);
      }
    }

    for (const cat of allCategories) {
      const regionScores = {};
      let present = 0;
      for (const key of regionKeys) {
        const metric = result.regions[key].find(m => m.categoryName === cat);
        if (metric) {
          regionScores[key] = metric.demandPR;
          present++;
        }
      }
      if (present >= 2) {
        const avgPR = Object.values(regionScores).reduce((a, b) => a + b, 0) / present;
        result.crossRegion.push({ categoryName: cat, regionScores, avgPR });
      }
    }
    result.crossRegion.sort((a, b) => b.avgPR - a.avgPR);
  }

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
  flattenGenreVideos,
  computeGenreDemandPR,
  computeEngagementRate,
  computeCompetitionDensity,
  computeUploadCadence,
  computeNewChannelGrowth,
  computeScaleEfficiency,
  computeRecencyTrend,
  analyzeRegion,
  runAnalysis,
  saveToFile,
  loadFromFile,
  OUTPUT_FILE,
};
