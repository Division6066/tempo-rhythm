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

export type BreathworkSnapshot = {
  elapsedMs: number;
  cycleMs: number;
  cycleIndex: number;
  phase: BreathPhase;
  phaseElapsedMs: number;
  phaseRemainingMs: number;
  phaseIndex: number;
};

function cycleOffsetMs(elapsedMs: number, cycleMs: number): number {
  return ((elapsedMs % cycleMs) + cycleMs) % cycleMs;
}

export function getBreathPhaseAt(pattern: BreathPatternConfig, elapsedMs: number): BreathPhase {
  return getBreathworkSnapshot(pattern, elapsedMs).phase;
}

/** Elapsed-time leftover from #189. Same cycle math as getBreathPhaseAt, with remaining ms. */
export function getBreathworkSnapshot(
  pattern: BreathPatternConfig,
  elapsedMs: number,
): BreathworkSnapshot {
  const cycle = buildBreathCycle(pattern);
  const offsetMs = cycleOffsetMs(elapsedMs, cycle.totalDurationMs);

  for (const [phaseIndex, step] of cycle.steps.entries()) {
    if (offsetMs >= step.startsAtMs && offsetMs < step.endsAtMs) {
      const phaseElapsedMs = offsetMs - step.startsAtMs;
      return {
        elapsedMs: Math.max(0, elapsedMs),
        cycleMs: cycle.totalDurationMs,
        cycleIndex: Math.floor(Math.max(0, elapsedMs) / cycle.totalDurationMs),
        phase: step.phase,
        phaseElapsedMs,
        phaseRemainingMs: step.endsAtMs - offsetMs,
        phaseIndex,
      };
    }
  }

  const firstStep = cycle.steps[0];
  if (!firstStep) {
    throw new Error("Breath pattern must include at least one step");
  }

  return {
    elapsedMs: Math.max(0, elapsedMs),
    cycleMs: cycle.totalDurationMs,
    cycleIndex: 0,
    phase: firstStep.phase,
    phaseElapsedMs: 0,
    phaseRemainingMs: firstStep.endsAtMs - firstStep.startsAtMs,
    phaseIndex: 0,
  };
}
