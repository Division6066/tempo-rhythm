import { describe, expect, test } from "bun:test";
import {
  buildEnergySuggestion,
  calculateHabitCompletion,
  createRoutineItemDrafts,
  getLocalDateKey,
} from "../../convex/lib/habit_logic";

const dayMs = 24 * 60 * 60 * 1000;
const noonUtc = Date.UTC(2026, 6, 14, 12, 0, 0);

describe("habit streak check-ins", () => {
  test("starts a streak and records today's history key", () => {
    const result = calculateHabitCompletion({
      currentStreak: 0,
      longestStreak: 0,
      historyKeys: [],
      now: noonUtc,
    });

    expect(result.alreadyDone).toBe(false);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
    expect(result.completedOn).toBe("2026-07-14");
    expect(result.historyKeys).toEqual(["2026-07-14"]);
  });

  test("does not double-count the same local day", () => {
    const result = calculateHabitCompletion({
      currentStreak: 3,
      longestStreak: 5,
      historyKeys: ["2026-07-14"],
      now: noonUtc + 2 * 60 * 60 * 1000,
    });

    expect(result.alreadyDone).toBe(true);
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(5);
    expect(result.historyKeys).toEqual(["2026-07-14"]);
  });

  test("extends a streak across consecutive local days", () => {
    const result = calculateHabitCompletion({
      currentStreak: 2,
      longestStreak: 2,
      historyKeys: ["2026-07-13"],
      now: noonUtc,
    });

    expect(result.alreadyDone).toBe(false);
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
    expect(result.historyKeys).toEqual(["2026-07-13", "2026-07-14"]);
  });

  test("starts fresh after a missed day without shame copy", () => {
    const result = calculateHabitCompletion({
      currentStreak: 8,
      longestStreak: 8,
      historyKeys: ["2026-07-10"],
      now: noonUtc,
    });

    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(8);
    expect(result.historyKeys).toEqual(["2026-07-10", "2026-07-14"]);
  });

  test("uses timezone offsets for local date keys", () => {
    const lateUtc = Date.UTC(2026, 6, 14, 23, 30, 0);
    expect(getLocalDateKey(lateUtc, 120)).toBe("2026-07-15");
    expect(getLocalDateKey(lateUtc, -420)).toBe("2026-07-14");
  });
});

describe("routine item drafts", () => {
  test("keeps habits and tasks in explicit order", () => {
    const drafts = createRoutineItemDrafts([
      { type: "habit", habitId: "habit-1" },
      { type: "task", taskId: "task-1" },
      { type: "habit", habitId: "habit-2" },
    ]);

    expect(drafts).toEqual([
      { itemType: "habit", habitId: "habit-1", order: 0 },
      { itemType: "task", taskId: "task-1", order: 1 },
      { itemType: "habit", habitId: "habit-2", order: 2 },
    ]);
  });

  test("rejects routine items without their matching reference", () => {
    expect(() => createRoutineItemDrafts([{ type: "habit" }])).toThrow(/habit/i);
    expect(() => createRoutineItemDrafts([{ type: "task" }])).toThrow(/task/i);
  });
});

describe("energy-aware suggestions", () => {
  test("suggests the lowest energy habit first", () => {
    const suggestion = buildEnergySuggestion([
      {
        id: "walk",
        name: "Gentle walk",
        energy: "medium",
        currentStreak: 2,
        lastCompletedAt: noonUtc - dayMs,
      },
      {
        id: "water",
        name: "Drink water",
        energy: "low",
        currentStreak: 0,
        lastCompletedAt: undefined,
      },
    ]);

    expect(suggestion).toEqual({
      habitId: "water",
      title: "Drink water",
      reason: "This looks like a low-energy option for today.",
    });
  });

  test("does not suggest a habit already completed today", () => {
    const suggestion = buildEnergySuggestion([
      {
        id: "water",
        name: "Drink water",
        energy: "low",
        currentStreak: 1,
        lastCompletedAt: noonUtc,
      },
    ], noonUtc);

    expect(suggestion).toBeNull();
  });
});
