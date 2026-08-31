import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  appendSessionLogEntry,
  parseSessionLogEntries,
  serializeSessionLogEntries,
} from '@/lib/focus-session-log';
import {
  advanceSession,
  createIdleSession,
  createSessionLogEntry,
  getCurrentStep,
  pauseSession,
  type Routine,
  resumeSession,
  type SessionLogEntry,
  type SessionPlayerState,
  seededRoutines,
  sessionLogStorageKey,
  startSession,
} from '@/lib/session-player';

const fallbackRoutine = seededRoutines[0];

if (!fallbackRoutine) {
  throw new Error('Expected seeded routine');
}

export function SessionPlayer({
  routine = fallbackRoutine,
}: {
  routine?: Routine;
}) {
  const [state, setState] = useState<SessionPlayerState>(() =>
    createIdleSession(routine.id)
  );
  const [log, setLog] = useState<SessionLogEntry[]>([]);

  useEffect(() => {
    setState(createIdleSession(routine.id));
  }, [routine.id]);

  useEffect(() => {
    let isMounted = true;
    void AsyncStorage.getItem(sessionLogStorageKey).then((raw) => {
      if (!isMounted) {
        return;
      }
      setLog(parseSessionLogEntries(raw));
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (state.status !== 'running') {
      return;
    }

    const timer = setInterval(() => {
      setState((current) => {
        const next = advanceSession(current, routine, Date.now());
        if (next.status === 'finished' && current.status !== 'finished') {
          try {
            const entry = createSessionLogEntry(next, routine);
            setLog((entries) => {
              const nextEntries = appendSessionLogEntry(entries, entry);
              void AsyncStorage.setItem(
                sessionLogStorageKey,
                serializeSessionLogEntries(nextEntries)
              );
              return nextEntries;
            });
          } catch {
            // Only finished sessions can be logged; ignore races.
          }
        }
        return next;
      });
    }, 250);

    return () => {
      clearInterval(timer);
    };
  }, [state.status, routine]);

  const current = getCurrentStep(routine, state.elapsedMs);

  return (
    <View className="gap-5">
      <View className="gap-2">
        <Text className="text-sm font-semibold uppercase text-muted-foreground">
          Session
        </Text>
        <Text className="text-2xl font-semibold text-foreground">
          {routine.title}
        </Text>
        <Text className="text-sm leading-6 text-muted-foreground">
          {routine.subtitle}
        </Text>
      </View>

      <View className="gap-2 rounded-2xl border border-border bg-card p-5">
        <Text className="text-lg font-semibold text-foreground">
          {current.step.title}
        </Text>
        <Text className="text-sm leading-6 text-muted-foreground">
          {current.step.guidance}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {state.status === 'idle'
            ? 'Ready when you are.'
            : state.status === 'finished'
              ? 'That loop is complete enough.'
              : `Step ${current.index + 1} of ${routine.steps.length}`}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-3">
        {state.status === 'idle' || state.status === 'finished' ? (
          <Pressable
            accessibilityRole="button"
            className="min-h-11 rounded-full border border-border bg-background px-4 py-2"
            onPress={() => {
              setState(startSession(routine, Date.now()));
            }}
          >
            <Text className="text-sm font-semibold text-foreground">
              {state.status === 'finished' ? 'Play again' : 'Start this loop'}
            </Text>
          </Pressable>
        ) : null}
        {state.status === 'running' ? (
          <Pressable
            accessibilityRole="button"
            className="min-h-11 rounded-full border border-border bg-background px-4 py-2"
            onPress={() => {
              setState((current) => pauseSession(current, routine, Date.now()));
            }}
          >
            <Text className="text-sm font-semibold text-foreground">Pause</Text>
          </Pressable>
        ) : null}
        {state.status === 'paused' ? (
          <Pressable
            accessibilityRole="button"
            className="min-h-11 rounded-full border border-border bg-background px-4 py-2"
            onPress={() => {
              setState((current) => resumeSession(current, Date.now()));
            }}
          >
            <Text className="text-sm font-semibold text-foreground">
              Resume
            </Text>
          </Pressable>
        ) : null}
      </View>

      {log.length > 0 ? (
        <Text className="text-sm text-muted-foreground">
          Logged {log.length} {log.length === 1 ? 'loop' : 'loops'}.
        </Text>
      ) : null}
    </View>
  );
}
