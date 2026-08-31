import { describe, expect, test } from "bun:test";
import {
  computeInsightsSummary,
  type InsightsGoalRow,
  type InsightsHabitRow,
  type InsightsTaskRow,
} from "./lib/insights_summary";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Fixed, timezone-independent windows: "today" is [10 days, 11 days), week starts 4 days before today. */
const todayStartMs = 10 * DAY_MS;
const todayEndMs = 11 * DAY_MS;
const weekStartMs = 6 * DAY_MS;

const windows = { todayStartMs, todayEndMs, weekStartMs };

function task(overrides: Partial<InsightsTaskRow> = {}): InsightsTaskRow {
  return {
    status: "todo",
    priority: "medium",
    updatedAt: todayStartMs,
    ...overrides,
  };
}

function habit(overrides: Partial<InsightsHabitRow> = {}): InsightsHabitRow {
  return { currentStreak: 0, longestStreak: 0, ...overrides };
}

function goal(overrides: Partial<InsightsGoalRow> = {}): InsightsGoalRow {
  return { status: "active", progressPercent: 0, ...overrides };
}

function summarize(input: {
  tasks?: InsightsTaskRow[];
  habits?: InsightsHabitRow[];
  goals?: InsightsGoalRow[];
}) {
  return computeInsightsSummary({
    tasks: input.tasks ?? [],
    habits: input.habits ?? [],
    goals: input.goals ?? [],
    ...windows,
  });
}

describe("computeInsightsSummary", () => {
  test("empty inputs produce an all-zero summary", () => {
    const s = summarize({});
    expect(s).toEqual({
      tasksOpen: 0,
      tasksDueToday: 0,
      tasksOverdue: 0,
      tasksCompletedThisWeek: 0,
      openByEnergy: { low: 0, medium: 0, high: 0 },
      openByPriority: { low: 0, medium: 0, high: 0 },
      habitsTotal: 0,
      habitsWithActiveStreak: 0,
      bestStreak: 0,
      goalsActive: 0,
      goalsAverageProgressPercent: 0,
    });
  });

  test("soft-deleted rows are excluded everywhere", () => {
    const s = summarize({
      tasks: [task({ deletedAt: 1, dueAt: todayStartMs })],
      habits: [habit({ deletedAt: 1, currentStreak: 5, longestStreak: 9 })],
      goals: [goal({ deletedAt: 1, progressPercent: 80 })],
    });
    expect(s.tasksOpen).toBe(0);
    expect(s.tasksDueToday).toBe(0);
    expect(s.habitsTotal).toBe(0);
    expect(s.bestStreak).toBe(0);
    expect(s.goalsActive).toBe(0);
  });

  test("done and cancelled tasks are not open, due today, or overdue", () => {
    const s = summarize({
      tasks: [
        task({ status: "done", dueAt: todayStartMs - 1 }),
        task({ status: "cancelled", dueAt: todayStartMs + 1 }),
      ],
    });
    expect(s.tasksOpen).toBe(0);
    expect(s.tasksDueToday).toBe(0);
    expect(s.tasksOverdue).toBe(0);
  });

  test("due-today vs overdue boundaries are exact at todayStartMs / todayEndMs", () => {
    const s = summarize({
      tasks: [
        task({ dueAt: todayStartMs - 1 }), // overdue
        task({ dueAt: todayStartMs }), // due today (inclusive start)
        task({ dueAt: todayEndMs - 1 }), // due today
        task({ dueAt: todayEndMs }), // future — neither bucket
        task({}), // no dueAt — open only
      ],
    });
    expect(s.tasksOpen).toBe(5);
    expect(s.tasksDueToday).toBe(2);
    expect(s.tasksOverdue).toBe(1);
  });

  test("in_progress counts as open", () => {
    const s = summarize({ tasks: [task({ status: "in_progress" })] });
    expect(s.tasksOpen).toBe(1);
  });

  test("completed-this-week uses updatedAt >= weekStartMs on done tasks only", () => {
    const s = summarize({
      tasks: [
        task({ status: "done", updatedAt: weekStartMs }), // counts (inclusive)
        task({ status: "done", updatedAt: weekStartMs - 1 }), // too old
        task({ status: "todo", updatedAt: weekStartMs + 1 }), // not done
      ],
    });
    expect(s.tasksCompletedThisWeek).toBe(1);
  });

  test("missing energy counts as medium; priority buckets are exact", () => {
    const s = summarize({
      tasks: [
        task({ energy: "low", priority: "high" }),
        task({ energy: undefined, priority: "low" }),
        task({ energy: "high", priority: "medium" }),
        task({ energy: "medium", priority: "medium" }),
      ],
    });
    expect(s.openByEnergy).toEqual({ low: 1, medium: 2, high: 1 });
    expect(s.openByPriority).toEqual({ low: 1, medium: 2, high: 1 });
  });

  test("closed tasks do not contribute to energy/priority buckets", () => {
    const s = summarize({
      tasks: [task({ status: "done", energy: "high", priority: "high" })],
    });
    expect(s.openByEnergy).toEqual({ low: 0, medium: 0, high: 0 });
    expect(s.openByPriority).toEqual({ low: 0, medium: 0, high: 0 });
  });

  test("habit streak aggregates: active streaks and best-ever streak", () => {
    const s = summarize({
      habits: [
        habit({ currentStreak: 3, longestStreak: 7 }),
        habit({ currentStreak: 0, longestStreak: 12 }),
        habit({ currentStreak: 1, longestStreak: 1 }),
      ],
    });
    expect(s.habitsTotal).toBe(3);
    expect(s.habitsWithActiveStreak).toBe(2);
    expect(s.bestStreak).toBe(12);
  });

  test("goal aggregates average only active goals and round the result", () => {
    const s = summarize({
      goals: [
        goal({ progressPercent: 10 }),
        goal({ progressPercent: 25 }),
        goal({ status: "completed", progressPercent: 100 }),
        goal({ status: "archived", progressPercent: 0 }),
      ],
    });
    expect(s.goalsActive).toBe(2);
    expect(s.goalsAverageProgressPercent).toBe(18); // round(17.5)
  });
});
