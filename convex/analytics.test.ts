import { describe, expect, test } from "bun:test";
import { computeOverview, type OverviewTaskRow } from "./analytics";

const DAY_MS = 24 * 60 * 60 * 1000;
const todayStartMs = 10 * DAY_MS;
const todayEndMs = 11 * DAY_MS;

function overview(input: Partial<Parameters<typeof computeOverview>[0]> = {}) {
  return computeOverview({
    tasks: [],
    notes: [],
    habitsCount: 0,
    goals: [],
    memoriesCount: 0,
    conversationsCount: 0,
    ...input,
  });
}

describe("computeOverview", () => {
  test("empty inputs produce all-zero counts", () => {
    expect(overview()).toEqual({
      tasksTotal: 0,
      taskTodo: 0,
      taskDone: 0,
      tasksDueToday: 0,
      notesTotal: 0,
      notesPinned: 0,
      habitsTotal: 0,
      goalsActive: 0,
      goalsTotal: 0,
      memoriesTotal: 0,
      coachSessionsTotal: 0,
    });
  });

  test("task status buckets: todo+in_progress count as open, done separately", () => {
    const tasks: OverviewTaskRow[] = [
      { status: "todo" },
      { status: "in_progress" },
      { status: "done" },
      { status: "cancelled" },
    ];
    const counts = overview({ tasks });
    expect(counts.tasksTotal).toBe(4);
    expect(counts.taskTodo).toBe(2);
    expect(counts.taskDone).toBe(1);
  });

  test("tasksDueToday is 0 when the window is omitted", () => {
    const tasks: OverviewTaskRow[] = [{ status: "todo", dueAt: todayStartMs }];
    expect(overview({ tasks }).tasksDueToday).toBe(0);
    expect(overview({ tasks, todayStartMs }).tasksDueToday).toBe(0); // half a window is no window
  });

  test("tasksDueToday respects exact window boundaries and skips done/cancelled", () => {
    const tasks: OverviewTaskRow[] = [
      { status: "todo", dueAt: todayStartMs }, // counts (inclusive start)
      { status: "in_progress", dueAt: todayEndMs - 1 }, // counts
      { status: "todo", dueAt: todayEndMs }, // exclusive end
      { status: "todo", dueAt: todayStartMs - 1 }, // before window
      { status: "done", dueAt: todayStartMs }, // done excluded
      { status: "cancelled", dueAt: todayStartMs }, // cancelled excluded
      { status: "todo" }, // no dueAt
    ];
    expect(overview({ tasks, todayStartMs, todayEndMs }).tasksDueToday).toBe(2);
  });

  test("notes, goals, and passthrough counts", () => {
    const counts = overview({
      notes: [{ pinned: true }, { pinned: false }, { pinned: true }],
      goals: [{ status: "active" }, { status: "completed" }, { status: "archived" }],
      habitsCount: 4,
      memoriesCount: 7,
      conversationsCount: 2,
    });
    expect(counts.notesTotal).toBe(3);
    expect(counts.notesPinned).toBe(2);
    expect(counts.goalsTotal).toBe(3);
    expect(counts.goalsActive).toBe(1);
    expect(counts.habitsTotal).toBe(4);
    expect(counts.memoriesTotal).toBe(7);
    expect(counts.coachSessionsTotal).toBe(2);
  });
});
