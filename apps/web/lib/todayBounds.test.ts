import { describe, expect, test } from "bun:test";
import { getLocalDayBoundsMs, nextLocalDayRolloverDelayMs } from "./todayBounds";

describe("getLocalDayBoundsMs", () => {
  test("returns a 24h half-open window in local time", () => {
    const noon = new Date(2026, 3, 15, 12, 30, 45);
    const bounds = getLocalDayBoundsMs(noon);
    expect(bounds.endMs - bounds.startMs).toBe(24 * 60 * 60 * 1000);
    expect(bounds.startMs).toBeLessThanOrEqual(noon.getTime());
    expect(bounds.endMs).toBeGreaterThan(noon.getTime());
  });

  test("startMs aligns to local midnight", () => {
    const sample = new Date(2026, 3, 15, 23, 59, 59, 999);
    const bounds = getLocalDayBoundsMs(sample);
    const start = new Date(bounds.startMs);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(start.getMilliseconds()).toBe(0);
    expect(start.getFullYear()).toBe(sample.getFullYear());
    expect(start.getMonth()).toBe(sample.getMonth());
    expect(start.getDate()).toBe(sample.getDate());
  });

  test("a task with dueAt = endMs - 1 falls inside today's bounds", () => {
    const bounds = getLocalDayBoundsMs(new Date(2026, 3, 15, 9));
    const dueAt = bounds.endMs - 1;
    expect(dueAt).toBeGreaterThanOrEqual(bounds.startMs);
    expect(dueAt).toBeLessThan(bounds.endMs);
  });

  test("a task with dueAt = endMs (exclusive) falls outside today's bounds", () => {
    const bounds = getLocalDayBoundsMs(new Date(2026, 3, 15, 9));
    const dueAt = bounds.endMs;
    expect(dueAt < bounds.startMs || dueAt >= bounds.endMs).toBe(true);
  });

  test("crossing midnight produces non-overlapping consecutive windows", () => {
    const today = getLocalDayBoundsMs(new Date(2026, 3, 15, 23, 59, 59));
    const tomorrow = getLocalDayBoundsMs(new Date(2026, 3, 16, 0, 0, 0, 1));
    expect(today.endMs).toBe(tomorrow.startMs);
  });
});

describe("nextLocalDayRolloverDelayMs", () => {
  test("at noon the next rollover is roughly 12 hours away (with 50ms cushion)", () => {
    const noon = new Date(2026, 3, 15, 12, 0, 0).getTime();
    const delay = nextLocalDayRolloverDelayMs(noon);
    const twelveHours = 12 * 60 * 60 * 1000;
    expect(delay).toBeGreaterThanOrEqual(twelveHours);
    expect(delay).toBeLessThanOrEqual(twelveHours + 100);
  });

  test("one second before midnight the delay is ~1050ms (1s + 50ms cushion)", () => {
    const almostMidnight = new Date(2026, 3, 15, 23, 59, 59).getTime();
    const delay = nextLocalDayRolloverDelayMs(almostMidnight);
    expect(delay).toBeGreaterThanOrEqual(1000);
    expect(delay).toBeLessThanOrEqual(1100);
  });

  test("exactly at midnight the delay floors to a positive 50ms minimum", () => {
    const midnight = new Date(2026, 3, 16, 0, 0, 0).getTime();
    const delay = nextLocalDayRolloverDelayMs(midnight);
    // At local midnight the previous-day window has just closed; the helper
    // recomputes against the new day, which gives a full ~24h delay. The key
    // invariant is that it is strictly positive (>= 50ms) so a stale timer
    // can never fire-immediately-loop.
    expect(delay).toBeGreaterThanOrEqual(50);
  });

  test("delay is always strictly positive", () => {
    for (const ts of [
      new Date(2026, 0, 1, 0, 0, 0).getTime(),
      new Date(2026, 5, 30, 23, 59, 59, 999).getTime(),
      new Date(2026, 11, 31, 12, 0, 0).getTime(),
      Date.now(),
    ]) {
      expect(nextLocalDayRolloverDelayMs(ts)).toBeGreaterThanOrEqual(50);
    }
  });

  test("delay aligns to the day rollover (now + delay >= next-day startMs)", () => {
    const sample = new Date(2026, 3, 15, 14, 30, 0).getTime();
    const delay = nextLocalDayRolloverDelayMs(sample);
    const nextDay = getLocalDayBoundsMs(new Date(sample)).endMs;
    expect(sample + delay).toBeGreaterThanOrEqual(nextDay);
  });
});
