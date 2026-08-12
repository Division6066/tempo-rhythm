import { describe, expect, test } from "bun:test";
import {
  filterTasksForView,
  groupTasksByEnergy,
  groupTasksByPriority,
  type TaskViewRecord,
} from "../../apps/web/lib/task-view-filters";

const todayStart = Date.UTC(2026, 6, 14);
const todayEnd = Date.UTC(2026, 6, 15);

const records: TaskViewRecord[] = [
  {
    id: "task-today",
    title: "Today task",
    status: "todo",
    priority: "high",
    energy: "low",
    projectId: "home",
    projectName: "Home reset",
    dueAt: todayStart + 60_000,
    updatedAt: 10,
  },
  {
    id: "task-done",
    title: "Completed today task",
    status: "done",
    priority: "medium",
    energy: "medium",
    projectId: "home",
    projectName: "Home reset",
    dueAt: todayStart + 120_000,
    updatedAt: 20,
  },
  {
    id: "task-inbox",
    title: "Inbox task",
    status: "in_progress",
    priority: "low",
    energy: "high",
    projectId: "admin",
    projectName: "Admin",
    updatedAt: 30,
  },
  {
    id: "task-cancelled",
    title: "Cancelled task",
    status: "cancelled",
    priority: "high",
    energy: "high",
    projectId: "home",
    projectName: "Home reset",
    dueAt: todayStart + 180_000,
    updatedAt: 40,
  },
];

describe("task view filters", () => {
  test("today view includes every non-cancelled task due in the local day", () => {
    const result = filterTasksForView(records, {
      view: "today",
      todayStart,
      todayEnd,
    });

    expect(result.map((task) => task.id)).toEqual(["task-done", "task-today"]);
  });

  test("inbox view includes all non-cancelled task records", () => {
    const result = filterTasksForView(records, { view: "inbox" });

    expect(result.map((task) => task.id)).toEqual(["task-inbox", "task-done", "task-today"]);
  });

  test("project view scopes to a single project while keeping completed tasks visible", () => {
    const result = filterTasksForView(records, {
      view: "project",
      projectId: "home",
    });

    expect(result.map((task) => task.id)).toEqual(["task-done", "task-today"]);
  });

  test("priority and energy group views share the same underlying records", () => {
    const priorityGroups = groupTasksByPriority(filterTasksForView(records, { view: "priority" }));
    const energyGroups = groupTasksByEnergy(filterTasksForView(records, { view: "energy" }));

    expect(priorityGroups.high.map((task) => task.id)).toEqual(["task-today"]);
    expect(priorityGroups.medium.map((task) => task.id)).toEqual(["task-done"]);
    expect(priorityGroups.low.map((task) => task.id)).toEqual(["task-inbox"]);

    expect(energyGroups.low.map((task) => task.id)).toEqual(["task-today"]);
    expect(energyGroups.medium.map((task) => task.id)).toEqual(["task-done"]);
    expect(energyGroups.high.map((task) => task.id)).toEqual(["task-inbox"]);
  });
});
