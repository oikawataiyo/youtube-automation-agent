#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCRIPT_DIR = path.join(ROOT, 'data', 'scripts');
const VIDEO_DIR = path.join(ROOT, 'channels', 'autopilot', 'video');
const SURVIVORSHIP_RE = /survivorship/i;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  mkdirp(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

function slugFromScriptFile(fileName) {
  return path.basename(fileName, '.json').replace(/^\d+_/, '');
}

function isModernScript(data) {
  const script = data && data.script;
  return Boolean(
    script &&
    script.hook &&
    script.hook.text &&
    Array.isArray(script.sections) &&
    script.sections.length &&
    script.outro &&
    script.outro.narration
  );
}

function words(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean);
}

function estimateDuration(text, fallback = 75) {
  const count = words(text).length;
  if (!count) return fallback;
  return Math.max(24, Math.round((count / 2.45) * 10) / 10);
}

function cleanText(text) {
  return String(text || '')
    .replace(/\uFFFD/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sentenceChunks(text, maxWords = 13) {
  const raw = cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
  const chunks = [];
  for (const sentence of raw) {
    const w = words(sentence);
    if (w.length <= maxWords) {
      chunks.push(sentence);
      continue;
    }
    for (let i = 0; i < w.length; i += maxWords) {
      chunks.push(w.slice(i, i + maxWords).join(' '));
    }
  }
  return chunks.slice(0, 42);
}

function buildSegments(scriptData) {
  const script = scriptData.script;
  const segments = [];
  segments.push({
    id: 'seg-00-hook',
    part: 'PART 01',
    heading: 'Hook',
    title: script.title,
    narration: cleanText(script.hook.text),
    visualNote: cleanText(script.hook.visual_note || ''),
    duration: estimateDuration(script.hook.text, 45),
    register: 'hook'
  });

  script.sections.forEach((section, index) => {
    segments.push({
      id: `seg-${String(index + 1).padStart(2, '0')}-${slugify(section.heading || `section-${index + 1}`)}`,
      part: `PART ${String(index + 2).padStart(2, '0')}`,
      heading: cleanText(section.heading || `Section ${index + 1}`),
      title: cleanText(section.heading || `Section ${index + 1}`),
      narration: cleanText(section.narration),
      visualNote: cleanText(section.visual_note || ''),
      duration: Number(section.duration_estimate_seconds) || estimateDuration(section.narration, 95),
      register: ['lab', 'archive', 'industry', 'decision', 'practice'][index % 5]
    });
  });

  const outroText = [script.outro.narration, script.outro.cta].filter(Boolean).join(' ');
  segments.push({
    id: `seg-${String(segments.length).padStart(2, '0')}-outro`,
    part: `PART ${String(segments.length + 1).padStart(2, '0')}`,
    heading: 'Outro',
    title: 'Closing Thought',
    narration: cleanText(outroText),
    visualNote: 'The argument collapses into one quiet sentence, then leaves the viewer with a question.',
    duration: estimateDuration(outroText, 70),
    register: 'outro'
  });

  let start = 0;
  for (const segment of segments) {
    segment.start = Math.round(start * 10) / 10;
    segment.duration = Math.round(segment.duration * 10) / 10;
    start += segment.duration;
    segment.end = Math.round(start * 10) / 10;
    segment.captions = sentenceChunks(segment.narration);
  }
  return segments;
}

function slugify(value) {
  return String(value || 'untitled')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || 'untitled';
}

function jsString(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function makePackageJson(id) {
  return `${JSON.stringify({
    name: id,
    private: true,
    type: 'module',
    scripts: {
      dev: 'npx --yes hyperframes@0.6.63 preview',
      check: 'npx --yes hyperframes@0.6.63 lint && npx --yes hyperframes@0.6.63 validate --timeout 30000',
      render: `node ../../../scripts/render-video-playwright.js . --fps 12 --output renders/${id}-full.mp4`,
      publish: 'npx --yes hyperframes@0.6.63 publish'
    }
  }, null, 2)}\n`;
}

function makeMeta(id, sourceFile, scriptData, totalDuration) {
  return `${JSON.stringify({
    id,
    name: id,
    sourceScript: sourceFile.replace(/\\/g, '/'),
    topic: scriptData.topic,
    title: scriptData.script.title,
    estimatedDurationSeconds: Math.round(totalDuration * 10) / 10,
    toneReference: 'survivorship-v2',
    createdAt: new Date().toISOString()
  }, null, 2)}\n`;
}

function makeHyperframesJson() {
  return `${JSON.stringify({
    $schema: 'https://hyperframes.heygen.com/schema/hyperframes.json',
    registry: 'https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry',
    paths: {
      blocks: 'compositions',
      components: 'compositions/components',
      assets: 'assets'
    }
  }, null, 2)}\n`;
}

function makeDesign(id, scriptData) {
  return `# Design System - ${id}

Reference tone: \`channels/autopilot/video/survivorship-v2\`.

Dark editorial motion graphics: restrained, contemplative, authoritative. No BGM or SFX in the base pass. Narration-first, burned-in captions, kinetic typography as punctuation rather than decoration.

## Palette

| Token | Hex | Use |
|---|---|---|
| \`--bg\` | \`#0a0c10\` | deep blue-black ground |
| \`--bg-grid\` | \`#141925\` | faint technical grid |
| \`--bone\` | \`#e8e4d8\` | primary diagram strokes |
| \`--steel\` | \`#9aa6b2\` | secondary annotation |
| \`--ink\` | \`#f4efe6\` | primary text |
| \`--mute\` | \`#5b6472\` | caption inactive |
| \`--alarm\` | \`#d8392e\` | threat/reversal |
| \`--warn\` | \`#ff5a3c\` | contradiction glow |
| \`--gold\` | \`#caa86a\` | rare marker emphasis |

## Motion Grammar

- One deliberate gear-change per segment.
- No static hold beyond roughly 15 seconds.
- Use recurring diagram language: grid, evidence points, hidden layer, threshold line, denominator field.
- Captions sit in the lower third and should be replaced by word-level timings after TTS/transcription.

## Source

- Topic: ${scriptData.topic || scriptData.script.title}
- Title: ${scriptData.script.title}
- Pillar: ${scriptData.pillar || 'unknown'}
`;
}

function makeAgants() {
  return `# HyperFrames Composition Project

This project was generated from a completed script and uses the same visual register as \`survivorship-v2\`.

## Commands

\`\`\`bash
npm run dev
npm run check
npm run render
\`\`\`

## Production Notes

- This is a first-pass HyperFrames package: timing is estimated from the script.
- Next pass: generate narration with the same \`am_adam\` Kokoro voice, transcribe to word timings, then replace estimated captions with word-level karaoke captions.
- Keep the dark editorial tone: grid, sparse diagrams, kinetic emphasis, no decorative clutter.
`;
}

function makeIndexHtml(projectId, segments, totalDuration) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
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
      #grid { position: absolute; inset: 0;
        background-image: linear-gradient(var(--bg-grid) 1px, transparent 1px),
          linear-gradient(90deg, var(--bg-grid) 1px, transparent 1px);
        background-size: 64px 64px; opacity: 0.5; }
      #vignette { position: absolute; inset: 0; pointer-events: none;
        background: radial-gradient(ellipse 72% 60% at 50% 45%, transparent 36%, rgba(0,0,0,0.66) 100%); }
      .particle { position: absolute; width: 3px; height: 3px; border-radius: 50%; background: #3a4658; opacity: 0.42; }
      .scene { position: absolute; inset: 0; opacity: 0; overflow: hidden; }
      .kicker { position: absolute; left: 88px; top: 84px; font-size: 22px; letter-spacing: 0.32em; text-transform: uppercase; color: var(--steel); }
      .kicker b { color: var(--gold); font-weight: 700; }
      .line { position: absolute; left: 88px; top: 122px; width: 300px; height: 2px; background: var(--steel); opacity: 0.45; transform-origin: left center; }
      .title { position: absolute; left: 120px; top: 214px; width: 1000px; font-size: 60px; line-height: 1.02; letter-spacing: 0; font-weight: 800; text-transform: uppercase; color: var(--ink); }
      .title .marker { color: var(--gold); }
      .thesis { position: absolute; left: 128px; top: 510px; width: 780px; font-size: 39px; line-height: 1.26; color: var(--steel); font-weight: 300; }
      .diagram { position: absolute; right: 120px; top: 194px; width: 640px; height: 580px; }
      .panel { position: absolute; inset: 0; border: 1px solid rgba(154,166,178,0.38); background: rgba(10,12,16,0.26); }
      .axis-x, .axis-y { position: absolute; background: rgba(154,166,178,0.5); transform-origin: left center; }
      .axis-x { left: 86px; bottom: 98px; width: 458px; height: 2px; }
      .axis-y { left: 86px; bottom: 98px; width: 2px; height: 356px; }
      .trace { position: absolute; left: 88px; bottom: 100px; width: 452px; height: 272px; border-left: 0; border-bottom: 0; }
      .trace svg { width: 100%; height: 100%; overflow: visible; }
      .trace path { fill: none; stroke: var(--gold); stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 780; stroke-dashoffset: 780; }
      .dot { position: absolute; width: 9px; height: 9px; border-radius: 50%; background: var(--alarm); opacity: 0; }
      .ghost { position: absolute; width: 12px; height: 12px; border: 1px solid rgba(154,166,178,0.55); border-radius: 50%; opacity: 0; }
      .hidden-band { position: absolute; left: 86px; right: 96px; bottom: 74px; height: 72px; background: linear-gradient(180deg, rgba(216,57,46,0), rgba(216,57,46,0.22)); opacity: 0; }
      .visual-note { position: absolute; left: 48px; right: 48px; bottom: 42px; font-size: 20px; line-height: 1.35; color: var(--steel); letter-spacing: 0.04em; text-transform: uppercase; opacity: 0.76; }
      .beat-word { position: absolute; right: 140px; top: 804px; color: var(--warn); font-size: 42px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0; }
      .caps { position: absolute; left: 50%; bottom: 86px; transform: translateX(-50%); width: 1480px; text-align: center; }
      .caption { position: absolute; left: 0; right: 0; bottom: 0; opacity: 0; color: var(--mute); font-size: 43px; line-height: 1.35; font-weight: 400; }
      .caption b { color: var(--ink); font-weight: 500; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${totalDuration}" data-width="1920" data-height="1080">
      <div id="texture" class="clip" data-start="0" data-duration="${totalDuration}" data-track-index="0">
        <div id="grid"></div>
        <div id="particles"></div>
        <div id="vignette"></div>
      </div>
      ${segments.map((segment, index) => makeSceneHtml(segment, index)).join('\n      ')}
    </div>
    <script>
      const PROJECT_ID = ${jsString(projectId)};
      const SEGMENTS = ${jsString(segments)};
      function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
      const rnd = mulberry32(${hashCode(projectId)});
      const particleHost = document.getElementById("particles");
      for (let i = 0; i < 90; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.left = (rnd() * 1920).toFixed(1) + "px";
        p.style.top = (rnd() * 1080).toFixed(1) + "px";
        p.style.transform = "scale(" + (0.5 + rnd() * 1.4).toFixed(2) + ")";
        p.dataset.drift = (rnd() * 2 - 1).toFixed(3);
        particleHost.appendChild(p);
      }

      function makeCaptions(scene, segment) {
        const host = scene.querySelector(".caps");
        segment.captions.forEach((text, index) => {
          const cap = document.createElement("div");
          cap.className = "caption";
          const split = text.split(/\\s+/);
          const pivot = Math.min(split.length - 1, Math.max(0, Math.floor(split.length * 0.62)));
          cap.innerHTML = split.map((word, i) => i === pivot ? "<b>" + escapeHtml(word) + "</b>" : escapeHtml(word)).join(" ");
          host.appendChild(cap);
        });
      }

      function escapeHtml(text) {
        return String(text).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;","'":"&#39;"}[c]));
      }

      function scatter(scene, seedOffset) {
        const localRnd = mulberry32(${hashCode(projectId)} + seedOffset * 101);
        const diagram = scene.querySelector(".diagram");
        for (let i = 0; i < 42; i++) {
          const d = document.createElement("div");
          d.className = i % 4 === 0 ? "ghost" : "dot";
          d.style.left = (120 + localRnd() * 380).toFixed(1) + "px";
          d.style.top = (92 + localRnd() * 330).toFixed(1) + "px";
          diagram.appendChild(d);
        }
      }

      SEGMENTS.forEach((segment, index) => {
        const scene = document.getElementById(segment.id);
        makeCaptions(scene, segment);
        scatter(scene, index + 1);
      });

      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      gsap.utils.toArray(".particle").forEach((p, i) => {
        const d = parseFloat(p.dataset.drift) || 0;
        tl.to(p, { y: "+=" + (d * 36), duration: 28, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
      });

      SEGMENTS.forEach((segment, index) => {
        const scene = document.getElementById(segment.id);
        const start = segment.start;
        const dur = segment.duration;
        const captions = gsap.utils.toArray(scene.querySelectorAll(".caption"));
        tl.set(scene, { opacity: 0 }, Math.max(0, start - 0.02));
        tl.to(scene, { opacity: 1, duration: 0.55, ease: "power2.out" }, start);
        tl.fromTo(scene.querySelector(".line"), { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, start + 0.3);
        tl.fromTo(scene.querySelector(".title"), { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.85, ease: "power3.out" }, start + 0.6);
        tl.fromTo(scene.querySelector(".thesis"), { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.85, ease: "power3.out" }, start + 1.5);
        tl.fromTo(scene.querySelector(".panel"), { opacity: 0, scale: 0.985 }, { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }, start + 1.1);
        tl.fromTo(scene.querySelector(".trace path"), { strokeDashoffset: 780 }, { strokeDashoffset: 0, duration: Math.min(12, dur * 0.3), ease: "power2.inOut" }, start + 2.3);
        tl.fromTo(scene.querySelectorAll(".dot"), { opacity: 0, scale: 0 }, { opacity: 0.9, scale: 1, duration: 0.28, stagger: { each: Math.min(0.14, dur / 420), from: "random" }, ease: "back.out(1.8)" }, start + 3.2);
        tl.fromTo(scene.querySelectorAll(".ghost"), { opacity: 0, scale: 0.4 }, { opacity: 0.42, scale: 1, duration: 0.45, stagger: 0.08, ease: "power2.out" }, start + Math.max(5, dur * 0.24));
        tl.fromTo(scene.querySelector(".hidden-band"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, ease: "power4.in" }, start + Math.max(8, dur * 0.48));
        tl.fromTo(scene.querySelector(".beat-word"), { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.28, ease: "power4.in", immediateRender: false, overwrite: "auto" }, start + Math.max(9, dur * 0.5));
        tl.to(scene.querySelector(".beat-word"), { opacity: 0.08, duration: 1.2, ease: "power2.out", overwrite: "auto" }, start + Math.max(10, dur * 0.5 + 1.1));

        captions.forEach((cap, capIndex) => {
          const span = Math.max(2.4, (dur - 6) / Math.max(1, captions.length));
          const capStart = start + 3 + capIndex * span;
          const capEnd = Math.min(start + dur - 0.4, capStart + span * 0.82);
          tl.fromTo(cap, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" }, capStart);
          tl.to(cap, { opacity: 0, y: -10, duration: 0.28, ease: "power2.in" }, capEnd);
        });

        if (index < SEGMENTS.length - 1) {
          tl.to(scene, { opacity: 0, duration: 0.45, ease: "power2.inOut" }, start + dur - 0.45);
        }
      });

      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
}

function makeSceneHtml(segment, index) {
  const titleWords = segment.title.split(/\s+/);
  const markerAt = Math.min(titleWords.length - 1, Math.max(0, Math.floor(titleWords.length * 0.58)));
  const title = titleWords.map((word, i) => i === markerAt ? `<span class="marker">${escapeHtml(word)}</span>` : escapeHtml(word)).join(' ');
  const thesis = cleanText(segment.narration).split(/\s+/).slice(0, 34).join(' ');
  const visual = cleanText(segment.visualNote).split(/\s+/).slice(0, 24).join(' ');
  const beat = beatWord(segment);
  const pathVariant = index % 3;
  const pathData = [
    'M0 230 C72 170 116 220 166 148 C222 68 288 112 348 58 C392 20 426 42 452 14',
    'M0 120 C60 104 88 196 156 176 C232 154 236 56 312 70 C374 82 390 210 452 190',
    'M0 218 C80 218 94 142 156 142 C226 142 220 70 292 70 C360 70 380 28 452 28'
  ][pathVariant];
  return `<section id="${segment.id}" class="scene clip" data-start="${segment.start}" data-duration="${segment.duration}" data-track-index="${index + 1}">
        <div class="kicker">${escapeHtml(projectLabel(segment))} &nbsp;·&nbsp; <b>${escapeHtml(segment.part)}</b></div>
        <div class="line"></div>
        <div class="title">${title}</div>
        <div class="thesis">${escapeHtml(thesis)}...</div>
        <div class="diagram">
          <div class="panel"></div>
          <div class="axis-x"></div>
          <div class="axis-y"></div>
          <div class="hidden-band"></div>
          <div class="trace"><svg viewBox="0 0 452 272"><path d="${pathData}"/></svg></div>
          <div class="visual-note">${escapeHtml(visual)}</div>
        </div>
        <div class="beat-word">${escapeHtml(beat)}</div>
        <div class="caps"></div>
      </section>`;
}

function projectLabel(segment) {
  return segment.register === 'hook' ? 'PSYCHOLOGY FIELD NOTE' : 'HIDDEN MECHANISM';
}

function beatWord(segment) {
  const candidates = cleanText(`${segment.heading} ${segment.title}`)
    .split(/\s+/)
    .map(w => w.replace(/[^a-zA-Z]/g, ''))
    .filter(w => w.length > 5);
  return (candidates[Math.min(candidates.length - 1, 1)] || 'REVERSAL').toUpperCase();
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function hashCode(text) {
  let hash = 2166136261;
  for (const char of String(text)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function makeProductionNotes(id, sourceFile, scriptData, segments) {
  const rows = segments.map(s => `| ${s.id} | ${s.heading} | ${s.duration}s | ${words(s.narration).length} |`).join('\n');
  return `# Production Notes - ${id}

Source: \`${sourceFile.replace(/\\/g, '/')}\`

## Segment Map

| Segment | Heading | Est. Duration | Words |
|---|---:|---:|---:|
${rows}

## Next Pass

1. Generate narration per \`assets/narration/seg-*.txt\` using the same \`am_adam\` voice as \`survivorship-v2\`.
2. Transcribe each WAV to word timing JS.
3. Replace estimated caption scheduling in \`index.html\` with word-level timing.
4. Add 1-2 custom visual motifs per section, based on each \`visual_note\`.
5. Run \`npm run check\`, then render.

## SEO Title

${scriptData.seo && scriptData.seo.optimized_title ? scriptData.seo.optimized_title : scriptData.script.title}
`;
}

function createProject(scriptPath) {
  const sourceFile = path.relative(ROOT, scriptPath);
  const scriptData = readJson(scriptPath);
  if (!isModernScript(scriptData)) return null;

  const baseSlug = slugFromScriptFile(path.basename(scriptPath));
  const projectId = `${baseSlug}-v1`;
  const projectDir = path.join(VIDEO_DIR, projectId);
  const segments = buildSegments(scriptData);
  const totalDuration = Math.round(segments.reduce((sum, s) => sum + s.duration, 0) * 10) / 10;

  mkdirp(projectDir);
  writeFile(path.join(projectDir, 'package.json'), makePackageJson(projectId));
  writeFile(path.join(projectDir, 'meta.json'), makeMeta(projectId, sourceFile, scriptData, totalDuration));
  writeFile(path.join(projectDir, 'hyperframes.json'), makeHyperframesJson());
  writeFile(path.join(projectDir, 'AGENTS.md'), makeAgants());
  writeFile(path.join(projectDir, 'design.md'), makeDesign(projectId, scriptData));
  writeFile(path.join(projectDir, 'production-notes.md'), makeProductionNotes(projectId, sourceFile, scriptData, segments));
  writeFile(path.join(projectDir, 'assets', 'source-script.json'), `${JSON.stringify(scriptData, null, 2)}\n`);
  writeFile(path.join(projectDir, 'assets', 'segments.json'), `${JSON.stringify(segments, null, 2)}\n`);

  segments.forEach((segment, index) => {
    const fileName = `${String(index).padStart(2, '0')}-${slugify(segment.heading)}.txt`;
    writeFile(path.join(projectDir, 'assets', 'narration', fileName), `${segment.narration}\n`);
  });

  writeFile(path.join(projectDir, 'index.html'), makeIndexHtml(projectId, segments, totalDuration));

  return { projectId, projectDir, sourceFile, totalDuration, segmentCount: segments.length };
}

function discoverScripts() {
  return fs.readdirSync(SCRIPT_DIR)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(SCRIPT_DIR, file))
    .filter(file => {
      const data = readJson(file);
      return isModernScript(data) && !SURVIVORSHIP_RE.test(path.basename(file)) && !SURVIVORSHIP_RE.test(data.topic || data.script.title || '');
    });
}

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.includes('--all')) return discoverScripts();
  if (!args.length) {
    console.error('Usage: node scripts/create-video-projects.js --all | <script-json> [script-json...]');
    process.exit(1);
  }
  return args.map(arg => path.resolve(ROOT, arg));
}

function main() {
  const scripts = parseArgs();
  const created = [];
  for (const scriptPath of scripts) {
    const result = createProject(scriptPath);
    if (result) created.push(result);
  }
  console.log(`Created/updated ${created.length} video project(s):`);
  for (const item of created) {
    console.log(`- ${item.projectId} (${item.segmentCount} segments, ${item.totalDuration}s)`);
  }
}

main();
