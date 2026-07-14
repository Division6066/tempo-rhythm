export type SessionPhase = {
  id: string;
  title: string;
  durationMs: number;
};

export type SessionRoutine = {
  id: string;
  title: string;
  phases: SessionPhase[];
};

export type SessionSnapshot = {
  elapsedMs: number;
  currentPhase: SessionPhase;
  currentPhaseIndex: number;
  isComplete: boolean;
};

type SessionSnapshotInput = {
  now: number;
  routine: SessionRoutine;
  startedAt: number;
};

export const routineForBackgroundResumeTest: SessionRoutine = {
  id: "grounding-reset",
  title: "Grounding reset",
  phases: [
    {
      id: "warm-up",
      title: "Warm up",
      durationMs: 10_000,
    },
    {
      id: "breathe",
      title: "Breathe",
      durationMs: 20_000,
    },
    {
      id: "close",
      title: "Close gently",
      durationMs: 5_000,
    },
  ],
};

const fallbackPhase: SessionPhase = {
  id: "empty",
  title: "Ready",
  durationMs: 0,
};

export function getSessionSnapshot({
  now,
  routine,
  startedAt,
}: SessionSnapshotInput): SessionSnapshot {
  const elapsedMs = Math.max(0, now - startedAt);
  const phases = routine.phases;

  if (phases.length === 0) {
    return {
      currentPhase: fallbackPhase,
      currentPhaseIndex: 0,
      elapsedMs,
      isComplete: true,
    };
  }

  let phaseStartMs = 0;

  for (let index = 0; index < phases.length; index += 1) {
    const phase = phases[index];
    const phaseEndMs = phaseStartMs + phase.durationMs;

    if (elapsedMs < phaseEndMs) {
      return {
        currentPhase: phase,
        currentPhaseIndex: index,
        elapsedMs,
        isComplete: false,
      };
    }

    phaseStartMs = phaseEndMs;
  }

  return {
    currentPhase: phases.at(-1) ?? fallbackPhase,
    currentPhaseIndex: phases.length - 1,
    elapsedMs,
    isComplete: true,
  };
}

export function formatSessionElapsed(elapsedMs: number): string {
  const totalSeconds = Math.floor(elapsedMs / 1_000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
