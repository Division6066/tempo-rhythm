export type BreathworkPhaseKey = 'inhale' | 'hold' | 'exhale';

export type BreathworkPhase = {
  key: BreathworkPhaseKey;
  label: string;
  instruction: string;
  durationMs: number;
};

export type BreathworkSnapshot = {
  elapsedMs: number;
  cycleMs: number;
  cycleIndex: number;
  phase: BreathworkPhase;
  phaseElapsedMs: number;
  phaseRemainingMs: number;
  phaseIndex: number;
};

export const fourSevenEightPattern = [
  {
    key: 'inhale',
    label: 'Breathe in',
    instruction: 'Inhale gently through your nose.',
    durationMs: 4_000,
  },
  {
    key: 'hold',
    label: 'Hold',
    instruction: 'Hold the breath softly.',
    durationMs: 7_000,
  },
  {
    key: 'exhale',
    label: 'Breathe out',
    instruction: 'Exhale slowly through your mouth.',
    durationMs: 8_000,
  },
] as const satisfies readonly BreathworkPhase[];

export const fourSevenEightCycleMs = fourSevenEightPattern.reduce(
  (total, phase) => total + phase.durationMs,
  0
);

export function getBreathworkSnapshot(
  startedAtMs: number,
  nowMs: number,
  pattern: readonly BreathworkPhase[] = fourSevenEightPattern
): BreathworkSnapshot {
  if (pattern.length === 0) {
    throw new Error('Breathwork pattern must include at least one phase');
  }

  const cycleMs = pattern.reduce((total, phase) => total + phase.durationMs, 0);

  if (cycleMs <= 0) {
    throw new Error('Breathwork pattern must have a positive duration');
  }

  const elapsedMs = Math.max(0, nowMs - startedAtMs);
  const cycleElapsedMs = elapsedMs % cycleMs;
  let phaseStartMs = 0;

  for (let phaseIndex = 0; phaseIndex < pattern.length; phaseIndex += 1) {
    const phase = pattern[phaseIndex];
    const phaseEndMs = phaseStartMs + phase.durationMs;

    if (cycleElapsedMs < phaseEndMs) {
      const phaseElapsedMs = cycleElapsedMs - phaseStartMs;

      return {
        elapsedMs,
        cycleMs,
        cycleIndex: Math.floor(elapsedMs / cycleMs),
        phase,
        phaseElapsedMs,
        phaseRemainingMs: phase.durationMs - phaseElapsedMs,
        phaseIndex,
      };
    }

    phaseStartMs = phaseEndMs;
  }

  const lastPhase = pattern[pattern.length - 1];

  return {
    elapsedMs,
    cycleMs,
    cycleIndex: Math.floor(elapsedMs / cycleMs),
    phase: lastPhase,
    phaseElapsedMs: lastPhase.durationMs,
    phaseRemainingMs: 0,
    phaseIndex: pattern.length - 1,
  };
}

export function formatBreathworkSeconds(ms: number): string {
  return Math.ceil(ms / 1_000).toString();
}
