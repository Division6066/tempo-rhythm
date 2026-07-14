import { describe, expect, test } from "bun:test";
import { applyHabitCompletion, calculateHabitStreak, getUtcDayKey } from "../../convex/lib/habit_streak";

describe("habit streak calculation", () => {
  test("returns zero streaks for an empty history", () => {
    expect(calculateHabitStreak([])).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      completedDayKeys: [],
    });
  });

  test("deduplicates same-day checkoffs", () => {
    expect(calculateHabitStreak(["2026-07-14", "2026-07-14"])).toEqual({
      currentStreak: 1,
      longestStreak: 1,
      completedDayKeys: ["2026-07-14"],
    });
  });

  test("counts consecutive calendar days by hand-computed golden cases", () => {
    expect(calculateHabitStreak(["2026-07-10", "2026-07-11", "2026-07-12"])).toMatchObject({
      currentStreak: 3,
      longestStreak: 3,
    });

    expect(calculateHabitStreak(["2026-07-01", "2026-07-02", "2026-07-05", "2026-07-06"])).toMatchObject({
      currentStreak: 2,
      longestStreak: 2,
    });

    expect(
      calculateHabitStreak(["2026-07-01", "2026-07-02", "2026-07-03", "2026-07-10"]),
    ).toMatchObject({
      currentStreak: 1,
      longestStreak: 3,
    });
  });

  test("applies a new checkoff idempotently", () => {
    expect(applyHabitCompletion(["2026-07-12", "2026-07-13"], "2026-07-14")).toMatchObject({
      alreadyDone: false,
      currentStreak: 3,
      longestStreak: 3,
      completedDayKeys: ["2026-07-12", "2026-07-13", "2026-07-14"],
    });

    expect(applyHabitCompletion(["2026-07-12", "2026-07-13", "2026-07-14"], "2026-07-14")).toMatchObject({
      alreadyDone: true,
      currentStreak: 3,
      longestStreak: 3,
      completedDayKeys: ["2026-07-12", "2026-07-13", "2026-07-14"],
    });
  });

  test("generates UTC day keys for backend fallback completion", () => {
    expect(getUtcDayKey(Date.UTC(2026, 6, 14, 23, 59, 59))).toBe("2026-07-14");
  });
});
