import { describe, expect, test } from 'bun:test';

import {
  advanceSession,
  createSessionLogEntry,
  pauseSession,
  resumeSession,
  seededRoutines,
  startSession,
} from './session-player';

const routine = seededRoutines[0];

if (!routine) {
  throw new Error('Expected seeded routine');
}

describe('session player state machine', () => {
  test('plays a routine from start to finish', () => {
    const started = startSession(routine, 1000);
    const halfway = advanceSession(started, routine, 2500);
    const finished = advanceSession(halfway, routine, 4500);

    expect(started.status).toBe('running');
    expect(halfway.status).toBe('running');
    expect(halfway.currentStepIndex).toBe(1);
    expect(finished.status).toBe('finished');
    expect(finished.currentStepIndex).toBe(2);
    expect(finished.elapsedMs).toBe(3000);
  });

  test('pause freezes elapsed time and resume continues from the same elapsed value', () => {
    const started = startSession(routine, 1000);
    const paused = pauseSession(started, routine, 1600);
    const whilePaused = advanceSession(paused, routine, 2600);
    const resumed = resumeSession(whilePaused, 3000);
    const advanced = advanceSession(resumed, routine, 3400);

    expect(paused.status).toBe('paused');
    expect(paused.elapsedMs).toBe(600);
    expect(whilePaused.elapsedMs).toBe(600);
    expect(advanced.status).toBe('running');
    expect(advanced.elapsedMs).toBe(1000);
  });

  test('resume after background does not count time spent while backgrounded', () => {
    const started = startSession(routine, 1000);
    const frozenForBackground = advanceSession(started, routine, 1500);
    const resumed = resumeSession(frozenForBackground, 5500);
    const advanced = advanceSession(resumed, routine, 6000);

    expect(frozenForBackground.elapsedMs).toBe(500);
    expect(resumed.elapsedMs).toBe(500);
    expect(advanced.elapsedMs).toBe(1000);
    expect(advanced.status).toBe('running');
  });

  test('completion creates a session-log entry for the routine id', () => {
    const started = startSession(routine, 1000);
    const finished = advanceSession(started, routine, 5000);
    const entry = createSessionLogEntry(finished, routine);

    expect(entry.routineId).toBe(routine.id);
    expect(entry.startedAt).toBe(1000);
    expect(entry.completedAt).toBe(5000);
    expect(entry.stepCount).toBe(routine.steps.length);
  });
});
