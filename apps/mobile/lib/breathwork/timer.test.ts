import { describe, expect, test } from 'bun:test';
import type { BreathPattern } from './patterns';
import { breathPatterns } from './patterns';
import {
  getBreathworkSnapshot,
  getPhaseBoundariesBetween,
  getPhaseDurationsSeconds,
} from './timer';

describe('breathwork timer config', () => {
  test('4-7-8 counts exactly 4 -> 7 -> 8 seconds', () => {
    expect(getPhaseDurationsSeconds(breathPatterns['4-7-8'])).toEqual([
      4, 7, 8,
    ]);
  });

  test('supports a new pattern as config only', () => {
    const configOnlyPattern: BreathPattern = {
      id: 'test-calm',
      name: 'Test calm',
      description: 'Added in a test without changing timer logic.',
      defaultLoops: 1,
      phases: [
        {
          id: 'inhale',
          label: 'Inhale',
          kind: 'inhale',
          durationMs: 2_000,
          instruction: 'Breathe in.',
        },
        {
          id: 'exhale',
          label: 'Exhale',
          kind: 'exhale',
          durationMs: 6_000,
          instruction: 'Breathe out.',
        },
      ],
    };

    expect(getPhaseDurationsSeconds(configOnlyPattern)).toEqual([2, 6]);
    expect(
      getBreathworkSnapshot({
        pattern: configOnlyPattern,
        loops: 1,
        startedAtMs: 1_000,
        nowMs: 4_500,
      }).phase.id
    ).toBe('exhale');
  });
});

describe('breathwork wall-clock timing', () => {
  test('derives phase from elapsed wall time after a background gap', () => {
    const snapshot = getBreathworkSnapshot({
      pattern: breathPatterns['4-7-8'],
      loops: 1,
      startedAtMs: 10_000,
      nowMs: 22_250,
    });

    expect(snapshot.phase.id).toBe('exhale');
    expect(snapshot.phaseElapsedMs).toBe(1_250);
    expect(snapshot.elapsedMs).toBe(12_250);
  });

  test('returns every phase boundary crossed between ticks', () => {
    const boundaries = getPhaseBoundariesBetween({
      pattern: breathPatterns['4-7-8'],
      loops: 2,
      previousElapsedMs: 3_900,
      nextElapsedMs: 19_100,
    });

    expect(boundaries.map((boundary) => boundary.phase.id)).toEqual([
      'hold',
      'exhale',
      'inhale',
    ]);
    expect(boundaries.map((boundary) => boundary.elapsedMs)).toEqual([
      4_000, 11_000, 19_000,
    ]);
  });
});
