import { describe, expect, test } from "bun:test";
import { isHabitCompletedOnUtcDay } from "../../../convex/lib/habitStreak";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("HabitsScreen completedToday derivation", () => {
  test("matches the landed completeToday alreadyDone window", () => {
    const last = 1_700_000_000_000;
    expect(isHabitCompletedOnUtcDay(undefined, last)).toBe(false);
    expect(isHabitCompletedOnUtcDay(last, last + 3 * 60 * 60 * 1000)).toBe(true);
    expect(isHabitCompletedOnUtcDay(last, last + DAY_MS)).toBe(false);
  });
});
