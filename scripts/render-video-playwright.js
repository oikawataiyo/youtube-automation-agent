#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { spawnSync, spawn } = require('child_process');
const { chromium } = require('playwright');

function usage() {
  console.error('Usage: node scripts/render-video-playwright.js <project-dir> [--fps 12] [--output renders/final.mp4]');
  process.exit(1);
}

const args = process.argv.slice(2);
const projectArg = args.find((arg) => !arg.startsWith('--'));
if (!projectArg) usage();

function option(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

const projectDir = path.resolve(projectArg);
const fps = Number(option('--fps', '12'));
if (!Number.isFinite(fps) || fps <= 0) throw new Error(`Invalid fps: ${fps}`);

const renderWidth = Number(option('--width', '1920'));
const renderHeight = Number(option('--height', '1080'));
if (!Number.isFinite(renderWidth) || renderWidth <= 0) throw new Error(`Invalid width: ${renderWidth}`);
if (!Number.isFinite(renderHeight) || renderHeight <= 0) throw new Error(`Invalid height: ${renderHeight}`);

const output = path.resolve(projectDir, option('--output', 'renders/final-playwright.mp4'));
const indexPath = path.join(projectDir, 'index.html');
const segmentsPath = path.join(projectDir, 'assets', 'segments.json');
const narrationDir = path.join(projectDir, 'assets', 'narration');
const workDir = path.join(projectDir, 'renders', 'playwright-work');
const audioPath = path.join(workDir, 'full-narration.wav');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.mkdirSync(workDir, { recursive: true });

const segments = JSON.parse(fs.readFileSync(segmentsPath, 'utf8'));
const duration = Math.max(...segments.map((segment) => Number(segment.end || 0)));
if (!duration) throw new Error('Could not determine duration from assets/segments.json');

function wavFor(index) {
  const prefix = String(index).padStart(2, '0');
  const found = fs.readdirSync(narrationDir).find((name) => name.startsWith(`${prefix}-`) && name.endsWith('.wav'));
  if (!found) throw new Error(`Missing wav for segment ${prefix}`);
  return path.join(narrationDir, found);
}

function buildAudio() {
  const listPath = path.join(workDir, 'concat.txt');
  const list = segments.map((_, index) => `file '${wavFor(index).replace(/\\/g, '/')}'`).join('\n');
  fs.writeFileSync(listPath, list);
  const result = spawnSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', audioPath], {
    stdio: 'inherit',
  });
  if (result.status !== 0) throw new Error('ffmpeg audio concat failed');
}

async function main() {
  buildAudio();
  const totalFrames = Math.ceil(duration * fps);
  console.log(`Rendering ${totalFrames} frames at ${fps}fps (${duration.toFixed(2)}s)`);

  const ffmpeg = spawn('ffmpeg', [
    '-y',
    '-framerate', String(fps),
    '-f', 'image2pipe',
    '-vcodec', 'png',
    '-i', 'pipe:0',
    '-i', audioPath,
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '23',
    '-pix_fmt', 'yuv420p',
    '-r', '30',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    output,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: renderWidth, height: renderHeight }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(indexPath).href, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => Boolean(window.__timelines && window.__timelines.main), null, { timeout: 60000 });

  for (let frame = 0; frame < totalFrames; frame++) {
    const time = Math.min(duration - 0.001, frame / fps);
    await page.evaluate((t) => {
      const tl = window.__timelines.main;
      tl.pause();
      tl.seek(t, false);
    }, time);
    await page.waitForTimeout(8);
    const png = await page.screenshot({ fullPage: false, type: 'png' });
    if (!ffmpeg.stdin.write(png)) {
      await new Promise((resolve) => ffmpeg.stdin.once('drain', resolve));
    }
    if (frame % Math.max(1, fps * 10) === 0) {
      console.log(`frame ${frame}/${totalFrames} (${time.toFixed(1)}s)`);
    }
  }

  ffmpeg.stdin.end();
  await browser.close();
  const code = await new Promise((resolve) => ffmpeg.on('close', resolve));
  if (code !== 0) throw new Error(`ffmpeg encode failed with code ${code}`);
  console.log(`Wrote ${output}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
