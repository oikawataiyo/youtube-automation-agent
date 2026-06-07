# BUILD SPEC — seg-04-decisions.html (HyperFrames composition)

You are building ONE file: `mychannel/video/survivorship-v2/compositions/seg-04-decisions.html`.

## How to work

1. **READ `compositions/seg-03-industries.html` FIRST** and copy its structure verbatim as the
   template: `<head>` style block + palette CSS vars, the `mulberry32` PRNG, the `svg()` / `textSvg()`
   helpers, the seeded particle loop, the caption-phrase builder + karaoke loop, and the
   `window.__timelines[...] = gsap.timeline({paused:true})` registration. Match its coding style exactly.
2. Reuse the same `<style>` palette tokens (`--bg --bg-grid --bone --steel --ink --mute --alarm --warn
   --gold` and seg-03's extra `--green --paper --deep`). Same fonts.
3. This is a DIFFERENT scene — do NOT copy seg-03's bookstore/Denrell/phone visuals. Build the NEW
   visuals below. Only the scaffolding/conventions are copied.

## Composition shell (exact)

- Root: `<div id="root" data-composition-id="seg-04-decisions" data-start="0" data-duration="292.9"
  data-width="1920" data-height="1080">`
- Audio: `<audio id="vo" data-start="0" data-duration="292.9" data-track-index="9"
  src="../assets/narration/seg-04-decisions.wav" data-volume="1"></audio>`
- Word-timings script in `<head>`: `<script src="../assets/narration/seg-04-words.js"></script>`
  (global is `window.SEG04_WORDS`).
- Layers, each `class="clip" data-start="0" data-duration="292.9"` with `data-track-index`:
  0 = `#bg` (grid, particles, washes, vignette), 1 = `#stage` (SVG `#stageSvg viewBox 0 0 1920 1080`),
  2 = `#labels` (kicker + domain labels), 3 = `#type` (HTML cards/callouts/center blocks),
  4 = `#caps` (captions, built in JS).
- Kicker text: `SURVIVORSHIP BIAS &nbsp;.&nbsp; <span class="num">PART 05</span>` (seg-00=PART 01 →
  seg-04 = PART 05). Same kicker/kickerline intro tween as seg-03 (in at ~0.4).
- `const DUR = 292.9;` Single paused timeline registered as
  `window.__timelines["seg-04-decisions"] = tl;` at the end.

## Hard constraints (lint will fail otherwise)

- Every timed element has `data-start`, `data-duration`, `data-track-index` AND `class="clip"`.
- Deterministic ONLY: use `mulberry32` (seed `20260604`) for any scatter. NO `Math.random`, NO
  `Date.now`, NO network, NO `repeat:-1` (use finite repeats).
- Comments in English only (no katakana / non-ASCII prose in code comments).
- Captions: build phrase groups from `window.SEG04_WORDS` with seg-03's splitter (break on `.?!`, or on
  `,` when `cur.length>=6`, or when `cur.length>=10`); active word gets `color:#f4efe6` (`--ink`) marker
  at `parseFloat(wEl.dataset.start)`; phrase fade in at `start-0.15`, out at next phrase `start-0.1`.
- `npm run check` must pass with 0 errors. Known-harmless warnings (`duplicate_audio_track`,
  `GSAP target not found`) are fine.

## Scene identity

"The Decisions This Is Ruining." Register: editorial, then turning intimate at the confession.
**Signature recurring motif = a SURVIVOR / GRAVEYARD split**: left side = ONE lit survivor (gold),
right side = a field/row of DIM identical others who tried the same and failed (steel/grey, faint).
This split **recurs and transforms across the 4 decision domains** (career, relationships, investing,
risk), then the coin motif takes over for the confession and takeaway. Keep the left/right spatial
language consistent so the eye learns it. Captions live at the bottom — keep visuals above y≈900.

Richness bar (must hold): no static hold > ~15s; the **confession (B6) is the deliberate gear-change**
(reset to a dim single spotlight, slower pacing); every statistic ANIMATES (count-up + grid/bar fill);
one marker-highlight emphasis per beat; distinct register from seg-03.

## BEATS — all times are SECONDS, keyed to actual narration word-starts. Build a hero layout, then
## animate elements in/out around these cues. Clear each beat's elements before the next.

**B0 INTRO (0 – 3.6).** Short. Center title `IT STOPS BEING / ABSTRACT` (bigTitle style), in ~0.3,
out ~3.2. bg/grid/particles/kicker in at 0–0.5.

**B1 CAREER (3.8 – 34.8).** Domain label `CAREER` in @3.8.
- LEFT: a single lit rising path — a gold polyline climbing up-right + a gold node at top labeled
  `SUCCESSFUL AT 24`. In @4.2.
- RIGHT: a graveyard of faint figures (seeded scatter of ~40 small steel dots/strokes) representing the
  hidden failures. Reveal them progressively as the narration names them: `NOVELIST — never published`
  @17.1, `MUSICIAN — never broke through` ~22, `older and broker and quieter` @28.56 (figures sink /
  fade greyer). Use 3 small right-side labels.
- CALLOUT `THE PATH IS REAL / THE BASE RATE IS HIDDEN` @31.76; marker-emphasis (warn color) on
  `HIDDEN` ~33.2.
- Clear B1 ~34.6.

**B2 RELATIONSHIPS (35.14 – 56.0).** Domain label `RELATIONSHIPS` @35.14.
- LEFT: one couple glyph (two joined gold circles) labeled `30 YEARS` lit @36.1.
- RIGHT: a row of ~8 identical couple glyphs (steel). @42.54 ("you don't survey the people who
  divorced") they split apart / turn `--alarm` then fade grey.
- CALLOUT `THE ADVICE SURVIVED · THE COUPLE SURVIVED` @43.66, then a second line
  `so you assume the advice caused it` ~47.
- Emphasis line `UNKNOWABLE FROM THE INSIDE` @54.16 (warn).
- Clear B2 ~55.8.

**B3 INVESTING (56.48 – 97.8).** The big statistic beat. Domain label `INVESTING` @56.48.
- Journal card (copy seg-03 `#journal` card style exactly): `year 2018` / name
  `Journal of Financial Economics` / title `Just 4% of stocks created the entire net wealth gain` /
  author `Bessembinder` — in @58.98.
- DATA-IN-MOTION grid: a 10×10 grid of 100 cells (use the seeded svg helper). @63.42 light up **4**
  cells gold (`Just 4%`) with a count-up label `0% → 4%` (tabular-nums, seg-03 `.metric .num` style);
  label `the entire market's net wealth gain`. Add a small `1926 – 2016` caption @68.64.
- @72.6 the other **96** cells fill dim steel; count-up label `96%`; sub-label
  `≈ short-term Treasury bills` @76.4.
- CALLOUT `EVERY STOCK-PICKER IS A SURVIVOR / pulled from a small lucky sample` @79.02.
- @96.66 `the rest get day jobs` — a cluster of dim figures; brief marker emphasis.
- Clear B3 ~97.8.

**B4 RISK-TAKING (98.16 – 130.0).** Domain label `RISK-TAKING` @98.16.
- LEFT: a lit `FOUNDER` hero card (gold) — `quit the job · bet the savings · made it work` @99.88.
- Source label `U.S. BUREAU OF LABOR STATISTICS / BUSINESS EMPLOYMENT DYNAMICS` @110.6.
- DATA-IN-MOTION: two count-up metrics (seg-03 `.metric` style) with bars:
  `20.4%` (label `fail in year one`) count-up @115.34; `65.3%` (label `fail within ten years`)
  count-up @119.6. Pair each with a graveyard bar/figure fill that grows to the percentage.
- CALLOUT `ONE DATA POINT / from a graveyard of identical-looking attempts` @127.08; emphasis on
  `graveyard`.
- Clear B4 ~129.8.

**B5 THE FAIR OBJECTION (130.42 – 175.6).** A dialectical, slightly lighter register.
- Label/quote `A FAIR OBJECTION` @130.42.
- Speech-style card: `"isn't there signal in the survivors?"` @135.8.
- Answer line `YES — WITH A KNIFE EDGE OF ASTERISKS` @144.5 (gold).
- Line `you cannot tell signal from noise inside the sample` @148.96.
- HIGH-VARIANCE viz: 100 seeded dots; @156.68 ONE dot balloons gold + label `1 BILLIONAIRE`, the other
  99 shrink grey + label `99 BARISTAS` (~159). 
- CALLOUT `EVIDENCE THE STRATEGY IS HIGH-VARIANCE / not evidence it is GOOD`, then
  `TWO DIFFERENT CLAIMS` @168.32 (marker emphasis).
- Clear B5 ~175.6.

**B6 CONFESSION (176.04 – 230.5) — THE GEAR-CHANGE.** Reset the stage: fade everything, drop to a
single warm `--gold` spotlight on dark, slower pacing.
- Line `I'M GOING TO ADMIT SOMETHING` @176.04 (intimate, smaller, serif-ish if you like).
- A folded-paper card set down: `MY INVESTING NOTEBOOK · 2014` @180.52 (slight drop-in + settle).
- `the track record was, on paper, undeniable` card @186.96.
- `ONE OF SEVEN STUDENTS` @201.22 → render **7** coin/figure tokens in a row, all gold.
- @204.06 `the other six went bankrupt` → 6 tokens fall + turn `--alarm`/grey, ONE remains gold.
- `A COIN FLIPPED SEVEN TIMES` @208.56 → the surviving token becomes a spinning coin.
- `TAUGHT BY THE ONE HEADS` @212.2 → coin lands HEADS, gold flash. This is the emotional apex.
- `I was lucky — I lost a small amount` @213.4; `it cost me a year of savings` @223.6 (the notebook
  card dims / a year crossed off).
- Hold, then clear ~229.8.

**B7 TAKEAWAY (230.76 – 247.8).**
- `THE MISTAKE ISN'T ADMIRING THE SURVIVOR` @230.76.
- `IT'S USING THEM AS EVIDENCE FOR YOUR OWN DECISION` @234.12 (emphasis on `EVIDENCE`).
- Big closing line `INSPIRATION WITHOUT BASE RATES` @238.86 → second line
  `IS A COIN TOSS SOMEONE WON / REPACKAGED AND SOLD AS A STRATEGY` @244.98 (callback: a small coin glyph
  reappears next to it).
- Clear B7 ~247.8.

**B8 TRANSITION → seg-05 (248.42 – 292.9).** Pull back / widen.
- `STEP BACK FROM YOUR OWN DECISIONS` @248.42.
- The meta turn — a centered line `IF WE CAN SEE THIS … WHY DOES NOBODY ACT ON IT?` building around
  @266.66.
- Hard emphasis (gear): `THE FIX IS NOT MORE INFORMATION` @282.34 (warn color, scale-in snap like
  seg-03's `power4.in`).
- Deep-tease (mirror seg-03's `#deepTease` into the next scene): `ONE LAYER DEEPER THAN INDUSTRY`
  @285.52 → `ALL THE WAY TO THE INSIDE OF YOUR SKULL` @291.44 (warn). Hold to 292.9.

## Output

Write ONLY the file. Then report back: the file path, total element/timeline-tween count, and the
result of running `npm run check` from `mychannel/video/survivorship-v2` (paste only the
errors/warnings summary, not full logs). Do NOT print the file contents.
