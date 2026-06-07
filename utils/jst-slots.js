/**
 * Pure helpers for JST clock-slot scheduling.
 *
 * Japan Standard Time is a fixed UTC+9 with no daylight saving, so converting a
 * JST clock time to UTC is just "subtract 9 hours". This is computed explicitly
 * (not via the machine timezone) so the result is identical on any host or CI.
 *
 *   06:00 JST on date D  ->  (D-1)T21:00:00Z
 *   08:00 JST on date D  ->  (D-1)T23:00:00Z
 *   10:00 JST on date D  ->  (D  )T01:00:00Z
 */

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const JST_OFFSET_MS = 9 * 3600 * 1000;
const MIN_FUTURE_MS = 60 * 1000; // YouTube rejects publishAt in the past; keep a small buffer

/**
 * Parse "06:00,08:00,10:00" into a normalized ["06:00","08:00","10:00"].
 * @param {string} str
 * @returns {string[]}
 */
function parseSlots(str) {
  if (!str) return [];
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = /^(\d{1,2}):(\d{2})$/.exec(s);
      if (!m) throw new Error(`invalid slot "${s}" (expected HH:MM)`);
      const hh = Number(m[1]);
      const mm = Number(m[2]);
      if (hh > 23 || mm > 59) throw new Error(`slot out of range "${s}"`);
      return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    });
}

/**
 * Convert a JST date + clock slot to a UTC Date instant.
 * @param {string} dateStr  "YYYY-MM-DD" (JST calendar date)
 * @param {string} slot     "HH:MM" (JST clock time)
 * @returns {Date}
 */
function jstSlotToUtcDate(dateStr, slot) {
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!dm) throw new Error(`invalid date "${dateStr}" (expected YYYY-MM-DD)`);
  const sm = /^(\d{1,2}):(\d{2})$/.exec(slot);
  if (!sm) throw new Error(`invalid slot "${slot}" (expected HH:MM)`);
  const y = Number(dm[1]);
  const mo = Number(dm[2]);
  const d = Number(dm[3]);
  const hh = Number(sm[1]);
  const mm = Number(sm[2]);
  // JST -> UTC: subtract the 9h offset directly via Date.UTC.
  return new Date(Date.UTC(y, mo - 1, d, hh - 9, mm, 0, 0));
}

/** ISO "YYYY-MM-DD" string (for dry-run output). */
function jstSlotToUtcIso(dateStr, slot) {
  return jstSlotToUtcDate(dateStr, slot).toISOString();
}

/** JST calendar date ("YYYY-MM-DD") for a given instant. */
function jstDateString(date) {
  return new Date(date.getTime() + JST_OFFSET_MS).toISOString().slice(0, 10);
}

/** Add `n` days to a "YYYY-MM-DD" JST date string. */
function addDaysJst(dateStr, n) {
  const [y, mo, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, mo - 1, d) + n * 86400000).toISOString().slice(0, 10);
}

/** Weekday ("Sun".."Sat") of a "YYYY-MM-DD" JST date. */
function weekdayJst(dateStr) {
  const [y, mo, d] = dateStr.split('-').map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()];
}

/**
 * Build a publish schedule from JST clock slots.
 *
 * @param {object} opts
 * @param {string[]} opts.pending  pending job filenames, in order
 * @param {string[]} opts.slots    normalized JST slots, e.g. ["06:00","08:00","10:00"]
 * @param {'batch'|'rotate'} [opts.mode='rotate']
 * @param {string} [opts.from]     first JST date "YYYY-MM-DD" (default: today or tomorrow)
 * @param {Date}   [opts.now=new Date()]
 * @param {number} [opts.limit=6]  max uploads this run
 * @returns {{ rows: Array<{file:string, publishAt:Date, slotJst:string, dateJst:string, weekdayJst:string}>, warnings: string[] }}
 */
function buildSlotSchedule({ pending, slots, mode = 'rotate', from, now = new Date(), limit = 6 }) {
  if (!slots || !slots.length) throw new Error('slots required');
  if (mode !== 'batch' && mode !== 'rotate') throw new Error(`invalid mode "${mode}" (batch|rotate)`);
  const warnings = [];
  const isFuture = (dateStr, slot) =>
    jstSlotToUtcDate(dateStr, slot).getTime() > now.getTime() + MIN_FUTURE_MS;

  if (mode === 'batch') {
    let baseDate = from;
    if (!baseDate) {
      const today = jstDateString(now);
      baseDate = slots.some((s) => isFuture(today, s)) ? today : addDaysJst(today, 1);
    }
    const futureSlots = slots.filter((s) => isFuture(baseDate, s));
    for (const s of slots) {
      if (!isFuture(baseDate, s)) warnings.push(`skip past slot ${s} JST on ${baseDate}`);
    }
    const rows = [];
    for (const slot of futureSlots) {
      if (rows.length >= pending.length || rows.length >= limit) break;
      const dateJst = baseDate;
      rows.push({
        file: pending[rows.length],
        publishAt: jstSlotToUtcDate(dateJst, slot),
        slotJst: slot,
        dateJst,
        weekdayJst: weekdayJst(dateJst),
      });
    }
    const capacity = Math.min(futureSlots.length, limit);
    if (pending.length > capacity) {
      warnings.push(
        `${pending.length - capacity} video(s) overflow ${capacity} usable slot(s) on ${baseDate}; not scheduled this run`
      );
    }
    return { rows, warnings };
  }

  // rotate: 1 video/day, slot cycles across days.
  let baseDate = from;
  if (!baseDate) {
    const today = jstDateString(now);
    baseDate = isFuture(today, slots[0]) ? today : addDaysJst(today, 1);
  }
  const rows = [];
  const count = Math.min(pending.length, limit);
  for (let i = 0; i < count; i++) {
    const dateJst = addDaysJst(baseDate, i);
    const slot = slots[i % slots.length];
    if (!isFuture(dateJst, slot)) {
      warnings.push(`skip past ${dateJst} ${slot} JST (${pending[i]})`);
      continue;
    }
    rows.push({
      file: pending[i],
      publishAt: jstSlotToUtcDate(dateJst, slot),
      slotJst: slot,
      dateJst,
      weekdayJst: weekdayJst(dateJst),
    });
  }
  return { rows, warnings };
}

module.exports = {
  WEEKDAYS,
  parseSlots,
  jstSlotToUtcDate,
  jstSlotToUtcIso,
  jstDateString,
  addDaysJst,
  weekdayJst,
  buildSlotSchedule,
};
