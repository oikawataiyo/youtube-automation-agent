const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { ChannelDataCollector, DEFAULT_CHANNELS } = require('../utils/channel-data-collector');

const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'analysis', 'channel-data.json');

async function main() {
  const tokensPath = path.join(__dirname, '..', 'config', 'tokens.json');
  const creds = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config', 'credentials.json'), 'utf8'));
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

  const oauth2Client = new google.auth.OAuth2(
    creds.youtube.client_id,
    creds.youtube.client_secret,
    creds.youtube.redirect_uris[0]
  );
  oauth2Client.setCredentials(tokens.youtube);
  oauth2Client.on('tokens', (newTokens) => {
    tokens.youtube = { ...tokens.youtube, ...newTokens };
    fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
  });
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const collector = new ChannelDataCollector(youtube);

  console.log(`Collecting data from ${DEFAULT_CHANNELS.length} channels...`);
  const data = await collector.collectChannelData();

  collector.saveToFile(data, OUTPUT_FILE);

  const totalVideos = data.channels.reduce((s, c) => s + c.videos.length, 0);
  console.log(`Saved to ${OUTPUT_FILE}`);
  console.log(`Total: ${totalVideos} videos from ${data.channels.length} channels`);
}

main().catch(err => {
  console.error('Error:', err.message);
  if (err.response) console.error('API response:', JSON.stringify(err.response.data, null, 2));
});
