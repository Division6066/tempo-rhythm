import { describe, expect, test } from "bun:test";
import {
  endOfLocalDayMs,
  endOfLocalWeekMondayMs,
  startOfLocalDayMs,
  startOfLocalWeekMondayMs,
} from "./localDay";

describe("startOfLocalDayMs / endOfLocalDayMs", () => {
  test("end is exactly 24h after start", () => {
    const sample = new Date(2026, 5, 18, 15, 45, 0);
    expect(endOfLocalDayMs(sample) - startOfLocalDayMs(sample)).toBe(
      24 * 60 * 60 * 1000,
    );
  });

  test("start aligns to local midnight", () => {
    const sample = new Date(2026, 5, 18, 23, 59, 59);
    const start = new Date(startOfLocalDayMs(sample));
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getDate()).toBe(18);
  });
});

describe("startOfLocalWeekMondayMs", () => {
  test("Thursday maps back to Monday 00:00 local", () => {
    const thu = new Date(2026, 5, 18, 12, 0, 0);
    const monday = new Date(startOfLocalWeekMondayMs(thu));
    expect(monday.getDay()).toBe(1);
    expect(monday.getDate()).toBe(15);
    expect(monday.getHours()).toBe(0);
  });

  test("Sunday maps back to previous Monday", () => {
    const sun = new Date(2026, 5, 21, 10, 0, 0);
    const monday = new Date(startOfLocalWeekMondayMs(sun));
    expect(monday.getDay()).toBe(1);
    expect(monday.getDate()).toBe(15);
  });
});

describe("endOfLocalWeekMondayMs", () => {
  test("week window is exactly 7 days", () => {
    const sample = new Date(2026, 5, 18, 9, 0, 0);
    expect(endOfLocalWeekMondayMs(sample) - startOfLocalWeekMondayMs(sample)).toBe(
      7 * 24 * 60 * 60 * 1000,
    );
  });
});
