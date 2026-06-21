import { describe, expect, test } from "bun:test";
import { computeHabitStreakUpdate } from "./habitStreak";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("computeHabitStreakUpdate", () => {
  test("first completion starts streak at 1", () => {
    const now = 1_700_000_000_000;
    const result = computeHabitStreakUpdate(now, undefined, 0, 0);
    expect(result.alreadyDone).toBe(false);
    if (!result.alreadyDone) {
      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(1);
    }
  });

  test("same UTC day returns alreadyDone without incrementing", () => {
    const last = 1_700_000_000_000;
    const now = last + 6 * 60 * 60 * 1000;
    const result = computeHabitStreakUpdate(now, last, 3, 5);
    expect(result.alreadyDone).toBe(true);
    if (result.alreadyDone) {
      expect(result.currentStreak).toBe(3);
    }
  });

  test("exactly one day later increments streak", () => {
    const last = 1_700_000_000_000;
    const now = last + DAY_MS;
    const result = computeHabitStreakUpdate(now, last, 4, 4);
    expect(result.alreadyDone).toBe(false);
    if (!result.alreadyDone) {
      expect(result.currentStreak).toBe(5);
      expect(result.longestStreak).toBe(5);
    }
  });

  test("two or more days gap resets streak to 1", () => {
    const last = 1_700_000_000_000;
    const now = last + 2 * DAY_MS;
    const result = computeHabitStreakUpdate(now, last, 10, 10);
    expect(result.alreadyDone).toBe(false);
    if (!result.alreadyDone) {
      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(10);
    }
  });

  test("longest streak only increases when current exceeds prior best", () => {
    const last = 1_700_000_000_000;
    const now = last + DAY_MS;
    const result = computeHabitStreakUpdate(now, last, 2, 7);
    expect(result.alreadyDone).toBe(false);
    if (!result.alreadyDone) {
      expect(result.currentStreak).toBe(3);
      expect(result.longestStreak).toBe(7);
    }
  });
});
