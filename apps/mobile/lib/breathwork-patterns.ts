import type { BreathworkPattern, BreathworkPhaseId } from "./breathwork-timer";

export type NamedBreathPatternId = "4-7-8" | "box" | "coherence" | "triangle";

export type NamedBreathPattern = {
  id: NamedBreathPatternId;
  name: string;
  description: string;
  pattern: BreathworkPattern;
};

const phase = (
  id: BreathworkPhaseId,
  label: string,
  durationMs: number,
): BreathworkPattern["phases"][number] => ({
  id,
  label,
  durationMs,
});

export const namedBreathPatterns: Record<NamedBreathPatternId, NamedBreathPattern> =
  {
    "4-7-8": {
      id: "4-7-8",
      name: "4-7-8",
      description: "Inhale for 4, hold for 7, exhale for 8.",
      pattern: {
        phases: [
          phase("inhale", "Breathe in", 4_000),
          phase("hold", "Hold gently", 7_000),
          phase("exhale", "Let it out", 8_000),
        ],
      },
    },
    box: {
      id: "box",
      name: "Box breathing",
      description: "Equal inhale, hold, exhale, and rest.",
      pattern: {
        phases: [
          phase("inhale", "Breathe in", 4_000),
          phase("hold", "Hold with ease", 4_000),
          phase("exhale", "Breathe out", 4_000),
          phase("rest", "Rest before the next breath", 4_000),
        ],
      },
    },
    coherence: {
      id: "coherence",
      name: "Coherence",
      description: "A steady 5-second inhale and 5-second exhale.",
      pattern: {
        phases: [
          phase("inhale", "Breathe in at an easy pace", 5_000),
          phase("exhale", "Breathe out at the same pace", 5_000),
        ],
      },
    },
    triangle: {
      id: "triangle",
      name: "Triangle breathing",
      description: "Inhale, hold, and exhale in equal steps.",
      pattern: {
        phases: [
          phase("inhale", "Breathe in comfortably", 3_000),
          phase("hold", "Pause without strain", 3_000),
          phase("exhale", "Release the breath", 3_000),
        ],
      },
    },
  };

export const namedBreathPatternIds = Object.keys(
  namedBreathPatterns,
) as NamedBreathPatternId[];

export function isNamedBreathPatternId(
  value: string | undefined,
): value is NamedBreathPatternId {
  return value !== undefined && value in namedBreathPatterns;
}

export function getNamedBreathPattern(
  id: string | undefined,
): NamedBreathPattern {
  if (isNamedBreathPatternId(id)) {
    return namedBreathPatterns[id];
  }
  return namedBreathPatterns["4-7-8"];
}
