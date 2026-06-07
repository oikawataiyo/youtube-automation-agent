# Posting-time experiment (morning-JST slots)

Goal: publish in **early-morning JST** (US/English prime time) instead of the JST
evening, and collect enough data to tell which morning slot performs best.

Test slots: **06:00 / 08:00 / 10:00 JST** (long-form). JST 06:00–08:00 ≈ US-East
early-evening / US-West afternoon.

## Quick start

```bash
# Render videos -> add blocks to UPLOAD_PACKAGE.md, then:
npm run publish:morning:plan   # dry-run: see the schedule, upload nothing
npm run publish:morning        # build jobs + upload, scheduled at JST morning slots
npm run experiment:slots       # per-slot analytics read-out (once data accrues)
```

## Two experiment shapes

`scripts/publish-queue.js --slots 06:00,08:00,10:00 --mode <batch|rotate>`

- **batch** — fill *one* morning's 06:00/08:00/10:00 with the next ready videos.
  Quick way to move off the evening; cannot rank slots (same day = same confound).
- **rotate** (default) — 1 video/day, slot cycles 06→08→10→06… across the dates.
  The **only** shape that can rank slots, because each slot sees many different
  videos over time.

Slots are **JST clock times**. Conversion is explicit (UTC+9, no DST), independent
of the machine timezone: `06:00 JST on D → (D-1)T21:00:00Z`.

Flags: `--from YYYY-MM-DD` (first JST date; default today if a slot is still
future, else tomorrow), `--limit N` (≤6, YouTube upload quota), `--dry-run`.
Past slots are skipped automatically. Omitting `--slots` keeps the legacy
`--start/--every` drip unchanged.

## Reading the results

Each upload records `slotJst` + `weekdayJst` in
`mychannel/output/jobs/_publish-state.json`. `npm run experiment:slots` groups
published videos by slot and shows avg views + avg retention.

**This is a weak lever for evergreen content and DIRECTIONAL ONLY** until roughly
8–10 videos/slot — below that, content quality dominates the posting time. The
authoritative signal is YouTube Studio's *"when your viewers are online"* heatmap
once impressions accrue. Fix the JST clock; read the US-local result empirically
(it drifts ±1h with US DST).

## Tests

`npm run test:slots` covers the JST→UTC math, batch/rotate building, limits, and
past-slot skipping (`utils/jst-slots.test.js`).
