/**
 * Real YouTube uploader (replaces the stubbed getVideoStream in the
 * publishing agent, which returned placeholder JSON instead of the file).
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
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const { CredentialManager } = require('../utils/credential-manager');

const ROOT = path.join(__dirname, '..');

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

function resolvePath(p) {
  if (!p) return p;
  return path.isAbsolute(p) ? p : path.join(ROOT, p);
}

async function getClient() {
  const cm = new CredentialManager();
  const ok = await cm.initialize();
  if (!ok) throw new Error('CredentialManager failed to initialize (check config/credentials.json + tokens.json)');
  return cm.getYouTubeClient();
}

async function whoami(youtube) {
  const me = await youtube.channels.list({ part: 'snippet,statistics', mine: true });
  const ch = (me.data.items || [])[0];
  if (!ch) throw new Error('No channel found for the authorized account.');
  console.log(`🎬 Channel: "${ch.snippet.title}"  (id ${ch.id})`);
  console.log(`   subs ${ch.statistics.subscriberCount} · videos ${ch.statistics.videoCount} · views ${ch.statistics.viewCount}`);
  return ch;
}

function normalizeJob(job) {
  if (!job.video) throw new Error('job.video is required');
  if (!job.title) throw new Error('job.title is required');
  const videoPath = resolvePath(job.video);
  if (!fs.existsSync(videoPath)) throw new Error(`video file not found: ${videoPath}`);

  const tags = Array.isArray(job.tags)
    ? job.tags
    : typeof job.tags === 'string'
      ? job.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

  let privacyStatus = job.privacyStatus || 'private';
  // publishAt (scheduled) requires the video to start as private.
  if (job.publishAt) privacyStatus = 'private';

  return {
    videoPath,
    thumbnailPath: job.thumbnail ? resolvePath(job.thumbnail) : null,
    title: job.title,
    description: job.description || '',
    tags,
    categoryId: String(job.categoryId || '27'),
    language: job.language || 'en',
    privacyStatus,
    publishAt: job.publishAt || undefined,
    madeForKids: job.madeForKids === true,
  };
}

async function uploadVideo(youtube, job) {
  const j = normalizeJob(job);
  const bytes = fs.statSync(j.videoPath).size;
  const mb = (bytes / 1024 / 1024).toFixed(1);
  console.log(`⬆️  Uploading "${j.title}"  (${mb}MB, ${j.privacyStatus})`);

  let lastPct = -5;
  const res = await youtube.videos.insert(
    {
      part: ['snippet', 'status'],
      notifySubscribers: false,
      requestBody: {
        snippet: {
          title: j.title,
          description: j.description,
          tags: j.tags,
          categoryId: j.categoryId,
          defaultLanguage: j.language,
          defaultAudioLanguage: j.language,
        },
        status: {
          privacyStatus: j.privacyStatus,
          publishAt: j.publishAt,
          selfDeclaredMadeForKids: j.madeForKids,
          embeddable: true,
        },
      },
      media: { body: fs.createReadStream(j.videoPath) },
    },
    {
      // Resumable upload progress for large files.
      onUploadProgress: (evt) => {
        const pct = Math.floor((evt.bytesRead / bytes) * 100);
        if (pct >= lastPct + 5) {
          lastPct = pct;
          process.stdout.write(`\r   ${pct}%   `);
        }
      },
    }
  );
  process.stdout.write('\r   100%  \n');

  const videoId = res.data.id;
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  console.log(`✅ Uploaded: ${url}`);

  if (j.thumbnailPath) {
    if (fs.existsSync(j.thumbnailPath)) {
      await youtube.thumbnails.set({
        videoId,
        media: { body: fs.createReadStream(j.thumbnailPath) },
      });
      console.log(`🖼️  Thumbnail set.`);
    } else {
      console.warn(`⚠️  Thumbnail not found, skipped: ${j.thumbnailPath}`);
    }
  }

  if (j.publishAt) console.log(`⏰ Scheduled to go public at ${j.publishAt}.`);
  return { videoId, url };
}

async function deleteVideo(youtube, videoId) {
  await youtube.videos.delete({ id: videoId });
  console.log(`🗑️  Deleted video ${videoId}.`);
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
      title: `Autopilot pipeline self-test (delete me) ${new Date().toISOString()}`,
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
  const youtube = await getClient();

  if (args.whoami) {
    await whoami(youtube);
    return;
  }
  if (args.delete) {
    await deleteVideo(youtube, args.delete);
    return;
  }
  if (args.selfTest) {
    await selfTest(youtube);
    return;
  }
  if (args.job) {
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
