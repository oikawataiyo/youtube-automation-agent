/**
 * Posting-time experiment read-out: groups published videos by their JST slot
 * (recorded in _publish-state.json by publish-queue.js) and shows per-slot
 * averages from the YouTube Analytics API.
 *
 *   node scripts/experiment-report.js
 *   node scripts/experiment-report.js --channel autopilot   # resolves jobsDir from channels.json
 *
 * DIRECTIONAL ONLY until ~8-10 videos/slot: with few videos per slot, content
 * quality dominates the posting time, so do not over-read slot rankings. The
 * authoritative read-out is YouTube Studio's "when your viewers are online"
 * heatmap once impressions accrue; this is a convenience aggregate.
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { CredentialManager } = require('../utils/credential-manager');
const { resolveChannel } = require('../utils/channels');

const ROOT = path.join(__dirname, '..');

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : def;
}

const CHANNEL = resolveChannel();
const DIR = path.resolve(ROOT, arg('--dir', CHANNEL.jobsDir));
const STATE_FILE = path.join(DIR, '_publish-state.json');

function avg(nums) {
  const v = nums.filter((n) => Number.isFinite(n));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN;
}
function fmt(n, digits = 0) {
  return Number.isFinite(n) ? n.toFixed(digits) : '—';
}
function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

async function main() {
  if (!fs.existsSync(STATE_FILE)) throw new Error(`state file not found: ${STATE_FILE}`);
  const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));

  // Videos uploaded by the slot scheduler carry slotJst; manual/legacy seeds may not.
  const tagged = Object.entries(state)
    .filter(([, s]) => s.videoId && s.slotJst)
    .map(([file, s]) => ({ file, ...s }));

  if (!tagged.length) {
    console.log('No slot-tagged videos yet. Schedule with:');
    console.log('  npm run publish:morning   (publish-queue.js --slots 06:00,08:00,10:00 --mode rotate)');
    const untagged = Object.values(state).filter((s) => s.videoId && !s.slotJst).length;
    if (untagged) console.log(`(${untagged} published video(s) have no slotJst — uploaded before this experiment.)`);
    return;
  }

  const cm = new CredentialManager({ tokensPath: CHANNEL.tokenFile });
  if (!(await cm.initialize())) throw new Error('CredentialManager init failed');
  const auth = cm.getYouTubeAuth();
  const yta = google.youtubeAnalytics({ version: 'v2', auth });

  const start = '2020-01-01';
  const end = isoDate(new Date());
  let rows = [];
  try {
    const res = await yta.reports.query({
      ids: 'channel==MINE', startDate: start, endDate: end,
      dimensions: 'video',
      metrics: 'views,averageViewPercentage',
      maxResults: 200,
    });
    const h = (res.data.columnHeaders || []).map((c) => c.name);
    rows = (res.data.rows || []).map((r) => Object.fromEntries(h.map((k, i) => [k, r[i]])));
  } catch (e) {
    console.warn('per-video analytics error:', e.message, '(showing counts only)');
  }
  const byId = Object.fromEntries(rows.map((r) => [r.video, r]));

  // Group by slot.
  const slots = {};
  for (const v of tagged) {
    const a = byId[v.videoId] || {};
    (slots[v.slotJst] ||= []).push({
      views: Number(a.views),
      retention: Number(a.averageViewPercentage),
    });
  }

  console.log('\n========== POSTING-TIME EXPERIMENT (by JST slot) ==========');
  console.log('slot     n   avg views   avg retention');
  for (const slot of Object.keys(slots).sort()) {
    const g = slots[slot];
    console.log(
      `${slot.padEnd(7)} ${String(g.length).padStart(2)}   ${fmt(avg(g.map((x) => x.views))).padStart(9)}   ${fmt(avg(g.map((x) => x.retention)), 1).padStart(7)}%`
    );
  }
  const total = tagged.length;
  const perSlot = total / Object.keys(slots).length;
  console.log(`\n${total} slot-tagged video(s), ~${perSlot.toFixed(1)}/slot.`);
  if (perSlot < 8) {
    console.log('⚠️  DIRECTIONAL ONLY: < ~8 videos/slot — content confound dominates. Do not rank slots yet.');
  }
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
