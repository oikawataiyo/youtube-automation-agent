# Plan: Thumbnail system + re-thumbnail existing 5 (CTR fix)

## Honest framing
- Channel is 1 day old, API total views 0 → **the "1% CTR" is noise, not yet evidence.** We are NOT optimizing against data; we are fixing visible craft defects and *creating* the conditions to measure CTR honestly.
- Existing thumbs are frame-grabs (`thumbs/<topic>-<sec>.jpg` → FINAL). Six defects: burned-in subtitles, too dark, no focal subject, tiny/clipped text, no brand consistency, weak curiosity gap.

## Decisions (locked)
- **Scope:** build template + **re-thumbnail the existing 5** (free, instant, no re-render). Bake into pipeline after.
- **Style:** big text (3–5 words) + expressive chibi, bright bg + brand accent, one curiosity gap. No subtitle text on thumbnail, ever.

## Brand rules (the template enforces these)
1. Bright/high-contrast bg (accent gradient, never near-black). Must pop at 120px mobile width.
2. One large focal subject = the chibi, close, with a clear emotion/pose matching the topic.
3. 3–5 huge heavy words, fully inside safe margins (no edge clipping), white + 1 accent.
4. Consistent layout grid + corner brand mark → recognizable as "Autopilot".
5. Curiosity gap: thumbnail poses the question, doesn't repeat the title.
6. NEVER ship a video frame with burned-in captions.

## Technical approach
- **Thumbnail = HyperFrames single-frame HTML render** at 1280×720:
  - Layer 1: bright accent bg (CSS gradient).
  - Layer 2: chibi PNG — render the existing scene-kit chibi (three.js) to transparent PNG, one per needed emotion (sad/curious/alert/etc.). Cache PNGs.
  - Layer 3: hook text (heavy webfont) + brand mark.
  - Render frame → `sharp` → JPG ≤2MB.
- **`scripts/set-thumbnail.js`** (new, small): `node scripts/set-thumbnail.js <videoId> <image>` → `youtube.thumbnails.set` (pattern already in youtube-upload.js). Reads videoIds from `_publish-state.json`; supports `--all` to map FINAL set → 5 videos. `--dry-run`.

## Phases
1. **Template** — one parameterized HTML thumbnail composition `{hook, accent, chibiEmotion}` + render→jpg step. Acceptance: produces a bright, legible 1280×720 JPG ≤2MB with no clipped text.
2. **Chibi expression PNGs** — render the scene-kit chibi at a flattering angle in the few emotions the 5 topics need; transparent PNGs cached under `assets/thumb-chibi/`.
3. **Design 5** — hook copy + emotion + accent per video:
   - survivorship → e.g. "THE PLANES THAT CAME BACK LIED"
   - depression → e.g. "IT WAS NEVER A CHEMICAL IMBALANCE"
   - pull-away → e.g. "WHY YOU PUSH LOVE AWAY"
   - anxiety → e.g. "YOUR BRAIN IS FORECASTING THREATS"
   - freeze → e.g. "WHY YOU FREEZE INSTEAD OF FIGHT"
   (final copy iterated with you.)
4. **APPROVAL GATE** — render all 5, show side-by-side vs the old ones. **No upload until you approve.** (Outward-facing change; reversible but public.)
5. **Upload** — `set-thumbnail.js --all`. Verify each video shows the new thumb in Studio.
6. **Pipeline bake-in** — add the thumbnail render as a required step so every future video ships a designed thumbnail (kills frame-grabs). `package-to-jobs` points `thumbnail` at the rendered file.

## Acceptance criteria
- 5 new thumbnails: bright, ≤2MB, 3–5 words unclipped, chibi focal, consistent mark, no subtitles.
- `set-thumbnail.js --dry-run` lists 5 (videoId ↔ image) correctly; real run swaps all 5; Studio reflects them.
- Old frame-grab thumbs untouched on disk (so we can revert).
- Pipeline: a fresh produce run emits a designed thumbnail, not a frame.

## Risks
- **Chibi render fidelity at thumbnail size** — close crop + rim light; if 3D render is slow/ugly, fall back to a bold 2D mark + text-dominant layout (still satisfies rules 1,3,4,6).
- **YouTube thumbnail quota** — `thumbnails.set` is cheap; 5 calls fine.
- **CTR readout still needs time + volume** — 5 swaps give a *before/after* signal once impressions accrue (~days); don't over-read week 1.
- **Subjectivity** — mitigated by the approval gate (step 4) and sample-first.

## Out of scope
- Retention/pacing (separate lever; see prior brightness+cut feedback).
- Producing a brand-new video (separate track; it will inherit this template).
