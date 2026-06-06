// Deterministic still-image capture for brand art.
// Usage: node shot.mjs <input.html> <output.png> <width> <height>
import { chromium } from 'playwright';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [, , inFile, outFile, wArg, hArg] = process.argv;
if (!inFile || !outFile) {
  console.error('Usage: node shot.mjs <input.html> <output.png> <width> <height>');
  process.exit(1);
}
const width = Number(wArg) || 800;
const height = Number(hArg) || 800;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width, height },
  deviceScaleFactor: 2, // export at 2x for crisp downscale
});
await page.goto(pathToFileURL(path.resolve(inFile)).href, { waitUntil: 'networkidle' });
await page.screenshot({ path: path.resolve(outFile), clip: { x: 0, y: 0, width, height } });
await browser.close();
console.log(`wrote ${outFile} (${width}x${height} @2x)`);
