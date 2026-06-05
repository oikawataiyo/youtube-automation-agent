/**
 * Competitive research v2 — focused redo.
 *
 * Combines (b) mental-health TOP channels + (c) our actual battlefield
 * (neuroscience / cognitive reframe essayists), with a subscriber floor to
 * drop the AI-clone swarm. Curated named channels are always kept (they
 * guarantee the genuine top tier is represented, not just search noise).
 *
 * Outputs:
 *   data/analysis/competitor-channels-v2.json
 *   data/analysis/competitor-top-videos-v2.json
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { parseDuration } = require('../utils/channel-data-collector');

const ROOT = path.join(__dirname, '..');
const OUT_CHANNELS = path.join(ROOT, 'data', 'analysis', 'competitor-channels-v2.json');
const OUT_VIDEOS = path.join(ROOT, 'data', 'analysis', 'competitor-top-videos-v2.json');

const SUBS_FLOOR = 80000;            // drop sub-floor discovery noise (clones)
const TOP_VIDEOS_PER_CHANNEL = 12;

// (b) mental-health TOP + (c) neuroscience / cognitive-reframe (our lane)
const DISCOVERY_QUERIES = [
  // (b) mental health
  'mental health',
  'anxiety explained',
  'depression explained',
  'emotional regulation',
  'trauma healing',
  'nervous system regulation',
  // (c) neuroscience / cognitive reframe — our battlefield
  'neuroscience explained',
  'how your brain works',
  'cognitive bias explained',
  'the psychology of emotions',
  'your brain on',
  'why your brain',
];

// Always-include named channels (top-tier mental-health + our-lane essayists).
const CURATED_NAMES = [
  // mental-health / therapy creators (genuine top tier)
  'Kati Morton', 'Doctor Tracey Marks', 'Therapy in a Nutshell', 'HealthyGamerGG',
  'Dr Julie', 'Patrick Teahan', 'Crappy Childhood Fairy', 'The Holistic Psychologist',
  // our lane: neuroscience / cognitive / philosophical reframe essayists
  'Heidi Priebe', 'Academy of Ideas', 'Pursuit of Wonder', 'Sisyphus 55',
  'Like Stories of Old', 'Einzelganger philosophy', 'Eternalised', 'The School of Life',
  'Andrew Huberman', 'Psych2Go',
];

function buildYouTube() {
  const creds = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'credentials.json'), 'utf8'));
  const tokensPath = path.join(ROOT, 'config', 'tokens.json');
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
  const o = new google.auth.OAuth2(creds.youtube.client_id, creds.youtube.client_secret, creds.youtube.redirect_uris[0]);
  o.setCredentials(tokens.youtube);
  o.on('tokens', (n) => { tokens.youtube = { ...tokens.youtube, ...n }; fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2)); });
  return google.youtube({ version: 'v3', auth: o });
}

async function discover(youtube) {
  const found = new Map();
  for (const q of DISCOVERY_QUERIES) {
    try {
      const res = await youtube.search.list({ part: 'snippet', q, type: 'channel', maxResults: 12, order: 'relevance', relevanceLanguage: 'en' });
      for (const it of res.data.items || []) {
        const id = it.snippet.channelId || it.id.channelId;
        if (id) found.set(id, false); // false = discovery (subject to floor)
      }
      console.log(`  discover "${q}": +${res.data.items?.length || 0}`);
    } catch (e) { console.error(`  discover "${q}" failed: ${e.message}`); }
  }
  return found;
}

async function findChannelId(youtube, name) {
  try {
    const res = await youtube.search.list({ part: 'snippet', q: name, type: 'channel', maxResults: 3, relevanceLanguage: 'en' });
    const items = res.data.items || [];
    const exact = items.find(i => (i.snippet.title || '').toLowerCase() === name.toLowerCase());
    const pick = exact || items[0];
    return pick ? (pick.snippet.channelId || pick.id.channelId) : null;
  } catch (e) { console.error(`  curated "${name}" search failed: ${e.message}`); return null; }
}

async function fetchBranding(youtube, ids) {
  const out = [];
  for (let i = 0; i < ids.length; i += 50) {
    const res = await youtube.channels.list({ part: 'snippet,statistics,brandingSettings,topicDetails,contentDetails', id: ids.slice(i, i + 50).join(','), maxResults: 50 });
    for (const ch of res.data.items || []) {
      const bs = (ch.brandingSettings && ch.brandingSettings.channel) || {};
      out.push({
        id: ch.id, title: ch.snippet.title, handle: ch.snippet.customUrl || null,
        country: ch.snippet.country || null, publishedAt: ch.snippet.publishedAt,
        aboutDescription: ch.snippet.description || '', brandingDescription: bs.description || '',
        keywords: bs.keywords || '', subscribers: parseInt(ch.statistics.subscriberCount || '0'),
        totalViews: parseInt(ch.statistics.viewCount || '0'), videoCount: parseInt(ch.statistics.videoCount || '0'),
        topicCategories: (ch.topicDetails && ch.topicDetails.topicCategories) || [],
        uploadsPlaylist: ch.contentDetails.relatedPlaylists.uploads,
      });
    }
  }
  return out;
}

async function fetchTopVideos(youtube, channel) {
  try {
    const res = await youtube.search.list({ part: 'snippet', channelId: channel.id, type: 'video', order: 'viewCount', maxResults: TOP_VIDEOS_PER_CHANNEL });
    const ids = (res.data.items || []).map(i => i.id.videoId).filter(Boolean);
    if (!ids.length) return [];
    const vres = await youtube.videos.list({ part: 'snippet,statistics,contentDetails', id: ids.join(',') });
    return (vres.data.items || []).map(v => {
      const th = v.snippet.thumbnails || {}; const best = th.maxres || th.standard || th.high || th.medium || th.default || {};
      return { id: v.id, title: v.snippet.title, publishedAt: v.snippet.publishedAt,
        views: parseInt(v.statistics.viewCount || '0'), likes: parseInt(v.statistics.likeCount || '0'),
        comments: parseInt(v.statistics.commentCount || '0'), duration: parseDuration(v.contentDetails.duration), thumbnail: best.url || null };
    }).sort((a, b) => b.views - a.views);
  } catch (e) { console.error(`  top videos ${channel.title} failed: ${e.message}`); return []; }
}

async function main() {
  const youtube = buildYouTube();

  console.log('1) Discovery (mental-health + neuro/cognitive)...');
  const idMap = await discover(youtube); // id -> isCurated(false)

  console.log('2) Curated named channels...');
  for (const name of CURATED_NAMES) {
    const id = await findChannelId(youtube, name);
    console.log(`   ${name} => ${id || 'NOT FOUND'}`);
    if (id) idMap.set(id, true); // curated = always keep
  }

  console.log(`3) Fetching branding for ${idMap.size} channels...`);
  const branding = await fetchBranding(youtube, [...idMap.keys()]);

  // Keep: curated OR subs >= floor.
  const kept = branding.filter(c => idMap.get(c.id) === true || c.subscribers >= SUBS_FLOOR);
  console.log(`   kept ${kept.length}/${branding.length} (curated or >=${SUBS_FLOOR} subs)`);

  console.log('4) Top videos for kept channels...');
  const videosByChannel = [];
  for (const ch of kept) {
    const vids = await fetchTopVideos(youtube, ch);
    videosByChannel.push({ channelId: ch.id, name: ch.title, subscribers: ch.subscribers, curated: idMap.get(ch.id) === true, videos: vids });
    console.log(`   ${ch.title} (${ch.subscribers}): ${vids.length}`);
  }

  fs.mkdirSync(path.dirname(OUT_CHANNELS), { recursive: true });
  fs.writeFileSync(OUT_CHANNELS, JSON.stringify({ collectedAt: new Date().toISOString(), subsFloor: SUBS_FLOOR, channels: kept.map(c => ({ ...c, curated: idMap.get(c.id) === true })) }, null, 2));
  fs.writeFileSync(OUT_VIDEOS, JSON.stringify({ collectedAt: new Date().toISOString(), channels: videosByChannel }, null, 2));
  console.log(`\nSaved ${kept.length} channels:\n  ${OUT_CHANNELS}\n  ${OUT_VIDEOS}`);
}

main().catch(e => { console.error('Error:', e.message); if (e.response) console.error(JSON.stringify(e.response.data, null, 2)); process.exit(1); });
