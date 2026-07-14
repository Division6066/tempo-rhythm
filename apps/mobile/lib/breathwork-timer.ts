export type BreathworkPhaseId = 'inhale' | 'hold' | 'exhale';

export type BreathworkPhase = {
  id: BreathworkPhaseId;
  label: string;
  durationMs: number;
};

export type BreathworkPattern = {
  phases: [BreathworkPhase, ...BreathworkPhase[]];
};

export type BreathworkCueKind = 'audio' | 'haptic';

export type BreathworkCueHandler = (
  phase: BreathworkPhase,
  boundaryIndex: number
) => Promise<void> | void;

export type BreathworkCueHandlers = {
  audio: BreathworkCueHandler;
  haptic: BreathworkCueHandler;
};

export type BreathworkTimerController = {
  readonly boundaryIndex: number;
  readonly currentPhase: BreathworkPhase;
  advancePhase: () => Promise<BreathworkPhase>;
};

type CreateBreathworkTimerControllerOptions = {
  cues: BreathworkCueHandlers;
  pattern: BreathworkPattern;
};

export const defaultBreathworkPattern: BreathworkPattern = {
  phases: [
    { id: 'inhale', label: 'Breathe in', durationMs: 4_000 },
    { id: 'hold', label: 'Hold gently', durationMs: 7_000 },
    { id: 'exhale', label: 'Let it out', durationMs: 8_000 },
  ],
};

export const defaultBreathworkCueHandlers: BreathworkCueHandlers = {
  audio: (phase, boundaryIndex) => {
    dispatchBreathworkCueEvent('audio', phase, boundaryIndex);
  },
  haptic: (phase, boundaryIndex) => {
    const navigatorWithVibrate = globalThis.navigator as
      | (Navigator & {
          vibrate?: (pattern: number | number[]) => boolean;
        })
      | undefined;

    navigatorWithVibrate?.vibrate?.(18);
    dispatchBreathworkCueEvent('haptic', phase, boundaryIndex);
  },
};

export function createBreathworkTimerController({
  cues,
  pattern,
}: CreateBreathworkTimerControllerOptions): BreathworkTimerController {
  let currentPhaseIndex = 0;
  let boundaryIndex = 0;

  return {
    get boundaryIndex() {
      return boundaryIndex;
    },
    get currentPhase() {
      return getPhaseAt(pattern, currentPhaseIndex);
    },
    async advancePhase() {
      currentPhaseIndex = (currentPhaseIndex + 1) % pattern.phases.length;
      boundaryIndex += 1;

      const nextPhase = getPhaseAt(pattern, currentPhaseIndex);
      await Promise.all([
        cues.audio(nextPhase, boundaryIndex),
        cues.haptic(nextPhase, boundaryIndex),
      ]);

      return nextPhase;
    },
  };
}

function dispatchBreathworkCueEvent(
  kind: BreathworkCueKind,
  phase: BreathworkPhase,
  boundaryIndex: number
): void {
  if (
    typeof globalThis.dispatchEvent !== 'function' ||
    typeof CustomEvent !== 'function'
  ) {
    return;
  }

  globalThis.dispatchEvent(
    new CustomEvent('tempo:breathwork-cue', {
      detail: {
        boundaryIndex,
        kind,
        phaseId: phase.id,
      },
    })
  );
}

function getPhaseAt(
  pattern: BreathworkPattern,
  phaseIndex: number
): BreathworkPhase {
  return pattern.phases[phaseIndex % pattern.phases.length] ?? pattern.phases[0];
}
