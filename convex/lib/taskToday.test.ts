import { describe, expect, test } from "bun:test";
import { isTaskDueInLocalDay, truncateQuickTitle, QUICK_TITLE_MAX } from "./taskToday";

describe("truncateQuickTitle", () => {
  test("trims surrounding whitespace", () => {
    expect(truncateQuickTitle("  Pay rent  ")).toBe("Pay rent");
  });

  test("throws on empty title", () => {
    expect(() => truncateQuickTitle("   ")).toThrow(/empty/i);
  });

  test("returns short titles unchanged", () => {
    expect(truncateQuickTitle("Call mom")).toBe("Call mom");
  });

  test("truncates long titles with ellipsis", () => {
    const long = "x".repeat(QUICK_TITLE_MAX + 10);
    const result = truncateQuickTitle(long);
    expect(result.length).toBe(QUICK_TITLE_MAX);
    expect(result.endsWith("...")).toBe(true);
    expect(result).toBe(`${"x".repeat(QUICK_TITLE_MAX - 3)}...`);
  });
});

describe("isTaskDueInLocalDay", () => {
  const from = 1_000;
  const to = 2_000;

  test("includes dueAt at endMs - 1 (half-open window)", () => {
    expect(isTaskDueInLocalDay(to - 1, from, to, "todo")).toBe(true);
  });

  test("excludes dueAt at endMs (exclusive upper bound)", () => {
    expect(isTaskDueInLocalDay(to, from, to, "todo")).toBe(false);
  });

  test("excludes tasks without dueAt", () => {
    expect(isTaskDueInLocalDay(undefined, from, to, "todo")).toBe(false);
  });

  test("excludes cancelled tasks even when due today", () => {
    expect(isTaskDueInLocalDay(from + 100, from, to, "cancelled")).toBe(false);
  });

  test("includes in-progress tasks due in window", () => {
    expect(isTaskDueInLocalDay(from, from, to, "in_progress")).toBe(true);
  });
});
