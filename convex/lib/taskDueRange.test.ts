import { describe, expect, test } from "bun:test";
import {
  filterTasksDueInHalfOpenRange,
  QUICK_TASK_TITLE_MAX,
  truncateQuickTaskTitle,
} from "./taskDueRange";

describe("filterTasksDueInHalfOpenRange", () => {
  const dueFrom = 1_000;
  const dueTo = 2_000;
  const tasks = [
    { id: "a", dueAt: 999, status: "todo" },
    { id: "b", dueAt: 1_000, status: "todo" },
    { id: "c", dueAt: 1_999, status: "todo" },
    { id: "d", dueAt: 2_000, status: "todo" },
    { id: "e", dueAt: 1_500, status: "cancelled" },
    { id: "f", status: "todo" },
  ];

  test("includes tasks in [dueFrom, dueTo) and excludes cancelled by default", () => {
    const result = filterTasksDueInHalfOpenRange(tasks, dueFrom, dueTo);
    expect(result.map((t) => t.id)).toEqual(["b", "c"]);
  });

  test("can include cancelled tasks when excludeCancelled is false", () => {
    const result = filterTasksDueInHalfOpenRange(tasks, dueFrom, dueTo, {
      excludeCancelled: false,
    });
    expect(result.map((t) => t.id)).toEqual(["b", "c", "e"]);
  });

  test("excludes tasks without dueAt", () => {
    const result = filterTasksDueInHalfOpenRange(tasks, dueFrom, dueTo);
    expect(result.some((t) => t.id === "f")).toBe(false);
  });
});

describe("truncateQuickTaskTitle", () => {
  test("trims whitespace", () => {
    expect(truncateQuickTaskTitle("  Pay rent  ")).toBe("Pay rent");
  });

  test("returns empty string for whitespace-only input", () => {
    expect(truncateQuickTaskTitle("   ")).toBe("");
  });

  test("leaves short titles unchanged", () => {
    expect(truncateQuickTaskTitle("Call mom")).toBe("Call mom");
  });

  test(`truncates titles longer than ${QUICK_TASK_TITLE_MAX} chars with ellipsis`, () => {
    const long = "x".repeat(QUICK_TASK_TITLE_MAX + 50);
    const result = truncateQuickTaskTitle(long);
    expect(result.length).toBe(QUICK_TASK_TITLE_MAX);
    expect(result.endsWith("...")).toBe(true);
  });
});
