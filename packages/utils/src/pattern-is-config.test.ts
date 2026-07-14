import { describe, expect, test } from "bun:test";
import { type BreathPatternConfig, buildBreathCycle, getBreathPhaseAt } from "./breathwork";

describe("pattern-is-config", () => {
  test("plays a newly added coherence pattern from config only", () => {
    const coherence: BreathPatternConfig = {
      id: "coherence",
      label: "Coherence breathing",
      steps: [
        { phase: "inhale", durationMs: 5_000 },
        { phase: "exhale", durationMs: 5_000 },
      ],
    };

    const cycle = buildBreathCycle(coherence);

    expect(cycle.totalDurationMs).toBe(10_000);
    expect(cycle.steps).toEqual([
      { phase: "inhale", startsAtMs: 0, endsAtMs: 5_000 },
      { phase: "exhale", startsAtMs: 5_000, endsAtMs: 10_000 },
    ]);
    expect(getBreathPhaseAt(coherence, 0)).toBe("inhale");
    expect(getBreathPhaseAt(coherence, 4_999)).toBe("inhale");
    expect(getBreathPhaseAt(coherence, 5_000)).toBe("exhale");
    expect(getBreathPhaseAt(coherence, 9_999)).toBe("exhale");
    expect(getBreathPhaseAt(coherence, 10_000)).toBe("inhale");
  });
});
