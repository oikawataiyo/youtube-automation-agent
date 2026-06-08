# Plan: Shorts experiment (pivot from long-form)

**Date:** 2026-06-08
**Channel:** Psycolloge (internal key `autopilot`, UCxEagAMHdRgP22rKN8uHWig)
**Why:** long-form 11–15min faceless explainers have terrible cold-start distribution and cost multiple sessions each. Shorts are pushed to non-subscribers → break cold-start, and are cheap/fast → real signal in days. See memory `muteki_oji_analysis` (旬度/stance drive views), `loneliness_video_phase0`.

## Goal of the experiment

Test **hook + topic** resonance fast. Ship a handful of Shorts, read retention/views/shares within days, then double down on whatever lands. This is a *signal-finding* exercise, not polish.

## Format (locked)

- **1080×1920 vertical**, ~40–50s, kinetic typography (NO heavy 3D — that defeats cheap/fast).
- Bold animated text + word-level karaoke captions synced from `words.js`, simple moving background (grain/gradient/drift), one accent color.
- Voice: Kokoro `am_adam` (brand-consistent) via `scripts/generate-kokoro-narration-onnx.py`; word timings via `scripts/transcribe-word-timings.py`.
- Structure: **0–2s pattern-interrupt hook → counterintuitive mechanism → one takeaway → share CTA.**
- Render via existing `scripts/render-video-playwright.js` (HTML composition), output 1080×1920.

## Pipeline per short (fast loop)

1. Write `assets/narration/00-<slug>.txt` (~100–120 words).
2. `generate-kokoro-narration-onnx.py <project> --voice am_adam --speed 0.8` → wav + json.
3. `transcribe-word-timings.py <project>` → `00-words.js`.
4. Drop into the vertical `index.html` template (shared), set accent + bg motif.
5. `render-video-playwright.js . --output renders/<slug>.mp4` at 1080×1920.

## Project layout

```
channels/autopilot/shorts/
  _template/index.html         # shared vertical kinetic-type template
  <slug>-s1/
    assets/narration/00-<slug>.txt (+ .wav .json, 00-words.js)
    index.html                 # copy of template, wired to this short's words.js + copy
    renders/<slug>.mp4
```

## First batch (3 — different hooks to compare)

| # | Slug | Source script | Hook angle |
|---|---|---|---|
| 1 | connected-but-lonely | loneliness (P) | "you open the app to feel less alone, and close it lonelier" |
| 2 | pull-away | avoidant attachment (pull-away) | "the closer someone gets, the more you want to run — here's why" |
| 3 | willpower-no-tank | willpower myth (O) | "you didn't run out of willpower. there was never a tank." |

Ship #1 end-to-end first to prove the vertical pipeline, then batch #2/#3.

## Acceptance

- [ ] `_template/index.html` renders deterministically at 1080×1920 via playwright renderer.
- [ ] Short #1 mp4 exists (~45s), captions synced, hook readable in first 2s.
- [ ] Upload path: Shorts post (private/scheduled) — decide cadence after first numbers.
