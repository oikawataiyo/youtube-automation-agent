const fs = require('fs');
const path = require('path');
const {
  runFullAnalysis,
} = require('../utils/demand-analyzer');

const DATA_FILE = path.join(__dirname, '..', 'data', 'analysis', 'channel-data.json');

function fmtDur(s) {
  return `${Math.floor(s / 60)}m${Math.round(s % 60)}s`;
}

function main() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error(`Data file not found: ${DATA_FILE}`);
    console.error('Run collect-channel-data.js first.');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  console.log(`Data collected at: ${data.collectedAt}`);
  console.log(`Channels: ${data.channels.map(c => c.name).join(', ')}`);

  const analysis = runFullAnalysis(data);

  console.log(`Total videos: ${analysis.videos.length}\n`);

  // 1. TOPIC DEMAND RANKING
  console.log('='.repeat(70));
  console.log(' 1. TOPIC DEMAND RANKING');
  console.log('    Performance Ratio (PR) = Views / Subscribers');
  console.log('='.repeat(70));

  console.log('\n  Rank | Topic               | Avg PR  | Med PR  | Videos | Ch | Avg Views    | Eng');
  console.log('  ' + '-'.repeat(90));
  analysis.topicRanking.forEach((t, i) => {
    console.log(
      `  ${String(i + 1).padStart(4)} | ${t.topic.padEnd(19)} ` +
      `| ${t.avgPR.toFixed(3).padStart(6)}x ` +
      `| ${t.medianPR.toFixed(3).padStart(6)}x ` +
      `| ${String(t.videos).padStart(5)}  ` +
      `| ${String(t.channels).padStart(2)} ` +
      `| ${t.avgViews.toLocaleString().padStart(12)} ` +
      `| ${(t.avgEngagement * 100).toFixed(1).padStart(5)}%`
    );
  });

  // 2. OPPORTUNITY SCORE
  console.log('\n' + '='.repeat(70));
  console.log(' 2. OPPORTUNITY SCORE (high PR + few videos = underserved niche)');
  console.log('='.repeat(70));

  console.log('\n  Rank | Topic               | Opportunity | Avg PR  | Supply');
  console.log('  ' + '-'.repeat(65));
  analysis.opportunities.forEach((t, i) => {
    console.log(
      `  ${String(i + 1).padStart(4)} | ${t.topic.padEnd(19)} ` +
      `| ${t.opportunity.toFixed(3).padStart(9)}   ` +
      `| ${t.avgPR.toFixed(3).padStart(6)}x ` +
      `| ${t.videos} videos from ${t.channels} ch`
    );
  });

  // 3. DURATION SWEET SPOT
  console.log('\n' + '='.repeat(70));
  console.log(' 3. DURATION SWEET SPOT');
  console.log('='.repeat(70));

  console.log('\n  Topic                | Top Half Dur | Bottom Half Dur | Recommendation');
  console.log('  ' + '-'.repeat(75));
  analysis.durationSweetSpot.forEach(d => {
    console.log(
      `  ${d.topic.padEnd(21)} ` +
      `| ${fmtDur(d.topHalfDuration).padStart(12)} ` +
      `| ${fmtDur(d.bottomHalfDuration).padStart(15)} ` +
      `| ${d.recommendation}`
    );
  });

  // 4. TOP VIDEOS
  console.log('\n' + '='.repeat(70));
  console.log(' 4. TOP 20 VIDEOS BY PERFORMANCE RATIO');
  console.log('='.repeat(70));

  const topVideos = [...analysis.videos].sort((a, b) => b.performanceRatio - a.performanceRatio).slice(0, 20);
  topVideos.forEach((v, i) => {
    console.log(
      `  ${String(i + 1).padStart(2)}. [PR ${v.performanceRatio.toFixed(3)}x | ` +
      `${v.views.toLocaleString().padStart(10)} views | ` +
      `${fmtDur(v.duration).padStart(6)}] ${v.channel}`
    );
    console.log(`      ${v.title}`);
    console.log(`      Topics: ${v.topics.join(', ')}`);
  });

  // 5. RECENCY TREND
  console.log('\n' + '='.repeat(70));
  console.log(' 5. RECENCY TREND (last 30 days vs 30-90 days)');
  console.log('='.repeat(70));

  console.log('\n  Topic               | Recent PR | Older PR  | Change    | Direction');
  console.log('  ' + '-'.repeat(75));
  analysis.recencyTrend.forEach(t => {
    const arrow = t.direction === 'rising' ? '>>>' : t.direction === 'falling' ? '<<<' : '---';
    console.log(
      `  ${t.topic.padEnd(19)} ` +
      `| ${t.recentPR.toFixed(3).padStart(8)}x ` +
      `| ${t.olderPR.toFixed(3).padStart(8)}x ` +
      `| ${(t.change > 0 ? '+' : '') + t.change.toFixed(3).padStart(7)}  ` +
      `| ${arrow} ${t.direction.toUpperCase()}`
    );
  });
}

main();
