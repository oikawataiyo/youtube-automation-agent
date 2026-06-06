/**
 * Re-authorize the YouTube OAuth token against a DIFFERENT account/channel,
 * reusing the existing API credentials (config/credentials.json).
 *
 * Unlike `npm run credentials:setup` (the full wizard), this ONLY runs the
 * OAuth flow — it does not re-prompt for the client id/secret or touch any
 * other config. It forces the Google account picker + consent so you can
 * select the new Autopilot account and get a durable refresh_token.
 *
 * Backs up the current config/tokens.json to config/tokens.json.bak first,
 * so you can revert to the previous (personal) account if needed.
 *
 * Usage:
 *   node scripts/reauth-youtube.js     # interactive — run via `! node ...` in-session
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT = path.join(__dirname, '..');
const CRED = path.join(ROOT, 'config', 'credentials.json');
const TOK = path.join(ROOT, 'config', 'tokens.json');
const TOK_BAK = path.join(ROOT, 'config', 'tokens.json.bak');

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
];

function ask(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => rl.question(q, (a) => { rl.close(); res(a.trim()); }));
}

(async () => {
  const creds = JSON.parse(fs.readFileSync(CRED, 'utf8')).youtube;
  const o = new google.auth.OAuth2(creds.client_id, creds.client_secret, creds.redirect_uris[0]);

  const url = o.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent select_account', // force account picker + guarantee refresh_token
    scope: SCOPES,
  });

  console.log('\n1) Open this URL and sign in as the NEW Autopilot account (autopilot.studi@gmail.com):\n');
  console.log(url);
  console.log('\n2) After approving, the browser redirects to a localhost page that will NOT load — that is expected.');
  console.log('   Copy the value of the `code=...` parameter from the address bar.\n');

  const code = await ask('Paste the authorization code here: ');
  if (!code) { console.error('No code provided. Aborting.'); process.exit(1); }

  const { tokens } = await o.getToken(code);
  if (!tokens.refresh_token) {
    console.warn('⚠️  No refresh_token returned. (Re-run; the picker/consent should force one.)');
  }

  // Back up the existing token, then write the new one in the same shape.
  if (fs.existsSync(TOK)) fs.copyFileSync(TOK, TOK_BAK);
  fs.writeFileSync(TOK, JSON.stringify({ youtube: tokens }, null, 2));
  console.log(`\n✅ Wrote ${TOK} (previous token backed up to ${TOK_BAK}).`);

  // Confirm which channel we landed on.
  o.setCredentials(tokens);
  const yt = google.youtube({ version: 'v3', auth: o });
  const me = await yt.channels.list({ part: 'snippet', mine: true });
  const ch = (me.data.items || [])[0];
  if (ch) {
    console.log(`\n🎬 Authorized channel: "${ch.snippet.title}"  (id ${ch.id})`);
    console.log(ch.snippet.title.toLowerCase().includes('autopilot')
      ? '   → Looks like Autopilot. Tell Claude "done".'
      : '   ⚠️  This is NOT the Autopilot channel. Re-run and pick the right account, or restore tokens.json.bak.');
  } else {
    console.log('\n⚠️  No channel found for this account. Make sure the Autopilot channel exists on it.');
  }
})().catch((e) => { console.error('Error:', e.message); process.exit(1); });
