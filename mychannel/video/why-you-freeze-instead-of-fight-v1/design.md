# design.md — Why You Freeze Instead of Fight (v1)

Built on the **your-anxiety-is-a-threat-forecast-v1** kit (`scene-kit.js`, `fx-kit.js`,
copied verbatim). Source script:
`data/scripts/1780200000001_why-you-freeze-instead-of-fight.json`.
Topic spec: `tasks/script-spec-N.md`.

## Unifying motif
**The autonomic ladder.** Threat responses are not two clean options — they are a
*descending cascade* of rungs: arousal → fight/flight → freeze → tonic immobility →
collapse. Two visual through-lines carry it: (1) a **vertical descending structure**
(ladder / staircase / dropping marker / falling trace) that recurs every segment, and
(2) **a small still figure** the world moves around — grass, shadow, fog, doors — while
it locks. Cold slate-blue baseline with an amber "warning" mid and a red "freeze" rung;
**one warm catchlight** is born only in seg-05 and returns in seg-06 as the signal of
safety. The descent reverses exactly once — at the very end the marker rises one rung.

## Palette (extends scene-kit COL)
- BG `#0e1116` · COLD/SLATE `#8b9bb0` (the frozen baseline) · caption ink `#f4efe6` / rest `#5b6472`
- Ladder rungs: CALM `#6fae8e` (green) · AROUSAL/AMBER `#e0a23a` · **FREEZE `#ff3a2a` (red)** · SHUTDOWN `#34435c` (deep blue-grey)
- WARM catchlight `#f0c98a` (safety — seg-05 birth, seg-06 floor lift only)
- SCREEN/cold accent `#9fc0ff` for HR traces / cold light-slits

## Global rules (same bars as anxiety-v1)
- Render via `composer.render()` (bloom) inside `gsap.timeline({ paused:true, onUpdate })`.
  No `Date.now`/`Math.random`/`performance.now`/`rAF`. Seeded noise sampled with a timeline `t`.
  rough.js fixed `seed`. `repeat:-1` forbidden — use finite `Math.ceil(dur/cycle)-1`.
- Set `window.THREE = THREE` in each composition module **before** calling `SceneKit` fns.
- `gsap` UMD `<script src>`; `scene-kit.js` classic IIFE `<script src>`; `fx-kit.js` `<script type="module">`.
- **Max 4s per camera framing** via `makeCutter.auto(from,to,≤4,frames,dolly)`; **5+ `makeCameraRig`
  framings per 3D segment**. No "still 4 seconds": every framing also has dolly push / simplex
  displacement / motif animation so the subject is never frozen on screen (the *figure* may be
  still, the *camera/world* never is).
- Brightness floors via `warmLight` + `makeFill(~1.3)`, `toneMappingExposure ~1.5`, bloom
  `threshold ~0.4` + modest `strength` (0.5–1.2) to halo only highlights (no blowout). Pull the
  camera back on glow beats; rim/catchlight any dark object.
- Karaoke captions from real word timings (`buildCaptions`/`wireCaptions`, `window.segNN`).
  Every timed element carries `data-start/data-duration/data-track-index` + `class="clip"`.
- Each composition declares the importmap (three 0.160 + addons + simplex-noise@4 + roughjs@4.6.6).
- DOM/value mutation inside the timeline is via proxy + `onUpdate` tween, never GSAP `.call()`.

## Segment briefs

### seg-00 — Hook (`index.html`)  · simplex + bloom
Golden-hour field at dusk, tall grass. A small **rabbit frozen mid-stride**, the only still
thing while the grass shears in a simplex wind. A **hawk's shadow** slides across the grass
(bloom-grazed warm rim on the horizon). Pivot text: "you have done the exact same thing."
Motif: the held-still body. **Axis: 反転** (stillness = the reflex working, not giving up).
**Gear-change:** the raptor shadow crosses the rabbit → everything locks while the grass keeps moving.
- Framings: low wide across grass · over-rabbit to sky/shadow · macro on rabbit eye (heart-beat scale pulse) · shadow sweeping the grass · pull-back to lone figure in the open.

### seg-01 — §1 The Defense Cascade  · rough.js + bloom
A **literal descending ladder** in a dark room, each rung a rough.js chalk label:
AROUSAL · FIGHT/FLIGHT · FREEZE · TONIC IMMOBILITY · COLLAPSE (top→bottom). A small **red
marker bead** drops past the bright amber middle rung into the unlit lower rungs (bloom on
the lit rungs only). Motif: the ladder (its first full reveal). **Axis: 剥がす** (peel back
"fight-or-flight" to expose the rungs beneath). **Gear-change:** camera tilts down past the
FIGHT/FLIGHT rung into the shadowed lower rungs as the marker drops.
- Framings: ladder full wide · top rungs (arousal/amber) med · marker macro on FREEZE rung · tilt-down into lower rungs · figure-at-foot-of-ladder pull-back.

### seg-02 — §2 The Brake, Not the Gas  · rough.js + bloom + simplex
A close pair of **gas + brake pedals** that morph into **two branching vagal nerve lines**
(rough.js, seed-fixed). A **heart-rate trace** (cold `#9fc0ff`, simplex-jittered) runs along
the top, then **plunges** on the freeze beat while a **pair of pupils widen** (still scanning).
Motif: branching line + the still figure (now seen flooded-inside). **Axis: 反転** (freeze is
braked high-alert, not low-energy collapse). **Gear-change:** HR trace plunges while pupils dilate.
- Framings: pedals close · pedals→nerve morph med · HR trace wide (top band) · trace plunge macro · pupils/eye insert · pull-back to braked figure.

### seg-03 — §3 The Industry of Self-Blame  · rough.js + bloom
A glossy **`JUST WALK AWAY` poster** on a wall (rough.js block lettering) that **peels/curls
off** to reveal a dim **brain diagram** beneath, where a **fast amygdala low-road** lights
(bloom flare) *before* the cortex begins to glow. A small **still figure stands in a doorway**.
Motif: the still figure, now in a doorway. **Axis: 剥がす.** **Gear-change:** the poster tears
away and the subcortical pathway ignites under it before the cortex lights.
- Framings: figure-in-doorway wide · poster med (slogan readable) · poster peel macro · amygdala flare close (bloom peak) · cortex-lags reveal · pull-back doorway.

### seg-04 — §4 What Freeze Is Quietly Running  · simplex (HERO) + bloom
A **translucent body outline braces on a loop** inside a calm present-day room; a **fog /
time-slow overlay** (simplex flow field, the hero beat) drifts through it, and a **delayed
shadow** repeats the same defensive brace again and again. Motif: the looped brace. **Axis:
gap可視化** (gap between the passed threat and the still-bracing body). **Gear-change:** the
present-day calm scene flickers back into the braced posture.
- Framings: calm room wide · translucent body med · fog drift through chest close · delayed-shadow loop wide · brace macro · silhouette pull-back.

### seg-05 — §5 How to Work With a Reflex You Cannot Outvote  · simplex + bloom + rough.js
A **bottom-up arrow** rises from a still body toward a dim brain (body→brain, not brain→body).
A **slow exhale waveform** (simplex, long period) crosses the frame, and the cold slate palette
**warms** around a small **returning catchlight** (`#f0c98a`, first warmth — `warmLight` warm 0→1).
Motif: the figure begins to *thaw / move* (one finger, one breath). **Axis: 反転** (you don't
outvote it, you signal safety). **Gear-change:** cold palette grades warm as the body releases.
- Framings: still body wide · bottom-up arrow med · exhale waveform across frame · catchlight birth close (bloom warm) · figure-thaws (finger/breath) macro · warm pull-back.

### seg-06 — Outro  · soft bloom + warm floor
Back to a calmer dawn version of the **field from the hook** — the rabbit (and the human
figure) now able to move; grass lit by a low warm sun. The red FREEZE rung still exists but is
**one rung among many**, the marker **rises one rung** (the only reversal). Lighter grade
(warm floor up, soft bloom). Motif: callback to the hook's field, descent reversed. **Axis:
反転** (failure → oldest survival option). **Gear-change:** the marker rises a rung and the
field warms to dawn.
- Framings: dawn field wide · figure/rabbit able-to-move med · ladder-as-one-input (marker rises) insert · warm horizon line · settle wide pull-back.

## Narration → segment map
Hook→seg-00 (`index.html`), §1→seg-01, §2→seg-02, §3→seg-03, §4→seg-04, §5→seg-05, Outro→seg-06.
TTS = Kokoro `am_adam`; words via Whisper `small.en` (`window.segNN`, `seg-NN-words.js`).
Each composition's `data-duration`/`END` = true wav length.
