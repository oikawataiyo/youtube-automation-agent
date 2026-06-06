/**
 * Robust YouTube re-auth using a loopback capture server (no copy-paste).
 *
 * Spins up http://localhost:8080 and listens on the exact registered
 * redirect path (/oauth2callback). The browser redirect after consent is
 * captured automatically, the code is exchanged immediately, and the new
 * token is written to config/tokens.json (previous backed up to .bak).
 *
 * Run AFTER publishing the OAuth app to "In production" so the issued
 * refresh_token is durable (no 7-day testing expiry).
 *
 * Usage (interactive — run via `! node scripts/reauth-youtube-server.js`):
 *   1. A URL is printed (and the browser is opened automatically).
 *   2. Sign in as autopilot.studi@gmail.com; on the "unverified app" screen
 *      click Advanced -> Go to (unsafe); approve all scopes.
 *   3. The browser lands on a "Success" page; this script writes the token
 *      and prints the durability check + channel, then exits.
 */

const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { google } = require('googleapis');

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

const creds = JSON.parse(fs.readFileSync(CRED, 'utf8')).youtube;
const redirectUri = creds.redirect_uris[0]; // http://localhost:8080/oauth2callback
const callbackPath = new URL(redirectUri).pathname;
const port = Number(new URL(redirectUri).port) || 8080;

const oauth = new google.auth.OAuth2(creds.client_id, creds.client_secret, redirectUri);

const authUrl = oauth.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent select_account', // force account picker + guarantee refresh_token
  scope: SCOPES,
});

function page(title, body) {
  return `<!doctype html><meta charset="utf-8"><title>${title}</title>` +
    `<body style="font-family:system-ui;text-align:center;padding:60px;background:#06080D;color:#F2F4F8">` +
    `<h1>${title}</h1><p style="color:#9aa7bd">${body}</p></body>`;
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${port}`);
  if (u.pathname !== callbackPath) {
    res.writeHead(404).end('Not found');
    return;
  }

  const err = u.searchParams.get('error');
  const code = u.searchParams.get('code');

  if (err) {
    res.writeHead(200, { 'Content-Type': 'text/html' }).end(page('❌ Authorization error', err));
    console.error('\n❌ Authorization error:', err);
    server.close();
    process.exit(1);
  }
  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/html' }).end(page('❌ No code', 'No authorization code received.'));
    return;
  }

  try {
    const { tokens } = await oauth.getToken(code);

    if (!tokens.refresh_token) {
      console.warn('⚠️  No refresh_token returned. Re-run; the consent prompt should force one.');
    }

    if (fs.existsSync(TOK)) fs.copyFileSync(TOK, TOK_BAK);
    // Preserve the { youtube: ... } shape that CredentialManager expects.
    fs.writeFileSync(TOK, JSON.stringify({ youtube: tokens }, null, 2));

    // Durability check: testing-mode tokens carry refresh_token_expires_in (~604800s/7d).
    const exp = tokens.refresh_token_expires_in;
    const durable = exp === undefined || exp > 30 * 24 * 3600;

    oauth.setCredentials(tokens);
    const yt = google.youtube({ version: 'v3', auth: oauth });
    const me = await yt.channels.list({ part: 'snippet', mine: true });
    const ch = (me.data.items || [])[0];
    const chName = ch ? ch.snippet.title : '(unknown)';

    res.writeHead(200, { 'Content-Type': 'text/html' })
      .end(page('🎉 Authorized', `Channel: ${chName}. You can close this tab and return to the terminal.`));

    console.log(`\n✅ Wrote ${TOK} (previous backed up to ${TOK_BAK}).`);
    console.log(`🎬 Authorized channel: "${chName}"  (id ${ch ? ch.id : '?'})`);
    console.log(`🔁 refresh_token_expires_in: ${exp === undefined ? 'absent' : exp + 's'}`);
    console.log(durable
      ? '🟢 DURABLE — no 7-day expiry. Auto-posting will keep working.'
      : '🔴 STILL 7-DAY EXPIRY — the app may not be fully "In production" yet. Verify publishing status and re-run.');
    if (ch && !chName.toLowerCase().includes('autopilot')) {
      console.log('⚠️  This is NOT the Autopilot channel. Re-run and pick the right account, or restore tokens.json.bak.');
    }

    setTimeout(() => { server.close(); process.exit(durable ? 0 : 2); }, 500);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/html' }).end(page('❌ Token exchange failed', e.message));
    console.error('\n❌ Token exchange failed:', e.message);
    server.close();
    process.exit(1);
  }
});

server.listen(port, () => {
  console.log(`\n🔐 Capture server on http://localhost:${port}${callbackPath}`);
  console.log('\n1) Opening this URL in your browser (sign in as autopilot.studi@gmail.com):\n');
  console.log(authUrl);
  console.log('\n2) On "このアプリは確認されていません" → 詳細 → 安全でないページに移動 → approve all scopes.');
  console.log('   The redirect is captured automatically — nothing to copy.\n');
  // Best-effort auto-open on Windows.
  exec(`start "" "${authUrl}"`, { shell: 'cmd.exe' }, () => {});
});
