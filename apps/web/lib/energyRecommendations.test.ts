import { describe, expect, test } from "bun:test";
import {
  type RecommendableTask,
  recommendTasksForEnergy,
} from "./energyRecommendations";

const DAY_MS = 24 * 60 * 60 * 1000;
const todayStartMs = 10 * DAY_MS;
const todayEndMs = 11 * DAY_MS;

let nextId = 0;

function task(overrides: Partial<RecommendableTask> = {}): RecommendableTask {
  nextId += 1;
  return {
    id: `t${nextId}`,
    title: `Task ${nextId}`,
    status: "todo",
    priority: "medium",
    updatedAt: todayStartMs - DAY_MS,
    ...overrides,
  };
}

function recommend(
  tasks: RecommendableTask[],
  overrides: Partial<Parameters<typeof recommendTasksForEnergy>[1]> = {},
) {
  return recommendTasksForEnergy(tasks, {
    energy: "medium",
    todayStartMs,
    todayEndMs,
    ...overrides,
  });
}

describe("recommendTasksForEnergy", () => {
  test("returns nothing for an empty task list", () => {
    expect(recommend([])).toEqual([]);
  });

  test("only todo and in_progress tasks are candidates", () => {
    const open = task({ energy: "medium" });
    const inProgress = task({ energy: "medium", status: "in_progress" });
    const picks = recommend([
      open,
      inProgress,
      task({ energy: "medium", status: "done" }),
      task({ energy: "medium", status: "cancelled" }),
    ]);
    expect(picks.map((p) => p.task.id).toSorted()).toEqual([open.id, inProgress.id].toSorted());
  });

  test("tasks already due today are excluded; other dueAt values are not", () => {
    const dueToday = task({ energy: "medium", dueAt: todayStartMs });
    const dueTodayEdge = task({ energy: "medium", dueAt: todayEndMs - 1 });
    const dueTomorrow = task({ energy: "medium", dueAt: todayEndMs });
    const overdue = task({ energy: "medium", dueAt: todayStartMs - 1 });
    const picks = recommend([dueToday, dueTodayEdge, dueTomorrow, overdue]);
    const ids = picks.map((p) => p.task.id);
    expect(ids).not.toContain(dueToday.id);
    expect(ids).not.toContain(dueTodayEdge.id);
    expect(ids).toContain(dueTomorrow.id);
    expect(ids).toContain(overdue.id);
  });

  test("exact energy matches come first and are flagged exactMatch", () => {
    const low = task({ energy: "low" });
    const medium = task({ energy: "medium" });
    const picks = recommend([low, medium], { energy: "low" });
    expect(picks[0]?.task.id).toBe(low.id);
    expect(picks[0]?.exactMatch).toBe(true);
    expect(picks[1]?.task.id).toBe(medium.id);
    expect(picks[1]?.exactMatch).toBe(false);
  });

  test("a task without an energy level counts as medium", () => {
    const unlabelled = task({ energy: undefined });
    const picks = recommend([unlabelled], { energy: "medium" });
    expect(picks[0]?.task.id).toBe(unlabelled.id);
    expect(picks[0]?.exactMatch).toBe(true);
  });

  test("low-energy request never surfaces high-energy work", () => {
    const high = task({ energy: "high" });
    const picks = recommend([high], { energy: "low" });
    expect(picks).toEqual([]);
  });

  test("high-energy request never surfaces low-energy work", () => {
    const low = task({ energy: "low" });
    const picks = recommend([low], { energy: "high" });
    expect(picks).toEqual([]);
  });

  test("ranking: higher priority first, then longest-waiting task", () => {
    const oldLowPriority = task({ energy: "medium", priority: "low", updatedAt: 1 });
    const newHighPriority = task({ energy: "medium", priority: "high", updatedAt: 9 * DAY_MS });
    const oldHighPriority = task({ energy: "medium", priority: "high", updatedAt: 1 });
    const picks = recommend([oldLowPriority, newHighPriority, oldHighPriority]);
    expect(picks.map((p) => p.task.id)).toEqual([
      oldHighPriority.id,
      newHighPriority.id,
      oldLowPriority.id,
    ]);
  });

  test("limit caps results (default 3)", () => {
    const tasks = [task(), task(), task(), task(), task()].map((t) => ({
      ...t,
      energy: "medium" as const,
    }));
    expect(recommend(tasks)).toHaveLength(3);
    expect(recommend(tasks, { limit: 2 })).toHaveLength(2);
    expect(recommend(tasks, { limit: 0 })).toEqual([]);
  });

  test("dismissed tasks are never re-suggested", () => {
    const a = task({ energy: "medium" });
    const b = task({ energy: "medium" });
    const picks = recommend([a, b], { dismissedIds: new Set([a.id]) });
    expect(picks.map((p) => p.task.id)).toEqual([b.id]);
  });

  test("fallback fills remaining slots after exact matches, in preference order", () => {
    const exact = task({ energy: "medium" });
    const low = task({ energy: "low" });
    const high = task({ energy: "high" });
    const picks = recommend([high, low, exact], { energy: "medium" });
    expect(picks.map((p) => p.task.id)).toEqual([exact.id, low.id, high.id]);
    expect(picks.map((p) => p.exactMatch)).toEqual([true, false, false]);
  });

  test("every reason string is shame-free", () => {
    const picks = recommend(
      [task({ energy: "medium" }), task({ energy: "low" }), task({ energy: "high" })],
      { energy: "medium" },
    );
    for (const pick of picks) {
      expect(pick.reason).not.toMatch(/\b(behind|failing|failure|lazy|overdue|late)\b/i);
    }
  });

  test("does not mutate the input array", () => {
    const tasks = [
      task({ energy: "medium", priority: "low" }),
      task({ energy: "medium", priority: "high" }),
    ];
    const order = tasks.map((t) => t.id);
    recommend(tasks);
    expect(tasks.map((t) => t.id)).toEqual(order);
  });
});
