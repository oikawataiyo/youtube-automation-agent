/**
 * Render a project's designed thumbnail as part of the produce pipeline, so a
 * video never falls back to a frame-grab. Convention: the project dir holds a
 * `thumb.json` (or `assets/thumb.json`) config; output goes to renders/thumb.jpg.
 *
 *   node scripts/build-thumbnail.js mychannel/video/<slug> [--config x.json] [--out y.jpg]
 *
 * If no thumb.json exists it WARNS and exits 0 (non-fatal) so the pipeline keeps
 * going — but the missing designed thumbnail is surfaced loudly.
 * Config schema: see scripts/thumbnail/render-thumb.js.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const arg = (name, def) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : def; };

const projectArg = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!projectArg) { console.error('usage: build-thumbnail.js <project-dir> [--config x.json] [--out y.jpg]'); process.exit(1); }
const dir = path.resolve(ROOT, projectArg);

const firstExisting = (...ps) => ps.find((p) => p && fs.existsSync(p));
const cfgArg = arg('--config');
const config = cfgArg
  ? path.resolve(ROOT, cfgArg)
  : firstExisting(path.join(dir, 'thumb.json'), path.join(dir, 'assets', 'thumb.json'));
const out = path.resolve(ROOT, arg('--out', path.join(dir, 'renders', 'thumb.jpg')));

if (!config || !fs.existsSync(config)) {
  console.warn(`⚠️  no thumb.json in ${path.relative(ROOT, dir)} — skipping designed thumbnail.`);
  console.warn(`   Add ${path.relative(ROOT, path.join(dir, 'thumb.json'))} so this video ships a designed thumbnail, not a frame-grab.`);
  process.exit(0);
}

const r = spawnSync('node', [path.join('scripts', 'thumbnail', 'render-thumb.js'), '--config', config, '--out', out],
  { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
process.exit(r.status || 0);
