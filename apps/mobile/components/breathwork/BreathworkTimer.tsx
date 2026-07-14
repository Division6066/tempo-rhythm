import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import {
  createBreathworkTimerController,
  defaultBreathworkCueHandlers,
  defaultBreathworkPattern,
  type BreathworkCueHandlers,
  type BreathworkPattern,
  type BreathworkTimerController,
} from '@/lib/breathwork-timer';

type BreathworkTimerProps = {
  autoStart?: boolean;
  cues?: BreathworkCueHandlers;
  pattern?: BreathworkPattern;
};

export function BreathworkTimer({
  autoStart = true,
  cues = defaultBreathworkCueHandlers,
  pattern = defaultBreathworkPattern,
}: BreathworkTimerProps) {
  const controllerRef = useRef<BreathworkTimerController | null>(null);

  if (controllerRef.current === null) {
    controllerRef.current = createBreathworkTimerController({
      cues,
      pattern,
    });
  }

  const [phase, setPhase] = useState(() => {
    return controllerRef.current?.currentPhase ?? pattern.phases[0];
  });
  const [boundaryIndex, setBoundaryIndex] = useState(0);

  const advancePhase = useCallback(async () => {
    const controller = controllerRef.current;

    if (controller === null) {
      return;
    }

    const nextPhase = await controller.advancePhase();
    setPhase(nextPhase);
    setBoundaryIndex(controller.boundaryIndex);
  }, []);

  useEffect(() => {
    if (!autoStart) {
      return;
    }

    const timeout = setTimeout(() => {
      void advancePhase();
    }, phase.durationMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [advancePhase, autoStart, phase.durationMs]);

  const phaseSeconds = Math.round(phase.durationMs / 1_000);

  return (
    <View
      accessibilityLabel={`Breathwork timer. Current phase: ${phase.label}.`}
      accessible={true}
      className="rounded-3xl border border-border bg-card p-5 gap-4"
    >
      <View className="gap-1">
        <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Breathwork
        </Text>
        <Text className="text-2xl font-semibold text-foreground">
          {phase.label}
        </Text>
      </View>

      <View className="rounded-full bg-muted px-4 py-3">
        <Text className="text-center text-sm text-muted-foreground">
          {phaseSeconds} seconds - cue {boundaryIndex}
        </Text>
      </View>
    </View>
  );
}
