/**
 * Reddit API connectivity probe (CLI).
 *
 * Verifies that the configured Reddit credentials work end-to-end:
 *   env present -> OAuth token -> public read endpoint -> sample result.
 *
 * Usage:  npm run reddit:probe
 *         node scripts/reddit/probe.js [r/<subreddit>]   (default: r/investing)
 *
 * Exits 0 on success, 1 on any failure (with a clean, secret-free message).
 */

require('dotenv').config();

const { getRequiredEnv, getAccessToken, redditGet } = require('./auth');

async function main() {
  const arg = process.argv[2];
  const subreddit = (arg && arg.replace(/^\/?r\//i, '')) || 'investing';

  console.log('🔎 Reddit API probe\n');

  // 1) Env present?
  getRequiredEnv();
  console.log('✅ Required env vars present (REDDIT_CLIENT_ID / SECRET / USER_AGENT)');

  // 2) Token?
  await getAccessToken();
  console.log('✅ OAuth access token obtained (application-only / client_credentials)');

  // 3) Public read?
  const { data, rateLimit } = await redditGet(`/r/${subreddit}/hot`, {
    limit: 1,
    raw_json: 1,
  });

  const child = data && data.data && data.data.children && data.data.children[0];
  const post = child && child.data;
  if (!post) {
    throw new Error(`No posts returned for r/${subreddit} (unexpected response shape).`);
  }

  console.log(`✅ HTTP 200 — fetched r/${subreddit}/hot\n`);
  console.log('   Sample thread:');
  console.log(`     title : ${post.title}`);
  console.log(`     author: u/${post.author}`);
  console.log(`     score : ${post.score}  comments: ${post.num_comments}`);
  console.log(`     link  : https://www.reddit.com${post.permalink}`);
  console.log('\n   Rate limit:');
  console.log(`     remaining: ${fmt(rateLimit.remaining)}  used: ${fmt(rateLimit.used)}  reset(s): ${fmt(rateLimit.reset)}`);

  console.log('\n🎉 Reddit API is ready.');
}

function fmt(v) {
  return v === null || v === undefined ? 'n/a' : v;
}

main().catch((error) => {
  console.error(`\n❌ Probe failed: ${error.message}`);
  console.error('   → Check .env values and tasks/reddit-api-terms.md (app may need pre-approval).');
  process.exit(1);
});
