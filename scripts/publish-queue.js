/**
 * Upload a queue of job.json files, scheduling each to go public later via
 * YouTube's native publishAt (private-until-scheduled). No long-running daemon
 * needed: once uploaded, YouTube flips each video public at its publishAt even
 * if this machine is off.
 *
 *   node scripts/publish-queue.js                         # upload pending jobs, 1/day drip
 *   node scripts/publish-queue.js --dry-run               # show the plan, upload nothing
 *   node scripts/publish-queue.js --start 2026-06-10T14:00 --every 24 --limit 6
 *   node scripts/publish-queue.js --dir mychannel/output/jobs
 *
 * Flags:
 *   --dir <path>     directory of *.job.json (default mychannel/output/jobs)
 *   --start <iso>    first publish datetime (local). Default: tomorrow 15:00 local.
 *   --every <hours>  spacing between videos (default 24 = one per day)
 *   --limit <n>      max uploads this run (default 6; YouTube quota ~6 uploads/day)
 *   --dry-run        print the schedule, do not upload
 *
 * Already-published jobs are tracked in <dir>/_publish-state.json and skipped.
 */

const fs = require('fs');
const path = require('path');
const { CredentialManager } = require('../utils/credential-manager');
const { uploadVideo } = require('../utils/youtube-upload');

const ROOT = path.join(__dirname, '..');

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : def;
}
const hasFlag = (name) => process.argv.includes(name);

const DIR = path.resolve(ROOT, arg('--dir', 'mychannel/output/jobs'));
const EVERY_H = parseFloat(arg('--every', '24'));
const LIMIT = parseInt(arg('--limit', '6'), 10);
const DRY = hasFlag('--dry-run');
const STATE_FILE = path.join(DIR, '_publish-state.json');

function defaultStart() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(15, 0, 0, 0); // tomorrow 15:00 local
  return d;
}
function parseStart() {
  const raw = arg('--start');
  if (!raw) return defaultStart();
  const d = new Date(raw);
  if (isNaN(d.getTime())) throw new Error(`invalid --start: ${raw}`);
  return d;
}

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
  catch (_) { return {}; }
}
function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

async function main() {
  if (!fs.existsSync(DIR)) throw new Error(`jobs dir not found: ${DIR} (run package-to-jobs.js first)`);
  const files = fs.readdirSync(DIR)
    .filter((f) => f.endsWith('.job.json'))
    .sort();
  if (!files.length) throw new Error(`no *.job.json in ${DIR}`);

  const state = loadState();
  const pending = files.filter((f) => !state[f] || !state[f].videoId);
  console.log(`📋 ${files.length} job(s), ${pending.length} pending, uploading up to ${LIMIT}.`);
  if (!pending.length) { console.log('✅ Nothing pending — all jobs already published.'); return; }

  const start = parseStart();
  if (start.getTime() < Date.now() + 60 * 1000) {
    console.warn('⚠️  --start is in the past/near-now; YouTube needs publishAt in the future.');
  }

  // Build the plan first so --dry-run shows everything.
  const batch = pending.slice(0, LIMIT).map((file, idx) => {
    const publishAt = new Date(start.getTime() + idx * EVERY_H * 3600 * 1000);
    return { file, publishAt };
  });

  console.log('\n🗓️  Plan:');
  for (const { file, publishAt } of batch) {
    const job = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8'));
    console.log(`   ${publishAt.toISOString()}  ·  ${file}  ·  "${job.title.slice(0, 45)}"`);
  }
  if (DRY) { console.log('\n(dry-run — nothing uploaded)'); return; }

  const cm = new CredentialManager();
  if (!(await cm.initialize())) throw new Error('CredentialManager init failed');
  const youtube = cm.getYouTubeClient();

  for (const { file, publishAt } of batch) {
    const job = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8'));
    job.publishAt = publishAt.toISOString();
    console.log(`\n=== ${file} ===`);
    try {
      const { videoId, url } = await uploadVideo(youtube, job);
      state[file] = { videoId, url, publishAt: job.publishAt, uploadedAt: new Date().toISOString() };
      saveState(state);
    } catch (e) {
      console.error(`❌ ${file} failed: ${e.message}`);
      state[file] = { error: e.message, failedAt: new Date().toISOString() };
      saveState(state);
    }
  }

  const done = Object.values(state).filter((s) => s.videoId).length;
  console.log(`\n✅ Done. ${done}/${files.length} job(s) uploaded total. State: ${path.relative(ROOT, STATE_FILE)}`);
}

main().catch((e) => { console.error('❌', e.message); process.exit(1); });
