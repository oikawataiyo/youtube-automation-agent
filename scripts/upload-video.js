/**
 * Real YouTube uploader CLI. Core upload logic lives in utils/youtube-upload.js
 * (shared with publish-queue.js and the publishing agent).
 *
 * Streams the actual video file with a resumable upload, then sets the
 * thumbnail. Auth + token auto-refresh is reused from CredentialManager,
 * so a durable refresh_token (app published to "In production") keeps this
 * working indefinitely without re-consent.
 *
 * Usage:
 *   node scripts/upload-video.js --job path/to/job.json
 *   node scripts/upload-video.js --self-test         # tiny unlisted upload, then delete (needs ffmpeg)
 *   node scripts/upload-video.js --delete <videoId>  # delete a video by id
 *   node scripts/upload-video.js --whoami            # print the authorized channel
 *
 * Job JSON shape:
 * {
 *   "video": "mychannel/video/.../renders/foo-full.mp4",   // required
 *   "title": "...",                                         // required
 *   "description": "...",
 *   "tags": ["a", "b"],            // or a comma-separated string
 *   "categoryId": "27",            // 27 = Education (default)
 *   "privacyStatus": "unlisted",   // public | unlisted | private (default: private)
 *   "madeForKids": false,
 *   "language": "en",
 *   "thumbnail": "path/to.jpg",    // optional
 *   "publishAt": "2026-06-10T14:00:00Z"  // optional; forces privacyStatus=private until then
 * }
 */

const fs = require('fs');
const fsp = require('fs').promises;
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { CredentialManager } = require('../utils/credential-manager');
const { resolvePath, whoami, uploadVideo, deleteVideo } = require('../utils/youtube-upload');
const { resolveChannel, assertChannel } = require('../utils/channels');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--job') args.job = argv[++i];
    else if (a === '--delete') args.delete = argv[++i];
    else if (a === '--self-test') args.selfTest = true;
    else if (a === '--whoami') args.whoami = true;
  }
  return args;
}

async function getClient(channel) {
  const cm = new CredentialManager({ tokensPath: channel.tokenFile });
  const ok = await cm.initialize();
  if (!ok) throw new Error(`CredentialManager failed to initialize (check config/credentials.json + ${path.basename(channel.tokenFile)})`);
  return cm.getYouTubeClient();
}

function makeTestClip() {
  const out = path.join(os.tmpdir(), `yt-selftest-${Date.now()}.mp4`);
  // 2s solid test pattern + silent audio so YouTube accepts it as a real video.
  execFileSync('ffmpeg', [
    '-f', 'lavfi', '-i', 'testsrc=size=640x360:rate=30:duration=2',
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
    '-shortest', '-pix_fmt', 'yuv420p', '-y', out,
  ], { stdio: 'ignore' });
  return out;
}

async function selfTest(youtube) {
  console.log('🧪 Self-test: generating a 2s clip, uploading unlisted, then deleting it.\n');
  await whoami(youtube);
  const clip = makeTestClip();
  let videoId;
  try {
    const r = await uploadVideo(youtube, {
      video: clip,
      title: `psycollege pipeline self-test (delete me) ${new Date().toISOString()}`,
      description: 'Automated upload pipeline verification. Safe to ignore — auto-deleted.',
      tags: ['test'],
      privacyStatus: 'unlisted',
    });
    videoId = r.videoId;
    console.log('\n⏳ Waiting 5s before cleanup...');
    await new Promise((res) => setTimeout(res, 5000));
    await deleteVideo(youtube, videoId);
    console.log('\n🎉 Self-test PASSED — auth, streamed upload, and delete all work.');
  } finally {
    try { fs.unlinkSync(clip); } catch (_) {}
  }
}

(async () => {
  const args = parseArgs(process.argv.slice(2));
  const channel = resolveChannel();
  const youtube = await getClient(channel);

  if (args.whoami) {
    await whoami(youtube);
    return;
  }
  if (args.delete) {
    await assertChannel(youtube, channel); // don't delete on the wrong channel
    await deleteVideo(youtube, args.delete);
    return;
  }
  if (args.selfTest) {
    await assertChannel(youtube, channel);
    await selfTest(youtube);
    return;
  }
  if (args.job) {
    await assertChannel(youtube, channel); // abort if token routes to the wrong channel
    const jobPath = resolvePath(args.job);
    const job = JSON.parse(await fsp.readFile(jobPath, 'utf8'));
    await uploadVideo(youtube, job);
    return;
  }

  console.log('Nothing to do. Use --job <file> | --self-test | --delete <id> | --whoami');
})().catch((e) => {
  console.error('\n❌ Error:', e.message);
  if (e.errors) console.error(JSON.stringify(e.errors, null, 2));
  process.exit(1);
});
