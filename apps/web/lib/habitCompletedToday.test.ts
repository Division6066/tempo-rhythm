import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isHabitCompletedOnUtcDay } from "../../../convex/lib/habitStreak";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("HabitsScreen leftover wiring", () => {
  test("keeps energy suggestion accept/reject on the landed screen", () => {
    const source = readFileSync(
      join(import.meta.dir, "../components/habits/HabitsScreen.tsx"),
      "utf8"
    );
    expect(source).toContain("HabitEnergySuggestions");
    expect(source).toContain("isHabitCompletedOnUtcDay");
  });
});

describe("HabitsScreen completedToday derivation", () => {
  test("matches the landed completeToday alreadyDone window", () => {
    const morning = Date.UTC(2023, 10, 14, 8, 0, 0);
    const late = Date.UTC(2023, 10, 14, 22, 0, 0);
    expect(isHabitCompletedOnUtcDay(undefined, morning)).toBe(false);
    expect(isHabitCompletedOnUtcDay(morning, morning + 3 * 60 * 60 * 1000)).toBe(true);
    expect(isHabitCompletedOnUtcDay(late, late + 3 * 60 * 60 * 1000)).toBe(false);
    expect(isHabitCompletedOnUtcDay(morning, morning + DAY_MS)).toBe(false);
  });
});
