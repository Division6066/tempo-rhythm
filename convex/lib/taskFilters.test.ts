import { describe, expect, test } from "bun:test";
import {
  filterTasksDueInWindow,
  QUICK_TITLE_MAX,
  toggleTaskStatus,
  truncateQuickTitle,
} from "./taskFilters";

describe("filterTasksDueInWindow", () => {
  const startMs = 1_000;
  const endMs = 2_000;

  test("includes tasks with dueAt in [startMs, endMs)", () => {
    const tasks = [
      { dueAt: startMs, status: "todo" },
      { dueAt: endMs - 1, status: "todo" },
      { dueAt: endMs, status: "todo" },
      { dueAt: startMs - 1, status: "todo" },
      { status: "todo" },
    ];
    const filtered = filterTasksDueInWindow(tasks, startMs, endMs);
    expect(filtered.map((t) => t.dueAt)).toEqual([startMs, endMs - 1]);
  });

  test("excludes cancelled tasks when requested", () => {
    const tasks = [
      { dueAt: startMs + 10, status: "cancelled" },
      { dueAt: startMs + 20, status: "todo" },
    ];
    const filtered = filterTasksDueInWindow(tasks, startMs, endMs, {
      excludeCancelled: true,
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.status).toBe("todo");
  });

  test("excludes done tasks when requested", () => {
    const tasks = [
      { dueAt: startMs + 10, status: "done" },
      { dueAt: startMs + 20, status: "in_progress" },
    ];
    const filtered = filterTasksDueInWindow(tasks, startMs, endMs, {
      excludeDone: true,
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.status).toBe("in_progress");
  });
});

describe("truncateQuickTitle", () => {
  test("throws on empty or whitespace-only title", () => {
    expect(() => truncateQuickTitle("")).toThrow(/empty/i);
    expect(() => truncateQuickTitle("   ")).toThrow(/empty/i);
  });

  test("returns trimmed title when within limit", () => {
    expect(truncateQuickTitle("  Pay rent  ")).toBe("Pay rent");
  });

  test("truncates long titles with ellipsis", () => {
    const long = "x".repeat(QUICK_TITLE_MAX + 50);
    const result = truncateQuickTitle(long);
    expect(result.length).toBe(QUICK_TITLE_MAX);
    expect(result.endsWith("...")).toBe(true);
  });
});

describe("toggleTaskStatus", () => {
  test("toggles done to todo and everything else to done", () => {
    expect(toggleTaskStatus("done")).toBe("todo");
    expect(toggleTaskStatus("todo")).toBe("done");
    expect(toggleTaskStatus("in_progress")).toBe("done");
    expect(toggleTaskStatus("cancelled")).toBe("done");
  });
});
