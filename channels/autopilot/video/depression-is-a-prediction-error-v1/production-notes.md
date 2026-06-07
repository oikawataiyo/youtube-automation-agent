# Production Notes - depression-is-a-prediction-error-v1

Source: `data/scripts/1779800000002_depression-is-a-prediction-error.json`

## Segment Map

| Segment | Heading | Est. Duration | Words |
|---|---:|---:|---:|
| seg-00-hook | Hook | 31.4s | 77 |
| seg-01-the-map-we-got-wrong | The Map We Got Wrong | 100s | 249 |
| seg-02-the-predictive-brain-theory | The Predictive Brain Theory | 105s | 243 |
| seg-03-the-body-that-won-t-stop-burning | The Body That Won't Stop Burning | 100s | 267 |
| seg-04-why-just-be-positive-backfires | Why Just Be Positive Backfires | 100s | 265 |
| seg-05-what-actually-reaches-the-circuit | What Actually Reaches The Circuit | 110s | 328 |
| seg-06-outro | Outro | 77.6s | 190 |

## Next Pass

1. Generate narration per `assets/narration/seg-*.txt` using the same `am_adam` voice as `survivorship-v2`.
2. Transcribe each WAV to word timing JS.
3. Replace estimated caption scheduling in `index.html` with word-level timing.
4. Add 1-2 custom visual motifs per section, based on each `visual_note`.
5. Run `npm run check`, then render.

## SEO Title

Depression Isn't Sadness — It's Your Brain Refusing To Predict The Future
