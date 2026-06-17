import { describe, expect, test } from "bun:test";
import {
  endOfLocalDayMs,
  endOfLocalWeekMondayMs,
  startOfLocalDayMs,
  startOfLocalWeekMondayMs,
} from "./localDay";

describe("startOfLocalDayMs / endOfLocalDayMs", () => {
  test("end is exactly 24h after start", () => {
    const sample = new Date(2026, 3, 15, 14, 30);
    expect(endOfLocalDayMs(sample) - startOfLocalDayMs(sample)).toBe(24 * 60 * 60 * 1000);
  });

  test("start aligns to local midnight", () => {
    const start = new Date(startOfLocalDayMs(new Date(2026, 3, 15, 23, 59)));
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
  });
});

describe("startOfLocalWeekMondayMs", () => {
  test("Wednesday maps back to Monday 00:00 local", () => {
    const wed = new Date(2026, 3, 15, 12, 0); // Wed Apr 15 2026
    const monday = new Date(startOfLocalWeekMondayMs(wed));
    expect(monday.getDay()).toBe(1);
    expect(monday.getDate()).toBe(13);
    expect(monday.getHours()).toBe(0);
  });

  test("Sunday maps back to previous Monday", () => {
    const sun = new Date(2026, 3, 19, 10, 0); // Sun Apr 19 2026
    const monday = new Date(startOfLocalWeekMondayMs(sun));
    expect(monday.getDay()).toBe(1);
    expect(monday.getDate()).toBe(13);
  });

  test("Monday stays on same calendar day at midnight", () => {
    const mon = new Date(2026, 3, 13, 15, 0);
    const monday = new Date(startOfLocalWeekMondayMs(mon));
    expect(monday.getDate()).toBe(13);
    expect(monday.getHours()).toBe(0);
  });
});

describe("endOfLocalWeekMondayMs", () => {
  test("week window is exactly 7 days", () => {
    const sample = new Date(2026, 3, 15, 9);
    const start = startOfLocalWeekMondayMs(sample);
    const end = endOfLocalWeekMondayMs(sample);
    expect(end - start).toBe(7 * 24 * 60 * 60 * 1000);
  });

  test("consecutive weeks do not overlap", () => {
    const week1End = endOfLocalWeekMondayMs(new Date(2026, 3, 15));
    const week2Start = startOfLocalWeekMondayMs(new Date(2026, 3, 20));
    expect(week1End).toBe(week2Start);
  });
});
