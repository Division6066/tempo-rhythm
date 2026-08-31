import { describe, expect, test } from "bun:test";
import {
	type BreathPatternConfig,
	buildBreathCycle,
	getBreathPhaseAt,
} from "../../packages/utils/src/breathwork";

const coherence: BreathPatternConfig = {
	id: "coherence",
	label: "Coherence breathing",
	steps: [
		{ phase: "inhale", durationMs: 5_000 },
		{ phase: "exhale", durationMs: 5_000 },
	],
};

describe("buildBreathCycle", () => {
	test("plays a newly added coherence pattern from config only", () => {
		const cycle = buildBreathCycle(coherence);

		expect(cycle.totalDurationMs).toBe(10_000);
		expect(cycle.steps).toEqual([
			{ phase: "inhale", startsAtMs: 0, endsAtMs: 5_000 },
			{ phase: "exhale", startsAtMs: 5_000, endsAtMs: 10_000 },
		]);
	});

	test("rejects an empty pattern", () => {
		expect(() =>
			buildBreathCycle({
				id: "empty",
				label: "Empty",
				steps: [],
			}),
		).toThrow("Breath pattern must include at least one step");
	});

	test("rejects a non-positive step duration", () => {
		expect(() =>
			buildBreathCycle({
				id: "bad",
				label: "Bad",
				steps: [{ phase: "inhale", durationMs: 0 }],
			}),
		).toThrow("Breath pattern step duration must be a positive finite number");
	});
});

describe("getBreathPhaseAt", () => {
	test("wraps elapsed time through the configured cycle", () => {
		expect(getBreathPhaseAt(coherence, 0)).toBe("inhale");
		expect(getBreathPhaseAt(coherence, 4_999)).toBe("inhale");
		expect(getBreathPhaseAt(coherence, 5_000)).toBe("exhale");
		expect(getBreathPhaseAt(coherence, 9_999)).toBe("exhale");
		expect(getBreathPhaseAt(coherence, 10_000)).toBe("inhale");
		expect(getBreathPhaseAt(coherence, -1)).toBe("exhale");
	});
});
