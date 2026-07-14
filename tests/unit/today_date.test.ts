import { describe, expect, test } from "bun:test";
import { getLocalDayBoundsMs, nextLocalDayRolloverDelayMs } from "../../apps/web/lib/todayBounds";

process.env.TZ = "America/New_York";

describe("Today local date helpers", () => {
  test("uses the next local midnight as the exclusive end on DST spring-forward days", () => {
    const sample = new Date(2026, 2, 8, 12, 0, 0);
    const bounds = getLocalDayBoundsMs(sample);
    const end = new Date(bounds.endMs);

    expect(end.getFullYear()).toBe(2026);
    expect(end.getMonth()).toBe(2);
    expect(end.getDate()).toBe(9);
    expect(end.getHours()).toBe(0);
    expect(end.getMinutes()).toBe(0);
    expect(bounds.endMs - bounds.startMs).toBe(23 * 60 * 60 * 1000);
  });

  test("keeps quick-add dueAt = endMs - 1 inside the local day", () => {
    const bounds = getLocalDayBoundsMs(new Date(2026, 10, 1, 9, 30, 0));
    const dueAt = bounds.endMs - 1;

    expect(dueAt).toBeGreaterThanOrEqual(bounds.startMs);
    expect(dueAt).toBeLessThan(bounds.endMs);
  });

  test("schedules the next rollover after the exclusive end of today", () => {
    const almostMidnight = new Date(2026, 2, 8, 23, 59, 59, 900).getTime();
    const delay = nextLocalDayRolloverDelayMs(almostMidnight);
    const { endMs } = getLocalDayBoundsMs(new Date(almostMidnight));

    expect(almostMidnight + delay).toBeGreaterThanOrEqual(endMs);
    expect(delay).toBeGreaterThan(0);
  });
});
