/**
 * Parse the human-authored UPLOAD_PACKAGE.md into one job.json per video,
 * ready for scripts/upload-video.js or scripts/publish-queue.js.
 *
 *   node scripts/package-to-jobs.js                       # default md -> default out dir
 *   node scripts/package-to-jobs.js --in path/to.md --out dir
 *
 * Expected per-video block in the markdown:
 *
 *   ## 1. Some Title  ⏱ ...
 *   - **動画ファイル:** `mychannel/.../foo-full.mp4` (112MB)
 *   - **サムネ:** `mychannel/.../thumb.jpg`
 *   **タイトル:**
 *   ```
 *   The real title
 *   ```
 *   **説明:**
 *   ```
 *   description...
 *   ```
 *   **タグ:**
 *   ```
 *   tag1, tag2, tag3
 *   ```
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : def;
}

const IN = path.resolve(ROOT, arg('--in', 'mychannel/output/UPLOAD_PACKAGE.md'));
const OUT = path.resolve(ROOT, arg('--out', 'mychannel/output/jobs'));

function slugFromVideoPath(p) {
  // mychannel/video/<slug>/renders/<file>.mp4  -> <slug>; fallback to file stem.
  const parts = p.split(/[\\/]/);
  const vi = parts.indexOf('video');
  if (vi >= 0 && parts[vi + 1]) return parts[vi + 1];
  return path.basename(p).replace(/\.[^.]+$/, '');
}

/**
 * If the video's project dir has a designed thumbnail at renders/thumb.jpg,
 * return its repo-relative path; else null. video looks like
 * mychannel/video/<slug>/renders/<file>.mp4 → mychannel/video/<slug>.
 */
function designedThumbFor(video) {
  const m = video.match(/^(.*[\\/]video[\\/][^\\/]+)[\\/]/);
  if (!m) return null;
  const rel = path.join(m[1], 'renders', 'thumb.jpg');
  return fs.existsSync(path.resolve(ROOT, rel)) ? rel.replace(/\\/g, '/') : null;
}

/** Extract the first fenced code block that appears after `label` in `block`. */
function codeBlockAfter(block, label) {
  const idx = block.indexOf(label);
  if (idx < 0) return '';
  const rest = block.slice(idx + label.length);
  const m = rest.match(/```[a-z]*\n([\s\S]*?)\n```/);
  return m ? m[1].trim() : '';
}

/** Extract the first backtick-quoted value on the line containing `label`. */
function inlineCodeAfter(block, label) {
  const re = new RegExp(`${label}[^\\n]*?\`([^\`]+)\``);
  const m = block.match(re);
  return m ? m[1].trim() : '';
}

function parsePackage(md) {
  // Split on "## N. " section headers, keeping only numbered video sections.
  const sections = md.split(/\n(?=##\s+\d+\.)/).filter((s) => /^##\s+\d+\./.test(s.trim()));
  const jobs = [];
  for (const sec of sections) {
    const numMatch = sec.match(/^##\s+(\d+)\./);
    const order = numMatch ? parseInt(numMatch[1], 10) : jobs.length + 1;

    const video = inlineCodeAfter(sec, '動画ファイル');
    // Prefer the pipeline's designed thumbnail (renders/thumb.jpg) over a manual
    // サムネ path so videos never ship a frame-grab. Falls back to サムネ, then none.
    const mdThumb = inlineCodeAfter(sec, 'サムネ');
    const thumbnail = designedThumbFor(video) || mdThumb;
    const title = codeBlockAfter(sec, '**タイトル:**');
    const description = codeBlockAfter(sec, '**説明:**');
    const tagsRaw = codeBlockAfter(sec, '**タグ:**');
    const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);

    if (!video || !title) {
      console.warn(`⚠️  Section ${order}: missing video or title, skipped.`);
      continue;
    }

    jobs.push({
      order,
      slug: slugFromVideoPath(video),
      job: {
        video,
        title,
        description,
        tags,
        thumbnail: thumbnail || undefined,
        categoryId: '27',
        language: 'en',
        madeForKids: false,
        privacyStatus: 'private',
      },
    });
  }
  return jobs;
}

function main() {
  if (!fs.existsSync(IN)) throw new Error(`input markdown not found: ${IN}`);
  const md = fs.readFileSync(IN, 'utf8');
  const jobs = parsePackage(md);
  if (!jobs.length) throw new Error('no video sections parsed — check the markdown format');

  fs.mkdirSync(OUT, { recursive: true });
  for (const { order, slug, job } of jobs) {
    const name = `${String(order).padStart(2, '0')}-${slug}.job.json`;
    const file = path.join(OUT, name);
    fs.writeFileSync(file, JSON.stringify(job, null, 2) + '\n');
    const videoExists = fs.existsSync(path.resolve(ROOT, job.video)) ? '' : '  ⚠️ video missing';
    console.log(`📝 ${name}  "${job.title.slice(0, 50)}${job.title.length > 50 ? '…' : ''}"${videoExists}`);
  }
  console.log(`\n✅ Wrote ${jobs.length} job(s) to ${path.relative(ROOT, OUT)}`);
}

try {
  main();
} catch (e) {
  console.error('❌', e.message);
  process.exit(1);
}

module.exports = { parsePackage };
