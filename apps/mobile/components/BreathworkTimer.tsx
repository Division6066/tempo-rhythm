import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import {
  formatBreathworkSeconds,
  getBreathworkSnapshot,
  type BreathworkSnapshot,
} from '@/features/breathwork/breathworkTimer';

type BreathworkTimerProps = {
  startedAtMs?: number;
  nowMs?: number;
  tickMs?: number;
};

const defaultTickMs = 250;

function currentTimeMs(): number {
  return Date.now();
}

export function BreathworkTimer({
  startedAtMs,
  nowMs,
  tickMs = defaultTickMs,
}: BreathworkTimerProps) {
  const [mountedAtMs] = useState(() => startedAtMs ?? currentTimeMs());
  const [liveNowMs, setLiveNowMs] = useState(() => nowMs ?? currentTimeMs());
  const effectiveNowMs = nowMs ?? liveNowMs;

  useEffect(() => {
    if (nowMs !== undefined) {
      return;
    }

    const updateNow = () => setLiveNowMs(currentTimeMs());
    const intervalId = setInterval(updateNow, tickMs);

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', updateNow);
    }

    updateNow();

    return () => {
      clearInterval(intervalId);

      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', updateNow);
      }
    };
  }, [nowMs, tickMs]);

  const snapshot: BreathworkSnapshot = useMemo(
    () => getBreathworkSnapshot(mountedAtMs, effectiveNowMs),
    [effectiveNowMs, mountedAtMs]
  );

  const secondsRemaining = formatBreathworkSeconds(snapshot.phaseRemainingMs);
  const cycleNumber = snapshot.cycleIndex + 1;

  return (
    <View
      accessibilityLabel={`4-7-8 breath timer, ${snapshot.phase.label}, ${secondsRemaining} seconds remaining`}
      accessibilityRole="timer"
      className="gap-4 rounded-3xl border border-border bg-card p-6"
      testID="breathwork-timer"
    >
      <View className="gap-1">
        <Text className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          4-7-8 breath
        </Text>
        <Text className="text-3xl font-semibold text-foreground" testID="phase-label">
          {snapshot.phase.label}
        </Text>
      </View>
      <Text className="text-base text-muted-foreground" testID="phase-instruction">
        {snapshot.phase.instruction}
      </Text>
      <View className="flex-row items-end gap-2">
        <Text className="text-6xl font-semibold text-foreground" testID="seconds-remaining">
          {secondsRemaining}
        </Text>
        <Text className="pb-2 text-sm font-medium text-muted-foreground">seconds</Text>
      </View>
      <Text className="text-xs text-muted-foreground" testID="cycle-label">
        Cycle {cycleNumber}
      </Text>
    </View>
  );
}
