export type RoutineStep = {
  id: string;
  title: string;
  guidance: string;
  durationMs: number;
};

export type Routine = {
  id: string;
  title: string;
  subtitle: string;
  steps: RoutineStep[];
};

export type SessionStatus = 'idle' | 'running' | 'paused' | 'finished';

export type SessionPlayerState = {
  routineId: string;
  status: SessionStatus;
  currentStepIndex: number;
  elapsedMs: number;
  startedAt: number | null;
  updatedAt: number | null;
  completedAt: number | null;
};

export type SessionLogEntry = {
  id: string;
  routineId: string;
  startedAt: number;
  completedAt: number;
  elapsedMs: number;
  stepCount: number;
};

export const activeSessionStorageKey = 'theway.sessionPlayer.active.v1';
export const sessionLogStorageKey = 'theway.sessionPlayer.log.v1';

export const seededRoutines: Routine[] = [
  {
    id: 'seed-morning-reset',
    title: 'Morning reset',
    subtitle: 'A tiny routine to arrive, choose, and close.',
    steps: [
      {
        id: 'arrive',
        title: 'Arrive',
        guidance: 'Take one slow breath and notice where you are.',
        durationMs: 1000,
      },
      {
        id: 'choose',
        title: 'Choose the next gentle action',
        guidance: 'Pick one doable move. Small is welcome here.',
        durationMs: 1000,
      },
      {
        id: 'close',
        title: 'Close the loop',
        guidance: 'Name what is complete enough for this moment.',
        durationMs: 1000,
      },
    ],
  },
];

export function createIdleSession(routineId: string): SessionPlayerState {
  return {
    routineId,
    status: 'idle',
    currentStepIndex: 0,
    elapsedMs: 0,
    startedAt: null,
    updatedAt: null,
    completedAt: null,
  };
}

export function getRoutineTotalMs(routine: Routine): number {
  return routine.steps.reduce((total, step) => total + step.durationMs, 0);
}

export function getCurrentStep(
  routine: Routine,
  elapsedMs: number
): { step: RoutineStep; index: number } {
  let elapsedBeforeStep = 0;

  for (let index = 0; index < routine.steps.length; index += 1) {
    const step = routine.steps[index];
    if (!step) {
      break;
    }

    elapsedBeforeStep += step.durationMs;
    if (elapsedMs < elapsedBeforeStep) {
      return { step, index };
    }
  }

  const index = Math.max(routine.steps.length - 1, 0);
  const step = routine.steps[index];
  if (!step) {
    throw new Error('Routine must include at least one step');
  }
  return { step, index };
}

export function startSession(
  routine: Routine,
  now: number
): SessionPlayerState {
  return {
    routineId: routine.id,
    status: 'running',
    currentStepIndex: 0,
    elapsedMs: 0,
    startedAt: now,
    updatedAt: now,
    completedAt: null,
  };
}

export function pauseSession(
  state: SessionPlayerState,
  routine: Routine,
  now: number
): SessionPlayerState {
  const advanced = advanceSession(state, routine, now);
  if (advanced.status === 'finished') {
    return advanced;
  }

  return {
    ...advanced,
    status: 'paused',
    updatedAt: now,
  };
}

export function resumeSession(
  state: SessionPlayerState,
  now: number
): SessionPlayerState {
  if (state.status === 'finished') {
    return state;
  }

  return {
    ...state,
    status: 'running',
    updatedAt: now,
  };
}

export function advanceSession(
  state: SessionPlayerState,
  routine: Routine,
  now: number
): SessionPlayerState {
  if (state.status !== 'running') {
    return state;
  }

  const previousTick = state.updatedAt ?? now;
  const deltaMs = Math.max(0, now - previousTick);
  const totalMs = getRoutineTotalMs(routine);
  const elapsedMs = Math.min(totalMs, state.elapsedMs + deltaMs);
  const { index } = getCurrentStep(routine, elapsedMs);

  if (elapsedMs >= totalMs) {
    return {
      ...state,
      status: 'finished',
      currentStepIndex: index,
      elapsedMs,
      updatedAt: now,
      completedAt: now,
    };
  }

  return {
    ...state,
    currentStepIndex: index,
    elapsedMs,
    updatedAt: now,
  };
}

export function finishSession(
  state: SessionPlayerState,
  routine: Routine,
  now: number
): SessionPlayerState {
  return {
    ...state,
    status: 'finished',
    currentStepIndex: Math.max(routine.steps.length - 1, 0),
    elapsedMs: getRoutineTotalMs(routine),
    updatedAt: now,
    completedAt: now,
    startedAt: state.startedAt ?? now,
  };
}

export function createSessionLogEntry(
  state: SessionPlayerState,
  routine: Routine
): SessionLogEntry {
  if (state.status !== 'finished' || state.completedAt === null) {
    throw new Error('Only finished sessions can be logged');
  }

  const startedAt = state.startedAt ?? state.completedAt;

  return {
    id: `${state.routineId}:${state.completedAt}`,
    routineId: state.routineId,
    startedAt,
    completedAt: state.completedAt,
    elapsedMs: state.elapsedMs,
    stepCount: routine.steps.length,
  };
}
