/**
 * Apply the Autopilot brand to the live channel via the YouTube Data API.
 *
 * Sets brandingSettings.channel.{title,description,keywords} on the
 * authenticated channel (mine=true). Source of truth: mychannel/brand/brand-spec.md.
 *
 * NOTE / limits:
 *   - The @handle CANNOT be set via the Data API — claim @autopilot in YouTube
 *     Studio (Settings -> Channel -> Advanced) manually.
 *   - Channel TITLE changes via the API are unreliable for some account types;
 *     we send it but you must VERIFY in Studio (description/keywords are reliable).
 *   - Banner / profile picture are Studio-only.
 *
 * Usage:
 *   node scripts/apply-branding.js          # DRY RUN — prints current vs proposed
 *   node scripts/apply-branding.js --apply  # actually writes the change
 *
 * Requires the OAuth token to carry a write scope
 * (youtube.force-ssl or youtube). If it only has readonly, re-auth first.
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// --- Brand values (mirror of brand-spec.md §3/§4) -------------------------
const BRAND = {
  title: 'Autopilot',
  description: [
    'Your brain is running on autopilot — predicting, forecasting, and bracing for threats before you ever decide a thing. Autopilot makes that hidden machinery visible.',
    '',
    "Every video is a cinematic essay on the predictive brain: the neuroscience of why we spiral into anxiety, sink into depression, freeze, or pull away — and what's actually firing in the circuit when we do. Not symptoms. Mechanisms.",
    '',
    'Grounded in predictive-processing neuroscience and peer-reviewed research, rendered in original 3D animation. New essays regularly.',
    '',
    'Educational only — not medical advice or a substitute for professional care. Subscribe to start seeing your own autopilot.',
  ].join('\n'),
  // keywords: space-separated; quote multi-word phrases (API convention)
  keywords: '"predictive brain" neuroscience psychology anxiety depression "predictive processing" "cinematic essay" "mental health" "how your brain works"',
};
// --------------------------------------------------------------------------

function buildYouTube() {
  const creds = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'credentials.json'), 'utf8'));
  const tokensPath = path.join(ROOT, 'config', 'tokens.json');
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
  const o = new google.auth.OAuth2(creds.youtube.client_id, creds.youtube.client_secret, creds.youtube.redirect_uris[0]);
  o.setCredentials(tokens.youtube);
  o.on('tokens', (n) => { tokens.youtube = { ...tokens.youtube, ...n }; fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2)); });
  return { youtube: google.youtube({ version: 'v3', auth: o }), scope: tokens.youtube.scope || '' };
}

function show(label, channel) {
  const c = channel.brandingSettings?.channel || {};
  console.log(`\n--- ${label} ---`);
  console.log(`title:       ${c.title ?? channel.snippet?.title ?? '(none)'}`);
  console.log(`keywords:    ${c.keywords ?? '(none)'}`);
  console.log(`description: ${(c.description ?? channel.snippet?.description ?? '(none)').slice(0, 200)}${(c.description || '').length > 200 ? ' …' : ''}`);
}

(async () => {
  const apply = process.argv.includes('--apply');
  const { youtube, scope } = buildYouTube();

  const writeOk = /youtube(\.force-ssl)?(\s|$)/.test(scope) || scope.includes('auth/youtube');
  if (!writeOk) {
    console.warn(`⚠️  token scope = "${scope}"`);
    console.warn('   This may be read-only. --apply will fail if no write scope (youtube / youtube.force-ssl). Re-auth if needed.');
  }

  const cur = await youtube.channels.list({ part: 'snippet,brandingSettings', mine: true });
  const channel = (cur.data.items || [])[0];
  if (!channel) {
    console.error('❌ No channel found for the authenticated account. Create the channel first (Studio).');
    process.exit(1);
  }

  show('CURRENT', channel);

  const proposed = {
    ...(channel.brandingSettings || {}),
    channel: {
      ...(channel.brandingSettings?.channel || {}),
      title: BRAND.title,
      description: BRAND.description,
      keywords: BRAND.keywords,
    },
  };
  show('PROPOSED', { brandingSettings: proposed });

  if (!apply) {
    console.log('\n(DRY RUN) Re-run with --apply to write. The @handle and images must still be set in Studio.');
    return;
  }

  const res = await youtube.channels.update({
    part: 'brandingSettings',
    requestBody: { id: channel.id, brandingSettings: proposed },
  });
  console.log('\n✅ Applied. Verify in Studio:');
  show('AFTER', res.data);
  console.log('\nReminder: claim @autopilot handle + set banner/profile picture in Studio (API cannot).');
})();
