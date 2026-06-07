#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function usage() {
  console.error('Usage: node scripts/build-wordlevel-video.js <project-dir>');
  process.exit(1);
}

const projectDir = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!projectDir) usage();

const segmentsPath = path.join(projectDir, 'assets', 'segments.json');
const narrationDir = path.join(projectDir, 'assets', 'narration');
if (!fs.existsSync(segmentsPath)) throw new Error(`Missing ${segmentsPath}`);
if (!fs.existsSync(narrationDir)) throw new Error(`Missing ${narrationDir}`);

const projectId = path.basename(projectDir);
const segments = JSON.parse(fs.readFileSync(segmentsPath, 'utf8'));
const ROOT = path.resolve(__dirname, '..');

function ensureVendorAssets() {
  const src = path.join(ROOT, 'scripts', 'vendor', 'gsap.min.js');
  const dest = path.join(projectDir, 'assets', 'vendor', 'gsap.min.js');
  if (!fs.existsSync(src)) throw new Error(`Missing shared GSAP vendor file: ${src}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (!fs.existsSync(dest) || fs.statSync(dest).size !== fs.statSync(src).size) {
    fs.copyFileSync(src, dest);
  }
}

ensureVendorAssets();

function clean(text) {
  return String(text || '')
    .replace(/\uFFFD/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function words(text) {
  return clean(text).split(/\s+/).filter(Boolean);
}

function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

function js(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function ffprobeDuration(filePath) {
  const out = execFileSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    filePath,
  ], { encoding: 'utf8' }).trim();
  const duration = Number(out);
  if (!Number.isFinite(duration)) throw new Error(`ffprobe duration failed for ${filePath}`);
  return Math.round(duration * 100) / 100;
}

function mediaForSegment(index, segment) {
  const prefix = String(index).padStart(2, '0');
  const txt = fs.readdirSync(narrationDir)
    .find((name) => name.startsWith(`${prefix}-`) && name.endsWith('.txt'));
  if (!txt) throw new Error(`Missing narration txt for segment ${prefix}`);
  const stem = txt.slice(0, -4);
  const wav = path.join(narrationDir, `${stem}.wav`);
  const wordsJs = path.join(narrationDir, `${prefix}-words.js`);
  if (!fs.existsSync(wav)) throw new Error(`Missing generated WAV: ${wav}`);
  if (!fs.existsSync(wordsJs)) throw new Error(`Missing word timing JS: ${wordsJs}`);
  return {
    txt,
    stem,
    wav,
    wordsJs,
    wordsVar: `SEG${prefix}_WORDS`,
    audioSrc: `assets/narration/${stem}.wav`,
    wordsSrc: `assets/narration/${prefix}-words.js`,
    duration: ffprobeDuration(wav),
    sourceSegment: segment,
  };
}

let current = 0;
const media = segments.map((segment, index) => {
  const item = mediaForSegment(index, segment);
  item.start = Math.round(current * 100) / 100;
  item.end = Math.round((item.start + item.duration) * 100) / 100;
  current = item.end;
  return item;
});
const totalDuration = Math.round(current * 100) / 100;

const timedSegments = segments.map((segment, index) => ({
  ...segment,
  start: media[index].start,
  end: media[index].end,
  duration: media[index].duration,
  wordsVar: media[index].wordsVar,
  audioSrc: media[index].audioSrc,
}));

fs.writeFileSync(segmentsPath, `${JSON.stringify(timedSegments, null, 2)}\n`);

function hashCode(text) {
  let hash = 2166136261;
  for (const char of String(text)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function titleHtml(title) {
  const parts = words(title);
  const markerAt = Math.min(parts.length - 1, Math.max(0, Math.floor(parts.length * 0.58)));
  return parts.map((word, i) => i === markerAt ? `<span class="marker">${esc(word)}</span>` : esc(word)).join(' ');
}

function labelFor(segment) {
  const register = segment.register || '';
  if (register === 'hook') return 'PSYCHOLOGY FIELD NOTE';
  if (register === 'practice') return 'INTERVENTION DESIGN';
  if (register === 'industry') return 'MARKET PRESSURE';
  if (register === 'decision') return 'BEHAVIORAL CAPTURE';
  if (register === 'archive') return 'NEURAL EVIDENCE';
  return 'HIDDEN MECHANISM';
}

function beatWord(segment) {
  const candidates = words(`${segment.heading} ${segment.title}`)
    .map((w) => w.replace(/[^a-zA-Z]/g, ''))
    .filter((w) => w.length > 5);
  return (candidates[Math.min(1, candidates.length - 1)] || 'THRESHOLD').toUpperCase();
}

function motifWords(segment) {
  const stop = new Set('the a an and or of in on with to from into by for is are was were be been being this that then it its as at up down out over under before after'.split(' '));
  const source = clean(segment.visualNote || segment.narration)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ');
  const counts = new Map();
  for (const word of source.split(/\s+/)) {
    if (word.length < 4 || stop.has(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, 6)
    .map(([word]) => word.toUpperCase());
}

function visualKind(segment) {
  if (segment.register === 'industry') return 'industry';
  if (segment.register === 'decision') return 'decision';
  if (segment.register === 'practice') return 'practice';
  if (segment.register === 'outro') return 'outro';
  if (segment.register === 'archive') return 'scanner';
  if (segment.register === 'lab') return 'lab';
  const text = `${segment.heading} ${segment.visualNote} ${segment.narration}`.toLowerCase();
  if (/clock|eeg|oscilloscope|lab|finger|button|readiness|libet/.test(text)) return 'lab';
  if (/fmri|scanner|brain|threshold|predict/.test(text)) return 'scanner';
  if (/book|industry|self-help|marshmallow|genes|sleep|blood|housing/.test(text)) return 'industry';
  if (/form|default|menu|contract|moral|judgment|architecture|addiction/.test(text)) return 'decision';
  if (/workshop|jig|contract|mindfulness|identity|design|review|curtain/.test(text)) return 'practice';
  if (/outro|closing|question|thought/.test(text)) return 'outro';
  return 'signal';
}

function motifHtml(segment, index) {
  const kind = visualKind(segment);
  const tags = motifWords(segment);
  const tagHtml = tags.map((tag, i) => `<span class="motif-tag t${i}">${esc(tag)}</span>`).join('');
  if (kind === 'lab') {
    return `<div class="motif motif-lab">
          <div class="clock"><div class="hand"></div><div class="pin"></div></div>
          <div class="button"></div>
          <svg class="wave" viewBox="0 0 620 250"><path d="M0 190 C90 184 124 176 170 156 C228 130 252 94 314 84 C392 70 452 116 520 66 C564 34 590 28 620 26"/></svg>
          <div class="threshold"></div>${tagHtml}
        </div>`;
  }
  if (kind === 'scanner') {
    return `<div class="motif motif-scanner">
          <div class="scanner-ring"></div><div class="scanner-bed"></div>
          ${[0,1,2,3,4,5].map((n) => `<div class="brain b${n}"></div>`).join('')}
          <svg class="wave" viewBox="0 0 620 250"><path d="M0 206 C74 214 112 148 164 150 C226 152 234 78 298 82 C374 86 406 40 470 52 C528 62 554 28 620 30"/></svg>
          <div class="threshold"></div>${tagHtml}
        </div>`;
  }
  if (kind === 'industry') {
    return `<div class="motif motif-industry">
          ${[0,1,2,3,4,5,6].map((n) => `<div class="book bk${n}"></div>`).join('')}
          ${[0,1,2,3].map((n) => `<div class="envelope ev${n}"></div>`).join('')}
          <div class="basement"></div>${tagHtml}
        </div>`;
  }
  if (kind === 'decision') {
    return `<div class="motif motif-decision">
          <div class="form left-form"><span>DEFAULT</span><i></i><i></i><i></i></div>
          <div class="form right-form"><span>INTENTION</span><i></i><i></i><i></i></div>
          <div class="pen"></div><div class="early-shadow"></div>
          <svg class="wave" viewBox="0 0 620 250"><path d="M0 170 C92 120 130 224 208 152 C286 80 346 96 406 70 C496 30 548 58 620 18"/></svg>
          ${tagHtml}
        </div>`;
  }
  if (kind === 'practice') {
    return `<div class="motif motif-practice">
          <div class="bench"></div>
          ${[0,1,2,3,4].map((n) => `<div class="jig j${n}"><span></span></div>`).join('')}
          <div class="screw"></div><div class="doorline"></div>${tagHtml}
        </div>`;
  }
  if (kind === 'outro') {
    return `<div class="motif motif-outro">
          <div class="single-line"></div><div class="question">?</div>
          ${[0,1,2,3,4].map((n) => `<div class="lever l${n}"></div>`).join('')}
          ${tagHtml}
        </div>`;
  }
  return `<div class="motif motif-signal">
          <svg class="wave" viewBox="0 0 620 250"><path d="M0 190 C90 184 124 176 170 156 C228 130 252 94 314 84 C392 70 452 116 520 66 C564 34 590 28 620 26"/></svg>
          <div class="threshold"></div>${tagHtml}
        </div>`;
}

function sceneHtml(segment, index) {
  const lead = words(segment.narration).slice(0, 34).join(' ');
  return `<section id="${esc(segment.id)}" class="scene clip ${visualKind(segment)}" data-start="${segment.start}" data-duration="${segment.duration}" data-track-index="${index + 1}">
        <div class="kicker">${esc(labelFor(segment))} &nbsp;/&nbsp; <b>${esc(segment.part)}</b></div>
        <div class="line"></div>
        <div class="title">${titleHtml(segment.title)}</div>
        <div class="thesis">${esc(lead)}...</div>
        <div class="diagram">
          <div class="panel"></div>
          <div class="axis-x"></div>
          <div class="axis-y"></div>
          <div class="hidden-band"></div>
          ${motifHtml(segment, index)}
          <div class="visual-note">${esc(words(segment.visualNote).slice(0, 24).join(' '))}</div>
        </div>
        <div class="beat-word">${esc(beatWord(segment))}</div>
        <div class="caps"></div>
      </section>`;
}

const scriptTags = media.map((item) => `    <script src="${item.wordsSrc}"></script>`).join('\n');
const audioTags = media.map((item, index) => {
  const seg = timedSegments[index];
  return `      <audio id="audio-${String(index).padStart(2, '0')}" data-start="${seg.start}" data-duration="${seg.duration}" data-track-index="${20 + index}" src="${item.audioSrc}" data-volume="1" preload="none"></audio>`;
}).join('\n');

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="assets/vendor/gsap.min.js"></script>
${scriptTags}
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: 1920px; height: 1080px; overflow: hidden; background: #0a0c10;
        --bg: #0a0c10; --bg-grid: #141925; --bone: #e8e4d8; --steel: #9aa6b2;
        --ink: #f4efe6; --mute: #5b6472; --alarm: #d8392e; --warn: #ff5a3c; --gold: #caa86a;
        font-family: "Helvetica Neue", Arial, sans-serif;
      }
      #root { position: absolute; inset: 0; background: var(--bg); color: var(--ink); }
      #texture { position: absolute; inset: 0; overflow: hidden; }
      #grid { position: absolute; inset: 0; background-image: linear-gradient(var(--bg-grid) 1px, transparent 1px), linear-gradient(90deg, var(--bg-grid) 1px, transparent 1px); background-size: 64px 64px; opacity: 0; }
      #vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 72% 60% at 50% 45%, transparent 36%, rgba(0,0,0,0.66) 100%); }
      .particle { position: absolute; width: 3px; height: 3px; border-radius: 50%; background: #3a4658; opacity: 0; }
      .scene { position: absolute; inset: 0; opacity: 0; overflow: hidden; }
      .kicker { position: absolute; left: 88px; top: 84px; font-size: 22px; letter-spacing: 0.26em; text-transform: uppercase; color: var(--steel); }
      .kicker b { color: var(--gold); font-weight: 700; }
      .line { position: absolute; left: 88px; top: 122px; width: 300px; height: 2px; background: var(--steel); opacity: 0.45; transform-origin: left center; }
      .title { position: absolute; left: 120px; top: 206px; width: 1020px; font-size: 62px; line-height: 1.02; letter-spacing: 0; font-weight: 800; text-transform: uppercase; color: var(--ink); }
      .title .marker { color: var(--gold); }
      .thesis { position: absolute; left: 128px; top: 504px; width: 780px; font-size: 38px; line-height: 1.27; color: var(--steel); font-weight: 300; }
      .diagram { position: absolute; right: 110px; top: 176px; width: 670px; height: 620px; }
      .panel { position: absolute; inset: 0; border: 1px solid rgba(154,166,178,0.38); background: rgba(10,12,16,0.26); }
      .axis-x, .axis-y { position: absolute; background: rgba(154,166,178,0.48); transform-origin: left center; }
      .axis-x { left: 74px; bottom: 102px; width: 512px; height: 2px; }
      .axis-y { left: 74px; bottom: 102px; width: 2px; height: 392px; }
      .hidden-band { position: absolute; left: 74px; right: 84px; bottom: 78px; height: 76px; background: linear-gradient(180deg, rgba(216,57,46,0), rgba(216,57,46,0.24)); opacity: 0; }
      .visual-note { position: absolute; left: 46px; right: 46px; bottom: 36px; font-size: 19px; line-height: 1.35; color: var(--steel); letter-spacing: 0.04em; text-transform: uppercase; opacity: 0.68; }
      .beat-word { position: absolute; right: 138px; top: 824px; color: var(--warn); font-size: 42px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0; }
      .caps { position: absolute; left: 50%; bottom: 86px; transform: translateX(-50%); width: 1500px; height: 135px; text-align: center; }
      .phrase { position: absolute; left: 0; right: 0; bottom: 0; opacity: 0; color: var(--mute); font-size: 42px; line-height: 1.35; font-weight: 400; }
      .phrase .w { color: var(--mute); transition: none; }
      .motif { position: absolute; inset: 0; }
      .motif-tag { position: absolute; color: rgba(154,166,178,0.78); border: 1px solid rgba(154,166,178,0.32); padding: 8px 12px; font-size: 16px; letter-spacing: 0.14em; opacity: 0; }
      .t0 { left: 58px; top: 48px; } .t1 { right: 58px; top: 62px; } .t2 { left: 82px; bottom: 168px; } .t3 { right: 70px; bottom: 188px; } .t4 { left: 300px; top: 96px; } .t5 { right: 220px; bottom: 122px; }
      .wave { position: absolute; left: 46px; top: 178px; width: 578px; height: 260px; overflow: visible; }
      .wave path { fill: none; stroke: var(--gold); stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 900; stroke-dashoffset: 900; }
      .threshold { position: absolute; left: 76px; top: 294px; width: 520px; height: 2px; background: var(--alarm); opacity: 0; transform-origin: left center; }
      .clock { position: absolute; left: 76px; top: 90px; width: 150px; height: 150px; border: 2px solid rgba(232,228,216,0.72); border-radius: 50%; }
      .hand { position: absolute; left: 74px; top: 16px; width: 2px; height: 60px; background: var(--warn); transform-origin: 50% 59px; }
      .pin { position: absolute; left: 68px; top: 68px; width: 14px; height: 14px; border-radius: 50%; background: var(--bone); }
      .button { position: absolute; right: 106px; top: 348px; width: 128px; height: 44px; border-radius: 24px; border: 2px solid var(--gold); box-shadow: 0 0 28px rgba(202,168,106,0.16); }
      .scanner-ring { position: absolute; left: 190px; top: 80px; width: 280px; height: 280px; border: 30px solid rgba(232,228,216,0.12); border-radius: 50%; outline: 2px solid rgba(154,166,178,0.45); }
      .scanner-bed { position: absolute; left: 126px; top: 330px; width: 410px; height: 24px; background: rgba(154,166,178,0.28); }
      .brain { position: absolute; width: 46px; height: 34px; border-radius: 50%; background: rgba(255,90,60,0.16); opacity: 0; }
      .b0 { left: 272px; top: 162px; } .b1 { left: 342px; top: 176px; } .b2 { left: 308px; top: 222px; } .b3 { left: 390px; top: 228px; } .b4 { left: 250px; top: 236px; } .b5 { left: 358px; top: 126px; }
      .book { position: absolute; bottom: 196px; width: 54px; height: 230px; background: rgba(202,168,106,0.18); border: 1px solid rgba(202,168,106,0.46); transform-origin: bottom center; }
      .bk0 { left: 112px; height: 210px; } .bk1 { left: 174px; height: 250px; } .bk2 { left: 240px; height: 190px; } .bk3 { left: 304px; height: 270px; } .bk4 { left: 370px; height: 222px; } .bk5 { left: 434px; height: 244px; } .bk6 { left: 500px; height: 200px; }
      .basement { position: absolute; left: 78px; right: 78px; bottom: 122px; height: 60px; background: rgba(216,57,46,0.18); opacity: 0; }
      .envelope { position: absolute; width: 116px; height: 64px; border: 1px solid rgba(154,166,178,0.48); opacity: 0; }
      .ev0 { left: 118px; bottom: 86px; } .ev1 { left: 250px; bottom: 86px; } .ev2 { left: 382px; bottom: 86px; } .ev3 { left: 514px; bottom: 86px; }
      .form { position: absolute; top: 140px; width: 230px; height: 292px; border: 1px solid rgba(232,228,216,0.38); color: var(--steel); font-size: 18px; letter-spacing: 0.1em; padding: 24px; }
      .left-form { left: 88px; } .right-form { right: 88px; }
      .form i { display: block; height: 2px; background: rgba(154,166,178,0.42); margin-top: 38px; }
      .pen { position: absolute; left: 310px; top: 250px; width: 170px; height: 8px; background: var(--gold); transform: rotate(-20deg); transform-origin: left center; }
      .early-shadow { position: absolute; left: 348px; top: 238px; width: 116px; height: 116px; border-radius: 50%; background: rgba(216,57,46,0.14); opacity: 0; }
      .bench { position: absolute; left: 70px; right: 70px; bottom: 166px; height: 22px; background: rgba(202,168,106,0.36); }
      .jig { position: absolute; bottom: 188px; width: 82px; height: 70px; border: 1px solid rgba(232,228,216,0.38); opacity: 0; }
      .jig span { position: absolute; left: 10px; right: 10px; top: 34px; height: 2px; background: rgba(216,57,46,0.52); }
      .j0 { left: 106px; } .j1 { left: 214px; } .j2 { left: 322px; } .j3 { left: 430px; } .j4 { left: 538px; }
      .screw { position: absolute; left: 356px; top: 248px; width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--gold); }
      .doorline { position: absolute; right: 104px; top: 112px; width: 2px; height: 330px; background: rgba(154,166,178,0.42); }
      .single-line { position: absolute; left: 92px; right: 92px; top: 304px; height: 3px; background: var(--bone); transform-origin: left center; }
      .question { position: absolute; left: 50%; top: 190px; transform: translateX(-50%); font-size: 190px; color: var(--gold); opacity: 0; }
      .lever { position: absolute; bottom: 172px; width: 8px; height: 150px; background: rgba(154,166,178,0.42); transform-origin: bottom center; }
      .l0 { left: 160px; } .l1 { left: 250px; } .l2 { left: 340px; } .l3 { left: 430px; } .l4 { left: 520px; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${totalDuration}" data-width="1920" data-height="1080">
${audioTags}
      <div id="texture" class="clip" data-start="0" data-duration="${totalDuration}" data-track-index="0">
        <div id="grid"></div><div id="particles"></div><div id="vignette"></div>
      </div>
      ${timedSegments.map(sceneHtml).join('\n      ')}
    </div>
    <script>
      const PROJECT_ID = ${js(projectId)};
      const SEGMENTS = ${js(timedSegments)};
      function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
      const rnd = mulberry32(${hashCode(projectId)});
      const particleHost = document.getElementById("particles");
      for (let i = 0; i < 96; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.left = (rnd() * 1920).toFixed(1) + "px";
        p.style.top = (rnd() * 1080).toFixed(1) + "px";
        p.style.transform = "scale(" + (0.5 + rnd() * 1.5).toFixed(2) + ")";
        p.dataset.drift = (rnd() * 2 - 1).toFixed(3);
        particleHost.appendChild(p);
      }

      function wordsFor(segment) {
        return window[segment.wordsVar] || [];
      }

      function buildPhrases(words) {
        const phrases = [];
        let current = [];
        words.forEach((word) => {
          current.push(word);
          const tooLong = current.length >= 10;
          const sentenceEnd = /[.!?]$/.test(word[0]);
          if (sentenceEnd || tooLong) {
            phrases.push(current);
            current = [];
          }
        });
        if (current.length) phrases.push(current);
        return phrases;
      }

      function makeWordCaptions(scene, segment) {
        const host = scene.querySelector(".caps");
        scene._captionPhrases = [];
        buildPhrases(wordsFor(segment)).forEach((phrase) => {
          const div = document.createElement("div");
          div.className = "phrase";
          phrase.forEach((word) => {
            const span = document.createElement("span");
            span.className = "w";
            span.textContent = word[0] + " ";
            span.dataset.start = word[1];
            span.dataset.end = word[2];
            div.appendChild(span);
          });
          host.appendChild(div);
          scene._captionPhrases.push({
            el: div,
            start: phrase[0][1],
            end: phrase[phrase.length - 1][2],
            words: Array.from(div.querySelectorAll(".w")),
          });
        });
      }

      SEGMENTS.forEach((segment) => makeWordCaptions(document.getElementById(segment.id), segment));

      function syncCaptions(scene, localTime) {
        const phrases = scene._captionPhrases || [];
        phrases.forEach((phrase) => {
          const active = localTime >= phrase.start - 0.14 && localTime <= phrase.end + 0.26;
          phrase.el.style.opacity = active ? "1" : "0";
          phrase.el.style.transform = active ? "translateY(0)" : "translateY(14px)";
          if (!active) return;
          phrase.words.forEach((wordEl) => {
            wordEl.style.color = localTime >= parseFloat(wordEl.dataset.start) ? "#f4efe6" : "#5b6472";
          });
        });
      }

      function hasTarget(target) {
        if (!target) return false;
        if (typeof NodeList !== "undefined" && target instanceof NodeList) return target.length > 0;
        if (Array.isArray(target)) return target.length > 0;
        return true;
      }
      function toIf(target, vars, at) {
        if (hasTarget(target)) tl.to(target, vars, at);
      }
      function fromToIf(target, fromVars, toVars, at) {
        if (hasTarget(target)) tl.fromTo(target, fromVars, toVars, at);
      }

      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      tl.to("#grid", { opacity: 0.5, duration: 1.4, ease: "power2.out" }, 0)
        .to(".particle", { opacity: 0.42, duration: 2.0, stagger: { each: 0.015, from: "random" }, ease: "power1.out" }, 0.1);
      gsap.utils.toArray(".particle").forEach((p) => {
        const d = parseFloat(p.dataset.drift) || 0;
        tl.to(p, { y: "+=" + (d * 36), duration: 28, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
      });

      SEGMENTS.forEach((segment, index) => {
        const scene = document.getElementById(segment.id);
        const start = segment.start;
        const dur = segment.duration;
        tl.set(scene, { opacity: 0 }, Math.max(0, start - 0.03));
        tl.to(scene, { opacity: 1, duration: 0.55, ease: "power2.out" }, start);
        tl.fromTo(scene.querySelector(".line"), { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, start + 0.25);
        tl.fromTo(scene.querySelector(".title"), { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.85, ease: "power3.out" }, start + 0.55);
        tl.fromTo(scene.querySelector(".thesis"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.85, ease: "power3.out" }, start + 1.35);
        tl.fromTo(scene.querySelector(".panel"), { opacity: 0, scale: 0.985 }, { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }, start + 1.0);
        const wave = scene.querySelector(".wave path");
        if (wave) tl.fromTo(wave, { strokeDashoffset: 900 }, { strokeDashoffset: 0, duration: Math.min(12, dur * 0.3), ease: "power2.inOut" }, start + 2.0);
        const threshold = scene.querySelector(".threshold");
        if (threshold) tl.fromTo(threshold, { opacity: 0, scaleX: 0 }, { opacity: 0.88, scaleX: 1, duration: 0.55, ease: "power4.in" }, start + Math.max(6.0, dur * 0.36));
        tl.fromTo(scene.querySelector(".hidden-band"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, ease: "power4.in" }, start + Math.max(8, dur * 0.48));
        tl.fromTo(scene.querySelectorAll(".motif-tag"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.34, stagger: 0.12, ease: "power2.out" }, start + Math.max(5.2, dur * 0.22));
        tl.fromTo(scene.querySelector(".beat-word"), { opacity: 0, scale: 1.32 }, { opacity: 1, scale: 1, duration: 0.28, ease: "power4.in", immediateRender: false, overwrite: "auto" }, start + Math.max(9, dur * 0.5));
        tl.to(scene.querySelector(".beat-word"), { opacity: 0.08, duration: 1.2, ease: "power2.out", overwrite: "auto" }, start + Math.max(10, dur * 0.5 + 1.1));

        toIf(scene.querySelectorAll(".brain"), { opacity: 1, scale: 1.18, duration: 0.28, stagger: 0.18, yoyo: true, repeat: 1, ease: "power2.inOut" }, start + 3.4);
        fromToIf(scene.querySelectorAll(".book"), { opacity: 0, y: 32, rotate: -2 }, { opacity: 1, y: 0, rotate: 0, duration: 0.45, stagger: 0.08, ease: "back.out(1.5)" }, start + 2.4);
        fromToIf(scene.querySelectorAll(".envelope"), { opacity: 0, y: -14 }, { opacity: 0.88, y: 0, duration: 0.4, stagger: 0.12, ease: "power2.out" }, start + Math.max(6.8, dur * 0.34));
        toIf(scene.querySelector(".basement"), { opacity: 1, duration: 0.5, ease: "power2.out" }, start + Math.max(6.4, dur * 0.34));
        fromToIf(scene.querySelector(".pen"), { x: -62, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, start + 2.5);
        toIf(scene.querySelector(".early-shadow"), { opacity: 1, scale: 1.18, duration: 0.5, yoyo: true, repeat: 1, ease: "power2.inOut" }, start + Math.max(6.2, dur * 0.3));
        fromToIf(scene.querySelectorAll(".jig"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.12, ease: "back.out(1.5)" }, start + 2.6);
        toIf(scene.querySelector(".screw"), { rotate: 720, scale: 1.18, duration: 0.8, ease: "power2.inOut" }, start + Math.max(7.0, dur * 0.32));
        fromToIf(scene.querySelector(".single-line"), { scaleX: 0 }, { scaleX: 1, duration: 1.0, ease: "power2.inOut" }, start + 2.2);
        toIf(scene.querySelector(".question"), { opacity: 0.9, scale: 1.05, duration: 0.55, ease: "power2.out" }, start + Math.max(6.5, dur * 0.28));
        toIf(scene.querySelectorAll(".lever"), { rotate: (i) => [-14, 9, -6, 16, -11][i] || 8, duration: 0.5, stagger: 0.08, ease: "power2.inOut" }, start + Math.max(7.5, dur * 0.35));
        const hand = scene.querySelector(".hand");
        if (hand) tl.to(hand, { rotate: 310, duration: Math.min(10, dur * 0.24), ease: "power1.inOut" }, start + 1.8);

        const captionClock = { t: 0 };
        tl.to(captionClock, { t: dur, duration: dur, ease: "none", onUpdate: () => syncCaptions(scene, captionClock.t) }, start);

        if (index < SEGMENTS.length - 1) {
          tl.to(scene, { opacity: 0, duration: 0.45, ease: "power2.inOut" }, start + dur - 0.45);
        }
      });

      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;

fs.writeFileSync(path.join(projectDir, 'index.html'), html);

const metaPath = path.join(projectDir, 'meta.json');
if (fs.existsSync(metaPath)) {
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  meta.durationSeconds = totalDuration;
  meta.actualDurationSeconds = totalDuration;
  meta.wordLevelCaptions = true;
  fs.writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`);
}

console.log(`updated ${path.join(projectDir, 'index.html')}`);
console.log(`actual duration: ${totalDuration}s`);
