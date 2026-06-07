#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');
const sharp = require('sharp');

function usage() {
  console.error('Usage: node scripts/qa-video-screenshots.js <project-dir> [time,time,...]');
  process.exit(1);
}

const projectDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!projectDir) usage();

const indexPath = path.join(projectDir, 'index.html');
const metaPath = path.join(projectDir, 'meta.json');
if (!fs.existsSync(indexPath)) throw new Error(`Missing ${indexPath}`);

const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf8')) : {};
const duration = Number(meta.actualDurationSeconds || meta.durationSeconds || meta.estimatedDurationSeconds || 0);
const times = process.argv[3]
  ? process.argv[3].split(',').map(Number).filter(Number.isFinite)
  : [5, 32, 145, 290, 455, 650, Math.max(1, duration - 8)].filter((t) => t > 0 && (!duration || t < duration));

const outDir = path.join(projectDir, 'renders', 'qa');
fs.mkdirSync(outDir, { recursive: true });

function safeTime(t) {
  return String(t.toFixed(1)).replace('.', 'p');
}

async function imageStats(filePath) {
  const { data, info } = await sharp(filePath)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });
  let bright = 0;
  let nonBlack = 0;
  const pixels = info.width * info.height;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const lum = (r + g + b) / 3;
    if (lum > 18) nonBlack++;
    bright += lum;
  }
  return {
    width: info.width,
    height: info.height,
    meanLuma: Math.round((bright / pixels) * 100) / 100,
    nonBlackRatio: Math.round((nonBlack / pixels) * 10000) / 10000,
  };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(indexPath).href, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => Boolean(window.__timelines && window.__timelines.main), null, { timeout: 60000 });

  const shots = [];
  for (const time of times) {
    await page.evaluate((t) => {
      const tl = window.__timelines.main;
      tl.pause();
      tl.seek(t, false);
    }, time);
    await page.waitForTimeout(120);
    const filePath = path.join(outDir, `frame-${safeTime(time)}s.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    shots.push({ time, file: path.relative(projectDir, filePath).replace(/\\/g, '/'), stats: await imageStats(filePath) });
  }

  await browser.close();
  fs.writeFileSync(path.join(outDir, 'qa-screenshots.json'), `${JSON.stringify(shots, null, 2)}\n`);
  for (const shot of shots) {
    console.log(`${shot.time.toFixed(1)}s ${shot.file} luma=${shot.stats.meanLuma} nonblack=${shot.stats.nonBlackRatio}`);
  }
})();
