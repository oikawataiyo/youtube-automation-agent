# Plan: why-you-pull-away **v2** (brighter + more shot variety)

## Requirements (from user review of v1 final video)
1. **退屈 / 同じ絵が長い** → more shot variety: cut between camera angles within each
   segment; shorter holds (never > ~6–8s, esp. the long citation stretches).
2. **画面が暗い** → raise overall brightness (key/ambient floors, lift the cold/warm low
   end so "cold" is slate-blue not black, brighter glows, lighter vignette).
3. **v1 を消さない** → v2 is a SEPARATE variant. v1 dir, renders, and final mp4 untouched.

## Variant strategy (DECISION)
- New dir `mychannel/video/why-you-pull-away-v2/`, copied from v1.
- **Reuse v1 narration assets as-is** (same wavs + `*-words.js`) — content/beats unchanged,
  only lighting + camera/pacing change. Copy them in (no symlink on Windows).
- Segment set & durations IDENTICAL to v1 (so `-c copy` concat still works):
  seg-00 29.5s · seg-01 147s · seg-02 160s · seg-03 177s · seg-04 161s · seg-05 149s(2D SVG) · seg-06 64s.

## Two shared mechanisms added to v2 `scene-kit.js` (build once, reuse in every seg)

### A. Global brightness lift (centralized levers — hit all 3D segments at once)
- `makeRenderer`: add `renderer.toneMapping = THREE.ACESFilmicToneMapping;`
  `renderer.toneMappingExposure = 1.15;` (filmic lift, no per-seg edit needed).
- Raise `COL.COLD` luminance (`#6b7a8f` → ~`#8b9bb0`) so every cold/warm-low beat reads
  slate-blue not black (COLD is the cold-key lerp target in every seg).
- Raise ambient base color (`0x33414f` → brighter) + `SceneKit.warmLight(rig, warm)` helper
  that floors `key.intensity`, `ambient.intensity`, and the COLD→WARM lerp so `warm:0.1`
  no longer renders near-black.

### B. Multi-camera cut rig (deterministic, seek-safe)
    SceneKit.makeCameraRig(presets)  // [{pos:Vec3, posNear?:Vec3, look:Vec3}, ...]
    // returns { camera, state:{idx,push}, apply() }
    // hard cut:      tl.set(state, { idx:2, push:0 }, t)   // instant, seeks cleanly
    // dolly in shot: tl.to(state,  { push:1, duration:5 }, t)
Replaces the single `camFar↔camNear` dolly. Each segment defines 3–5 framings (wide /
over-shoulder / detail / low / reverse) and CUTS between them on beats via `tl.set`.
`apply()` runs inside the existing `onUpdate` render — same deterministic model that works.

## Per-segment work (apply A + B, keep all content/beats/captions)
3D segments (01,02,03,04,06): swap single camera for `makeCameraRig` with 3–5 framings of the
existing geometry; insert `tl.set` hard cuts on beat times so no framing holds > ~6–8s; add
intra-shot dollies; apply brightness floors + lighter vignette (CSS 0.58 → ~0.38). Fix v1 flaws:
seg-02 light the crib directly; (optional) straighten chibi legs.
seg-05 (2D SVG): lighten palette/filter glows + viewBox pans / more frequent draw reveals.
seg-00 (Hook): brighten to match so the concatenated v2 is uniform.

## Phases (checkpointed — do NOT mass-produce before the look is approved)
**Phase 1 — Scaffold + shared mechanisms + seg-01 template**
1. Create v2 dir; copy hyperframes.json, package.json, CLAUDE.md, design.md, narration,
   scene-kit.js, index.html (seg-00), compositions/.
2. Edit v2 scene-kit.js: tone mapping + exposure, COL.COLD/ambient lift, warmLight() + makeCameraRig().
3. Rebuild seg-01 with 4–5 camera cuts + brightness floors + lighter vignette. Render.
4. Frame-verify: brighter, no hold > ~8s, cuts seek cleanly.
**→ STOP. Show seg-01 v2 to user for look approval before the rest.**

**Phase 2 — Remaining 3D segments (02,03,04,06) + Hook (seg-00).** Apply approved pattern,
render + frame-verify each (parallel renders OK).

**Phase 3 — seg-05 (2D SVG) brightness + pacing pass.** Render + verify.

**Phase 4 — Concat + final verify.** `ffmpeg -f concat -c copy` →
`renders/why-you-pull-away-v2-full.mp4`; verify A/V sync. v1 stays intact. Commit v2 source, push, update memory.

## Risks
- HIGH: presets must frame existing geometry well — bad framings look worse than v1. Mitigated by Phase-1 checkpoint.
- MED: hard cuts seeking backward — verify GSAP `.set` restores `idx` on scrub.
- MED: tone mapping can wash out — tune exposure (1.1–1.2) on seg-01 first.
- MED: scope — 7 segments × (relight + recut) is multi-session; phased so each ships.
- LOW: concat needs identical codec params (guaranteed — same renderer settings).

## Complexity: HIGH (multi-session). Phase 1 alone ≈ one focused session.
