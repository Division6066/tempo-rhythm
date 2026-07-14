import { expect, test } from '@playwright/test';

import {
  createBreathworkTimerController,
  type BreathworkCueKind,
  type BreathworkPhase,
  type BreathworkPhaseId,
  type BreathworkPattern,
} from '../lib/breathwork-timer';

type CueCall = {
  kind: BreathworkCueKind;
  phaseId: BreathworkPhaseId;
  boundaryIndex: number;
};

declare global {
  interface Window {
    __breathworkCueCalls: CueCall[];
    __recordBreathworkCue: (call: CueCall) => void;
  }
}

const cuePattern: BreathworkPattern = {
  phases: [
    { id: 'inhale', label: 'Breathe in', durationMs: 4_000 },
    { id: 'hold', label: 'Hold gently', durationMs: 7_000 },
    { id: 'exhale', label: 'Let it out', durationMs: 8_000 },
  ],
};

const expectedBoundaryPhases = ['hold', 'exhale', 'inhale'] as const;

test('cue events fire audio and haptic on every phase boundary', async ({
  page,
}) => {
  await page.setContent('<main aria-label="Breathwork timer cue spy"></main>');
  await page.evaluate(() => {
    window.__breathworkCueCalls = [];
    window.__recordBreathworkCue = (call) => {
      window.__breathworkCueCalls.push(call);
    };
  });

  const controller = createBreathworkTimerController({
    pattern: cuePattern,
    cues: {
      audio: async (phase: BreathworkPhase, boundaryIndex: number) => {
        await page.evaluate(
          ({ boundaryIndex: nextBoundaryIndex, phaseId }) => {
            window.__recordBreathworkCue({
              boundaryIndex: nextBoundaryIndex,
              kind: 'audio',
              phaseId,
            });
          },
          { boundaryIndex, phaseId: phase.id }
        );
      },
      haptic: async (phase: BreathworkPhase, boundaryIndex: number) => {
        await page.evaluate(
          ({ boundaryIndex: nextBoundaryIndex, phaseId }) => {
            window.__recordBreathworkCue({
              boundaryIndex: nextBoundaryIndex,
              kind: 'haptic',
              phaseId,
            });
          },
          { boundaryIndex, phaseId: phase.id }
        );
      },
    },
  });

  for (const phaseId of expectedBoundaryPhases) {
    await controller.advancePhase();

    const boundaryCalls = await page.evaluate(
      (boundaryIndex) =>
        window.__breathworkCueCalls.filter(
          (call) => call.boundaryIndex === boundaryIndex
        ),
      controller.boundaryIndex
    );

    expect(boundaryCalls).toEqual([
      { boundaryIndex: controller.boundaryIndex, kind: 'audio', phaseId },
      { boundaryIndex: controller.boundaryIndex, kind: 'haptic', phaseId },
    ]);
  }

  await expect
    .poll(() => page.evaluate(() => window.__breathworkCueCalls.length))
    .toBe(expectedBoundaryPhases.length * 2);
});
