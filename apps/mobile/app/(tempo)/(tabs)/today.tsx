import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const sessionLogStorageKey = "tempo:sessionLogs:v1";

type SessionStatus = "idle" | "active";

type SessionLogEntry = {
  id: string;
  title: string;
  completedAt: number;
  durationMinutes: number;
};

function isSessionLogEntry(value: unknown): value is SessionLogEntry {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<SessionLogEntry>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.completedAt === "number" &&
    typeof candidate.durationMinutes === "number"
  );
}

function parseSessionLogs(rawValue: string | null): SessionLogEntry[] {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isSessionLogEntry);
  } catch {
    return [];
  }
}

export default function Screen() {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("idle");
  const [sessionLogs, setSessionLogs] = useState<SessionLogEntry[]>([]);

  useEffect(() => {
    async function loadSessionLogs(): Promise<void> {
      const storedLogs = await AsyncStorage.getItem(sessionLogStorageKey);
      setSessionLogs(parseSessionLogs(storedLogs));
    }

    void loadSessionLogs();
  }, []);

  function handleStartSession(): void {
    setSessionStatus("active");
  }

  async function handleCompleteSession(): Promise<void> {
    const completedAt = Date.now();
    const nextEntry: SessionLogEntry = {
      id: `session-${completedAt}`,
      title: "Focus session",
      completedAt,
      durationMinutes: 25,
    };

    const nextLogs = [nextEntry, ...sessionLogs];
    setSessionLogs(nextLogs);
    setSessionStatus("idle");
    await AsyncStorage.setItem(sessionLogStorageKey, JSON.stringify(nextLogs));
  }

  const isSessionActive = sessionStatus === "active";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 gap-6 p-6">
        <View className="gap-2">
          <Text className="text-2xl font-semibold text-foreground">Today</Text>
          <Text className="text-sm text-muted-foreground">
            One calm focus session at a time.
          </Text>
        </View>

        <View className="gap-4 rounded-3xl border border-border bg-card p-5">
          <View className="gap-1">
            <Text className="text-lg font-semibold text-foreground">
              Focus session
            </Text>
            <Text
              className="text-sm text-muted-foreground"
              testID="active-session-status"
            >
              {isSessionActive
                ? "Session running"
                : "Ready when you are"}
            </Text>
          </View>

          <View className="flex-row gap-3">
            <Pressable
              accessibilityHint="Starts a focus session for your current routine."
              accessibilityLabel="Start focus session"
              accessibilityRole="button"
              accessibilityState={{ disabled: isSessionActive }}
              accessible={true}
              className={`min-h-12 flex-1 items-center justify-center rounded-2xl px-4 ${
                isSessionActive ? "bg-muted" : "bg-primary"
              }`}
              disabled={isSessionActive}
              onPress={handleStartSession}
              testID="start-session-button"
            >
              <Text
                className={`font-semibold ${
                  isSessionActive
                    ? "text-muted-foreground"
                    : "text-primary-foreground"
                }`}
              >
                Start
              </Text>
            </Pressable>

            <Pressable
              accessibilityHint="Completes this session and adds it to the session log."
              accessibilityLabel="Complete focus session"
              accessibilityRole="button"
              accessibilityState={{ disabled: !isSessionActive }}
              accessible={true}
              className={`min-h-12 flex-1 items-center justify-center rounded-2xl px-4 ${
                isSessionActive ? "bg-emerald-700" : "bg-muted"
              }`}
              disabled={!isSessionActive}
              onPress={() => {
                void handleCompleteSession();
              }}
              testID="complete-session-button"
            >
              <Text
                className={`font-semibold ${
                  isSessionActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Complete
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-lg font-semibold text-foreground">
            Session log
          </Text>

          {sessionLogs.length > 0 ? (
            <View className="gap-3" testID="session-log-list">
              {sessionLogs.map((entry) => (
                <View
                  className="rounded-2xl border border-border bg-card p-4"
                  key={entry.id}
                  testID="session-log-entry"
                >
                  <Text className="font-semibold text-foreground">
                    {entry.title}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Completed just now · {entry.durationMinutes} min
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View
              className="rounded-2xl border border-dashed border-border bg-card p-4"
              testID="session-log-empty"
            >
              <Text className="text-sm text-muted-foreground">
                No sessions logged yet. A completed session will show up here.
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
