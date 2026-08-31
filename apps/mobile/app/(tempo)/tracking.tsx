/**
 * @screen: tracking
 * @platform: mobile
 * @summary: Tracking chart leftover from #188, streak ring from #184, persisted session logs from #212.
 * @queries: streaks.getCurrent
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TrackingDashboardChart } from "@/components/tracking/TrackingDashboardChart";
import { TrackingStreakRing } from "@/components/tracking/TrackingStreakRing";
import { api } from "@/convex/_generated/api";
import {
  parseSessionLogEntries,
  sessionLogsToTrackingSessions,
} from "@/lib/focus-session-log";
import { sessionLogStorageKey } from "@/lib/session-player";
import type { LoggedTrackingSession } from "@/lib/tracking-dashboard-data";
import { useConvexAuth, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  const { isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.users.getProfile, isAuthenticated ? {} : "skip");
  const hasConvexUser = profile != null;
  const habitStreak = useQuery(
    api.streaks.getCurrent,
    isAuthenticated && hasConvexUser ? {} : "skip",
  );
  const streakCount = habitStreak?.streakCount ?? 0;
  const [sessions, setSessions] = useState<LoggedTrackingSession[]>([]);

  useEffect(() => {
    let isMounted = true;
    void AsyncStorage.getItem(sessionLogStorageKey).then((raw) => {
      if (!isMounted) {
        return;
      }
      setSessions(sessionLogsToTrackingSessions(parseSessionLogEntries(raw)));
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6 gap-5">
        <Text className="text-2xl font-semibold text-foreground">Tracking</Text>
        <Text className="text-sm text-muted-foreground">
          Focus minutes from sessions you already logged, and the habit streak
          you already have. An empty ring is still a complete enough start.
        </Text>
        <TrackingStreakRing streakCount={streakCount} />
        <TrackingDashboardChart sessions={sessions} />
      </View>
    </SafeAreaView>
  );
}
