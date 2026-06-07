/**
 * Channel resolver for multi-channel operation. Loads channels.json and resolves
 * a channel's directories + YouTube token/identity. The cross-post guard
 * (assertChannel) is the structural safety against uploading to the wrong channel.
 *
 * Scripts resolve via `--channel <name>`; when omitted, falls back to the
 * configured defaultChannel with a deprecation warning (migration period).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CHANNELS_FILE = path.join(ROOT, 'channels.json');

const REQUIRED_FIELDS = ['dir', 'tokenFile', 'jobsDir'];

function loadConfig() {
  let raw;
  try {
    raw = fs.readFileSync(CHANNELS_FILE, 'utf8');
  } catch (e) {
    throw new Error(`channels.json not readable at ${CHANNELS_FILE}: ${e.message}`);
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    throw new Error(`channels.json is not valid JSON: ${e.message}`);
  }
  if (!data.channels || typeof data.channels !== 'object') {
    throw new Error('channels.json: missing top-level "channels" object');
  }
  return data;
}

function validateChannel(name, ch) {
  for (const k of REQUIRED_FIELDS) {
    if (!ch[k]) throw new Error(`channels.json: channel "${name}" missing required field "${k}"`);
  }
}

/**
 * @param {{ name?: string, silent?: boolean }} [opts]
 * @returns {{ name, dir, tokenFile, jobsDir, youtubeChannelId, timezone, privacyDefault, publishSlot, brand, raw }}
 */
function resolveChannel(opts = {}) {
  const config = loadConfig();
  let name = opts.name;
  if (!name) {
    const i = process.argv.indexOf('--channel');
    if (i >= 0) name = process.argv[i + 1];
  }
  if (!name) {
    name = config.defaultChannel || 'autopilot';
    if (!opts.silent) {
      console.warn(`⚠️  --channel omitted; defaulting to "${name}". Pass --channel explicitly — this fallback is temporary.`);
    }
  }

  const ch = config.channels[name];
  if (!ch) {
    throw new Error(`unknown channel "${name}". Known: ${Object.keys(config.channels).join(', ')}`);
  }
  validateChannel(name, ch);

  return {
    name,
    dir: path.resolve(ROOT, ch.dir),
    tokenFile: path.resolve(ROOT, ch.tokenFile),
    jobsDir: path.resolve(ROOT, ch.jobsDir),
    youtubeChannelId: ch.youtubeChannelId || null,
    timezone: ch.timezone || null,
    privacyDefault: ch.privacyDefault || 'private',
    publishSlot: ch.publishSlot || null,
    brand: ch.brand ? path.resolve(ROOT, ch.brand) : null,
    raw: ch,
  };
}

/**
 * Cross-post guard. Verifies the authorized YouTube account matches the
 * channel's configured youtubeChannelId. Throws on mismatch so a misrouted
 * token can never upload to the wrong channel. Call before any write op
 * (upload, thumbnail set).
 *
 * @param {import('googleapis').youtube_v3.Youtube} youtube
 * @param {{ name: string, youtubeChannelId: string|null }} channel
 */
async function assertChannel(youtube, channel) {
  if (!channel.youtubeChannelId) {
    console.warn(`⚠️  channel "${channel.name}" has no youtubeChannelId in channels.json — cross-post guard SKIPPED. Set it after authenticating this channel.`);
    return;
  }
  const me = await youtube.channels.list({ part: 'id', mine: true });
  const authId = ((me.data.items || [])[0] || {}).id;
  if (!authId) throw new Error('cross-post guard: could not read the authorized channel id');
  if (authId !== channel.youtubeChannelId) {
    throw new Error(
      `cross-post guard ABORT: authorized channel ${authId} does not match configured ${channel.youtubeChannelId} for "${channel.name}".`
    );
  }
  console.log(`🔒 Channel guard OK: ${authId} ("${channel.name}")`);
}

module.exports = { resolveChannel, assertChannel, loadConfig };
