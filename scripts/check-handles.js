/**
 * Handle availability checker.
 *
 * Uses channels.list?forHandle=<h> against the YouTube Data API. If a channel
 * is returned, the handle is TAKEN; an empty response means it is (most likely)
 * AVAILABLE. Handles are normalized (lowercase, no spaces, no leading @).
 *
 * Usage: node scripts/check-handles.js handleA handleB ...
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function buildYouTube() {
  const creds = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'credentials.json'), 'utf8'));
  const tokensPath = path.join(ROOT, 'config', 'tokens.json');
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
  const o = new google.auth.OAuth2(creds.youtube.client_id, creds.youtube.client_secret, creds.youtube.redirect_uris[0]);
  o.setCredentials(tokens.youtube);
  o.on('tokens', (n) => { tokens.youtube = { ...tokens.youtube, ...n }; fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2)); });
  return google.youtube({ version: 'v3', auth: o });
}

const norm = (h) => h.replace(/^@/, '').toLowerCase().replace(/[^a-z0-9._-]/g, '');

async function check(youtube, handle) {
  const h = norm(handle);
  try {
    const res = await youtube.channels.list({ part: 'snippet,statistics', forHandle: h, maxResults: 1 });
    const item = (res.data.items || [])[0];
    if (!item) return { handle: h, status: 'AVAILABLE', detail: '' };
    const subs = item.statistics?.subscriberCount ?? '?';
    return { handle: h, status: 'TAKEN', detail: `${item.snippet.title} (${subs} subs)` };
  } catch (e) {
    return { handle: h, status: 'ERROR', detail: e.message };
  }
}

(async () => {
  const handles = process.argv.slice(2);
  if (!handles.length) { console.error('pass handles to check'); process.exit(1); }
  const youtube = buildYouTube();
  for (const handle of handles) {
    const r = await check(youtube, handle);
    const mark = r.status === 'AVAILABLE' ? '✅' : r.status === 'TAKEN' ? '❌' : '⚠️';
    console.log(`${mark} @${r.handle.padEnd(24)} ${r.status.padEnd(10)} ${r.detail}`);
  }
})();
