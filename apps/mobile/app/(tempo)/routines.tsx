import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  activeSessionStorageKey,
  advanceSession,
  createIdleSession,
  createSessionLogEntry,
  finishSession,
  getCurrentStep,
  getRoutineTotalMs,
  pauseSession,
  resumeSession,
  seededRoutines,
  sessionLogStorageKey,
  startSession,
  type SessionLogEntry,
  type SessionPlayerState,
} from '@/lib/session-player';

const routine = seededRoutines[0];

if (!routine) {
  throw new Error('Expected at least one seeded routine');
}

const initialSession = createIdleSession(routine.id);

async function readString(key: string): Promise<string | null> {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.localStorage.getItem(key);
  }

  return await AsyncStorage.getItem(key);
}

async function writeString(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.localStorage.setItem(key, value);
    return;
  }

  await AsyncStorage.setItem(key, value);
}

async function readStoredSession(): Promise<SessionPlayerState | null> {
  const rawSession = await readString(activeSessionStorageKey);
  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as SessionPlayerState;
  } catch {
    return null;
  }
}

async function readSessionLogs(): Promise<SessionLogEntry[]> {
  const rawLogs = await readString(sessionLogStorageKey);
  if (!rawLogs) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawLogs) as SessionLogEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeSessionLogs(logs: SessionLogEntry[]): Promise<void> {
  await writeString(sessionLogStorageKey, JSON.stringify(logs));
}

function formatElapsed(elapsedMs: number): string {
  return `${(elapsedMs / 1000).toFixed(1)}s`;
}

type PlayerButtonProps = {
  label: string;
  hint: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

function PlayerButton({
  label,
  hint,
  onPress,
  variant = 'secondary',
}: PlayerButtonProps) {
  const className =
    variant === 'primary'
      ? 'min-h-12 items-center justify-center rounded-2xl bg-orange-500 px-5 py-3'
      : 'min-h-12 items-center justify-center rounded-2xl border border-stone-300 bg-white px-5 py-3';
  const textClassName =
    variant === 'primary'
      ? 'text-base font-semibold text-white'
      : 'text-base font-semibold text-stone-900';

  return (
    <Pressable
      accessibilityHint={hint}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessible={true}
      className={className}
      hitSlop={8}
      onPress={onPress}
      testID={`session-player-${label.toLowerCase().replaceAll(' ', '-')}`}
    >
      <Text className={textClassName}>{label}</Text>
    </Pressable>
  );
}

export default function Screen() {
  const [session, setSession] = useState<SessionPlayerState>(initialSession);
  const [logs, setLogs] = useState<SessionLogEntry[]>([]);
  const [backgroundMessage, setBackgroundMessage] = useState(
    'Ready to begin'
  );
  const hydratedRef = useRef(false);
  const loggedCompletionIdsRef = useRef(new Set<string>());

  const totalMs = useMemo(() => getRoutineTotalMs(routine), []);
  const { step: currentStep, index: currentStepIndex } = getCurrentStep(
    routine,
    session.elapsedMs
  );
  const progressPercent = Math.round((session.elapsedMs / totalMs) * 100);

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession(): Promise<void> {
      const [storedSession, storedLogs] = await Promise.all([
        readStoredSession(),
        readSessionLogs(),
      ]);

      if (cancelled) {
        return;
      }

      storedLogs.forEach((entry) => {
        loggedCompletionIdsRef.current.add(entry.id);
      });

      setLogs(storedLogs);
      setSession(
        storedSession && storedSession.routineId === routine.id
          ? resumeSession(storedSession, Date.now())
          : initialSession
      );
      hydratedRef.current = true;
    }

    void hydrateSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) {
      return;
    }

    void writeString(activeSessionStorageKey, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    if (session.status !== 'running') {
      return;
    }

    const interval = setInterval(() => {
      if (
        Platform.OS === 'web' &&
        typeof document !== 'undefined' &&
        document.visibilityState === 'hidden'
      ) {
        return;
      }

      setSession((previousSession) =>
        advanceSession(previousSession, routine, Date.now())
      );
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [session.status]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }

    function handleVisibilityChange(): void {
      if (document.visibilityState === 'hidden') {
        setSession((previousSession) =>
          advanceSession(previousSession, routine, Date.now())
        );
        setBackgroundMessage('Saved while backgrounded');
        return;
      }

      setSession((previousSession) =>
        previousSession.status === 'running'
          ? resumeSession(previousSession, Date.now())
          : previousSession
      );
      setBackgroundMessage('Resumed correctly after background');
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (session.status !== 'finished' || session.completedAt === null) {
      return;
    }

    const entry = createSessionLogEntry(session, routine);
    if (loggedCompletionIdsRef.current.has(entry.id)) {
      return;
    }

    loggedCompletionIdsRef.current.add(entry.id);
    setLogs((previousLogs) => {
      const nextLogs = [entry, ...previousLogs];
      void writeSessionLogs(nextLogs);
      return nextLogs;
    });
  }, [session]);

  const handleStart = useCallback(() => {
    setBackgroundMessage('Routine running');
    setSession(startSession(routine, Date.now()));
  }, []);

  const handlePause = useCallback(() => {
    setBackgroundMessage('Paused. Your spot is safe.');
    setSession((previousSession) =>
      pauseSession(previousSession, routine, Date.now())
    );
  }, []);

  const handleResume = useCallback(() => {
    setBackgroundMessage('Routine running');
    setSession((previousSession) => resumeSession(previousSession, Date.now()));
  }, []);

  const handleFinish = useCallback(() => {
    setBackgroundMessage('Finished. Session log updated.');
    setSession((previousSession) =>
      finishSession(previousSession, routine, Date.now())
    );
  }, []);

  const showStart = session.status === 'idle' || session.status === 'finished';
  const showPause = session.status === 'running';
  const showResume = session.status === 'paused';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 p-6"
        testID="session-player-screen"
      >
        <View className="gap-2">
          <Text className="text-3xl font-semibold text-foreground">
            Session player
          </Text>
          <Text className="text-base text-muted-foreground">
            Plays a routine from start to finish. Pause when you need a breath;
            your place is kept.
          </Text>
        </View>

        <View
          className="gap-4 rounded-3xl border border-stone-200 bg-stone-50 p-5"
          testID="routine-card"
        >
          <View className="gap-1">
            <Text className="text-xs font-semibold uppercase tracking-wide text-orange-700">
              Seeded routine
            </Text>
            <Text className="text-2xl font-semibold text-stone-950">
              {routine.title}
            </Text>
            <Text className="text-sm text-stone-600">{routine.subtitle}</Text>
          </View>

          <View className="gap-2">
            <Text
              className="text-sm font-semibold text-stone-700"
              testID="session-player-status"
            >
              Status: {session.status}
            </Text>
            <Text
              className="text-sm font-semibold text-stone-700"
              testID="session-player-elapsed"
            >
              Elapsed: {formatElapsed(session.elapsedMs)}
            </Text>
            <Text
              className="text-sm font-semibold text-stone-700"
              testID="session-player-background-state"
            >
              {backgroundMessage}
            </Text>
          </View>

          <View className="h-3 overflow-hidden rounded-full bg-stone-200">
            <View
              className="h-3 rounded-full bg-orange-500"
              style={{ width: `${progressPercent}%` }}
              testID="session-player-progress"
            />
          </View>

          <View className="gap-2 rounded-2xl bg-white p-4" testID="step-card">
            <Text className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Step {currentStepIndex + 1} of {routine.steps.length}
            </Text>
            <Text className="text-xl font-semibold text-stone-950">
              {currentStep.title}
            </Text>
            <Text className="text-base text-stone-700">
              {currentStep.guidance}
            </Text>
          </View>

          <View className="gap-3">
            {showStart ? (
              <PlayerButton
                hint="Starts the seeded routine from the first step."
                label="Start routine"
                onPress={handleStart}
                variant="primary"
              />
            ) : null}
            {showPause ? (
              <PlayerButton
                hint="Pauses the elapsed timer without losing your place."
                label="Pause"
                onPress={handlePause}
              />
            ) : null}
            {showResume ? (
              <PlayerButton
                hint="Resumes the routine from the same elapsed time."
                label="Resume"
                onPress={handleResume}
                variant="primary"
              />
            ) : null}
            <PlayerButton
              hint="Completes this routine and writes a session-log row."
              label="Finish now"
              onPress={handleFinish}
            />
          </View>
        </View>

        <View className="gap-3 rounded-3xl border border-stone-200 bg-white p-5">
          <Text className="text-xl font-semibold text-stone-950">
            Session log
          </Text>
          {logs.length > 0 ? (
            logs.map((entry) => (
              <View
                className="rounded-2xl bg-stone-100 p-4"
                key={entry.id}
                testID="session-log-row"
              >
                <Text className="text-sm font-semibold text-stone-900">
                  Routine: {entry.routineId}
                </Text>
                <Text className="text-sm text-stone-600">
                  Steps: {entry.stepCount} · Elapsed:{' '}
                  {formatElapsed(entry.elapsedMs)}
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-sm text-stone-600" testID="session-log-empty">
              No sessions logged yet.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
