/* Quantitative analysis over collected competitor data. Prints tables to stdout. */
const fs = require('fs');
const path = require('path');
const { PSYCHOLOGY_TOPIC_RULES } = require('../utils/psychology-domain');

const ROOT = path.join(__dirname, '..');
const ch = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/analysis/competitor-channels.json'))).channels;
const vd = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/analysis/competitor-top-videos.json'))).channels;
let demand = { videos: [] };
try { demand = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/analysis/psychology-demand.json'))); } catch {}

const now = Date.now();
const yrs = iso => ((now - new Date(iso).getTime()) / (365.25 * 864e5));
const med = a => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(0) + 'k' : '' + n;

// ---------- 1. CHANNEL TABLE ----------
const rows = ch.filter(c => c.subscribers > 1000) // drop dead/clone 1-sub matches
  .map(c => ({
    title: c.title, handle: c.handle, subs: c.subscribers, vids: c.videoCount,
    age: yrs(c.publishedAt), vpv: c.videoCount ? c.totalViews / c.videoCount : 0,
    upY: c.videoCount / Math.max(yrs(c.publishedAt), 0.1),
    aboutLen: (c.aboutDescription || '').length, kw: (c.keywords || '').length, country: c.country,
  })).sort((a, b) => b.subs - a.subs);

console.log('=== CHANNEL TABLE (subs>1k, n=' + rows.length + ') ===');
console.log('subs\t vids\t age(y)\t views/vid\t up/yr\t about\t kw\t country\t handle\t title');
for (const r of rows) console.log([fmt(r.subs), r.vids, r.age.toFixed(1), fmt(Math.round(r.vpv)), r.upY.toFixed(0), r.aboutLen, r.kw, r.country || '-', r.handle || '-', r.title].join('\t'));

// ---------- 2. NAMING PATTERNS ----------
const tag = name => {
  const n = name.toLowerCase(); const t = [];
  if (/psych/.test(n)) t.push('psych');
  if (/\bbrain\b/.test(n)) t.push('brain');
  if (/\bmind\b/.test(n)) t.push('mind');
  if (/\bwhy\b/.test(n)) t.push('why');
  if (/attachment/.test(n)) t.push('attachment');
  if (/explain|simplif|decode|catalyst|unlock/.test(n)) t.push('explainer-verb');
  if (/\b(dr|coach)\b|smith|gibson|rigg|fedechkin|ryan|john/.test(n)) t.push('personal');
  if (!t.length) t.push('abstract/evocative');
  return t;
};
const bucket = {};
for (const r of rows) for (const tg of tag(r.title)) { (bucket[tg] ||= []).push(r); }
console.log('\n=== NAMING PATTERN BUCKETS (median subs, channels) ===');
console.log('bucket\tcount\tmedianSubs\twords(med)\texamples');
for (const [k, arr] of Object.entries(bucket).sort((a, b) => b[1].length - a[1].length)) {
  const wl = med(arr.map(r => r.title.split(/\s+/).length));
  console.log([k, arr.length, fmt(Math.round(med(arr.map(r => r.subs)))), wl, arr.slice(0, 3).map(r => r.title).join(' | ')].join('\t'));
}
console.log('\nname word-count distribution (all):', JSON.stringify(rows.reduce((a, r) => { const w = r.title.split(/\s+/).length; a[w] = (a[w] || 0) + 1; return a; }, {})));

// ---------- 3. ABOUT TEXT ----------
const abouts = ch.filter(c => c.subscribers > 50000);
console.log('\n=== ABOUT TEXT (channels>50k) ===');
console.log('empty about:', abouts.filter(c => !(c.aboutDescription || '').trim()).length, '/', abouts.length);
console.log('about length median chars:', med(abouts.map(c => (c.aboutDescription || '').length)));
console.log('\n-- sample About texts (top channels) --');
for (const c of [...abouts].sort((a, b) => b.subscribers - a.subscribers).slice(0, 8)) {
  console.log(`\n### ${c.title} (${fmt(c.subscribers)} subs) handle=${c.handle} kwLen=${(c.keywords || '').length}`);
  console.log((c.aboutDescription || '(empty)').slice(0, 600).replace(/\n+/g, ' / '));
  if (c.keywords) console.log('KEYWORDS:', c.keywords.slice(0, 200));
}

// ---------- 4. TITLE FORMULAS (normalized by views/sub) ----------
const subsById = Object.fromEntries(ch.map(c => [c.id, c.subscribers]));
const allVids = [];
for (const c of vd) for (const v of c.videos) {
  const subs = c.subscribers || subsById[c.channelId] || 0;
  if (subs > 5000) allVids.push({ ...v, channel: c.name, subs, vps: subs ? v.views / subs : 0 });
}
const formula = t => {
  const s = t.toLowerCase();
  if (/^why (you|we|your|i|do|are|is|am)/.test(s)) return 'Why you/we/I...';
  if (/^why /.test(s)) return 'Why [topic]...';
  if (/\b\d+\s+(ways|signs|things|types|traits|habits|reasons|rules|stages|truths|tips)\b/.test(s) || /^\d+ /.test(s)) return 'Number listicle';
  if (/^the psychology of|psychology of /.test(s)) return 'The psychology of...';
  if (/people who|signs (you|of)|things that|if you/.test(s)) return 'People who / Signs you...';
  if (/effect|bias|fallacy|syndrome|paradox|theory|principle|complex/.test(s)) return 'Named concept (effect/bias)';
  if (/\?$/.test(t)) return 'Question';
  if (/^how (to|your|you)/.test(s)) return 'How to / How your...';
  return 'Other / statement';
};
const fb = {};
for (const v of allVids) (fb[formula(v.title)] ||= []).push(v);
console.log('\n=== TITLE FORMULA (videos from channels>5k subs, n=' + allVids.length + ') ===');
console.log('formula\tcount\tmedianViews\tmedian views/sub\texample');
for (const [k, arr] of Object.entries(fb).sort((a, b) => med(b[1].map(v => v.vps)) - med(a[1].map(v => v.vps)))) {
  console.log([k, arr.length, fmt(Math.round(med(arr.map(v => v.views)))), med(arr.map(v => v.vps)).toFixed(3), arr.sort((a,b)=>b.vps-a.vps)[0].title.slice(0, 50)].join('\t'));
}

// ---------- 5. TOPIC DEMAND ----------
const classify = title => {
  const s = title.toLowerCase(); const hits = [];
  for (const r of PSYCHOLOGY_TOPIC_RULES) if (r.keywords.some(k => s.includes(k))) hits.push(r.topic);
  return hits.length ? hits : ['(unclassified)'];
};
const tb = {};
for (const v of allVids) for (const tp of classify(v.title)) (tb[tp] ||= []).push(v);
console.log('\n=== TOPIC DEMAND (by median views/sub, competitor top-videos) ===');
console.log('topic\tcount\tmedianViews\tmedian views/sub');
for (const [k, arr] of Object.entries(tb).sort((a, b) => med(b[1].map(v => v.vps)) - med(a[1].map(v => v.vps)))) {
  console.log([k, arr.length, fmt(Math.round(med(arr.map(v => v.views)))), med(arr.map(v => v.vps)).toFixed(3)].join('\t'));
}

// demand.json cross-check (Psych2Go-heavy recent uploads)
if (demand.videos && demand.videos.length) {
  const dvalid = demand.videos.filter(v => v.views > 0 && v.subs > 0).map(v => ({ ...v, vps: v.views / v.subs }));
  const dtb = {};
  for (const v of dvalid) for (const tp of (v.topics && v.topics.length ? v.topics : classify(v.title))) (dtb[tp] ||= []).push(v);
  console.log('\n=== TOPIC DEMAND cross-check (psychology-demand.json, n=' + dvalid.length + ', by median views/sub) ===');
  for (const [k, arr] of Object.entries(dtb).sort((a, b) => med(b[1].map(v => v.vps)) - med(a[1].map(v => v.vps)))) {
    console.log([k, arr.length, fmt(Math.round(med(arr.map(v => v.views)))), med(arr.map(v => v.vps)).toFixed(4)].join('\t'));
  }
}

// ---------- 6. duration mix ----------
const durs = allVids.map(v => v.duration).filter(Boolean);
console.log('\n=== DURATION (top videos) ===');
console.log('shorts(<=60s):', durs.filter(d => d <= 60).length, '| 1-5m:', durs.filter(d => d > 60 && d <= 300).length, '| 5-12m:', durs.filter(d => d > 300 && d <= 720).length, '| 12-30m:', durs.filter(d => d > 720 && d <= 1800).length, '| >30m:', durs.filter(d => d > 1800).length, '| median(s):', med(durs));
