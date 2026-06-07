/**
 * Reddit Data API client (application-only OAuth, read-only).
 *
 * Uses the `client_credentials` grant — sufficient for collecting public
 * threads/comments without a Reddit username/password. Required secrets are
 * REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET / REDDIT_USER_AGENT (see .env.example).
 *
 * Terms gate: tasks/reddit-api-terms.md (CONDITIONAL OK — non-commercial dev).
 *
 * Exports a thin, reusable client so the later collector (scripts/reddit/collect.js)
 * can call redditGet() without re-implementing auth, token caching, or backoff.
 */

const axios = require('axios');
const { Logger } = require('../../utils/logger');

const logger = new Logger('Reddit');

const TOKEN_URL = 'https://www.reddit.com/api/v1/access_token';
const API_BASE = 'https://oauth.reddit.com';
const TOKEN_REFRESH_BUFFER_MS = 60 * 1000; // refresh 60s before expiry
const MAX_RETRIES = 4;

// In-memory token cache (per process). { accessToken, expiresAt }
let tokenCache = null;

/**
 * Read and validate required Reddit env vars. Fail-fast with a clear message.
 * @returns {{ clientId: string, clientSecret: string, userAgent: string }}
 */
function getRequiredEnv() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const userAgent = process.env.REDDIT_USER_AGENT;

  const missing = [];
  if (!clientId) missing.push('REDDIT_CLIENT_ID');
  if (!clientSecret) missing.push('REDDIT_CLIENT_SECRET');
  if (!userAgent) missing.push('REDDIT_USER_AGENT');

  if (missing.length > 0) {
    throw new Error(
      `Missing Reddit env var(s): ${missing.join(', ')}. ` +
        'Create a "script" app at https://www.reddit.com/prefs/apps and fill .env ' +
        '(see .env.example).'
    );
  }
  return { clientId, clientSecret, userAgent };
}

/**
 * Obtain an application-only access token via client_credentials grant.
 * Cached in-memory and reused until shortly before expiry.
 * @param {{ force?: boolean }} [opts] - force a refresh, ignoring the cache.
 * @returns {Promise<string>} bearer access token
 */
async function getAccessToken(opts = {}) {
  if (!opts.force && tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }

  const { clientId, clientSecret, userAgent } = getRequiredEnv();

  let response;
  try {
    response = await axios({
      method: 'post',
      url: TOKEN_URL,
      auth: { username: clientId, password: clientSecret },
      headers: {
        'User-Agent': userAgent,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: 'grant_type=client_credentials',
      timeout: 15000,
    });
  } catch (error) {
    // Do not log secrets; surface a clean auth error.
    const status = error.response && error.response.status;
    const hint =
      status === 401
        ? ' (401 — check REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET)'
        : '';
    throw new Error(`Reddit token request failed${hint}: ${describeAxiosError(error)}`);
  }

  const { access_token: accessToken, expires_in: expiresIn } = response.data || {};
  if (!accessToken) {
    throw new Error('Reddit token response missing access_token.');
  }

  const ttlMs = (Number(expiresIn) || 3600) * 1000;
  tokenCache = {
    accessToken,
    expiresAt: Date.now() + ttlMs - TOKEN_REFRESH_BUFFER_MS,
  };
  logger.info(`Obtained Reddit access token (ttl ~${Math.round(ttlMs / 1000)}s).`);
  return accessToken;
}

/**
 * GET a Reddit API resource with auth, descriptive User-Agent, 401 re-auth,
 * and exponential backoff for 429/5xx.
 * @param {string} pathname - e.g. "/r/investing/hot" (leading slash optional)
 * @param {Record<string, string|number>} [params] - query params
 * @returns {Promise<{ data: any, rateLimit: { remaining: number|null, reset: number|null, used: number|null } }>}
 */
async function redditGet(pathname, params = {}) {
  const { userAgent } = getRequiredEnv();
  const url = `${API_BASE}/${String(pathname).replace(/^\/+/, '')}`;

  let attempt = 0;
  let reauthed = false;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const token = await getAccessToken();
    try {
      const response = await axios({
        method: 'get',
        url,
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': userAgent,
        },
        timeout: 20000,
      });
      return { data: response.data, rateLimit: parseRateLimit(response.headers) };
    } catch (error) {
      const status = error.response && error.response.status;

      // Token may have been revoked early — retry once with a fresh token.
      if (status === 401 && !reauthed) {
        reauthed = true;
        await getAccessToken({ force: true });
        continue;
      }

      // Rate limited or transient server error — exponential backoff.
      if ((status === 429 || (status >= 500 && status < 600)) && attempt < MAX_RETRIES) {
        const waitMs = backoffMs(attempt, error.response && error.response.headers);
        attempt += 1;
        logger.warn(
          `Reddit GET ${pathname} → ${status}; retry ${attempt}/${MAX_RETRIES} in ${waitMs}ms.`
        );
        await sleep(waitMs);
        continue;
      }

      throw new Error(`Reddit GET ${pathname} failed: ${describeAxiosError(error)}`);
    }
  }
}

function parseRateLimit(headers = {}) {
  const num = (v) => (v === undefined || v === null || v === '' ? null : Number(v));
  return {
    remaining: num(headers['x-ratelimit-remaining']),
    reset: num(headers['x-ratelimit-reset']),
    used: num(headers['x-ratelimit-used']),
  };
}

function backoffMs(attempt, headers = {}) {
  // Honor Reddit's reset hint when present, else exponential 1s,2s,4s,8s (+jitter).
  const reset = headers && headers['x-ratelimit-reset'];
  if (reset !== undefined && Number(reset) > 0) {
    return Math.min(Number(reset) * 1000, 60000);
  }
  return 2 ** attempt * 1000 + Math.floor(Math.random() * 500);
}

function describeAxiosError(error) {
  if (error.response) {
    return `HTTP ${error.response.status} ${error.response.statusText || ''}`.trim();
  }
  if (error.code) return error.code;
  return error.message;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { getRequiredEnv, getAccessToken, redditGet, API_BASE };
