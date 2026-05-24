const fs = require('fs');
const path = require('path');
const { ChannelDataCollector } = require('./channel-data-collector');

const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'analysis', 'genre-channels.json');

const STOPWORDS = new Set([
  // English
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'dare',
  'not', 'so', 'no', 'nor', 'too', 'very', 'just', 'about', 'above',
  'after', 'again', 'all', 'also', 'any', 'because', 'before', 'between',
  'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'than',
  'that', 'then', 'these', 'this', 'those', 'through', 'under', 'until',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'how',
  'its', 'it', 'he', 'she', 'they', 'them', 'their', 'his', 'her', 'our',
  'your', 'my', 'me', 'we', 'you', 'him', 'out', 'up', 'down', 'off',
  'over', 'into', 'only', 'own', 'same', 'here', 'there', 'now',
  'new', 'one', 'two', 'first', 'last', 'get', 'got', 'like', 'make',
  // Generic YouTube terms
  'video', 'videos', 'channel', 'subscribe', 'like', 'comment', 'share',
  'watch', 'live', 'stream', 'official', 'full', 'best', 'top', 'shorts',
  'short', 'episode', 'part', 'day', 'time', 'show', 'world',
  // Japanese particles/generic (basic — not a tokenizer replacement)
  'です', 'ます', 'した', 'する', 'ない', 'ある', 'いる', 'なる', 'れる',
  'これ', 'それ', 'あれ', 'この', 'その', 'あの', 'ここ', 'そこ', 'あそこ',
]);

const SCALE_TIERS = [
  { name: 'Small',  min: 10_000,    max: 100_000 },
  { name: 'Medium', min: 100_000,   max: 1_000_000 },
  { name: 'Large',  min: 1_000_000, max: 10_000_000 },
  { name: 'Mega',   min: 10_000_000, max: Infinity },
];

function classifyScale(subscribers) {
  for (const tier of SCALE_TIERS) {
    if (subscribers >= tier.min && subscribers < tier.max) return tier.name;
  }
  return subscribers < 10_000 ? 'Micro' : 'Mega';
}

function isStopword(word) {
  return STOPWORDS.has(word.toLowerCase());
}

function isGenericTag(tag) {
  if (isStopword(tag)) return true;
  if (/^\d+$/.test(tag)) return true;
  if (tag.length <= 2) return true;
  return false;
}

function extractSeedKeywords(categories, topN = 12, { seedCount = 3 } = {}) {
  const ranked = [...categories]
    .filter(c => c.trendingSample.length > 0)
    .sort((a, b) => b.trendingMedianViews - a.trendingMedianViews)
    .slice(0, topN);

  return ranked.map(cat => {
    const tagFreq = {};
    const titleWords = {};

    for (const v of cat.trendingSample) {
      for (const tag of v.tags) {
        const key = tag.toLowerCase().trim();
        if (key.length >= 3 && key.length <= 40 && !isGenericTag(key)) {
          tagFreq[key] = (tagFreq[key] || 0) + 1;
        }
      }
      const words = v.title
        .replace(/[^\w\s\u3000-\u9fff\uff00-\uffef]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 3 && !isStopword(w));
      for (const w of words) {
        const key = w.toLowerCase();
        titleWords[key] = (titleWords[key] || 0) + 1;
      }
    }

    const tagEntries = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]);
    const titleEntries = Object.entries(titleWords).sort((a, b) => b[1] - a[1]);

    // Collect diverse seed keywords: prefer tags, fall back to title words
    const seedKeywords = [];
    const seen = new Set();

    for (const [tag] of tagEntries) {
      if (seedKeywords.length >= seedCount) break;
      const lower = tag.toLowerCase();
      if (seen.has(lower)) continue;
      seen.add(lower);
      seedKeywords.push(tag);
    }

    for (const [word] of titleEntries) {
      if (seedKeywords.length >= seedCount) break;
      const lower = word.toLowerCase();
      if (seen.has(lower)) continue;
      seen.add(lower);
      seedKeywords.push(word);
    }

    if (seedKeywords.length === 0) {
      seedKeywords.push(cat.name);
    }

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      seedKeywords,
      topTags: tagEntries.slice(0, 5).map(([k]) => k),
      topTitleWords: titleEntries.slice(0, 5).map(([k]) => k),
    };
  });
}

class GenreChannelSampler {
  constructor(youtubeClient) {
    this.youtube = youtubeClient;
    this.collector = new ChannelDataCollector(youtubeClient);
  }

  async sample(discoveryData, regions = ['US', 'JP'], { channelsPerGenre = 6, videosPerChannel = 10 } = {}) {
    const result = {
      sampledAt: new Date().toISOString(),
      regions: {},
    };

    for (const region of regions) {
      console.log(`  Sampling channels for ${region}...`);
      const regionDiscovery = discoveryData.regions[region];
      if (!regionDiscovery) {
        console.log(`    No discovery data for ${region}, skipping`);
        continue;
      }

      result.regions[region] = await this._sampleRegion(
        regionDiscovery.categories,
        region,
        channelsPerGenre,
        videosPerChannel
      );
    }

    return result;
  }

  async _sampleRegion(categories, regionCode, channelsPerGenre, videosPerChannel) {
    const seeds = extractSeedKeywords(categories);
    console.log(`    ${seeds.length} genres to sample`);

    const globalSeenChannels = new Set();
    const genres = [];

    for (let si = 0; si < seeds.length; si++) {
      if (si > 0) await this._throttle(3000);
      const seed = seeds[si];
      const keywords = seed.seedKeywords;
      console.log(`    [${seed.categoryName}] keywords: ${JSON.stringify(keywords)}`);

      try {
        // Search with multiple keywords and merge unique channels
        const allChannelIds = new Set();
        for (let ki = 0; ki < keywords.length; ki++) {
          if (ki > 0) await this._throttle(2000);
          const ids = await this._discoverChannels(keywords[ki], regionCode, channelsPerGenre, seed.categoryId);
          for (const id of ids) {
            if (!globalSeenChannels.has(id)) {
              allChannelIds.add(id);
            }
          }
          // Stop early if we already have enough unique channels
          if (allChannelIds.size >= channelsPerGenre) break;
        }

        const uniqueIds = [...allChannelIds].slice(0, channelsPerGenre);
        if (uniqueIds.length === 0) {
          console.log(`      No unique channels found, skipping`);
          continue;
        }

        for (const id of uniqueIds) {
          globalSeenChannels.add(id);
        }

        const channels = await this._collectChannelVideos(uniqueIds, videosPerChannel);

        genres.push({
          categoryId: seed.categoryId,
          categoryName: seed.categoryName,
          seedKeywords: keywords,
          channels: channels.map(ch => ({
            ...ch,
            scaleTier: classifyScale(ch.subscribers),
          })),
        });

        console.log(`      ${channels.length} channels, ${channels.reduce((s, c) => s + c.videos.length, 0)} videos`);
      } catch (err) {
        console.log(`      Error: ${err.message}`);
      }
    }

    return { genres };
  }

  _throttle(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async _discoverChannels(keyword, regionCode, maxChannels, categoryId) {
    const params = {
      part: 'snippet',
      q: keyword,
      type: 'video',
      regionCode,
      maxResults: Math.min(maxChannels * 4, 50),
      order: 'relevance',
    };
    if (categoryId) {
      params.videoCategoryId = categoryId;
    }

    const searchRes = await this.youtube.search.list(params);

    // Extract unique channel IDs from video results
    const channelIds = (searchRes.data.items || [])
      .map(i => i.snippet.channelId)
      .filter(Boolean);

    const unique = [...new Set(channelIds)];

    if (unique.length === 0) return [];

    // Filter by subscriber count
    const statsRes = await this.youtube.channels.list({
      part: 'statistics,snippet',
      id: unique.slice(0, 50).join(','),
    });

    return (statsRes.data.items || [])
      .filter(ch => parseInt(ch.statistics.subscriberCount || '0') >= 1000)
      .map(ch => ch.id)
      .slice(0, maxChannels);
  }

  async _collectChannelVideos(channelIds, videosPerChannel) {
    const channels = [];

    for (const chId of channelIds) {
      try {
        const chData = await this.collector.collectViaPlaylist(chId, videosPerChannel);
        if (chData && chData.videos.length > 0) {
          channels.push(chData);
        }
      } catch (err) {
        console.log(`      Channel ${chId}: ${err.message}`);
      }
    }

    return channels;
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
    if (!data || !data.sampledAt) return true;
    const ageMs = Date.now() - new Date(data.sampledAt).getTime();
    return ageMs > maxAgeHours * 3600000;
  }
}

module.exports = { GenreChannelSampler, classifyScale, extractSeedKeywords, SCALE_TIERS, OUTPUT_FILE };
