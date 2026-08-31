import { describe, expect, test } from "bun:test";
import {
  createBreathworkTimerController,
  defaultBreathworkPattern,
  type BreathworkCueKind,
  type BreathworkPhaseId,
} from "../../apps/mobile/lib/breathwork-timer";

type CueCall = {
  kind: BreathworkCueKind;
  phaseId: BreathworkPhaseId;
  boundaryIndex: number;
};

const expectedBoundaryPhases = ["hold", "exhale", "inhale"] as const;

describe("createBreathworkTimerController", () => {
  test("starts on the inhale phase", () => {
    const calls: CueCall[] = [];
    const controller = createBreathworkTimerController({
      pattern: defaultBreathworkPattern,
      cues: {
        audio: (phase, boundaryIndex) => {
          calls.push({ kind: "audio", phaseId: phase.id, boundaryIndex });
        },
        haptic: (phase, boundaryIndex) => {
          calls.push({ kind: "haptic", phaseId: phase.id, boundaryIndex });
        },
      },
    });

    expect(controller.currentPhase.id).toBe("inhale");
    expect(controller.boundaryIndex).toBe(0);
    expect(calls).toEqual([]);
  });

  test("fires audio and haptic on every phase boundary", async () => {
    const calls: CueCall[] = [];
    const controller = createBreathworkTimerController({
      pattern: defaultBreathworkPattern,
      cues: {
        audio: (phase, boundaryIndex) => {
          calls.push({ kind: "audio", phaseId: phase.id, boundaryIndex });
        },
        haptic: (phase, boundaryIndex) => {
          calls.push({ kind: "haptic", phaseId: phase.id, boundaryIndex });
        },
      },
    });

    for (const [index, phaseId] of expectedBoundaryPhases.entries()) {
      const next = await controller.advancePhase();
      expect(next.id).toBe(phaseId);
      expect(controller.boundaryIndex).toBe(index + 1);
      expect(controller.currentPhase.id).toBe(phaseId);
    }

    expect(calls).toEqual([
      { kind: "audio", phaseId: "hold", boundaryIndex: 1 },
      { kind: "haptic", phaseId: "hold", boundaryIndex: 1 },
      { kind: "audio", phaseId: "exhale", boundaryIndex: 2 },
      { kind: "haptic", phaseId: "exhale", boundaryIndex: 2 },
      { kind: "audio", phaseId: "inhale", boundaryIndex: 3 },
      { kind: "haptic", phaseId: "inhale", boundaryIndex: 3 },
    ]);
  });
});
