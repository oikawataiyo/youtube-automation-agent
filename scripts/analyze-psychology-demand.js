#!/usr/bin/env node
/**
 * Analyze demand in the psychology/self-help YouTube niche.
 * Uses the same analysis pipeline as tech channel analysis
 * but with psychology-specific channels and topic rules.
 *
 * Usage:
 *   node scripts/analyze-psychology-demand.js
 *   node scripts/analyze-psychology-demand.js --skip-cache
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { ChannelDataCollector } = require('../utils/channel-data-collector');
const { runFullAnalysis } = require('../utils/demand-analyzer');
const { PSYCHOLOGY_CHANNELS, PSYCHOLOGY_TOPIC_RULES, mapTopicsToPillars } = require('../utils/psychology-domain');

const CHANNEL_DATA_FILE = path.join(__dirname, '..', 'data', 'analysis', 'psychology-channel-data.json');
const DEMAND_FILE = path.join(__dirname, '..', 'data', 'analysis', 'psychology-demand.json');

function parseArgs() {
  const args = process.argv.slice(2);
  return { skipCache: args.includes('--skip-cache') };
}

function createYouTubeClient() {
  const configDir = path.join(__dirname, '..', 'config');
  const tokensPath = path.join(configDir, 'tokens.json');
  const creds = JSON.parse(fs.readFileSync(path.join(configDir, 'credentials.json'), 'utf8'));
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

  const oauth2Client = new google.auth.OAuth2(
    creds.youtube.client_id,
    creds.youtube.client_secret,
    creds.youtube.redirect_uris[0]
  );
  oauth2Client.setCredentials(tokens.youtube);
  // Persist refreshed access_token + expiry_date back to file.
  // Refresh responses omit refresh_token, so merge to preserve it.
  oauth2Client.on('tokens', (newTokens) => {
    tokens.youtube = { ...tokens.youtube, ...newTokens };
    fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
  });
  return google.youtube({ version: 'v3', auth: oauth2Client });
}

function printOpportunityTable(opportunities) {
  console.log(`\n${'='.repeat(80)}`);
  console.log('  Psychology Topic Opportunity Ranking');
  console.log('='.repeat(80));

  const header = `  ${'#'.padEnd(4)} ${'Topic'.padEnd(30)} ${'AvgPR'.padEnd(8)} ${'Videos'.padEnd(8)} ${'Channels'.padEnd(10)} ${'Opp.Score'.padEnd(10)} ${'Pillar'.padEnd(10)}`;
  console.log(header);
  console.log(`  ${'-'.repeat(76)}`);

  opportunities.forEach((t, i) => {
    const rank = String(i + 1).padEnd(4);
    const topic = t.topic.slice(0, 28).padEnd(30);
    const pr = t.avgPR.toFixed(3).padEnd(8);
    const videos = String(t.videos).padEnd(8);
    const channels = String(t.channels).padEnd(10);
    const opp = t.opportunity.toFixed(3).padEnd(10);
    const pillar = (t.pillar || '-').padEnd(10);
    console.log(`  ${rank} ${topic} ${pr} ${videos} ${channels} ${opp} ${pillar}`);
  });
}

function printTrends(trends) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('  Recency Trends (30d vs 30-90d)');
  console.log('='.repeat(60));

  if (trends.length === 0) {
    console.log('  (insufficient data for trend analysis)');
    return;
  }

  for (const t of trends) {
    const arrow = t.direction === 'rising' ? '^' : t.direction === 'falling' ? 'v' : '=';
    console.log(`  ${arrow} ${t.topic.padEnd(30)} ${t.direction.padEnd(8)} (${t.change > 0 ? '+' : ''}${t.change.toFixed(3)})`);
  }
}

function printDuration(durationData) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('  Duration Sweet Spots');
  console.log('='.repeat(60));

  for (const d of durationData) {
    const topMin = (d.topHalfDuration / 60).toFixed(1);
    const botMin = (d.bottomHalfDuration / 60).toFixed(1);
    console.log(`  ${d.topic.padEnd(30)} top=${topMin}m  bottom=${botMin}m  -> ${d.recommendation}`);
  }
}

async function main() {
  const opts = parseArgs();
  console.log('Psychology Demand Analysis');
  console.log(`Channels: ${PSYCHOLOGY_CHANNELS.map(c => c.name).join(', ')}`);

  const youtube = createYouTubeClient();
  const collector = new ChannelDataCollector(youtube);

  // Collect channel data (with 24h cache)
  let channelData;
  if (!opts.skipCache && !collector.isCacheStale(CHANNEL_DATA_FILE)) {
    console.log('\n[1/2] Using cached channel data');
    channelData = collector.loadFromFile(CHANNEL_DATA_FILE);
  } else {
    console.log('\n[1/2] Collecting channel data from YouTube API...');
    channelData = await collector.collectChannelData(PSYCHOLOGY_CHANNELS, 30);
    collector.saveToFile(channelData, CHANNEL_DATA_FILE);
    console.log(`  Saved to ${path.relative(process.cwd(), CHANNEL_DATA_FILE)}`);
  }

  const totalVideos = channelData.channels.reduce((sum, ch) => sum + ch.videos.length, 0);
  console.log(`  ${channelData.channels.length} channels, ${totalVideos} videos`);

  // Run analysis with psychology topic rules
  console.log('\n[2/2] Running demand analysis...');
  const analysis = runFullAnalysis(channelData, PSYCHOLOGY_TOPIC_RULES);

  // Enrich with pillar mapping
  const enrichedOpportunities = mapTopicsToPillars(analysis.opportunities);

  const output = {
    ...analysis,
    opportunities: enrichedOpportunities,
    topicRanking: mapTopicsToPillars(analysis.topicRanking),
  };

  // Save
  const dir = path.dirname(DEMAND_FILE);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DEMAND_FILE, JSON.stringify(output, null, 2));
  console.log(`  Saved to ${path.relative(process.cwd(), DEMAND_FILE)}`);

  // Print results
  printOpportunityTable(enrichedOpportunities);
  printTrends(analysis.recencyTrend);
  printDuration(analysis.durationSweetSpot);

  console.log(`\nTop opportunity: ${enrichedOpportunities[0]?.topic || 'N/A'} (pillar: ${enrichedOpportunities[0]?.pillar || 'N/A'})`);
}

main().catch(err => {
  console.error('Error:', err.message);
  if (err.response) console.error('API response:', JSON.stringify(err.response.data, null, 2));
  process.exit(1);
});
