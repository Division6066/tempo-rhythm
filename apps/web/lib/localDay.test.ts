import { describe, expect, test } from "bun:test";
import { getLocalDayBoundsMs } from "./todayBounds";
import {
  endOfLocalDayMs,
  endOfLocalWeekMondayMs,
  startOfLocalDayMs,
  startOfLocalWeekMondayMs,
} from "./localDay";

describe("startOfLocalDayMs / endOfLocalDayMs", () => {
  test("match getLocalDayBoundsMs for the same date", () => {
    const sample = new Date(2026, 3, 15, 14, 30, 0);
    const bounds = getLocalDayBoundsMs(sample);
    expect(startOfLocalDayMs(sample)).toBe(bounds.startMs);
    expect(endOfLocalDayMs(sample)).toBe(bounds.endMs);
  });

  test("end is exactly 24h after start", () => {
    const sample = new Date(2026, 5, 1, 9, 0, 0);
    expect(endOfLocalDayMs(sample) - startOfLocalDayMs(sample)).toBe(24 * 60 * 60 * 1000);
  });
});

describe("startOfLocalWeekMondayMs", () => {
  test("returns same Monday for mid-week dates", () => {
    const wednesday = new Date(2026, 3, 15, 12, 0, 0); // Wed Apr 15 2026
    const monday = startOfLocalWeekMondayMs(wednesday);
    const mondayDate = new Date(monday);
    expect(mondayDate.getDay()).toBe(1);
    expect(mondayDate.getHours()).toBe(0);
    expect(mondayDate.getDate()).toBe(13);
  });

  test("Sunday maps to previous Monday", () => {
    const sunday = new Date(2026, 3, 19, 18, 0, 0); // Sun Apr 19 2026
    const monday = startOfLocalWeekMondayMs(sunday);
    const mondayDate = new Date(monday);
    expect(mondayDate.getDay()).toBe(1);
    expect(mondayDate.getDate()).toBe(13);
  });
});

describe("endOfLocalWeekMondayMs", () => {
  test("spans exactly seven days from week start", () => {
    const sample = new Date(2026, 3, 16, 10, 0, 0);
    const start = startOfLocalWeekMondayMs(sample);
    const end = endOfLocalWeekMondayMs(sample);
    expect(end - start).toBe(7 * 24 * 60 * 60 * 1000);
  });
});
