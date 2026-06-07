/**
 * Plain-node tests for jst-slots helpers. Run: node utils/jst-slots.test.js
 * No framework dependency — exits non-zero on first failure.
 */

const assert = require('assert');
const {
  parseSlots,
  jstSlotToUtcIso,
  addDaysJst,
  weekdayJst,
  buildSlotSchedule,
} = require('./jst-slots');

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.error(`  ✗ ${name}\n    ${e.message}`);
    process.exitCode = 1;
  }
}

// --- parseSlots ---
test('parseSlots normalizes and validates', () => {
  assert.deepStrictEqual(parseSlots('06:00,08:00,10:00'), ['06:00', '08:00', '10:00']);
  assert.deepStrictEqual(parseSlots(' 6:00 , 8:00 '), ['06:00', '08:00']);
  assert.deepStrictEqual(parseSlots(''), []);
  assert.throws(() => parseSlots('25:00'));
  assert.throws(() => parseSlots('0600'));
});

// --- JST -> UTC conversion (acceptance criteria hand calc) ---
test('jstSlotToUtcIso: 06/08/10 JST on D map to D-1 21/23 and D 01 Z', () => {
  assert.strictEqual(jstSlotToUtcIso('2026-06-10', '06:00'), '2026-06-09T21:00:00.000Z');
  assert.strictEqual(jstSlotToUtcIso('2026-06-10', '08:00'), '2026-06-09T23:00:00.000Z');
  assert.strictEqual(jstSlotToUtcIso('2026-06-10', '10:00'), '2026-06-10T01:00:00.000Z');
});

test('addDaysJst / weekdayJst', () => {
  assert.strictEqual(addDaysJst('2026-06-10', 1), '2026-06-11');
  assert.strictEqual(addDaysJst('2026-06-30', 1), '2026-07-01');
  // 2026-06-10 is a Wednesday.
  assert.strictEqual(weekdayJst('2026-06-10'), 'Wed');
});

// Fixed "now" well before the test dates so nothing is in the past.
const NOW = new Date('2026-06-08T00:00:00Z');

// --- batch ---
test('batch: 3 pending -> 3 rows on one date, slots in order', () => {
  const { rows } = buildSlotSchedule({
    pending: ['a.job.json', 'b.job.json', 'c.job.json'],
    slots: ['06:00', '08:00', '10:00'],
    mode: 'batch',
    from: '2026-06-10',
    now: NOW,
  });
  assert.strictEqual(rows.length, 3);
  assert.deepStrictEqual(rows.map((r) => r.slotJst), ['06:00', '08:00', '10:00']);
  assert.strictEqual(rows.every((r) => r.dateJst === '2026-06-10'), true);
  assert.strictEqual(rows[0].publishAt.toISOString(), '2026-06-09T21:00:00.000Z');
});

test('batch: overflow beyond slot count is dropped with a warning', () => {
  const { rows, warnings } = buildSlotSchedule({
    pending: ['a', 'b', 'c', 'd'],
    slots: ['06:00', '08:00', '10:00'],
    mode: 'batch',
    from: '2026-06-10',
    now: NOW,
  });
  assert.strictEqual(rows.length, 3);
  assert.strictEqual(warnings.some((w) => /overflow/.test(w)), true);
});

// --- rotate ---
test('rotate: 6 videos -> 6 consecutive dates, slots cycle 06/08/10/06/08/10', () => {
  const { rows } = buildSlotSchedule({
    pending: ['a', 'b', 'c', 'd', 'e', 'f'],
    slots: ['06:00', '08:00', '10:00'],
    mode: 'rotate',
    from: '2026-06-10',
    now: NOW,
    limit: 6,
  });
  assert.strictEqual(rows.length, 6);
  assert.deepStrictEqual(
    rows.map((r) => r.slotJst),
    ['06:00', '08:00', '10:00', '06:00', '08:00', '10:00']
  );
  assert.deepStrictEqual(
    rows.map((r) => r.dateJst),
    ['2026-06-10', '2026-06-11', '2026-06-12', '2026-06-13', '2026-06-14', '2026-06-15']
  );
});

test('rotate respects --limit', () => {
  const { rows } = buildSlotSchedule({
    pending: ['a', 'b', 'c', 'd', 'e', 'f'],
    slots: ['06:00', '08:00', '10:00'],
    mode: 'rotate',
    from: '2026-06-10',
    now: NOW,
    limit: 2,
  });
  assert.strictEqual(rows.length, 2);
});

// --- past-slot skipping ---
test('batch skips a slot already past today, keeps future slots', () => {
  // now = 2026-06-10 07:00 JST  (= 2026-06-09T22:00Z). 06:00 is past, 08:00/10:00 future.
  const now = new Date('2026-06-09T22:00:00Z');
  const { rows, warnings } = buildSlotSchedule({
    pending: ['a', 'b'],
    slots: ['06:00', '08:00', '10:00'],
    mode: 'batch',
    from: '2026-06-10',
    now,
  });
  assert.deepStrictEqual(rows.map((r) => r.slotJst), ['08:00', '10:00']);
  assert.strictEqual(warnings.some((w) => /skip past slot 06:00/.test(w)), true);
});

test('batch default-from rolls to tomorrow when all of today is past', () => {
  // now = 2026-06-10 11:00 JST (= 02:00Z). All of today's 06/08/10 are past.
  const now = new Date('2026-06-10T02:00:00Z');
  const { rows } = buildSlotSchedule({
    pending: ['a'],
    slots: ['06:00', '08:00', '10:00'],
    mode: 'batch',
    now,
  });
  assert.strictEqual(rows[0].dateJst, '2026-06-11');
  assert.strictEqual(rows[0].slotJst, '06:00');
});

test('rotate default-from rolls past 06:00 to tomorrow when today 06:00 gone', () => {
  // now = 2026-06-10 07:00 JST (= 2026-06-09T22:00Z). today 06:00 past.
  const now = new Date('2026-06-09T22:00:00Z');
  const { rows } = buildSlotSchedule({
    pending: ['a', 'b'],
    slots: ['06:00', '08:00', '10:00'],
    mode: 'rotate',
    now,
  });
  assert.strictEqual(rows[0].dateJst, '2026-06-11');
  assert.strictEqual(rows[0].slotJst, '06:00');
});

console.log(`\n${passed} passed`);
