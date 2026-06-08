# Production Notes - you-feel-lonelier-the-more-connected-you-are-v1

Source: `data/scripts/1780200000003_you-feel-lonelier-the-more-connected-you-are.json`

## Segment Map (Phase 0 done — real narration durations)

Voice: `am_adam` @ speed 0.8, engine `kokoro-onnx-v1.0` (Python 3.14 fallback; see `scripts/generate-kokoro-narration-onnx.py`). Narration text had inline `(year, source)` citations stripped to match the willpower/freeze house style — citations live in the script `.md` and the video description.

| Segment | Heading | Real Duration | Words | Words JS |
|---|---|---:|---:|---|
| seg-00-hook | Hook | 26.8s | 65 | `00-words.js` |
| seg-01-the-connected-and-the-alone | The Connected and the Alone | 117.3s | 284 | `01-words.js` |
| seg-02-the-comparison-machine | The Comparison Machine | 122.0s | 277 | `02-words.js` |
| seg-03-why-it-reaches-so-deep | Why It Reaches So Deep | 115.5s | 274 | `03-words.js` |
| seg-04-passive-scrolling-is-the-poison | Passive Scrolling Is the Poison | 121.9s | 270 | `04-words.js` |
| seg-05-what-your-nervous-system-actually-counts | What Your Nervous System Actually Counts | 118.8s | 287 | `05-words.js` |
| seg-06-outro | Outro | 46.9s | 117 | `06-words.js` |
| **Total** | | **669.2s ≈ 11:09** | 1574 | |

## Next Pass (composition authoring — later sessions)

Phase 0 (scaffold + narration + word timings + design) is complete. Remaining:

1. Author bespoke 3D compositions per `design.md` (cold→warm arc, bright + multi-cut), syncing word-level karaoke captions from each `NN-words.js` (`window.SEGnn_WORDS`).
2. Update `index.html` segment timing to the **real durations** above (replace the generator's estimates).
3. Render per segment, QA frames for brightness/pacing, then concat.
4. Run `npm run check` before each render.
5. Designed thumbnail → `UPLOAD_PACKAGE.md` block → `npm run publish:morning` (schedule to next morning JST slot).

## SEO Title

Why You Feel Lonelier the More Connected You Are
