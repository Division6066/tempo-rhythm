import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  assertRepeatEvery,
  computeNextRepeatDueAt,
  repeatDraftToCfg,
} from "../../convex/lib/taskRepeat";

const jan31NoonUtc = Date.UTC(2026, 0, 31, 12);
const jul14NineUtc = Date.UTC(2026, 6, 14, 9);

describe("taskRepeat leftover from #170 (landed taskRepeatCfgs shape)", () => {
  test("weekly every 1 steps from the current due to the next week", () => {
    const next = computeNextRepeatDueAt(
      jul14NineUtc,
      {
        repeatCycle: "WEEKLY",
        repeatEvery: 1,
        weekdays: [],
        skipOverdue: false,
      },
      jul14NineUtc,
    );
    expect(next).toBe(Date.UTC(2026, 6, 21, 9));
  });

  test("skipOverdue advances past a stale due instead of stacking missed days", () => {
    const now = Date.UTC(2026, 6, 30, 9);
    const next = computeNextRepeatDueAt(
      jul14NineUtc,
      {
        repeatCycle: "WEEKLY",
        repeatEvery: 1,
        weekdays: [],
        skipOverdue: true,
      },
      now,
    );
    expect(next).toBeGreaterThanOrEqual(now);
    expect(next).toBe(Date.UTC(2026, 7, 4, 9));
  });

  test("clamps monthly recurrences to the target month's last day", () => {
    expect(
      computeNextRepeatDueAt(
        jan31NoonUtc,
        {
          repeatCycle: "MONTHLY",
          repeatEvery: 1,
          weekdays: [],
          skipOverdue: false,
        },
        jan31NoonUtc,
      ),
    ).toBe(Date.UTC(2026, 1, 28, 12));
  });

  test("rejects invalid intervals instead of creating ambiguous recurrences", () => {
    expect(() => assertRepeatEvery(0)).toThrow(/interval/i);
    expect(() =>
      computeNextRepeatDueAt(
        jul14NineUtc,
        {
          repeatCycle: "DAILY",
          repeatEvery: 0,
          weekdays: [],
          skipOverdue: false,
        },
        jul14NineUtc,
      ),
    ).toThrow(/interval/i);
  });

  test("repeatDraftToCfg maps the create-form leftover onto landed fields", () => {
    expect(repeatDraftToCfg("daily", jul14NineUtc)).toEqual({
      repeatCycle: "DAILY",
      repeatEvery: 1,
      weekdays: [],
      skipOverdue: true,
    });
    expect(repeatDraftToCfg("weekly", jul14NineUtc).weekdays).toEqual([2]);
  });
});

describe("taskRepeat leftover wiring", () => {
  test("tasks.ts exposes create/list/pause/set on the existing module", () => {
    const source = readFileSync(join(import.meta.dir, "../../convex/tasks.ts"), "utf8");
    expect(source).toContain("export const createRepeatCfg");
    expect(source).toContain("export const listRepeatCfgs");
    expect(source).toContain("export const pauseRepeatCfg");
    expect(source).toContain("export const setTaskRepeatCfg");
    expect(source).toContain("taskRepeatCfgs");
    expect(source).not.toContain('frequency: "weekly"');
  });

  test("task create form offers a Repeat control without a new Convex module", () => {
    const source = readFileSync(
      join(import.meta.dir, "../../apps/web/components/tasks/TaskViewsScreen.tsx"),
      "utf8",
    );
    expect(source).toContain("api.tasks.createRepeatCfg");
    expect(source).toContain("api.tasks.setTaskRepeatCfg");
    expect(source).toContain('aria-label="Repeat"');
  });
});
