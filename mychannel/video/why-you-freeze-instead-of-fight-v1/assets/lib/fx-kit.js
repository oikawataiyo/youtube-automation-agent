/* =====================================================================
 * fx-kit.js — ESM helpers for the NEW libraries debuted in this video:
 *   - postprocessing bloom (three jsm UnrealBloomPass)
 *   - seeded simplex-noise (deterministic organic motion)
 *   - rough.js (seeded hand-drawn 2D overlay)
 * ---------------------------------------------------------------------
 * Loaded as an ES module: `import { ... } from "../assets/lib/fx-kit.js"`.
 * Bare specifiers ('three', 'three/addons/', 'simplex-noise', 'roughjs')
 * resolve through the host page's <script type="importmap">.
 *
 * Companion to scene-kit.js (classic IIFE → window.SceneKit). scene-kit
 * owns the 3D scene/chibi/camera/captions; fx-kit owns the new effects.
 *
 * DETERMINISM CONTRACT (proven by the Phase-0 probe + parallel-worker render):
 *   - bloom is single-frame (no history). Drive bloom.strength from the
 *     timeline proxy, never from a clock.
 *   - simplex noise is seeded (mulberry32). Sample it with a `t` taken from
 *     the timeline proxy, never Date.now()/performance.now().
 *   - rough.js draws with a FIXED options.seed so the hand-drawn jitter is
 *     identical on every (re-)seek; redraw from proxy values only.
 * ===================================================================== */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { createNoise2D, createNoise3D } from "simplex-noise";
import rough from "roughjs";

// ---- bloom -------------------------------------------------------------
// Returns { composer, bloom }. Call composer.render() inside the GSAP
// onUpdate (instead of renderer.render). Tweak bloom.strength from a proxy.
export function makeBloomComposer(renderer, scene, camera, opts = {}) {
  const composer = new EffectComposer(renderer);
  composer.setSize(1920, 1080);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(1920, 1080),
    opts.strength == null ? 1.0 : opts.strength,
    opts.radius == null ? 0.6 : opts.radius,
    opts.threshold == null ? 0.0 : opts.threshold
  );
  composer.addPass(bloom);
  return { composer, bloom };
}

// ---- seeded PRNG (no Math.random) --------------------------------------
export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- seeded simplex noise ---------------------------------------------
// makeNoise(seed) → { noise2D, noise3D }. Sample with a timeline-driven t.
export function makeNoise(seed) {
  const s = seed == null ? 1 : seed;
  return {
    noise2D: createNoise2D(mulberry32(s)),
    noise3D: createNoise3D(mulberry32(s + 101)),
  };
}

// ---- rough.js ----------------------------------------------------------
// roughCanvas(canvasEl) → RoughCanvas. Always pass a fixed `seed` in options.
export function roughCanvas(canvasEl) {
  return rough.canvas(canvasEl);
}
export { rough };
