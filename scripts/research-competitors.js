/**
 * Competitive research collector for channel-design decisions.
 *
 * Pulls real YouTube Data API data on popular psychology / mind explainer
 * channels so we can objectively analyse what names, About text, stance and
 * topics actually get watched — BEFORE deciding our own brand.
 *
 * Outputs:
 *   data/analysis/competitor-channels.json    (channel branding + stats)
 *   data/analysis/competitor-top-videos.json  (top videos by viewCount)
 *
 * Read-only API usage: channels.list / search.list / videos.list.
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { PSYCHOLOGY_CHANNELS } = require('../utils/psychology-domain');
const { parseDuration } = require('../utils/channel-data-collector');

const ROOT = path.join(__dirname, '..');
const OUT_CHANNELS = path.join(ROOT, 'data', 'analysis', 'competitor-channels.json');
const OUT_VIDEOS = path.join(ROOT, 'data', 'analysis', 'competitor-top-videos.json');

// Queries used to DISCOVER channels beyond the known benchmark set.
const DISCOVERY_QUERIES = [
  'psychology explained',
  'why you do that psychology',
  'cognitive bias explained',
  'how your brain works',
  'attachment style explained',
];

const TOP_VIDEOS_PER_CHANNEL = 12;

function buildYouTube() {
  const creds = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'credentials.json'), 'utf8'));
  const tokensPath = path.join(ROOT, 'config', 'tokens.json');
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

  const oauth2Client = new google.auth.OAuth2(
    creds.youtube.client_id,
    creds.youtube.client_secret,
    creds.youtube.redirect_uris[0]
  );
  oauth2Client.setCredentials(tokens.youtube);
  oauth2Client.on('tokens', (newTokens) => {
    tokens.youtube = { ...tokens.youtube, ...newTokens };
    fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
  });
  return google.youtube({ version: 'v3', auth: oauth2Client });
}

async function discoverChannelIds(youtube) {
  const found = new Map(); // id -> name
  for (const q of DISCOVERY_QUERIES) {
    try {
      const res = await youtube.search.list({
        part: 'snippet',
        q,
        type: 'channel',
        maxResults: 15,
        order: 'relevance',
        relevanceLanguage: 'en',
      });
      for (const item of res.data.items || []) {
        const id = item.snippet.channelId || item.id.channelId;
        if (id) found.set(id, item.snippet.title || item.snippet.channelTitle || '');
      }
      console.log(`  discovery "${q}": +${res.data.items?.length || 0}`);
    } catch (err) {
      console.error(`  discovery "${q}" failed: ${err.message}`);
    }
  }
  return found;
}

async function fetchChannelBranding(youtube, ids) {
  const out = [];
  // channels.list accepts up to 50 ids per call.
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const res = await youtube.channels.list({
      part: 'snippet,statistics,brandingSettings,topicDetails,contentDetails',
      id: batch.join(','),
      maxResults: 50,
    });
    for (const ch of res.data.items || []) {
      const bs = (ch.brandingSettings && ch.brandingSettings.channel) || {};
      out.push({
        id: ch.id,
        title: ch.snippet.title,
        handle: ch.snippet.customUrl || null,
        country: ch.snippet.country || null,
        publishedAt: ch.snippet.publishedAt,
        aboutDescription: ch.snippet.description || '',
        brandingDescription: bs.description || '',
        keywords: bs.keywords || '',
        subscribers: parseInt(ch.statistics.subscriberCount || '0'),
        hiddenSubs: ch.statistics.hiddenSubscriberCount || false,
        totalViews: parseInt(ch.statistics.viewCount || '0'),
        videoCount: parseInt(ch.statistics.videoCount || '0'),
        topicCategories: (ch.topicDetails && ch.topicDetails.topicCategories) || [],
        uploadsPlaylist: ch.contentDetails.relatedPlaylists.uploads,
      });
    }
  }
  return out;
}

async function fetchTopVideos(youtube, channel) {
  // Top videos by views: search.list order=viewCount, then hydrate stats.
  let searchItems = [];
  try {
    const res = await youtube.search.list({
      part: 'snippet',
      channelId: channel.id,
      type: 'video',
      order: 'viewCount',
      maxResults: TOP_VIDEOS_PER_CHANNEL,
    });
    searchItems = res.data.items || [];
  } catch (err) {
    console.error(`  top videos for ${channel.title} failed: ${err.message}`);
    return [];
  }
  const ids = searchItems.map(i => i.id.videoId).filter(Boolean);
  if (!ids.length) return [];

  const vres = await youtube.videos.list({
    part: 'snippet,statistics,contentDetails',
    id: ids.join(','),
  });
  return (vres.data.items || []).map(v => {
    const th = v.snippet.thumbnails || {};
    const best = th.maxres || th.standard || th.high || th.medium || th.default || {};
    return {
      id: v.id,
      title: v.snippet.title,
      publishedAt: v.snippet.publishedAt,
      views: parseInt(v.statistics.viewCount || '0'),
      likes: parseInt(v.statistics.likeCount || '0'),
      comments: parseInt(v.statistics.commentCount || '0'),
      duration: parseDuration(v.contentDetails.duration),
      thumbnail: best.url || null,
    };
  }).sort((a, b) => b.views - a.views);
}

async function main() {
  const youtube = buildYouTube();

  console.log('1) Discovering channels via search...');
  const discovered = await discoverChannelIds(youtube);

  // Merge known benchmarks + discovered, dedupe by id.
  const idSet = new Map();
  for (const c of PSYCHOLOGY_CHANNELS) idSet.set(c.id, c.name);
  for (const [id, name] of discovered) if (!idSet.has(id)) idSet.set(id, name);
  const ids = [...idSet.keys()];
  console.log(`   total unique channels: ${ids.length} (${PSYCHOLOGY_CHANNELS.length} known + ${ids.length - PSYCHOLOGY_CHANNELS.length} discovered)`);

  console.log('2) Fetching channel branding + stats...');
  const channels = await fetchChannelBranding(youtube, ids);
  console.log(`   got branding for ${channels.length} channels`);

  console.log('3) Fetching top videos per channel (by viewCount)...');
  const videosByChannel = [];
  for (const ch of channels) {
    const vids = await fetchTopVideos(youtube, ch);
    videosByChannel.push({ channelId: ch.id, name: ch.title, subscribers: ch.subscribers, videos: vids });
    console.log(`   ${ch.title}: ${vids.length} videos`);
  }

  fs.mkdirSync(path.dirname(OUT_CHANNELS), { recursive: true });
  fs.writeFileSync(OUT_CHANNELS, JSON.stringify({ collectedAt: new Date().toISOString(), channels }, null, 2));
  fs.writeFileSync(OUT_VIDEOS, JSON.stringify({ collectedAt: new Date().toISOString(), channels: videosByChannel }, null, 2));
  console.log(`\nSaved:\n  ${OUT_CHANNELS}\n  ${OUT_VIDEOS}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  if (err.response) console.error('API response:', JSON.stringify(err.response.data, null, 2));
  process.exit(1);
});
