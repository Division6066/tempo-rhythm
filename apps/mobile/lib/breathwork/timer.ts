import type { BreathPattern, BreathPhase } from './patterns';

export type BreathworkSnapshot = {
  elapsedMs: number;
  totalDurationMs: number;
  loopIndex: number;
  phaseIndex: number;
  phase: BreathPhase;
  phaseElapsedMs: number;
  phaseRemainingMs: number;
  isComplete: boolean;
};

export type PhaseBoundary = {
  elapsedMs: number;
  loopIndex: number;
  phaseIndex: number;
  phase: BreathPhase;
};

export function getPatternCycleDurationMs(pattern: BreathPattern): number {
  return pattern.phases.reduce((total, phase) => total + phase.durationMs, 0);
}

export function getPatternTotalDurationMs(
  pattern: BreathPattern,
  loops: number
): number {
  return getPatternCycleDurationMs(pattern) * loops;
}

export function getPhaseDurationsSeconds(
  pattern: BreathPattern
): readonly number[] {
  return pattern.phases.map((phase) => phase.durationMs / 1_000);
}

export function getBreathworkSnapshot({
  pattern,
  loops,
  startedAtMs,
  nowMs,
}: {
  pattern: BreathPattern;
  loops: number;
  startedAtMs: number;
  nowMs: number;
}): BreathworkSnapshot {
  if (pattern.phases.length === 0) {
    throw new Error('Breath pattern needs at least one phase.');
  }

  if (!Number.isFinite(loops) || loops < 1) {
    throw new Error('Breath timer needs at least one loop.');
  }

  const cycleDurationMs = getPatternCycleDurationMs(pattern);
  const totalDurationMs = cycleDurationMs * loops;
  const elapsedMs = Math.max(0, Math.min(nowMs - startedAtMs, totalDurationMs));
  const isComplete = elapsedMs >= totalDurationMs;
  const activeElapsedMs = isComplete
    ? Math.max(0, totalDurationMs - 1)
    : elapsedMs;
  const loopIndex = Math.min(
    loops - 1,
    Math.floor(activeElapsedMs / cycleDurationMs)
  );
  const elapsedInCycleMs = activeElapsedMs - loopIndex * cycleDurationMs;

  let phaseStartMs = 0;
  for (
    let phaseIndex = 0;
    phaseIndex < pattern.phases.length;
    phaseIndex += 1
  ) {
    const phase = pattern.phases[phaseIndex];
    if (!phase) {
      break;
    }

    const phaseEndMs = phaseStartMs + phase.durationMs;
    if (elapsedInCycleMs < phaseEndMs) {
      const phaseElapsedMs = elapsedInCycleMs - phaseStartMs;
      return {
        elapsedMs,
        totalDurationMs,
        loopIndex,
        phaseIndex,
        phase,
        phaseElapsedMs,
        phaseRemainingMs: Math.max(0, phase.durationMs - phaseElapsedMs),
        isComplete,
      };
    }

    phaseStartMs = phaseEndMs;
  }

  const fallbackPhase = pattern.phases[pattern.phases.length - 1];
  if (!fallbackPhase) {
    throw new Error('Breath pattern needs at least one phase.');
  }

  return {
    elapsedMs,
    totalDurationMs,
    loopIndex,
    phaseIndex: pattern.phases.length - 1,
    phase: fallbackPhase,
    phaseElapsedMs: fallbackPhase.durationMs,
    phaseRemainingMs: 0,
    isComplete,
  };
}

export function getPhaseBoundaries(
  pattern: BreathPattern,
  loops: number
): readonly PhaseBoundary[] {
  const cycleDurationMs = getPatternCycleDurationMs(pattern);
  const boundaries: PhaseBoundary[] = [];

  for (let loopIndex = 0; loopIndex < loops; loopIndex += 1) {
    let phaseStartInCycleMs = 0;
    for (
      let phaseIndex = 0;
      phaseIndex < pattern.phases.length;
      phaseIndex += 1
    ) {
      const phase = pattern.phases[phaseIndex];
      if (!phase) {
        continue;
      }

      if (loopIndex > 0 || phaseIndex > 0) {
        boundaries.push({
          elapsedMs: loopIndex * cycleDurationMs + phaseStartInCycleMs,
          loopIndex,
          phaseIndex,
          phase,
        });
      }

      phaseStartInCycleMs += phase.durationMs;
    }
  }

  return boundaries;
}

export function getPhaseBoundariesBetween({
  pattern,
  loops,
  previousElapsedMs,
  nextElapsedMs,
}: {
  pattern: BreathPattern;
  loops: number;
  previousElapsedMs: number;
  nextElapsedMs: number;
}): readonly PhaseBoundary[] {
  return getPhaseBoundaries(pattern, loops).filter(
    (boundary) =>
      boundary.elapsedMs > previousElapsedMs &&
      boundary.elapsedMs <= nextElapsedMs
  );
}
