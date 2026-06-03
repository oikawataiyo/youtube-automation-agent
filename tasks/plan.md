# Plan: Produce "不安は脳の予測 / Your Anxiety Is a Threat Forecast" (v1)

**Script:** `data/scripts/1780100000001_your-anxiety-is-a-threat-forecast.md` (+ `.json`)
**New video dir:** `mychannel/video/your-anxiety-is-a-threat-forecast-v1/`
**Base kit:** copy the **v2** `scene-kit.js` from `why-you-pull-away-v2` (brightness + camera-rig + cutter already baked in).
**New libraries to debut:** postprocessing/bloom + seeded simplex-noise + rough.js
**Pillar:** mood. **Target length:** ~9 min (Hook + 5 sections + Outro = 7 segments).

---

## Requirements (restated)

1. Turn the leftover anxiety script into a finished, concatenated MP4 in the established
   HyperFrames + three.js chibi style, reusing the proven v2 kit.
2. Debut three new **deterministic + seek-safe + UMD-loadable** libraries, used where they
   earn their place (not bolted on):
   - **bloom** → the glow beats (screen afterglow, the ringing red alarm, the thin line of daylight).
   - **simplex-noise (seeded)** → the script's spine metaphor: weather/storm lines flowing
     through a transparent body; breathing chest; drifting cloud/fog. Replaces `Math.sin` hacks.
   - **rough.js (seeded)** → hand-drawn beats: the wall of question-mark doors, the chalk
     `DANGER`/`SAFE` blackboard, the brass barometer dial face.
3. Keep the v2 quality bars: bright enough (no near-black), **max 4s per camera framing**
   (`makeCutter.auto`), karaoke captions from real word timings.
4. v1 of this title only — do not touch any existing video dir.

---

## Segment map (motif per section)

| Seg | Section | Core visual (from script Visual notes) | Lib used |
| --- | --- | --- | --- |
| seg-00 (index.html) | Hook | 3am bedroom, screen afterglow on ceiling, chest rising fast under blanket, frozen clock | bloom (screen glow) + simplex (breath) |
| seg-01 | §1 火事の前に鳴る警報 | silent dark hallway, red alarm under glass ringing; reflection morphs to a human eye | bloom (red alarm) |
| seg-02 | §2 分からなさに耐えられない | person facing a wall of closed doors marked only with `?`; cold light slides door to door | rough.js (`?` doors) + bloom (cold slit) |
| seg-03 | §3 体が予測を書いてしまう | transparent body; weather-map lines flow through chest/stomach, becoming an outward storm | **simplex flow field** (hero beat) + bloom |
| seg-04 | §4 予測を生かし続ける輪 | night classroom; a notebook stamps `SAFE` each time a door shuts; blackboard still reads `DANGER` | rough.js (chalk) + bloom |
| seg-05 | §5 予測を測り直す | hand turns a brass barometer `STORM → CHANGEABLE`; window cloudy but a thin daylight line | rough.js (dial) + bloom (daylight) + simplex (clouds) |
| seg-06 | Outro | the alarm still speaks but is one input among many; calmer, lighter room | bloom (soft) |

Unifying motif: **weather/forecast** (simplex-driven storm lines) + **alarm glow** (bloom).
3D chibi room/hallway/classroom reuse the v2 chibi + chair + camera-rig code; the barometer
and weather-map are SVG/canvas overlays composited over the 3D (same layering as v2 captions).

---

## Phase 0 — Library de-risking spike (DO THIS FIRST, gates everything)

The one real unknown: three's `EffectComposer`/`UnrealBloomPass` live in `examples/jsm` (ESM) and
will NOT load as classic UMD `<script src>` alongside the global `THREE@0.160`. Mixing ESM +
the existing global setup is the risk that could sink the whole approach.

- **Step 0.1** — Consult `/three` and `/hyperframes` skills for the supported postprocessing path.
- **Step 0.2** — Pick a UMD/global bloom that binds to the existing `window.THREE` 0.160 without
  loading three twice. Candidate: **pmndrs `postprocessing`** UMD build (`window.POSTPROCESSING`).
  Confirm version compatibility with three 0.160.
- **Step 0.3** — Build a throwaway 1-scene probe: cube + emissive material + bloom, rendered via
  `composer.render()` inside a paused `gsap.timeline({onUpdate})`. Render 2s headless with
  `hyperframes render`; frame-verify the glow appears AND that seeking backward reproduces the
  same frame (determinism). Drive any effect time uniform from the timeline proxy, never a clock.
- **Step 0.4** — Same probe for simplex-noise (seeded via alea; `noise(x, t)` with `t` from proxy)
  and rough.js (seeded canvas redraw on seek). Both are low-risk; confirm UMD globals load.
- **GATE:** if UMD bloom can't be made deterministic/headless-safe, fall back to a
  cheap emissive + additive-sprite "fake bloom" in-scene and report before proceeding. Do not
  build 7 segments on an unproven pass.

**Deliverable:** `assets/lib/fx-kit.js` — thin wrappers: `makeBloomComposer(renderer,scene,camera,opts)`,
`makeNoise(seed)`, `roughDraw(...)` — so the 7 segments don't duplicate setup. Extends scene-kit, not replaces it.

---

## Phase 1 — Scaffold

- **Step 1.1** — Create `mychannel/video/your-anxiety-is-a-threat-forecast-v1/` mirroring the v2
  tree: `assets/lib/`, `assets/narration/`, `compositions/`, `renders/`, `index.html`,
  `hyperframes.json`, `package.json`, `CLAUDE.md`, `design.md`.
- **Step 1.2** — Copy v2 `scene-kit.js` verbatim as the shared base. Add `fx-kit.js` from Phase 0.
- **Step 1.3** — Write `design.md`: the segment map above + per-seg framings + lib usage, so each
  segment build has a self-contained brief.

## Phase 2 — Narration (one pass for all 7)

- **Step 2.1** — Extract clean narration prose per section into `assets/narration/seg-NN.txt`
  (strip `> Visual` / `⏱` / headings; keep spoken text only). Hook→seg-00 … Outro→seg-06.
- **Step 2.2** — Kokoro TTS (`/hyperframes-media tts`) → `seg-NN.wav` (match v2 voice).
- **Step 2.3** — Whisper transcribe (reuse v2 `_transcribe.py`) → `seg-NN.json` + `seg-NN-words.js`
  (`window.segNN = [...]`). Read each wav's true duration to set each composition's `data-duration`/`END`.

## Phase 3 — Build segments (proven v2 pattern, one at a time)

For each seg: 5 `makeCameraRig` framings (3D segs) + `makeCutter.auto(from,to,~4,frames,dolly)` +
`warmLight`/`makeFill` brightness floors + the assigned new lib + karaoke captions via
`buildCaptions`/`wireCaptions`. All motion on the GSAP timeline; render (`composer.render()`) in
`onUpdate`. No `Date.now`/`Math.random`/`rAF`.

- 3.0 seg-00 Hook (bedroom; bloom+simplex) — also the hardest integration; validates fx-kit end-to-end.
- 3.1 seg-01 · 3.2 seg-02 · 3.3 seg-03 (simplex hero beat) · 3.4 seg-04 · 3.5 seg-05 · 3.6 seg-06.
- After each: `npm run check` (lint 0 errors; the ~N `duplicate_audio_track` warnings are the known
  standalone-per-seg false positive).

## Phase 4 — Render + verify + assemble (one render at a time)

- **Step 4.1** — `npx hyperframes render` per seg, **foreground**, **one at a time** (parallel renders
  thrash the GPU + corrupt shared output — lessons L5/L6). Hook uses index.html (omit `--composition`).
- **Step 4.2** — Frame-verify each: `ffmpeg -ss <t> -i renders/seg-NN.mp4 -frames:v 1 renders/_check/NN.png`
  then Read the png. Confirm brightness, bloom, the new-lib beat, and caption sync.
- **Step 4.3** — Confirm identical codecs (h264/1920x1080/30fps/aac) so concat copies without re-encode.
- **Step 4.4** — `ffmpeg -f concat -safe 0 -i renders/concat.txt -c copy renders/your-anxiety-...-full.mp4`.
- **Step 4.5** — Spot-check 2–3 frames across segment boundaries in the full file.

## Phase 5 — Commit + memory

- **Step 5.1** — Commit **source only** (html + lib + narration txt/json/js), not wav/mp4 (v1 convention).
  Branch from master per workflow; conventional commit; push.
- **Step 5.2** — Update memory: new production-state file for this video + a `tech-knowledge` Obsidian
  note "HyperFrames-compatible deterministic libraries" (the UMD/seek-safe filter + the bloom path found).
- **Step 5.3** — Update `tasks/lessons.md` with any new gotchas (esp. the bloom UMD path).

---

## Risks

| Risk | Sev | Mitigation |
| --- | --- | --- |
| three `EffectComposer`/bloom is ESM-only → won't load as UMD next to global THREE | **HIGH** | Phase 0 spike + UMD pmndrs `postprocessing`; emissive/sprite fallback if it fails |
| Bloom pass non-deterministic on backward seek (internal clock) | HIGH | Drive all time uniforms from timeline proxy; verify backward-seek reproduces frame in 0.3 |
| rough.js redraw-on-seek cost / flicker | MED | Seed fixed; redraw only on value change; pre-bake static `?`/dial if needed |
| Render concurrency / bg-cwd traps | MED | One render at a time, foreground (lessons L5/L6) |
| Chibi face can't carry subtle emotion | LOW | Anxiety is environmental (rooms/weather), not facial — fits chibi well |
| Codex delegation hangs on Windows | LOW | Build segments in-session; if delegating, bypass-sandbox + `</dev/null` (memory) |

## Complexity: **MEDIUM–HIGH**
Phase 0 spike is the gate. If bloom UMD works, Phases 1–5 are a known, repeatable pipeline (this is
the 4th video in this exact style). Estimate: spike + scaffold + narration ~1 session; 7 segments
build/render/verify ~2–3 sessions (1 render at a time is the bottleneck). Recommend splitting:
**Session A = Phase 0–2 (de-risk + scaffold + narration)**, then proceed segment-by-segment.

## Acceptance criteria
- [ ] Phase 0 probe proves bloom is deterministic + headless-renderable (or fallback chosen & reported)
- [ ] All 7 segs: lint clean, bright (no near-black), ≤4s framings, captions synced to word timings
- [ ] Each new lib visibly used in ≥1 beat and adds to the storytelling (bloom glow, simplex storm, rough sketch)
- [ ] Full MP4 concatenated `-c copy` (no re-encode), frame-verified across boundaries, ~9 min
- [ ] Source committed + pushed; memory + lessons updated
