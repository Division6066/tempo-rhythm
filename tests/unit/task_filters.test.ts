import { describe, expect, test } from "bun:test";
import {
  filterTasksForVariant,
  getChecklistProgress,
  getNextOccurrenceMs,
  groupTasksByEnergy,
  groupTasksByPriority,
  groupTasksByStatus,
  normalizeProjectKey,
  type TaskVariantRecord,
} from "../../apps/web/lib/taskVariants";

const mondayNoon = Date.UTC(2026, 6, 13, 12);
const tuesdayNoon = Date.UTC(2026, 6, 14, 12);
const tuesdayBounds = {
  startMs: Date.UTC(2026, 6, 14),
  endMs: Date.UTC(2026, 6, 15),
};

const tasks: TaskVariantRecord[] = [
  {
    id: "task-today",
    title: "Today high priority",
    status: "todo",
    priority: "high",
    dueAt: tuesdayNoon,
    projectKey: "alpha-launch",
    energyLevel: "low",
    checklist: [
      { id: "a", text: "First step", completed: true },
      { id: "b", text: "Second step", completed: false },
    ],
  },
  {
    id: "task-inbox",
    title: "Inbox medium",
    status: "in_progress",
    priority: "medium",
    dueAt: mondayNoon,
    projectKey: "admin",
    energyLevel: "medium",
  },
  {
    id: "task-recurring",
    title: "Recurring reset",
    status: "done",
    priority: "low",
    projectKey: "alpha-launch",
    energyLevel: "high",
    recurrence: {
      frequency: "weekly",
      interval: 1,
      nextDueAt: tuesdayNoon,
    },
  },
];

describe("task variant filters", () => {
  test("normalizes project keys for stable project routes", () => {
    expect(normalizeProjectKey(" Alpha Launch!! ")).toBe("alpha-launch");
  });

  test("filters today's tasks by caller-provided local day bounds", () => {
    expect(
      filterTasksForVariant(tasks, "today", { bounds: tuesdayBounds }).map((task) => task.id)
    ).toEqual(["task-today"]);
  });

  test("filters project tasks from the same task records", () => {
    expect(
      filterTasksForVariant(tasks, "project", { projectKey: "Alpha Launch" }).map((task) => task.id)
    ).toEqual(["task-today", "task-recurring"]);
  });

  test("filters recurring tasks and checklist tasks explicitly", () => {
    expect(filterTasksForVariant(tasks, "recurring").map((task) => task.id)).toEqual([
      "task-recurring",
    ]);
    expect(filterTasksForVariant(tasks, "checklists").map((task) => task.id)).toEqual([
      "task-today",
    ]);
  });
});

describe("task variant groups", () => {
  test("groups by priority", () => {
    const groups = groupTasksByPriority(tasks);
    expect(groups.high.map((task) => task.id)).toEqual(["task-today"]);
    expect(groups.medium.map((task) => task.id)).toEqual(["task-inbox"]);
    expect(groups.low.map((task) => task.id)).toEqual(["task-recurring"]);
  });

  test("groups by energy and defaults missing energy to medium", () => {
    const groups = groupTasksByEnergy([
      ...tasks,
      { id: "task-no-energy", title: "No energy set", status: "todo", priority: "medium" },
    ]);
    expect(groups.low.map((task) => task.id)).toEqual(["task-today"]);
    expect(groups.medium.map((task) => task.id)).toEqual(["task-inbox", "task-no-energy"]);
    expect(groups.high.map((task) => task.id)).toEqual(["task-recurring"]);
  });

  test("groups kanban columns by persisted status", () => {
    const groups = groupTasksByStatus(tasks);
    expect(groups.todo.map((task) => task.id)).toEqual(["task-today"]);
    expect(groups.in_progress.map((task) => task.id)).toEqual(["task-inbox"]);
    expect(groups.done.map((task) => task.id)).toEqual(["task-recurring"]);
    expect(groups.cancelled).toEqual([]);
  });
});

describe("checklists and recurrence", () => {
  test("calculates checklist progress", () => {
    expect(getChecklistProgress(tasks[0]?.checklist)).toEqual({
      completed: 1,
      total: 2,
      percent: 50,
    });
  });

  test("calculates explicit next occurrence dates", () => {
    expect(getNextOccurrenceMs(tuesdayNoon, { frequency: "daily", interval: 2 })).toBe(
      Date.UTC(2026, 6, 16, 12)
    );
    expect(getNextOccurrenceMs(tuesdayNoon, { frequency: "weekly", interval: 1 })).toBe(
      Date.UTC(2026, 6, 21, 12)
    );
    expect(getNextOccurrenceMs(tuesdayNoon, { frequency: "monthly", interval: 1 })).toBe(
      Date.UTC(2026, 7, 14, 12)
    );
  });
});
