export type BreathPhaseKind = 'inhale' | 'hold' | 'exhale' | 'rest';

export type BreathPhase = {
  id: string;
  label: string;
  kind: BreathPhaseKind;
  durationMs: number;
  instruction: string;
};

export type BreathPattern = {
  id: string;
  name: string;
  description: string;
  defaultLoops: number;
  phases: readonly BreathPhase[];
};

export const breathPatterns = {
  '4-7-8': {
    id: '4-7-8',
    name: '4-7-8',
    description: 'Inhale for 4, hold for 7, exhale for 8.',
    defaultLoops: 4,
    phases: [
      {
        id: 'inhale',
        label: 'Inhale',
        kind: 'inhale',
        durationMs: 4_000,
        instruction: 'Breathe in gently.',
      },
      {
        id: 'hold',
        label: 'Hold',
        kind: 'hold',
        durationMs: 7_000,
        instruction: 'Hold softly. No forcing.',
      },
      {
        id: 'exhale',
        label: 'Exhale',
        kind: 'exhale',
        durationMs: 8_000,
        instruction: 'Let the breath out slowly.',
      },
    ],
  },
  box: {
    id: 'box',
    name: 'Box breathing',
    description: 'Equal inhale, hold, exhale, and rest phases.',
    defaultLoops: 4,
    phases: [
      {
        id: 'inhale',
        label: 'Inhale',
        kind: 'inhale',
        durationMs: 4_000,
        instruction: 'Breathe in.',
      },
      {
        id: 'hold-in',
        label: 'Hold',
        kind: 'hold',
        durationMs: 4_000,
        instruction: 'Hold with ease.',
      },
      {
        id: 'exhale',
        label: 'Exhale',
        kind: 'exhale',
        durationMs: 4_000,
        instruction: 'Breathe out.',
      },
      {
        id: 'hold-out',
        label: 'Rest',
        kind: 'rest',
        durationMs: 4_000,
        instruction: 'Rest before the next breath.',
      },
    ],
  },
  coherence: {
    id: 'coherence',
    name: 'Coherence',
    description: 'A steady 5-second inhale and 5-second exhale.',
    defaultLoops: 6,
    phases: [
      {
        id: 'inhale',
        label: 'Inhale',
        kind: 'inhale',
        durationMs: 5_000,
        instruction: 'Breathe in at an easy pace.',
      },
      {
        id: 'exhale',
        label: 'Exhale',
        kind: 'exhale',
        durationMs: 5_000,
        instruction: 'Breathe out at the same pace.',
      },
    ],
  },
  triangle: {
    id: 'triangle',
    name: 'Triangle breathing',
    description: 'A config-only proof pattern: inhale, hold, exhale.',
    defaultLoops: 3,
    phases: [
      {
        id: 'inhale',
        label: 'Inhale',
        kind: 'inhale',
        durationMs: 3_000,
        instruction: 'Breathe in comfortably.',
      },
      {
        id: 'hold',
        label: 'Hold',
        kind: 'hold',
        durationMs: 3_000,
        instruction: 'Pause without strain.',
      },
      {
        id: 'exhale',
        label: 'Exhale',
        kind: 'exhale',
        durationMs: 3_000,
        instruction: 'Release the breath.',
      },
    ],
  },
} as const satisfies Record<string, BreathPattern>;

export type BreathPatternId = keyof typeof breathPatterns;
