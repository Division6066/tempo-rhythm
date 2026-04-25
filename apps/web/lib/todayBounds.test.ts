import { describe, expect, test } from "bun:test";
import { getLocalDayBoundsMs } from "./todayBounds";

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
