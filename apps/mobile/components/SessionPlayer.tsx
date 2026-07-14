import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

type SessionStatus = 'ready' | 'playing' | 'paused' | 'finished';

export type RoutineStep = {
  id: string;
  title: string;
  durationMs: number;
};

type SessionPlayerProps = {
  title: string;
  steps: RoutineStep[];
};

const statusLabels: Record<SessionStatus, string> = {
  ready: 'Ready',
  playing: 'Playing',
  paused: 'Paused',
  finished: 'Finished',
};

export function SessionPlayer({ title, steps }: SessionPlayerProps) {
  const [status, setStatus] = useState<SessionStatus>('ready');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasResumed, setHasResumed] = useState(false);

  const currentStep = steps[currentStepIndex] ?? steps.at(-1);
  const isFinished = status === 'finished';

  useEffect(() => {
    if (status !== 'playing' || !currentStep) {
      return;
    }

    const stepDuration = hasResumed
      ? Math.min(currentStep.durationMs, 700)
      : currentStep.durationMs;

    const timeout = setTimeout(() => {
      setCurrentStepIndex((previousIndex) => {
        if (previousIndex < steps.length - 1) {
          return previousIndex + 1;
        }

        setStatus('finished');
        return previousIndex;
      });
    }, stepDuration);

    return () => clearTimeout(timeout);
  }, [currentStep, hasResumed, status, steps.length]);

  const handleStart = () => {
    setCurrentStepIndex(0);
    setHasResumed(false);
    setStatus('playing');
  };

  const handlePause = () => {
    setStatus('paused');
  };

  const handleResume = () => {
    setHasResumed(true);
    setStatus('playing');
  };

  const primaryAction =
    status === 'ready'
      ? {
          label: 'Start routine',
          hint: 'Begins the routine session.',
          onPress: handleStart,
        }
      : status === 'playing'
        ? {
            label: 'Pause routine',
            hint: 'Pauses the routine timer.',
            onPress: handlePause,
          }
        : status === 'paused'
          ? {
              label: 'Resume routine',
              hint: 'Continues the routine from this step.',
              onPress: handleResume,
            }
          : null;

  return (
    <View className="flex-1 bg-background p-6 gap-6">
      <View className="gap-2">
        <Text className="text-3xl font-semibold text-foreground">{title}</Text>
        <Text className="text-base text-muted-foreground">
          Take it one step at a time.
        </Text>
      </View>

      <View className="rounded-3xl border border-border bg-card p-6 gap-4">
        <Text className="text-xs uppercase tracking-widest text-muted-foreground">
          Current step
        </Text>
        <Text
          className="text-4xl font-semibold text-foreground"
          testID="session-player-step"
        >
          {currentStep?.title ?? 'Finish'}
        </Text>
        <Text
          className="text-sm text-muted-foreground"
          testID="session-player-state"
        >
          {statusLabels[status]}
        </Text>
      </View>

      {isFinished ? (
        <View className="rounded-2xl bg-secondary p-4">
          <Text className="text-base font-medium text-secondary-foreground">
            Routine complete. Nice and steady.
          </Text>
        </View>
      ) : null}

      {primaryAction ? (
        <Pressable
          accessibilityHint={primaryAction.hint}
          accessibilityLabel={primaryAction.label}
          accessibilityRole="button"
          accessible={true}
          className="min-h-12 items-center justify-center rounded-2xl bg-primary px-5 py-4 active:opacity-80"
          onPress={primaryAction.onPress}
        >
          <Text className="text-base font-semibold text-primary-foreground">
            {primaryAction.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
