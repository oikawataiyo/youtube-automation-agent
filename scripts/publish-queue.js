/**
 * Upload a queue of job.json files, scheduling each to go public later via
 * YouTube's native publishAt (private-until-scheduled). No long-running daemon
 * needed: once uploaded, YouTube flips each video public at its publishAt even
 * if this machine is off.
 *
 *   node scripts/publish-queue.js                         # upload pending jobs, 1/day drip
 *   node scripts/publish-queue.js --dry-run               # show the plan, upload nothing
 *   node scripts/publish-queue.js --start 2026-06-10T14:00 --every 24 --limit 6
 *   node scripts/publish-queue.js --channel autopilot   # resolves jobsDir from channels.json
 *
 * Morning-JST clock slots (posting-time experiment):
 *   node scripts/publish-queue.js --slots 06:00,08:00,10:00 --mode rotate --dry-run
 *   node scripts/publish-queue.js --slots 06:00,08:00,10:00 --mode batch --from 2026-06-10
 *
 * Flags:
 *   --channel <name> channel from channels.json (default autopilot). Sets jobsDir + token.
 *   --dir <path>     directory of *.job.json (default: the channel's jobsDir)
 *   --start <iso>    first publish datetime (local). Default: tomorrow 15:00 local.
 *   --every <hours>  spacing between videos (default 24 = one per day)
 *   --limit <n>      max uploads this run (default 6; YouTube quota ~6 uploads/day)
 *   --slots <list>   JST clock slots "06:00,08:00,10:00". When given, overrides --start/--every.
 *   --mode <m>       batch|rotate (default rotate). batch = fill one morning's slots;
 *                    rotate = 1 video/day, slot cycles across days (rankable experiment).
 *   --from <date>    first JST date "YYYY-MM-DD" for --slots (default: today or tomorrow).
 *   --dry-run        print the schedule, do not upload
 *
 * Already-published jobs are tracked in <dir>/_publish-state.json and skipped.
 */

const fs = require('fs');
const path = require('path');
const { CredentialManager } = require('../utils/credential-manager');
const { uploadVideo } = require('../utils/youtube-upload');
const { resolveChannel, assertChannel } = require('../utils/channels');
const { parseSlots, buildSlotSchedule, weekdayJst, jstDateString } = require('../utils/jst-slots');

const ROOT = path.join(__dirname, '..');

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : def;
}
const hasFlag = (name) => process.argv.includes(name);

const CHANNEL = resolveChannel();
const DIR = path.resolve(ROOT, arg('--dir', CHANNEL.jobsDir));
const EVERY_H = parseFloat(arg('--every', '24'));
const LIMIT = parseInt(arg('--limit', '6'), 10);
const DRY = hasFlag('--dry-run');
const SLOTS_RAW = arg('--slots');
const MODE = arg('--mode', 'rotate');
const FROM = arg('--from');
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

  // Build the plan first so --dry-run shows everything.
  // Two scheduling modes: explicit JST clock slots (--slots) or the legacy
  // uniform --start/--every drip. --slots takes precedence when present.
  let batch;
  if (SLOTS_RAW) {
    const slots = parseSlots(SLOTS_RAW);
    if (!slots.length) throw new Error('--slots given but empty (expected "06:00,08:00,10:00")');
    const { rows, warnings } = buildSlotSchedule({
      pending, slots, mode: MODE, from: FROM, now: new Date(), limit: LIMIT,
    });
    for (const w of warnings) console.warn(`⚠️  ${w}`);
    if (!rows.length) { console.log('\n✅ No future slots to schedule this run.'); return; }
    batch = rows;
    console.log(`\n🗓️  Plan (${MODE}, JST slots ${slots.join('/')}):`);
    for (const { file, publishAt, slotJst, dateJst, weekdayJst: wd } of batch) {
      const job = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8'));
      console.log(`   ${publishAt.toISOString()}  |  ${dateJst} ${slotJst} (${wd}) JST  |  ${file}  |  "${job.title.slice(0, 40)}"`);
    }
  } else {
    const start = parseStart();
    if (start.getTime() < Date.now() + 60 * 1000) {
      console.warn('⚠️  --start is in the past/near-now; YouTube needs publishAt in the future.');
    }
    batch = pending.slice(0, LIMIT).map((file, idx) => {
      const publishAt = new Date(start.getTime() + idx * EVERY_H * 3600 * 1000);
      const jst = new Date(publishAt.getTime() + 9 * 3600 * 1000); // JST wall clock, TZ-independent
      const slotJst = `${String(jst.getUTCHours()).padStart(2, '0')}:${String(jst.getUTCMinutes()).padStart(2, '0')}`;
      const dateJst = jstDateString(publishAt);
      return { file, publishAt, slotJst, dateJst, weekdayJst: weekdayJst(dateJst) };
    });
    console.log('\n🗓️  Plan:');
    for (const { file, publishAt } of batch) {
      const job = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8'));
      console.log(`   ${publishAt.toISOString()}  ·  ${file}  ·  "${job.title.slice(0, 45)}"`);
    }
  }
  if (DRY) { console.log('\n(dry-run — nothing uploaded)'); return; }

  const cm = new CredentialManager({ tokensPath: CHANNEL.tokenFile });
  if (!(await cm.initialize())) throw new Error('CredentialManager init failed');
  const youtube = cm.getYouTubeClient();
  await assertChannel(youtube, CHANNEL); // abort if token routes to the wrong channel

  for (const { file, publishAt, slotJst, weekdayJst: wd } of batch) {
    const job = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8'));
    job.publishAt = publishAt.toISOString();
    console.log(`\n=== ${file} ===`);
    try {
      const { videoId, url } = await uploadVideo(youtube, job);
      state[file] = {
        videoId, url, publishAt: job.publishAt,
        slotJst, weekdayJst: wd,
        uploadedAt: new Date().toISOString(),
      };
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
