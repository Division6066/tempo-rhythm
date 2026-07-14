import { describe, expect, test } from "bun:test";
import {
  computeNextOccurrenceDueAt,
  planRecurringTaskCreation,
} from "../../convex/tasks";

const jan31NoonUtc = Date.UTC(2026, 0, 31, 12);

describe("recurring task scheduling", () => {
  test("plans an explicit next occurrence when a recurring task is created", () => {
    const firstDueAt = Date.UTC(2026, 6, 14, 9);
    const plan = planRecurringTaskCreation(firstDueAt, {
      frequency: "weekly",
      interval: 1,
    });

    expect(plan.shouldCreateFirstOccurrence).toBe(true);
    expect(plan.firstOccurrenceDueAt).toBe(Date.UTC(2026, 6, 21, 9));
    expect(plan.nextDueAt).toBe(Date.UTC(2026, 6, 28, 9));
    expect(plan.recurrence).toEqual({
      frequency: "weekly",
      interval: 1,
    });
  });

  test("respects recurrence end dates when planning the explicit next occurrence", () => {
    const firstDueAt = Date.UTC(2026, 6, 14, 9);
    const plan = planRecurringTaskCreation(firstDueAt, {
      frequency: "weekly",
      interval: 1,
      endAt: Date.UTC(2026, 6, 20, 23, 59),
    });

    expect(plan.shouldCreateFirstOccurrence).toBe(false);
    expect(plan.firstOccurrenceDueAt).toBe(Date.UTC(2026, 6, 21, 9));
  });

  test("clamps monthly recurrences to the target month's last day", () => {
    expect(
      computeNextOccurrenceDueAt(jan31NoonUtc, {
        frequency: "monthly",
        interval: 1,
      }),
    ).toBe(Date.UTC(2026, 1, 28, 12));
  });

  test("rejects invalid intervals instead of creating ambiguous recurrences", () => {
    expect(() =>
      planRecurringTaskCreation(Date.UTC(2026, 6, 14, 9), {
        frequency: "daily",
        interval: 0,
      }),
    ).toThrow(/interval/i);
  });
});
