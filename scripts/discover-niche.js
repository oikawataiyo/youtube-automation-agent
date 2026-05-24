const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { GenreDiscoverer } = require('../utils/genre-discoverer');
const { GenreChannelSampler } = require('../utils/genre-channel-sampler');
const { runAnalysis, saveToFile: saveAnalysis, OUTPUT_FILE: ANALYSIS_FILE } = require('../utils/genre-analyzer');
const { runScoring, saveToFile: saveScoring, OUTPUT_FILE: SCORING_FILE } = require('../utils/niche-scorer');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { skipCache: false, topN: 10, regions: ['US', 'JP'] };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--skip-cache') {
      opts.skipCache = true;
    } else if (args[i] === '--top' && args[i + 1]) {
      const parsed = parseInt(args[i + 1], 10);
      if (!isNaN(parsed) && parsed > 0) opts.topN = parsed;
      i++;
    } else if (args[i] === '--regions' && args[i + 1]) {
      opts.regions = args[i + 1].split(',').map(r => r.trim().toUpperCase());
      i++;
    }
  }

  return opts;
}

function createYouTubeClient() {
  const configDir = path.join(__dirname, '..', 'config');
  const creds = JSON.parse(fs.readFileSync(path.join(configDir, 'credentials.json'), 'utf8'));
  const tokens = JSON.parse(fs.readFileSync(path.join(configDir, 'tokens.json'), 'utf8'));

  const oauth2Client = new google.auth.OAuth2(
    creds.youtube.client_id,
    creds.youtube.client_secret,
    creds.youtube.redirect_uris[0]
  );
  oauth2Client.setCredentials(tokens.youtube);
  return google.youtube({ version: 'v3', auth: oauth2Client });
}

function printTable(title, items) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(70));

  if (items.length === 0) {
    console.log('  (no data)');
    return;
  }

  const header = `  ${'#'.padEnd(4)} ${'Genre'.padEnd(22)} ${'Score'.padEnd(8)} ${'PR'.padEnd(8)} ${'Eng%'.padEnd(8)} ${'Trend'.padEnd(8)}`;
  console.log(header);
  console.log(`  ${'-'.repeat(62)}`);

  for (const item of items) {
    const rank = String(item.rank || '-').padEnd(4);
    const name = (item.categoryName || '').slice(0, 20).padEnd(22);
    const score = (item.finalScore != null ? item.finalScore.toFixed(3) : '-').padEnd(8);

    const m = item.metrics || {};
    const pr = (m.demandPR != null ? m.demandPR.toFixed(3) : '-').padEnd(8);
    const eng = (m.engagementRate != null ? (m.engagementRate * 100).toFixed(2) : '-').padEnd(8);
    const trend = (m.recencyDirection || '-').padEnd(8);

    console.log(`  ${rank} ${name} ${score} ${pr} ${eng} ${trend}`);

    if (item.insights && item.insights.length > 0) {
      for (const insight of item.insights.slice(0, 2)) {
        console.log(`       -> ${insight}`);
      }
    }
  }
}

function printCrossRegion(items) {
  console.log(`\n${'='.repeat(70)}`);
  console.log('  Cross-Region Ranking (Global Viability)');
  console.log('='.repeat(70));

  if (items.length === 0) {
    console.log('  (no cross-region data)');
    return;
  }

  const header = `  ${'#'.padEnd(4)} ${'Genre'.padEnd(22)} ${'Avg Score'.padEnd(10)} ${'Viability'.padEnd(12)} Regions`;
  console.log(header);
  console.log(`  ${'-'.repeat(62)}`);

  items.forEach((item, i) => {
    const rank = String(i + 1).padEnd(4);
    const name = (item.categoryName || '').slice(0, 20).padEnd(22);
    const avg = item.avgScore.toFixed(3).padEnd(10);
    const viability = item.globalViability.padEnd(12);
    const regions = Object.entries(item.regionScores)
      .map(([r, s]) => `${r}:${s.toFixed(2)}`)
      .join(' ');

    console.log(`  ${rank} ${name} ${avg} ${viability} ${regions}`);
  });
}

async function main() {
  const opts = parseArgs();
  console.log(`Niche Discovery: regions=${opts.regions.join(',')} top=${opts.topN} skipCache=${opts.skipCache}`);

  const youtube = createYouTubeClient();
  const discoverer = new GenreDiscoverer(youtube);
  const sampler = new GenreChannelSampler(youtube);

  // Phase 1: Genre Discovery
  console.log('\n[Phase 1] Genre Discovery');
  let discoveryData;
  if (!opts.skipCache && !discoverer.isCacheStale()) {
    console.log('  Using cached discovery data');
    discoveryData = discoverer.loadFromFile();
  } else {
    discoveryData = await discoverer.discover(opts.regions);
    discoverer.saveToFile(discoveryData);
    console.log('  Saved to genre-discovery.json');
  }

  // Phase 2: Channel Sampling
  console.log('\n[Phase 2] Channel Sampling');
  let channelData;
  if (!opts.skipCache && !sampler.isCacheStale()) {
    console.log('  Using cached channel data');
    channelData = sampler.loadFromFile();
  } else {
    channelData = await sampler.sample(discoveryData, opts.regions);
    sampler.saveToFile(channelData);
    console.log('  Saved to genre-channels.json');
  }

  // Phase 3: Cross-Genre Analysis
  console.log('\n[Phase 3] Cross-Genre Analysis');
  const analysisData = runAnalysis(channelData, opts.regions);
  saveAnalysis(analysisData);
  console.log('  Saved to genre-analysis.json');

  // Phase 4: Niche Scoring
  console.log('\n[Phase 4] Niche Scoring');
  const recommendations = runScoring(analysisData, { topN: opts.topN });
  saveScoring(recommendations);
  console.log('  Saved to niche-recommendations.json');

  // Output
  for (const region of opts.regions) {
    if (recommendations.regions[region]) {
      printTable(`${region} Top ${opts.topN} Genres`, recommendations.regions[region]);
    }
  }

  printCrossRegion(recommendations.crossRegion);

  console.log(`\nDone. Results saved to data/analysis/`);
}

main().catch(err => {
  console.error('Error:', err.message);
  if (err.response) console.error('API response:', JSON.stringify(err.response.data, null, 2));
  process.exit(1);
});
