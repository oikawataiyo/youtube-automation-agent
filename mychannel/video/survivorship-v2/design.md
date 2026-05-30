# Design System — Survivorship Bias video

Dark editorial motion-graphics. Register: Sisyphus 55 / Einzelgänger — restrained, contemplative, authoritative. No clutter, every element earns its place.

## Palette

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#0a0c10` | deep blue-black ground |
| `--bg-grid` | `#141925` | faint technical grid lines |
| `--bone` | `#e8e4d8` | bomber silhouette / primary form |
| `--steel` | `#9aa6b2` | secondary lines, annotations |
| `--ink` | `#f4efe6` | primary text |
| `--mute` | `#6b7280` | secondary/dim text |
| `--alarm` | `#d8392e` | bullet-hole red dots |
| `--warn` | `#ff5a3c` | warning glow on clean areas (the reveal) |
| `--gold` | `#caa86a` | rare emphasis / marker highlight |

## Type

System stack (deterministic, no network fonts):
- Display / kinetic: `"Helvetica Neue", Arial, sans-serif` — tight, uppercase, heavy weight, wide tracking for labels.
- Contemplative / captions: `Georgia, "Times New Roman", serif` — for narration lines and reflective beats.
- Sizes (1080p): display 110–160px, sub-display 56–72px, caption 40–46px, label 22–26px (tracked 0.15em).

## Motion grammar

- Entrances: `gsap.from(opacity:0, y:+24, duration:0.8, ease:"power3.out")`. Build hero-frame layout first, then animate in.
- Default ease `power2.inOut`; contemplative `power1.inOut`; the reversal gear-change uses `power4.in` (snap).
- NO exit animations except the final beat of a scene. Scene transitions are mandatory (crossfade/wipe), no jump cuts.
- One deliberate gear-change per scene (fills the manifest Pacing gap).

## Captions

Synced burned-in, lower third. Phrase-grouped from `transcript.json` word timings; active word gets `--gold` marker emphasis. No BGM, no SFX — narration audio only.

## Determinism

Seeded PRNG (mulberry32) for any scatter/particle. No `Math.random`, no `Date.now`, no `repeat:-1` (finite repeats computed from duration). All timelines `{paused:true}`, registered on `window.__timelines`.

## Richness rules (anti-monotony)

1. No static hold > ~15s. 2. Recurring motifs (bomber, empty-mat, success-curve) reappear and change meaning. 3. Kinetic type as its own beats. 4. Marker highlight per beat. 5. Every statistic animates. 6. ≥1 gear-change per scene. 7. Per-scene visual register. 8. Seeded ambient particles so dark frames never feel dead.

## Per-scene visual register

- seg-00 HOOK: top-down bomber blueprint; red-dot accumulation; clean-area warning-glow reveal.
- (later scenes defined as built.)
