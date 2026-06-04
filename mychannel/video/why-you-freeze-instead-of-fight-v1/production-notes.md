# Production Notes — Why You Freeze Instead of Fight (v1)

Bespoke 3D (three.js importmap + bloom / seeded simplex-noise / rough.js), built on the
`your-anxiety-is-a-threat-forecast-v1` kit (`scene-kit.js`, `fx-kit.js` copied verbatim).

- **Source script**: `data/scripts/1780200000001_why-you-freeze-instead-of-fight.json` (1677 words)
- **Topic spec**: `tasks/script-spec-N.md`
- **Pillar**: neuroscience · **Unifying motif**: the autonomic ladder (arousal → fight/flight → freeze → tonic immobility → collapse)
- **Narration**: Kokoro `am_adam` @ speed 0.8; word timings via Whisper `small.en` (`seg-NN-words.js`)

## Segments (composition → narration → render)

| seg | composition | beat | render |
|-----|-------------|------|--------|
| 00 hook | `index.html` | frozen rabbit / dusk field + hawk shadow | `renders/seg-00.mp4` (22s) |
| 01 | `compositions/seg-01.html` | The Defense Cascade — descending ladder + dropping marker | seg-01.mp4 (150s) |
| 02 | `compositions/seg-02.html` | The Brake, Not the Gas — pedals→vagal nerves, HR plunge, pupil dilate | seg-02.mp4 (150s) |
| 03 | `compositions/seg-03.html` | Industry of Self-Blame — "JUST WALK AWAY" poster peels → amygdala fast-path | seg-03.mp4 (160s) |
| 04 | `compositions/seg-04.html` | What Freeze Is Quietly Running — looped brace + simplex fog (HERO) | seg-04.mp4 (172s) |
| 05 | `compositions/seg-05.html` | Work With a Reflex — bottom-up arrow + first-warmth thaw | seg-05.mp4 (158s) |
| 06 outro | `compositions/seg-06.html` | dawn field callback, marker rises one rung (the only reversal) | seg-06.mp4 (64s) |

## Outputs
- Per-seg: `renders/seg-NN.mp4` (gitignored)
- Full: `renders/why-you-freeze-instead-of-fight-v1-full.mp4` — **14.6 min** (876s), video+audio (gitignored)
- `renders/concat.txt` — committed (stream-copy concat list)

## Caveats
- **Runtime ≈ 14.6 min**, not the script's rough `estimated_duration_minutes: 9` (a word-count
  estimate). Actual length = summed Kokoro wav duration at speed 0.8 (consistent with anxiety-v1's
  ~11.5 min). Concat duration matches summed wav length within 0.3%.
- **Caption mistranscriptions**: Whisper occasionally garbles spoken citations (e.g. "Carrive"→"Kariv",
  "Schauer"→"Shower", "Zeitschrift für"→"Zytrift Fur"). The narration audio is correct; only the
  auto-generated caption text is affected. Acceptable per pipeline (captions are auto from TTS).
- `.wav` narration is gitignored by repo convention (regenerate from `assets/narration/seg-NN.txt`
  via `npm run video:produce -- <path> --skip-build` + local `_transcribe.py`).
- All motion is deterministic (pure functions of the GSAP timeline proxy `t`; seeded noise; fixed
  rough.js seeds). Lint: 0 errors.
