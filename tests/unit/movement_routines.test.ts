import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getGuidedMovementRoutineById,
  getMovementRoutineById,
  guidedMovementToSession,
  guidedMovementRoutineIds,
  isGuidedMovementRoutineId,
  isMovementRoutineId,
  movementCategories,
  movementRoutineIds,
  movementRoutineSections,
  movementRoutines,
} from "../../apps/mobile/lib/movement-routines";

describe("movement library leftover from #186", () => {
  test("ships five categories and one seeded session each", () => {
    expect(movementCategories.map((category) => category.id)).toEqual([
      "animal-flow",
      "fighter-yoga-mobility",
      "joint-prep-cars",
      "bodyweight-sc",
      "recovery",
    ]);
    expect(movementRoutineIds).toEqual([
      "animal-flow-primer",
      "fighter-yoga-hips",
      "joint-prep-morning-cars",
      "bodyweight-engine",
      "recovery-downshift",
    ]);
    expect(movementRoutines).toHaveLength(5);
  });

  test("groups sessions by category without dropping or inventing rows", () => {
    expect(movementRoutineSections).toHaveLength(5);
    for (const section of movementRoutineSections) {
      expect(section.data).toHaveLength(1);
      expect(section.data[0]?.categoryId).toBe(section.id);
    }
  });

  test("looks up known ids and leaves unknown ids empty", () => {
    expect(isMovementRoutineId("recovery-downshift")).toBe(true);
    expect(isMovementRoutineId("sprint")).toBe(false);
    expect(getMovementRoutineById("recovery-downshift")?.title).toBe(
      "Recovery Downshift",
    );
    expect(getMovementRoutineById("sprint")).toBeUndefined();
  });
});

describe("guided movement leftover from #221", () => {
  test("maps minute steps onto the session player without inventing duration", () => {
    expect(guidedMovementRoutineIds).toEqual([
      "morning-reset",
      "desk-unlock",
      "shutdown-stretch",
    ]);
    expect(isGuidedMovementRoutineId("desk-unlock")).toBe(true);
    expect(isGuidedMovementRoutineId("sprint")).toBe(false);
    expect(getGuidedMovementRoutineById("sprint")).toBeUndefined();

    const desk = getGuidedMovementRoutineById("desk-unlock");
    expect(desk).toBeDefined();
    if (!desk) {
      throw new Error("Expected desk-unlock");
    }
    const session = guidedMovementToSession(desk);
    expect(session.steps.map((step) => step.durationMs)).toEqual([
      60_000, 60_000, 120_000, 60_000,
    ]);
    expect(session.steps[0]?.guidance).toBe(
      "Draw small half-circles from shoulder to shoulder.",
    );
  });
});

describe("movement route leftover wiring", () => {
  const root = join(import.meta.dir, "../..");

  test("sibling movement screen uses the catalog and does not overwrite routines", () => {
    const screen = readFileSync(
      join(root, "apps/mobile/app/(tempo)/movement.tsx"),
      "utf8",
    );
    const routines = readFileSync(
      join(root, "apps/mobile/app/(tempo)/routines.tsx"),
      "utf8",
    );
    const player = readFileSync(
      join(root, "apps/mobile/app/(tempo)/session-player.tsx"),
      "utf8",
    );

    expect(screen).toContain("movementRoutineSections");
    expect(screen).toContain("guidedMovementRoutines");
    expect(screen).toContain("/session-player?routine=");
    expect(routines).toContain("BreathworkTimer");
    expect(routines).toContain('href="/movement"');
    expect(player).toContain("guidedMovementToSession");
  });
});
