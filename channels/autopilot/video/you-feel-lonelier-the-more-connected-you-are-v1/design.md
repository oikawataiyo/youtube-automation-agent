# Design System - you-feel-lonelier-the-more-connected-you-are-v1

Reference tone: `channels/autopilot/video/willpower-is-not-a-muscle-v1` (latest), 3D via `assets/lib/scene-kit.js` pattern (three.js + importmap, deterministic seek-driven render).

## Tone (v2 — brighter, more cuts)

Past viewer feedback (memory `video_pacing_brightness_feedback`): 3D は良いが **画面が暗い & 同じ絵が長く退屈**。This video must be **luminous** and **cut often**.

This topic carries its own visual thesis — **cold vs warm**:

- **Cold blue** = the feed, the glow, passive consumption, comparison, the "almost-contact" that does not count.
- **Warm amber** = real contact: a message answered, a voice, a person physically entering the room.

Drive a deliberate **cold → warm arc** across the video. Early segments live in cold phone-glow; the resolution segments (04–05) and outro must *bloom warm and bright* so the payoff is felt, not just narrated. Never let a single shot hold longer than ~6–8s without a cut, push-in, reframe, or motif change.

## Palette

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#10131c` | base ground — lifted from near-black so frames read brighter |
| `--bg-warm` | `#1c1812` | warm-room ground (payoff segments) |
| `--feed-blue` | `#3b6ed6` | cold phone-glow / feed light |
| `--feed-cyan` | `#5fd0ff` | screen highlight, scroll sheen |
| `--amber` | `#ffb24c` | real contact, warmth, ember |
| `--amber-hot` | `#ff8a3d` | the moment warmth ignites |
| `--ink` | `#f4efe6` | primary text |
| `--bone` | `#e8e4d8` | diagram strokes |
| `--steel` | `#9aa6b2` | secondary annotation / inactive caption |
| `--mute` | `#6b7686` | caption inactive |

Caption active word: `--ink` on a soft amber underglow in warm segments, cool white in cold segments.

## Motion Grammar

- **Cut often:** min 1 visible change every 6–8s (reframe, new motif, push-in, palette shift). No static hold > ~8s.
- **One emotional gear-change per segment**, but multiple micro-cuts within it.
- **Light is the lead actor:** the feed under-lights faces in cold blue; warmth always comes from *inside the room / from another person*, not from the screen.
- Word-level karaoke captions in the lower third, synced from `assets/narration/NN-words.js` (`window.SEGnn_WORDS`).
- Recurring motifs: the **lone figure** (simple 3D form, phone-lit), the **vertical feed column**, the **warm ember**, the **two-way arrow** (mutual contact). Reuse across segments for cohesion.

## Segment Briefs

Durations are first-pass estimates; replace with real narration lengths after TTS (`*.json` sidecars) before authoring timing.

| Seg | Heading | 🎬 Core visual (from script) | v2 brightening / cuts |
|---|---|---|---|
| 00 | Hook | Dark room, one face under-lit by cold phone-glow; endless highlight-reel thumbnails reflected in the eyes; rest of room in shadow. | Keep the cold glow strong but lift skin/edge light so it's not muddy. Fast thumbnail scroll in the eye-reflection = built-in motion. End on a slow push toward the eyes. |
| 01 | The Connected and the Alone | Cold blue bedroom; two thin graph lines `connection` and `loneliness` both rising **together**; small figure under phone light. | Lines drawn fast (cut on each data label). Glowing feed-cyan grid. The paradox = both lines climbing → hold the crossing beat, then cut. |
| 02 | The Comparison Machine | Glowing vertical feed becomes an **upward escalator** of highlight posts; the figure climbs, each step steeper. | Brightest cold segment — saturated feed-cyan posts streaming up. Multiple cuts as steps steepen. Figure shrinks against the rising escalator. |
| 03 | Why It Reaches So Deep | A small **ember** glows in the figure's chest; it flares reaching for warmth — but a flat phone-image of a crowded dinner slides into the space where a person should be. | First warm light source (`--amber` ember) against cold room → strong contrast = brighter overall. Cut between ember bloom and the cold flat image sliding in. |
| 04 | Passive Scrolling Is the Poison | **Split screen:** grey passive scroll sinking on one side; warm two-way message thread glowing with bidirectional arrows on the other; a **30-minute dial** clicks into place above. | The pivot. Left half desaturates/sinks; right half blooms `--amber`. Dial click = a hard cut/beat. Brightness rises on the warm half. |
| 05 | What Your Nervous System Actually Counts | Same dark-room figure sends **one real message**; the cold feed-column dims; another person enters frame; warm light spreads **from inside the room**. | Payoff — go warmest/brightest here. Feed-blue fades out; `--bg-warm` ground; amber fills the room as the second figure arrives. Several gentle cuts as warmth spreads. |
| 06 | Outro | Notification swarm; loneliness as **signal, not verdict**; small sparks that look warm from far away; give *moments* of contact, not *photos* of contact. End on a quiet question. | Settle from swarm into one warm steady point. Final frame: calm, bright-warm, a single question on screen. |

## Source

- Topic: つながるほど、孤独になる感覚 (Why you feel lonelier the more connected you are)
- Title (EN): Why You Feel Lonelier the More Connected You Are
- Pillar: modern-life
- Script: `data/scripts/1780200000003_you-feel-lonelier-the-more-connected-you-are.{json,md}`
