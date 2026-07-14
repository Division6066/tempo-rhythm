import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, Text, Vibration, View } from 'react-native';
import {
  type BreathPatternId,
  breathPatterns,
} from '@/lib/breathwork/patterns';
import {
  getBreathworkSnapshot,
  getPhaseBoundariesBetween,
} from '@/lib/breathwork/timer';

type TimerStatus = 'idle' | 'running' | 'complete';

type BreathworkCueEvent = {
  cue: 'audio' | 'haptic';
  patternId: BreathPatternId;
  phaseId: string;
  phaseLabel: string;
  elapsedMs: number;
};

type CueWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
    __tempoBreathworkEvents?: BreathworkCueEvent[];
  };

type BreathworkTimerProps = {
  patternId?: BreathPatternId;
  loops?: number;
  autoStart?: boolean;
};

const tickIntervalMs = 100;

function getNowMs(): number {
  if (typeof performance !== 'undefined') {
    return performance.now();
  }

  return Date.now();
}

function pushCueEvent(event: BreathworkCueEvent): void {
  if (typeof window === 'undefined') {
    return;
  }

  const cueWindow = window as CueWindow;
  cueWindow.__tempoBreathworkEvents = [
    ...(cueWindow.__tempoBreathworkEvents ?? []),
    event,
  ];
  cueWindow.dispatchEvent(
    new CustomEvent('tempo-breathwork-cue', { detail: event })
  );
}

function playAudioCue(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const cueWindow = window as CueWindow;
  const AudioContextCtor =
    cueWindow.AudioContext ?? cueWindow.webkitAudioContext;
  if (!AudioContextCtor) {
    return;
  }

  const audioContext = new AudioContextCtor();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.frequency.value = 528;
  gain.gain.value = 0.04;
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.08);
  oscillator.addEventListener('ended', () => {
    void audioContext.close();
  });
}

function fireCue(event: Omit<BreathworkCueEvent, 'cue'>): void {
  pushCueEvent({ ...event, cue: 'audio' });
  playAudioCue();

  pushCueEvent({ ...event, cue: 'haptic' });
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    navigator.vibrate?.(12);
    return;
  }

  Vibration.vibrate(12);
}

function formatSeconds(ms: number): string {
  return String(Math.max(0, Math.ceil(ms / 1_000)));
}

export function BreathworkTimer({
  patternId = '4-7-8',
  loops,
  autoStart = false,
}: BreathworkTimerProps) {
  const pattern = breathPatterns[patternId];
  const totalLoops = loops ?? pattern.defaultLoops;
  const [status, setStatus] = useState<TimerStatus>(
    autoStart ? 'running' : 'idle'
  );
  const [startedAtMs, setStartedAtMs] = useState(() => getNowMs());
  const [nowMs, setNowMs] = useState(startedAtMs);
  const lastCueElapsedMsRef = useRef(0);

  const snapshot = useMemo(
    () =>
      getBreathworkSnapshot({
        pattern,
        loops: totalLoops,
        startedAtMs,
        nowMs,
      }),
    [nowMs, pattern, startedAtMs, totalLoops]
  );

  const progressPercent = Math.min(
    100,
    (snapshot.elapsedMs / snapshot.totalDurationMs) * 100
  );

  const start = useCallback(() => {
    const nextStartedAtMs = getNowMs();
    lastCueElapsedMsRef.current = 0;
    setStartedAtMs(nextStartedAtMs);
    setNowMs(nextStartedAtMs);
    setStatus('running');
  }, []);

  const reset = useCallback(() => {
    const nextStartedAtMs = getNowMs();
    lastCueElapsedMsRef.current = 0;
    setStartedAtMs(nextStartedAtMs);
    setNowMs(nextStartedAtMs);
    setStatus('idle');
  }, []);

  useEffect(() => {
    if (status !== 'running') {
      return;
    }

    function tick(): void {
      const nextNowMs = getNowMs();
      const nextSnapshot = getBreathworkSnapshot({
        pattern,
        loops: totalLoops,
        startedAtMs,
        nowMs: nextNowMs,
      });
      const phaseBoundaries = getPhaseBoundariesBetween({
        pattern,
        loops: totalLoops,
        previousElapsedMs: lastCueElapsedMsRef.current,
        nextElapsedMs: nextSnapshot.elapsedMs,
      });

      for (const boundary of phaseBoundaries) {
        fireCue({
          patternId,
          phaseId: boundary.phase.id,
          phaseLabel: boundary.phase.label,
          elapsedMs: boundary.elapsedMs,
        });
      }

      lastCueElapsedMsRef.current = nextSnapshot.elapsedMs;
      setNowMs(nextNowMs);
      if (nextSnapshot.isComplete) {
        setStatus('complete');
      }
    }

    const intervalId = setInterval(tick, tickIntervalMs);
    const canListenForVisibility = typeof document !== 'undefined';
    if (canListenForVisibility) {
      document.addEventListener('visibilitychange', tick);
    }
    tick();

    return () => {
      clearInterval(intervalId);
      if (canListenForVisibility) {
        document.removeEventListener('visibilitychange', tick);
      }
    };
  }, [pattern, patternId, startedAtMs, status, totalLoops]);

  return (
    <View className="gap-5 rounded-3xl border border-border bg-card p-5">
      <View className="gap-2">
        <Text className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Breathwork timer
        </Text>
        <Text className="text-3xl font-semibold text-foreground">
          {pattern.name}
        </Text>
        <Text className="text-base text-muted-foreground">
          {pattern.description}
        </Text>
      </View>

      <View className="items-center gap-2 rounded-3xl bg-background p-6">
        <Text
          accessibilityLiveRegion="polite"
          className="text-5xl font-semibold text-foreground"
          testID="breathwork-phase"
        >
          {snapshot.phase.label}
        </Text>
        <Text className="text-lg text-muted-foreground" testID="phase-seconds">
          {formatSeconds(snapshot.phaseRemainingMs)}
        </Text>
        <Text className="text-sm text-muted-foreground">
          Loop {snapshot.loopIndex + 1} of {totalLoops}
        </Text>
      </View>

      <View className="h-3 overflow-hidden rounded-full bg-muted">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${progressPercent}%` }}
          testID="breathwork-progress"
        />
      </View>

      <View className="gap-2">
        <Text className="text-base font-semibold text-foreground">
          {snapshot.phase.instruction}
        </Text>
        <Text className="text-sm text-muted-foreground" testID="elapsed-ms">
          Elapsed {Math.round(snapshot.elapsedMs)} ms
        </Text>
      </View>

      <View className="flex-row gap-3">
        <Pressable
          accessibilityHint="Starts the selected breathing pattern."
          accessibilityLabel="Start breathwork timer"
          accessibilityRole="button"
          accessible={true}
          className="min-h-12 flex-1 items-center justify-center rounded-2xl bg-primary px-4 py-3"
          disabled={status === 'running'}
          onPress={start}
          testID="start-breathwork"
        >
          <Text className="font-semibold text-primary-foreground">
            {status === 'running' ? 'Running' : 'Start'}
          </Text>
        </Pressable>

        <Pressable
          accessibilityHint="Resets the breathwork timer to the beginning."
          accessibilityLabel="Reset breathwork timer"
          accessibilityRole="button"
          accessible={true}
          className="min-h-12 flex-1 items-center justify-center rounded-2xl border border-border px-4 py-3"
          onPress={reset}
          testID="reset-breathwork"
        >
          <Text className="font-semibold text-foreground">Reset</Text>
        </Pressable>
      </View>

      {status === 'complete' ? (
        <Text
          accessibilityLiveRegion="polite"
          className="text-center text-sm text-muted-foreground"
          testID="breathwork-complete"
        >
          Cycle complete. Take a moment before you move on.
        </Text>
      ) : null}
    </View>
  );
}
