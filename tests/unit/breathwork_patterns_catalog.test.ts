import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getNamedBreathPattern,
  isNamedBreathPatternId,
  namedBreathPatternIds,
  namedBreathPatterns,
} from "../../apps/mobile/lib/breathwork-patterns";
import { createBreathworkTimerController } from "../../apps/mobile/lib/breathwork-timer";

describe("named breath patterns leftover from #183", () => {
  test("ships 4-7-8, box, coherence, and triangle as config only", () => {
    expect(namedBreathPatternIds).toEqual([
      "4-7-8",
      "box",
      "coherence",
      "triangle",
    ]);
    expect(namedBreathPatterns.box.pattern.phases.map((phase) => phase.id)).toEqual(
      ["inhale", "hold", "exhale", "rest"],
    );
    expect(
      namedBreathPatterns.coherence.pattern.phases.map((phase) => phase.durationMs),
    ).toEqual([5_000, 5_000]);
    expect(
      namedBreathPatterns.triangle.pattern.phases.map((phase) => phase.durationMs),
    ).toEqual([3_000, 3_000, 3_000]);
  });

  test("falls back to 4-7-8 for an unknown pattern id", () => {
    expect(isNamedBreathPatternId("box")).toBe(true);
    expect(isNamedBreathPatternId("sprint")).toBe(false);
    expect(getNamedBreathPattern("sprint").id).toBe("4-7-8");
  });

  test("box pattern advances through rest without changing timer logic", async () => {
    const controller = createBreathworkTimerController({
      pattern: namedBreathPatterns.box.pattern,
      cues: {
        audio: () => undefined,
        haptic: () => undefined,
      },
    });

    expect(controller.currentPhase.id).toBe("inhale");
    expect((await controller.advancePhase()).id).toBe("hold");
    expect((await controller.advancePhase()).id).toBe("exhale");
    expect((await controller.advancePhase()).id).toBe("rest");
    expect((await controller.advancePhase()).id).toBe("inhale");
  });
});

describe("breathwork route leftover wiring", () => {
  const root = join(import.meta.dir, "../..");

  test("sibling breathwork screen uses the catalog and does not overwrite routines", () => {
    const screen = readFileSync(
      join(root, "apps/mobile/app/(tempo)/breathwork.tsx"),
      "utf8",
    );
    const routines = readFileSync(
      join(root, "apps/mobile/app/(tempo)/routines.tsx"),
      "utf8",
    );

    expect(screen).toContain("namedBreathPatterns");
    expect(screen).toContain("BreathworkTimer");
    expect(routines).toContain("BreathworkTimer");
    expect(routines).toContain('href="/breathwork"');
  });
});
