import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { isWithinToday } from "./routineRun";

describe("isWithinToday", () => {
  test("uses the landed half-open local-day window", () => {
    expect(isWithinToday(undefined, 0, 10)).toBe(false);
    expect(isWithinToday(0, 0, 10)).toBe(true);
    expect(isWithinToday(9, 0, 10)).toBe(true);
    expect(isWithinToday(10, 0, 10)).toBe(false);
  });
});

describe("routines leftover wiring", () => {
  test("list and create call generated habits APIs, not api.routines", () => {
    const source = readFileSync(
      join(import.meta.dir, "../components/routines/RoutinesPageClient.tsx"),
      "utf8",
    );
    expect(source).toContain("api.habits.listRoutines");
    expect(source).toContain("api.habits.createRoutineWithItems");
    expect(source).not.toContain("api.routines.");
  });

  test("detail complete calls generated habits APIs", () => {
    const source = readFileSync(
      join(import.meta.dir, "../components/routines/RoutineDetailClient.tsx"),
      "utf8",
    );
    expect(source).toContain("api.habits.getRoutineWithItems");
    expect(source).toContain("api.habits.completeRoutineItem");
    expect(source).toContain("isWithinToday");
    expect(source).not.toContain("api.routines.");
  });
});
