const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'analysis', 'genre-discovery.json');

function median(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

class GenreDiscoverer {
  constructor(youtubeClient) {
    this.youtube = youtubeClient;
  }

  async discover(regions = ['US', 'JP']) {
    const result = {
      discoveredAt: new Date().toISOString(),
      regions: {},
    };

    for (const region of regions) {
      console.log(`  Discovering categories for ${region}...`);
      result.regions[region] = await this._discoverRegion(region);
      console.log(`  ${region}: ${result.regions[region].categories.length} assignable categories found`);
    }

    return result;
  }

  async _discoverRegion(regionCode) {
    const catRes = await this.youtube.videoCategories.list({
      part: 'snippet',
      regionCode,
    });

    const assignable = (catRes.data.items || []).filter(c => c.snippet.assignable);
    const categories = [];

    for (const cat of assignable) {
      const catId = cat.id;
      const catName = cat.snippet.title;

      try {
        const trendingRes = await this.youtube.videos.list({
          part: 'snippet,statistics',
          chart: 'mostPopular',
          videoCategoryId: catId,
          regionCode: regionCode,
          maxResults: 10,
        });

        const items = trendingRes.data.items || [];
        const trendingSample = items.map(v => ({
          title: v.snippet.title,
          views: parseInt(v.statistics.viewCount || '0'),
          likes: parseInt(v.statistics.likeCount || '0'),
          channelId: v.snippet.channelId,
          channelTitle: v.snippet.channelTitle,
          tags: v.snippet.tags || [],
        }));

        const viewCounts = trendingSample.map(v => v.views);

        categories.push({
          id: catId,
          name: catName,
          assignable: true,
          trendingSample,
          trendingAvgViews: viewCounts.length > 0
            ? Math.round(viewCounts.reduce((a, b) => a + b, 0) / viewCounts.length)
            : 0,
          trendingMedianViews: median(viewCounts),
        });
      } catch (err) {
        console.log(`    Skipping ${catName} (${catId}): ${err.message}`);
      }
    }

    return { categories };
  }

  saveToFile(data, filePath = OUTPUT_FILE) {
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  loadFromFile(filePath = OUTPUT_FILE) {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  isCacheStale(filePath = OUTPUT_FILE, maxAgeHours = 24) {
    if (!fs.existsSync(filePath)) return true;
    const data = this.loadFromFile(filePath);
    if (!data || !data.discoveredAt) return true;
    const ageMs = Date.now() - new Date(data.discoveredAt).getTime();
    return ageMs > maxAgeHours * 3600000;
  }
}

module.exports = { GenreDiscoverer, OUTPUT_FILE };
