import { useEffect, useMemo, useState } from "react";
import { AppState, Text, View } from "react-native";

import {
  formatSessionElapsed,
  getSessionSnapshot,
  routineForBackgroundResumeTest,
  type SessionRoutine,
} from "@/lib/session-player";

type SessionPlayerProps = {
  routine?: SessionRoutine;
};

export function SessionPlayer({
  routine = routineForBackgroundResumeTest,
}: SessionPlayerProps) {
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const refresh = () => {
      setNow(Date.now());
    };

    const intervalId = setInterval(refresh, 1_000);
    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refresh();
      }
    });

    const onVisibilityChange = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        refresh();
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibilityChange);
    }

    return () => {
      clearInterval(intervalId);
      appStateSubscription.remove();

      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    };
  }, []);

  const snapshot = useMemo(
    () =>
      getSessionSnapshot({
        now,
        routine,
        startedAt,
      }),
    [now, routine, startedAt]
  );

  return (
    <View className="rounded-3xl border border-border bg-card p-5 gap-3">
      <Text className="text-sm font-medium text-muted-foreground">
        Session player
      </Text>
      <Text className="text-2xl font-semibold text-foreground">
        {routine.title}
      </Text>
      <View className="gap-1">
        <Text
          accessibilityLabel={`Current phase: ${snapshot.currentPhase.title}`}
          className="text-lg font-semibold text-foreground"
          testID="session-player-phase"
        >
          {snapshot.currentPhase.title}
        </Text>
        <Text
          accessibilityLabel={`Elapsed session time: ${formatSessionElapsed(
            snapshot.elapsedMs
          )}`}
          className="font-mono text-sm text-muted-foreground"
          testID="session-player-elapsed"
        >
          {formatSessionElapsed(snapshot.elapsedMs)}
        </Text>
      </View>
      <Text className="text-sm text-muted-foreground">
        You can step away and come back; this stays anchored to the session's
        real start time.
      </Text>
    </View>
  );
}
