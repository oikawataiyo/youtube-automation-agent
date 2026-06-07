/**
 * Investment domain configuration for the investor_digest channel.
 * Targets English-speaking senior / retirement investors (high-CPM lane).
 * Defines topic classification rules used by competitor demand analysis.
 */

const INVESTOR_TOPIC_RULES = [
  { topic: 'Dividend Investing',        keywords: ['dividend', 'dividends', 'yield', 'payout', 'drip', 'dividend growth', 'dividend stocks', 'dividend portfolio', 'dividend income', 'high yield'] },
  { topic: 'Retirement Planning',       keywords: ['retire', 'retirement', '401k', '401(k)', 'ira', 'roth', 'pension', 'rmd', 'required minimum', 'nest egg', 'withdrawal rate', '4% rule', 'retiring', 'retired'] },
  { topic: 'Social Security',           keywords: ['social security', 'ssa', 'cola', 'full retirement age', 'fra', 'claiming', 'spousal benefit', 'survivor benefit', 'social security benefit'] },
  { topic: 'Medicare & Healthcare',     keywords: ['medicare', 'medigap', 'medicare advantage', 'part b', 'part d', 'long-term care', 'healthcare cost', 'health insurance retirement'] },
  { topic: 'Bonds & Treasuries',        keywords: ['bond', 'bonds', 'treasury', 'treasuries', 't-bill', 'tips', 'i bond', 'ibond', 'cd ladder', 'fixed income', 'yield curve', 'money market'] },
  { topic: 'Index Funds & ETFs',        keywords: ['index fund', 'etf', 'etfs', 's&p 500', 'sp500', 'vanguard', 'vti', 'voo', 'bogle', 'boglehead', 'passive investing', 'total market'] },
  { topic: 'Stock Market Basics',       keywords: ['stock market', 'stocks', 'how to invest', 'investing for beginners', 'brokerage', 'portfolio', 'compound interest', 'start investing'] },
  { topic: 'Inflation & Economy',       keywords: ['inflation', 'recession', 'fed ', 'federal reserve', 'interest rate', 'cpi', 'economy', 'deflation', 'rate cut', 'rate hike', 'economic'] },
  { topic: 'Taxes & Estate',            keywords: ['tax', 'taxes', 'capital gains', 'estate', 'inheritance', 'trust', 'will ', 'roth conversion', 'tax-free', 'tax free', 'tax strategy'] },
  { topic: 'Real Estate & Passive Income', keywords: ['real estate', 'rental', 'reit', 'reits', 'rental property', 'passive income', 'cash flow', 'landlord'] },
  { topic: 'Annuities & Insurance',     keywords: ['annuity', 'annuities', 'guaranteed income', 'life insurance', 'whole life', 'insurance'] },
  { topic: 'Financial Freedom & FIRE',  keywords: ['financial freedom', 'fire', 'financial independence', 'early retirement', 'millionaire', 'net worth', 'build wealth', 'wealth'] },
  { topic: 'Stock Picks & Analysis',    keywords: ['stock analysis', 'undervalued', 'buy now', 'best stocks', 'growth stocks', 'blue chip', 'warren buffett', 'berkshire', 'value investing', 'stocks to buy'] },
];

/**
 * Classify a video/channel title into one or more investment topics.
 * @param {string} title
 * @returns {string[]} matched topics (['(unclassified)'] if none)
 */
function classifyInvestorTopic(title) {
  const s = (title || '').toLowerCase();
  const hits = [];
  for (const r of INVESTOR_TOPIC_RULES) if (r.keywords.some(k => s.includes(k))) hits.push(r.topic);
  return hits.length ? hits : ['(unclassified)'];
}

module.exports = { INVESTOR_TOPIC_RULES, classifyInvestorTopic };
