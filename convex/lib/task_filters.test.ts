import { describe, expect, test } from "bun:test";
import { filterTasksDueInRange } from "./task_filters";

const tasks = [
  { id: "a", dueAt: 100, status: "todo" },
  { id: "b", dueAt: 199, status: "todo" },
  { id: "c", dueAt: 200, status: "todo" },
  { id: "d", status: "todo" },
  { id: "e", dueAt: 150, status: "cancelled" },
];

describe("filterTasksDueInRange", () => {
  test("includes tasks in half-open [start, end) window", () => {
    const result = filterTasksDueInRange(tasks, 100, 200);
    expect(result.map((t) => t.id)).toEqual(["a", "b"]);
  });

  test("excludes tasks without dueAt", () => {
    const result = filterTasksDueInRange(tasks, 0, 1000);
    expect(result.some((t) => t.id === "d")).toBe(false);
  });

  test("excludes cancelled tasks by default", () => {
    const result = filterTasksDueInRange(tasks, 100, 200);
    expect(result.some((t) => t.id === "e")).toBe(false);
  });

  test("can include cancelled tasks when configured", () => {
    const result = filterTasksDueInRange(tasks, 100, 200, {
      excludeCancelled: false,
    });
    expect(result.map((t) => t.id)).toEqual(["a", "b", "e"]);
  });

  test("end boundary is exclusive", () => {
    const result = filterTasksDueInRange(tasks, 100, 200);
    expect(result.some((t) => t.id === "c")).toBe(false);
  });
});
