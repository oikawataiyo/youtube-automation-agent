/**
 * Render a designed 1280x720 YouTube thumbnail from a JSON config by
 * screenshotting an HTML template with headless Chromium (Playwright),
 * then compressing to a <2MB JPG with sharp.
 *
 *   node scripts/thumbnail/render-thumb.js --config path/to.json --out path/to.jpg
 *
 * Config shape (see scripts/thumbnail/configs/*.json):
 *   {
 *     "accent":  "#ffb020",          // single accent color
 *     "bg":      "indigo",           // named gradient (see template)
 *     "emotion": "sad",              // chibi expression
 *     "lines":   [ { "t": "IT WAS NEVER A", "style": "plain" },
 *                  { "t": "CHEMICAL IMBALANCE", "style": "strike" } ],
 *     "mark":    "AUTOPILOT"
 *   }
 *
 * style ∈ plain | accent | strike .  emotion ∈ sad | curious | alert | calm | tense
 */

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : def;
}

const TEMPLATE = path.join(__dirname, 'template.html');
const CONFIG = path.resolve(arg('--config'));
const OUT = path.resolve(arg('--out', CONFIG.replace(/\.json$/, '.jpg')));

async function main() {
  if (!CONFIG || !fs.existsSync(CONFIG)) throw new Error(`config not found: ${CONFIG}`);
  const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));

  let chromium;
  try { ({ chromium } = require('playwright')); }
  catch (_) { throw new Error('playwright not installed — run: npm i playwright && npx playwright install chromium'); }

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
    await page.addInitScript((c) => { window.__THUMB = c; }, cfg);
    await page.goto('file://' + TEMPLATE.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__thumbReady === true, { timeout: 8000 }).catch(() => {});
    const pngBuf = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1280, height: 720 } });

    // Compress to <2MB JPG (YouTube hard limit), stepping quality down if needed.
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    let q = 92, jpg;
    do {
      jpg = await sharp(pngBuf).resize(1280, 720).jpeg({ quality: q, mozjpeg: true }).toBuffer();
      q -= 6;
    } while (jpg.length > 2 * 1024 * 1024 && q >= 50);
    fs.writeFileSync(OUT, jpg);
    console.log(`🖼️  ${path.relative(process.cwd(), OUT)}  (${(jpg.length / 1024).toFixed(0)} KB, q≈${q + 6})`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error('❌', e.message); process.exit(1); });
