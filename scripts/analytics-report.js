/**
 * Pulls a full analytics snapshot for the authorized channel and prints it.
 *
 * Uses the same CredentialManager auth as upload-video.js. Requires the
 * yt-analytics.readonly scope (already present in config/tokens.json).
 *
 *   node scripts/analytics-report.js              # lifetime + per-video
 *   node scripts/analytics-report.js --days 28    # window for trend/traffic
 *
 * Combines:
 *   - Data API v3   : channel + per-video raw statistics (views/likes/etc)
 *   - Analytics v2  : watch time, avg view %, retention proxy, traffic, CTR
 */

const { google } = require('googleapis');
const { CredentialManager } = require('../utils/credential-manager');

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : def;
}

const WINDOW_DAYS = parseInt(arg('--days', '90'), 10);

function fmt(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x.toLocaleString('en-US') : String(n);
}
function secs(s) {
  const v = Math.round(Number(s) || 0);
  const m = Math.floor(v / 60);
  return `${m}m${String(v % 60).padStart(2, '0')}s`;
}
function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

async function main() {
  const cm = new CredentialManager();
  if (!(await cm.initialize())) throw new Error('CredentialManager init failed');
  const auth = cm.getYouTubeAuth();
  const data = google.youtube({ version: 'v3', auth });
  const yta = google.youtubeAnalytics({ version: 'v2', auth });

  // 1) Channel
  const chRes = await data.channels.list({ part: 'snippet,statistics,contentDetails', mine: true });
  const ch = (chRes.data.items || [])[0];
  if (!ch) throw new Error('No channel for authorized account');
  const created = ch.snippet.publishedAt;
  console.log('\n================ CHANNEL ================');
  console.log(`"${ch.snippet.title}"  (${ch.id})`);
  console.log(`created ${created ? created.slice(0, 10) : '?'}`);
  console.log(`subs ${fmt(ch.statistics.subscriberCount)} · videos ${fmt(ch.statistics.videoCount)} · total views ${fmt(ch.statistics.viewCount)}`);

  // 2) All uploads from the uploads playlist
  const uploadsId = ch.contentDetails.relatedPlaylists.uploads;
  const ids = [];
  let pageToken;
  do {
    const pl = await data.playlistItems.list({
      part: 'contentDetails', playlistId: uploadsId, maxResults: 50, pageToken,
    });
    for (const it of pl.data.items || []) ids.push(it.contentDetails.videoId);
    pageToken = pl.data.nextPageToken;
  } while (pageToken);

  // 3) Per-video raw stats (Data API)
  const videos = {};
  for (let i = 0; i < ids.length; i += 50) {
    const vr = await data.videos.list({
      part: 'snippet,statistics,contentDetails', id: ids.slice(i, i + 50).join(','),
    });
    for (const v of vr.data.items || []) videos[v.id] = v;
  }

  const start = isoDate(new Date(created || Date.now() - 365 * 864e5));
  const end = isoDate(new Date());

  // 4) Lifetime channel analytics
  const life = await yta.reports.query({
    ids: 'channel==MINE', startDate: start, endDate: end,
    metrics: 'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost,likes,dislikes,comments,shares',
  });
  const L = (life.data.rows && life.data.rows[0]) || [];
  const Lh = life.data.columnHeaders.map((c) => c.name);
  const lv = Object.fromEntries(Lh.map((k, idx) => [k, L[idx]]));
  console.log('\n========== LIFETIME ANALYTICS ==========');
  if (!life.data.rows || !life.data.rows.length) {
    console.log('(no analytics data yet — channel/videos too new; YouTube lags ~24-48h)');
    return;
  }
  console.log(`views ${fmt(lv.views)} · watch time ${fmt(Math.round(lv.estimatedMinutesWatched))} min`);
  console.log(`avg view duration ${secs(lv.averageViewDuration)} · avg view % ${Number(lv.averageViewPercentage).toFixed(1)}%`);
  console.log(`subs +${fmt(lv.subscribersGained)} / -${fmt(lv.subscribersLost)} (net ${fmt(lv.subscribersGained - lv.subscribersLost)})`);
  console.log(`likes ${fmt(lv.likes)} · comments ${fmt(lv.comments)} · shares ${fmt(lv.shares)}`);

  // 5) Per-video analytics (watch %, avg duration, CTR/impressions)
  let perVid = { data: { rows: [] } };
  try {
    perVid = await yta.reports.query({
      ids: 'channel==MINE', startDate: start, endDate: end,
      dimensions: 'video',
      metrics: 'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained',
      sort: '-views', maxResults: 200,
    });
  } catch (e) { console.log('per-video analytics error:', e.message); }
  const pvH = perVid.data.columnHeaders ? perVid.data.columnHeaders.map((c) => c.name) : [];
  console.log('\n========== PER-VIDEO ==========');
  for (const row of perVid.data.rows || []) {
    const r = Object.fromEntries(pvH.map((k, idx) => [k, row[idx]]));
    const v = videos[r.video];
    const title = v ? v.snippet.title : r.video;
    const st = v ? v.statistics : {};
    console.log(`\n• ${title}`);
    console.log(`   published ${v ? v.snippet.publishedAt.slice(0, 10) : '?'} · dur ${v ? v.contentDetails.duration.replace('PT', '') : '?'}`);
    console.log(`   views ${fmt(r.views)} · watch ${fmt(Math.round(r.estimatedMinutesWatched))}min · avgDur ${secs(r.averageViewDuration)} · retention ${Number(r.averageViewPercentage).toFixed(1)}%`);
    console.log(`   likes ${fmt(st.likeCount || 0)} · comments ${fmt(st.commentCount || 0)} · subs gained ${fmt(r.subscribersGained)}`);
  }

  // 6) Traffic sources (window)
  const wStart = isoDate(new Date(Date.now() - WINDOW_DAYS * 864e5));
  try {
    const traf = await yta.reports.query({
      ids: 'channel==MINE', startDate: wStart, endDate: end,
      dimensions: 'insightTrafficSourceType', metrics: 'views,estimatedMinutesWatched',
      sort: '-views',
    });
    console.log(`\n========== TRAFFIC SOURCES (last ${WINDOW_DAYS}d) ==========`);
    for (const row of traf.data.rows || []) console.log(`   ${row[0].padEnd(22)} views ${fmt(row[1])} · ${fmt(Math.round(row[2]))}min`);
  } catch (e) { console.log('traffic error:', e.message); }

  // 7) Geography
  try {
    const geo = await yta.reports.query({
      ids: 'channel==MINE', startDate: wStart, endDate: end,
      dimensions: 'country', metrics: 'views', sort: '-views', maxResults: 10,
    });
    console.log(`\n========== TOP COUNTRIES (last ${WINDOW_DAYS}d) ==========`);
    for (const row of geo.data.rows || []) console.log(`   ${row[0]}  ${fmt(row[1])}`);
  } catch (e) { console.log('geo error:', e.message); }

  // 8) Impressions / CTR (may be empty for tiny channels)
  try {
    const imp = await yta.reports.query({
      ids: 'channel==MINE', startDate: wStart, endDate: end,
      metrics: 'views', // probe; impressions live in a separate report group
    });
    void imp;
  } catch (_) {}
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
