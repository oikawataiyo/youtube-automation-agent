/**
 * Replace the thumbnail of already-published videos (no re-render, instant).
 * Maps job files -> videoId via the publish-state, then calls
 * youtube.thumbnails.set with the designed JPG.
 *
 *   node scripts/set-thumbnail.js --all --dry-run            # show the plan
 *   node scripts/set-thumbnail.js --all                      # set all mapped thumbs
 *   node scripts/set-thumbnail.js <videoId> path/to.jpg      # one-off
 *
 * Flags:
 *   --all            use the map file (default scripts/thumbnail/thumb-map.json)
 *   --map <path>     override the map file
 *   --channel <name> channel from channels.json (default autopilot). Sets state path + token.
 *   --state <path>   publish-state.json (default: the channel's jobsDir/_publish-state.json)
 *   --dry-run        print the plan, upload nothing
 */

const fs = require('fs');
const path = require('path');
const { CredentialManager } = require('../utils/credential-manager');
const { resolveChannel, assertChannel } = require('../utils/channels');

const ROOT = path.join(__dirname, '..');
const arg = (name, def) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : def; };
const hasFlag = (name) => process.argv.includes(name);

const DRY = hasFlag('--dry-run');
const CHANNEL = resolveChannel();
const MAP_FILE = path.resolve(ROOT, arg('--map', 'scripts/thumbnail/thumb-map.json'));
const STATE_FILE = path.resolve(ROOT, arg('--state', path.join(CHANNEL.jobsDir, '_publish-state.json')));

/** Build [{videoId, image, label}] from either --all map or positional args. */
function buildPlan() {
  if (hasFlag('--all')) {
    const map = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    return Object.entries(map).map(([jobFile, image]) => {
      const entry = state[jobFile];
      if (!entry || !entry.videoId) throw new Error(`no videoId for ${jobFile} in ${path.relative(ROOT, STATE_FILE)}`);
      return { videoId: entry.videoId, image: path.resolve(ROOT, image), label: jobFile };
    });
  }
  const positional = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const [videoId, image] = positional;
  if (!videoId || !image) throw new Error('usage: set-thumbnail.js --all | <videoId> <image>');
  return [{ videoId, image: path.resolve(image), label: videoId }];
}

async function main() {
  const plan = buildPlan();
  for (const p of plan) {
    if (!fs.existsSync(p.image)) throw new Error(`image not found: ${p.image}`);
  }

  console.log('🗓️  Plan:');
  for (const p of plan) {
    const kb = (fs.statSync(p.image).size / 1024).toFixed(0);
    console.log(`   ${p.videoId}  ←  ${path.relative(ROOT, p.image)} (${kb} KB)  · ${p.label}`);
  }
  if (DRY) { console.log('\n(dry-run — nothing uploaded)'); return; }

  const cm = new CredentialManager({ tokensPath: CHANNEL.tokenFile });
  if (!(await cm.initialize())) throw new Error('CredentialManager init failed');
  const youtube = cm.getYouTubeClient();
  await assertChannel(youtube, CHANNEL); // abort if token routes to the wrong channel

  let ok = 0;
  for (const p of plan) {
    try {
      await youtube.thumbnails.set({ videoId: p.videoId, media: { body: fs.createReadStream(p.image) } });
      console.log(`🖼️  set ${p.videoId}`);
      ok++;
    } catch (e) {
      console.error(`❌ ${p.videoId} failed: ${e.message}`);
    }
  }
  console.log(`\n✅ ${ok}/${plan.length} thumbnails updated.`);
  if (ok < plan.length) process.exitCode = 1; // let callers/retries detect failure
}

main().catch((e) => { console.error('❌', e.message); process.exit(1); });
