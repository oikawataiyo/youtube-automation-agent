# design.md — Your Anxiety Is a Threat Forecast (v1)

Built on the **why-you-pull-away-v2** kit (`scene-kit.js`, copied verbatim) + new
`fx-kit.js` (bloom / seeded simplex-noise / rough.js). Source script:
`data/scripts/1780100000001_your-anxiety-is-a-threat-forecast.md`.

## Unifying motif
**Weather / forecast.** Anxiety = a prediction the brain already believed. Two visual
through-lines carry it: (1) **simplex-driven storm lines** (breath, body-weather, clouds)
and (2) **bloom glow** on the alarm/screen/daylight. Cold slate-blue baseline; one warm
daylight lift only at the end (seg-05/06), mirroring the v2 "warmth floor" grade.

## Palette (extends scene-kit COL)
- BG `#0e1116` · COLD `#8b9bb0` (slate, the anxious baseline) · ALARM `#ff2a1a`
- SCREEN glow `#9fc0ff` (cold phone/screen light) · DAYLIGHT `#f0c98a` (warm, seg-05/06 only)
- caption ink `#f4efe6` / rest `#5b6472` (scene-kit defaults)

## Global rules (same bars as v2)
- Render via `composer.render()` (bloom) inside `gsap.timeline({ onUpdate })`. No
  `Date.now`/`Math.random`/`rAF`. Seeded noise sampled with a timeline `t`. rough.js fixed seed.
- Set `window.THREE = THREE` in each composition module **before** calling `SceneKit` fns.
- **Max 4s per camera framing** via `makeCutter.auto(from,to,~4,frames,dolly)`; 5 `makeCameraRig`
  framings per 3D segment. Brightness floors via `warmLight` + `makeFill`.
- Karaoke captions from real word timings (`buildCaptions`/`wireCaptions`, `window.segNN`).
- Each composition declares the importmap (three 0.160 + addons + simplex-noise@4 + roughjs@4.6.6).

## Segment briefs

### seg-00 — Hook (`index.html`)  · bloom + simplex
3am bedroom. Phone face-down, screen afterglow grazing the ceiling. A figure under the duvet,
**chest rising too fast** (simplex-driven breath on the torso scale/position). Bedside clock
digits refuse to change. Bloom halos the screen afterglow. Beat: stillness everywhere except
the racing chest → "your body isn't reacting to danger, it's rehearsing it."
Framings: wide room · over-the-shoulder to ceiling glow · close on chest · clock insert · low room.

### seg-01 — §1 火事の前に鳴る警報  · bloom
Silent dark hallway, every room dark and empty, a single **red alarm under glass ringing**
(bloom-haloed, pulsing strength on the proxy). Push in; the alarm's reflection resolves into a
human eye. Beat: the alarm fires before the fire — fast low-road threat path.
Framings: hallway wide · alarm med · alarm macro (bloom peak) · reflection/eye · pull-back.

### seg-02 — §2 分からなさに耐えられない  · rough.js + bloom
A figure before a **wall of closed doors, each marked only with a hand-drawn `?`** (rough.js,
seed-fixed). A cold light-slit (bloom) slides door to door but never opens one. Beat: anxiety
lives on the blank, not the monster; uncertainty is the fuel.
Framings: figure+wall wide · door row pan · single `?` door · cold slit close · figure back.

### seg-03 — §3 体が予測を書いてしまう  · simplex (HERO) + bloom
**Transparent body**; weather-map isolines flow through chest and stomach (simplex flow field,
the hero beat), then break outward into a storm projected from inside the body. Bloom on the
brightest fronts. Beat: the prediction becomes the evidence — interoceptive loop.
Framings: full body front · chest weather close · stomach close · body→outward storm wide · silhouette.

### seg-04 — §4 予測を生かし続ける輪  · rough.js + bloom
Night classroom, empty desks. A lone notebook **stamps `SAFE` (rough.js chalk) every time a door
shuts**, while the blackboard still reads `DANGER` (rough.js chalk). Beat: avoidance teaches the
wrong lesson — "avoided, therefore nothing happened."
Framings: classroom wide · desk+notebook med · `SAFE` stamp macro · blackboard `DANGER` · door close.

### seg-05 — §5 予測を測り直す  · rough.js + bloom + simplex
A hand turns an old **brass barometer dial from `STORM` → `CHANGEABLE`** (rough.js dial face,
bloom on the brass). Window still cloudy (simplex clouds) but a **thin warm line of daylight**
on the horizon (bloom, first warmth). Beat: don't silence the alarm — teach it a better estimate.
Framings: barometer wide · dial hand close · dial face macro · window/cloud wide · daylight line.

### seg-06 — Outro  · soft bloom
Back to a calmer version of the room. The alarm still glows but is now **one input among many**
(softer bloom). Lighter grade (warmth floor up). Beat: not a person without an alarm — a person
who taught the alarm a better forecast. Repair callback to the Hook's bedroom.
Framings: calm room wide · figure med · alarm (soft) · window daylight · settle wide.

## Narration → segment map
Hook→seg-00, §1→seg-01, §2→seg-02, §3→seg-03, §4→seg-04, §5→seg-05, Outro→seg-06.
Strip `> 📝 Visual` / `⏱` / headings; keep spoken prose only. TTS = Kokoro; words via Whisper
(`_transcribe.py`, `window.segNN`). Each composition's `data-duration`/`END` = true wav length.
