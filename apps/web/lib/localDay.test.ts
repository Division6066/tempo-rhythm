import { describe, expect, test } from "bun:test";
import {
  endOfLocalDayMs,
  endOfLocalWeekMondayMs,
  startOfLocalDayMs,
  startOfLocalWeekMondayMs,
} from "./localDay";

describe("startOfLocalDayMs / endOfLocalDayMs", () => {
  test("end is exactly 24h after start", () => {
    const sample = new Date(2026, 3, 15, 14, 30, 0);
    expect(endOfLocalDayMs(sample) - startOfLocalDayMs(sample)).toBe(24 * 60 * 60 * 1000);
  });

  test("start aligns to local midnight", () => {
    const sample = new Date(2026, 3, 15, 23, 59, 59, 999);
    const start = new Date(startOfLocalDayMs(sample));
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(start.getMilliseconds()).toBe(0);
  });
});

describe("startOfLocalWeekMondayMs", () => {
  test("Wednesday maps back to Monday 00:00 local", () => {
    const wednesday = new Date(2026, 3, 15, 10, 0, 0); // Wed Apr 15 2026
    const mondayStart = new Date(startOfLocalWeekMondayMs(wednesday));
    expect(mondayStart.getDay()).toBe(1);
    expect(mondayStart.getDate()).toBe(13);
    expect(mondayStart.getHours()).toBe(0);
  });

  test("Sunday maps back to previous Monday", () => {
    const sunday = new Date(2026, 3, 19, 15, 0, 0); // Sun Apr 19 2026
    const mondayStart = new Date(startOfLocalWeekMondayMs(sunday));
    expect(mondayStart.getDay()).toBe(1);
    expect(mondayStart.getDate()).toBe(13);
  });

  test("Monday stays on the same calendar Monday", () => {
    const monday = new Date(2026, 3, 13, 8, 0, 0);
    const mondayStart = new Date(startOfLocalWeekMondayMs(monday));
    expect(mondayStart.getFullYear()).toBe(2026);
    expect(mondayStart.getMonth()).toBe(3);
    expect(mondayStart.getDate()).toBe(13);
    expect(mondayStart.getHours()).toBe(0);
  });
});

describe("endOfLocalWeekMondayMs", () => {
  test("week window is exactly 7 days", () => {
    const sample = new Date(2026, 3, 15, 12, 0, 0);
    const start = startOfLocalWeekMondayMs(sample);
    const end = endOfLocalWeekMondayMs(sample);
    expect(end - start).toBe(7 * 24 * 60 * 60 * 1000);
  });

  test("consecutive weeks do not overlap", () => {
    const thisWeek = startOfLocalWeekMondayMs(new Date(2026, 3, 15));
    const nextWeek = startOfLocalWeekMondayMs(new Date(2026, 3, 22));
    expect(endOfLocalWeekMondayMs(new Date(2026, 3, 15))).toBe(nextWeek);
    expect(thisWeek).toBeLessThan(nextWeek);
  });
});
