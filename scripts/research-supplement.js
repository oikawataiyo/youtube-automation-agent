/**
 * Supplemental fetch: add specific named channels (whose hardcoded IDs were
 * stale) to the competitor dataset by searching for them by name, then merge
 * into competitor-channels.json / competitor-top-videos.json (dedupe by id).
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { parseDuration } = require('../utils/channel-data-collector');

const ROOT = path.join(__dirname, '..');
const OUT_CHANNELS = path.join(ROOT, 'data', 'analysis', 'competitor-channels.json');
const OUT_VIDEOS = path.join(ROOT, 'data', 'analysis', 'competitor-top-videos.json');

const WANTED = [
  'Einzelganger',
  'Sisyphus 55',
  'The School of Life',
  'Therapy in a Nutshell',
  'Sprouts',
  'Better Ideas',
  'Pursuit of Wonder',
  'Like Stories of Old',
];

const TOP_VIDEOS_PER_CHANNEL = 12;

function buildYouTube() {
  const creds = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'credentials.json'), 'utf8'));
  const tokensPath = path.join(ROOT, 'config', 'tokens.json');
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
  const oauth2Client = new google.auth.OAuth2(
    creds.youtube.client_id, creds.youtube.client_secret, creds.youtube.redirect_uris[0]);
  oauth2Client.setCredentials(tokens.youtube);
  oauth2Client.on('tokens', (n) => { tokens.youtube = { ...tokens.youtube, ...n }; fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2)); });
  return google.youtube({ version: 'v3', auth: oauth2Client });
}

async function findChannelId(youtube, name) {
  const res = await youtube.search.list({ part: 'snippet', q: name, type: 'channel', maxResults: 5, relevanceLanguage: 'en' });
  const items = res.data.items || [];
  // Prefer exact-ish title match.
  const exact = items.find(i => (i.snippet.title || '').toLowerCase() === name.toLowerCase());
  const pick = exact || items[0];
  return pick ? (pick.snippet.channelId || pick.id.channelId) : null;
}

async function fetchBranding(youtube, ids) {
  const res = await youtube.channels.list({ part: 'snippet,statistics,brandingSettings,topicDetails,contentDetails', id: ids.join(','), maxResults: 50 });
  return (res.data.items || []).map(ch => {
    const bs = (ch.brandingSettings && ch.brandingSettings.channel) || {};
    return {
      id: ch.id, title: ch.snippet.title, handle: ch.snippet.customUrl || null,
      country: ch.snippet.country || null, publishedAt: ch.snippet.publishedAt,
      aboutDescription: ch.snippet.description || '', brandingDescription: bs.description || '',
      keywords: bs.keywords || '', subscribers: parseInt(ch.statistics.subscriberCount || '0'),
      hiddenSubs: ch.statistics.hiddenSubscriberCount || false,
      totalViews: parseInt(ch.statistics.viewCount || '0'), videoCount: parseInt(ch.statistics.videoCount || '0'),
      topicCategories: (ch.topicDetails && ch.topicDetails.topicCategories) || [],
      uploadsPlaylist: ch.contentDetails.relatedPlaylists.uploads,
    };
  });
}

async function fetchTopVideos(youtube, channel) {
  const res = await youtube.search.list({ part: 'snippet', channelId: channel.id, type: 'video', order: 'viewCount', maxResults: TOP_VIDEOS_PER_CHANNEL });
  const ids = (res.data.items || []).map(i => i.id.videoId).filter(Boolean);
  if (!ids.length) return [];
  const vres = await youtube.videos.list({ part: 'snippet,statistics,contentDetails', id: ids.join(',') });
  return (vres.data.items || []).map(v => {
    const th = v.snippet.thumbnails || {};
    const best = th.maxres || th.standard || th.high || th.medium || th.default || {};
    return { id: v.id, title: v.snippet.title, publishedAt: v.snippet.publishedAt,
      views: parseInt(v.statistics.viewCount || '0'), likes: parseInt(v.statistics.likeCount || '0'),
      comments: parseInt(v.statistics.commentCount || '0'), duration: parseDuration(v.contentDetails.duration),
      thumbnail: best.url || null };
  }).sort((a, b) => b.views - a.views);
}

async function main() {
  const youtube = buildYouTube();
  const chDoc = JSON.parse(fs.readFileSync(OUT_CHANNELS, 'utf8'));
  const vidDoc = JSON.parse(fs.readFileSync(OUT_VIDEOS, 'utf8'));
  const existing = new Set(chDoc.channels.map(c => c.id));

  const ids = [];
  for (const name of WANTED) {
    const id = await findChannelId(youtube, name);
    console.log(`${name} => ${id || 'NOT FOUND'}`);
    if (id && !existing.has(id)) ids.push(id);
  }
  if (!ids.length) { console.log('Nothing new to add.'); return; }

  const branding = await fetchBranding(youtube, ids);
  for (const ch of branding) {
    chDoc.channels.push(ch);
    const vids = await fetchTopVideos(youtube, ch);
    vidDoc.channels.push({ channelId: ch.id, name: ch.title, subscribers: ch.subscribers, videos: vids });
    console.log(`  +${ch.title} (${ch.subscribers} subs, ${vids.length} vids)`);
  }

  fs.writeFileSync(OUT_CHANNELS, JSON.stringify(chDoc, null, 2));
  fs.writeFileSync(OUT_VIDEOS, JSON.stringify(vidDoc, null, 2));
  console.log(`\nMerged. channels now: ${chDoc.channels.length}`);
}

main().catch(err => { console.error('Error:', err.message); if (err.response) console.error(JSON.stringify(err.response.data, null, 2)); process.exit(1); });
