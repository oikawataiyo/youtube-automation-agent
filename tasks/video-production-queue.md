# Video Production Queue

Reference tone: `mychannel/video/survivorship-v2`.

## Status

Initial HyperFrames packages are generated for every completed modern script except survivorship. These are first-pass visual assemblies: dark editorial motion graphics, kinetic type, estimated captions, segment timing from script duration estimates, and per-segment narration text files.

Next production pass is narration and word-level caption sync.

## Queue

| Priority | Project | Source Script | Status |
|---:|---|---|---|
| 1 | `mychannel/video/your-brain-decides-before-you-do-v1` | `data/scripts/1779800000001_your-brain-decides-before-you-do.json` | completed: narration, word-level captions, QA, MP4 |
| 2 | `mychannel/video/depression-is-a-prediction-error-v1` | `data/scripts/1779800000002_depression-is-a-prediction-error.json` | initial package checked |
| 3 | `mychannel/video/your-attention-span-was-hijacked-v1` | `data/scripts/1779800000003_your-attention-span-was-hijacked.json` | initial package checked |
| 4 | `mychannel/video/why-you-crash-out-over-someone-you-barely-know-v1` | `data/scripts/1779900000001_why-you-crash-out-over-someone-you-barely-know.json` | initial package checked |
| 5 | `mychannel/video/your-brain-treats-losses-as-twice-as-loud-v1` | `data/scripts/1779900000002_your-brain-treats-losses-as-twice-as-loud.json` | initial package checked |
| 6 | `mychannel/video/social-pain-is-real-pain-v1` | `data/scripts/1779900000003_social-pain-is-real-pain.json` | initial package checked |
| 7 | `mychannel/video/rumination-is-your-default-mode-network-v1` | `data/scripts/1780000000001_rumination-is-your-default-mode-network.json` | initial package checked |
| 8 | `mychannel/video/memory-rewrites-itself-every-time-v1` | `data/scripts/1780000000002_memory-rewrites-itself-every-time.json` | initial package checked |
| 9 | `mychannel/video/contempt-is-the-best-predictor-of-divorce-v1` | `data/scripts/1780000000003_contempt-is-the-best-predictor-of-divorce.json` | initial package checked |
| 10 | `mychannel/video/spotlight-effect-v1` | `data/scripts/spotlight-effect.json` | initial package checked |
| 11 | `mychannel/video/your-body-remembers-trauma-v1` | `data/scripts/your-body-remembers-trauma.json` | initial package checked |
| 12 | `mychannel/video/test-video-v1` | `data/scripts/test-video.json` | initial package checked |
| 13 | `mychannel/video/your-anxiety-is-a-threat-forecast-v1` | `data/scripts/1780100000001_your-anxiety-is-a-threat-forecast.json` | completed: narration, word-level captions, QA, MP4 |
| 14 | `mychannel/video/why-you-pull-away-when-someone-gets-close-v1` | `data/scripts/1780100000002_why-you-pull-away-when-someone-gets-close.json` | completed: narration, word-level captions, QA, MP4 |
| 15 | `mychannel/video/procrastination-is-emotion-regulation-v1` | `data/scripts/1780100000003_procrastination-is-emotion-regulation.json` | completed: narration, word-level captions, QA, MP4 |
| 16 | `mychannel/video/your-brain-argues-to-win-not-find-truth-v1` | `data/scripts/1780100000004_your-brain-argues-to-win-not-find-truth.json` | completed: narration, word-level captions, QA, MP4 |

## Production Loop

For each project:

1. Generate narration from `assets/narration/*.txt` using the same `am_adam` Kokoro voice used by `survivorship-v2`.
2. Transcribe generated audio to word timings.
3. Replace estimated captions in `index.html` with word-level karaoke captions.
4. Add 1-2 custom motif passes per section using each segment's `visualNote` in `assets/segments.json`.
5. Run `npm run check`.
6. Render, then inspect before moving to the next project.

## Generator

Regenerate the queue packages with:

```bash
node scripts/create-video-projects.js --all
```

Generate a single package with:

```bash
node scripts/create-video-projects.js data/scripts/1779800000001_your-brain-decides-before-you-do.json
```
