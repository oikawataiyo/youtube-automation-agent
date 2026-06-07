# Design System — pull-away-webgl-poc

## Thesis the visuals must encode
Avoidant attachment: the moment closeness arrives, the body cools and retreats.
The PoC must put **approach → freeze → retreat** on screen literally — a chibi figure
reaches across a small table, stops midway, then pulls back as warm light cools to slate.

## Goal of this PoC
Prove three.js WebGL renders deterministically inside the HyperFrames capture pipeline
(timeline-driven render, `preserveDrawingBuffer`, no wall-clock animation). Character
fidelity is secondary — a simple two-head-tall (chibi) figure built from primitives.

## Palette
Warmth that grades one step toward cold slate across the shot (the cooling).

| token        | hex       | role |
|--------------|-----------|------|
| `--bg`       | `#0e1116` | night room base |
| `--warm`     | `#f0a35c` | key light when close / wanting (amber) |
| `--cold`     | `#6b7a8f` | key light after retreat (slate) |
| `--doorglow` | `#ffcaa0` | the door left slightly ajar (warmth out of reach) |
| `--skin`     | `#e8c9a8` | chibi body |
| `--skin2`    | `#c9a98a` | the other figure (dimmer, across the table) |
| `--wood`     | `#3a3330` | table / chairs |
| `--ink`      | `#f4efe6` | overlay caption |

## Motion grammar
- Single continuous shot (~18s), no scene cuts — the character motion is the content.
- Key beats: settle (0–3s) · reach begins (3–6s) · freeze midway (6–8s) ·
  cool + retreat + turn away + chair slides back (8–13s) · settle cold, door glow holds (13–18s).
- Light color lerps `--warm` → `--cold` driven by a single proxy value (`warm` 1→0).
- Reach pivots from the shoulder (parent→child rotation); torso leans from the pelvis.

## HyperFrames invariants
Standalone composition (`data-composition-id="main"`, 1920×1080), timeline `paused`,
registered on `window.__timelines["main"]`. Deterministic only — no `Date.now`/`Math.random`,
no `requestAnimationFrame` loop. three.js renders inside the GSAP timeline `onUpdate`.
