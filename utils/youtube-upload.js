/**
 * Shared YouTube upload core. Used by:
 *   - scripts/upload-video.js      (single job CLI)
 *   - scripts/publish-queue.js     (queued, scheduled drip)
 *   - agents/publishing-scheduling-agent.js (orchestrator, real stream)
 *
 * Every function takes an authorized `youtube` client (google.youtube v3),
 * so auth/token-refresh stays the caller's responsibility (CredentialManager).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function resolvePath(p) {
  if (!p) return p;
  return path.isAbsolute(p) ? p : path.join(ROOT, p);
}

/**
 * Validate + normalize a raw job object into the shape uploadVideo needs.
 * @param {object} job - { video, title, description?, tags?, categoryId?,
 *   language?, privacyStatus?, publishAt?, madeForKids?, thumbnail? }
 */
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

async function whoami(youtube) {
  const me = await youtube.channels.list({ part: 'snippet,statistics', mine: true });
  const ch = (me.data.items || [])[0];
  if (!ch) throw new Error('No channel found for the authorized account.');
  console.log(`🎬 Channel: "${ch.snippet.title}"  (id ${ch.id})`);
  console.log(`   subs ${ch.statistics.subscriberCount} · videos ${ch.statistics.videoCount} · views ${ch.statistics.viewCount}`);
  return ch;
}

/**
 * Resumable streamed upload of one job. Sets thumbnail if present.
 * @returns {Promise<{ videoId: string, url: string }>}
 */
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

module.exports = { ROOT, resolvePath, normalizeJob, whoami, uploadVideo, deleteVideo };
