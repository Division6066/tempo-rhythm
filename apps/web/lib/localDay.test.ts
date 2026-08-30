import { describe, expect, test } from "bun:test";
import {
  endOfLocalDayMs,
  endOfLocalWeekMondayMs,
  startOfLocalDayMs,
  startOfLocalWeekMondayMs,
} from "./localDay";

describe("startOfLocalDayMs / endOfLocalDayMs", () => {
  test("end is exactly 24h after start", () => {
    const sample = new Date(2026, 5, 18, 15, 45, 30);
    const start = startOfLocalDayMs(sample);
    const end = endOfLocalDayMs(sample);
    expect(end - start).toBe(24 * 60 * 60 * 1000);
  });

  test("start aligns to local midnight", () => {
    const sample = new Date(2026, 5, 18, 23, 59, 59, 999);
    const start = new Date(startOfLocalDayMs(sample));
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(start.getMilliseconds()).toBe(0);
  });
});

describe("startOfLocalWeekMondayMs", () => {
  test("Wednesday maps back to Monday 00:00 local", () => {
    const wednesday = new Date(2026, 5, 17, 12, 0, 0); // Wed Jun 17 2026
    const mondayStart = new Date(startOfLocalWeekMondayMs(wednesday));
    expect(mondayStart.getDay()).toBe(1);
    expect(mondayStart.getDate()).toBe(15);
    expect(mondayStart.getHours()).toBe(0);
  });

  test("Sunday maps back to previous Monday", () => {
    const sunday = new Date(2026, 5, 21, 18, 0, 0); // Sun Jun 21 2026
    const mondayStart = new Date(startOfLocalWeekMondayMs(sunday));
    expect(mondayStart.getDay()).toBe(1);
    expect(mondayStart.getDate()).toBe(15);
  });

  test("Monday stays on the same calendar Monday", () => {
    const monday = new Date(2026, 5, 15, 9, 30, 0);
    const mondayStart = new Date(startOfLocalWeekMondayMs(monday));
    expect(mondayStart.getDay()).toBe(1);
    expect(mondayStart.getDate()).toBe(15);
    expect(mondayStart.getHours()).toBe(0);
  });
});

describe("endOfLocalWeekMondayMs", () => {
  test("week window is exactly seven days", () => {
    const sample = new Date(2026, 5, 18, 12, 0, 0);
    const start = startOfLocalWeekMondayMs(sample);
    const end = endOfLocalWeekMondayMs(sample);
    expect(end - start).toBe(7 * 24 * 60 * 60 * 1000);
  });

  test("consecutive weeks do not overlap", () => {
    const week1End = endOfLocalWeekMondayMs(new Date(2026, 5, 17, 12, 0, 0));
    const week2Start = startOfLocalWeekMondayMs(new Date(2026, 5, 22, 12, 0, 0));
    expect(week1End).toBe(week2Start);
  });
});
