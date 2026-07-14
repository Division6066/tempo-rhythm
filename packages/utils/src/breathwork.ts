export type BreathPhase = "inhale" | "hold" | "exhale" | "rest";

export type BreathPatternStep = {
  phase: BreathPhase;
  durationMs: number;
};

export type BreathPatternConfig = {
  id: string;
  label: string;
  steps: BreathPatternStep[];
};

export type BreathCycleStep = {
  phase: BreathPhase;
  startsAtMs: number;
  endsAtMs: number;
};

export type BreathCycle = {
  patternId: string;
  label: string;
  totalDurationMs: number;
  steps: BreathCycleStep[];
};

function assertValidDuration(durationMs: number): void {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new Error("Breath pattern step duration must be a positive finite number");
  }
}

export function buildBreathCycle(pattern: BreathPatternConfig): BreathCycle {
  if (pattern.steps.length === 0) {
    throw new Error("Breath pattern must include at least one step");
  }

  let cursorMs = 0;
  const steps = pattern.steps.map((step) => {
    assertValidDuration(step.durationMs);

    const startsAtMs = cursorMs;
    const endsAtMs = startsAtMs + step.durationMs;
    cursorMs = endsAtMs;

    return {
      phase: step.phase,
      startsAtMs,
      endsAtMs,
    };
  });

  return {
    patternId: pattern.id,
    label: pattern.label,
    totalDurationMs: cursorMs,
    steps,
  };
}

export function getBreathPhaseAt(pattern: BreathPatternConfig, elapsedMs: number): BreathPhase {
  const cycle = buildBreathCycle(pattern);
  const cycleOffsetMs =
    ((elapsedMs % cycle.totalDurationMs) + cycle.totalDurationMs) % cycle.totalDurationMs;

  for (const step of cycle.steps) {
    if (cycleOffsetMs >= step.startsAtMs && cycleOffsetMs < step.endsAtMs) {
      return step.phase;
    }
  }

  const firstStep = cycle.steps[0];
  if (!firstStep) {
    throw new Error("Breath pattern must include at least one step");
  }

  return firstStep.phase;
}
