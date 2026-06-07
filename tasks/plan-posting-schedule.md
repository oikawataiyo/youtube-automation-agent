# Plan: Morning-slot publish scheduling (JST) + posting-time experiment infra

## Requirements (restated)
- Stop posting at JST evening (last time: ~19:00 JST by mistake). Target **early-morning JST** slots aimed at the US/English audience.
- Test slots **06:00 / 08:00 / 10:00 JST** (long-form). Buffer/QuickFrame logic: JST 06:00–08:00 ≈ US-East early-evening, US-West afternoon.
- Build **infra only now** — no posting today. Videos flow in later (production is a separate track; O/P scripts done but not animated; queue currently 0 pending).
- Infra must support **both** experiment shapes:
  - **batch**: fill one morning's 06:00/08:00/10:00 with several ready videos (quick move off evening).
  - **rotate**: 1 video/day, slot cycles 06→08→10→06… across ~30 videos (the only design that can *rank* slots).
- Per-video **slot log** so YouTube Studio's "when viewers are online" + analytics-report can later be read by slot.

## Current state (verified)
- Machine TZ = `Tokyo Standard Time`. `new Date("YYYY-MM-DDTHH:MM")` parses as JST; `.toISOString()` stores UTC. So today's tooling already *can* hit morning JST — the 19:00 was a bad `--start`, not a gap.
- `_publish-state.json`: all 5 jobs seeded as published → **0 pending**. No new video to attach right now.
- `publish-queue.js` schedules via uniform `--start` + `--every`. Cannot express "3 fixed clock-slots per day then jump to next day" (non-uniform spacing).

## Design decisions
1. **Timezone-explicit, not machine-dependent.** Compute UTC from JST clock-time directly (`Date.UTC(y,mo,d, hh-9, mm)`; Japan has no DST). Robust even if the machine TZ changes or this runs in CI.
2. **Additive flags** — when `--slots` is absent, current `--start/--every` behavior is unchanged (no regression for existing callers).
3. **Skip past slots** automatically (YouTube rejects `publishAt` in the past); roll to the next day's slots if today's are gone.
4. **Slot metadata in state**, not a second file — extend each `_publish-state.json` entry with `slotJst` + `weekdayJst`, so analysis joins on the file we already maintain.

## Phases

### Phase 1 — `publish-queue.js` slot/rotate scheduling (core, ~1 file)
New flags (only active when `--slots` is given):
- `--slots "06:00,08:00,10:00"` — JST clock times.
- `--mode batch|rotate` (default `rotate`).
  - `batch`: assign pending videos to the slots **on a single JST date**, in order, skipping past slots; overflow beyond the slot count is ignored this run (warn).
  - `rotate`: 1 video/day; for the i-th pending video → date = `from + i` days, slot = `slots[i % slots.length]`.
- `--from "YYYY-MM-DD"` — first JST date. Default: today if ≥1 slot still future, else tomorrow.
- Build the `publishAt` (UTC ISO) list from (date, jstSlot) pairs via the explicit converter.
- `--dry-run` prints each: `<publishAt UTC> | <JST date HH:MM (Weekday)> | <file> | "<title>"`.

Helper (small, pure, testable):
```
jstSlotToUtcIso("YYYY-MM-DD", "HH:MM") -> ISO string   // subtract 9h, no DST
```

### Phase 2 — Slot logging in state
- On upload, write `slotJst: "06:00"`, `weekdayJst: "Sun"` alongside existing `videoId/publishAt`.

### Phase 3 — Analytics by slot (small)
- Extend `scripts/analytics-report.js` (or a thin `scripts/experiment-report.js`) to group published videos by `slotJst` and show per slot: count, avg first-24h views, avg CTR, avg % viewed. Reads `_publish-state.json` + Analytics API (already wired).
- Label clearly: "directional only until ≥~8–10 videos/slot" (content confound).

### Phase 4 — npm scripts + docs
- `publish:morning` → `package-to-jobs && publish-queue --slots 06:00,08:00,10:00 --mode rotate`.
- Short usage note: batch vs rotate, slots are JST, expectations (weak lever for evergreen; real read-out is the Studio heatmap after data accrues).

## Acceptance criteria
- `node scripts/publish-queue.js --dry-run --slots 06:00,08:00,10:00 --mode batch` prints 3 rows; **06:00 JST on date D → `D-1`T21:00:00Z**, 08:00 → `D-1`T23:00:00Z, 10:00 → `D`T01:00:00Z (verify against hand calc).
- `--mode rotate --from <date> --limit 6` → 6 rows on 6 consecutive JST dates, slots cycling 06/08/10/06/08/10.
- A slot already past **today** is skipped; scheduling rolls forward.
- Omitting `--slots` reproduces today's exact `--start/--every` output (regression check).
- After a real upload, `_publish-state.json` entry carries `slotJst` + `weekdayJst`.
- No new video is posted as part of building this (infra-only, per decision).

## Risks
- **publishAt < now**: handled by past-slot skipping + the existing near-now warning.
- **DST drift (US side)**: JST fixed; US local target shifts ±1h seasonally. Acceptable — fix the JST clock, read results empirically.
- **Quota**: ≤6 uploads/run (unchanged cap); batch of 3 is safe.
- **Analysis confound (not code)**: ranking 06 vs 08 vs 10 needs rotation + ~8–10 videos/slot; documented so results aren't over-read.
- **Scope creep**: video production is explicitly out of scope.

## Complexity: LOW–MEDIUM
- Phase 1 ~1–1.5h · Phase 2 ~15m · Phase 3 ~1h · Phase 4 ~20m. Mostly one file + a small analytics add.

## Out of scope
- Producing/animating new videos (separate track).
- Shorts-specific slots (08:00–10:00) — same mechanism applies later; not built now.
