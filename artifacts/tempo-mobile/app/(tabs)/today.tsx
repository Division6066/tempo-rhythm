import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../tempo-app/convex/_generated/api";
import { useRouter } from "expo-router";
import { useThemeColors } from "../../lib/theme";
import { useNetwork } from "../../lib/NetworkContext";
import { cacheTodayTasks, getCachedTodayTasks } from "../../lib/offlineCache";
import { addToQueue } from "../../lib/offlineQueue";
import SwipeableTaskRow from "../../components/SwipeableTaskRow";
import AnimatedProgressBar from "../../components/AnimatedProgressBar";
import type { Id } from "../../../../tempo-app/convex/_generated/dataModel";
import { hapticSuccess, hapticMedium } from "../../lib/haptics";

export default function TodayScreen() {
  const colors = useThemeColors();
  const { isConnected } = useNetwork();
  const allTasks = useQuery(api.tasks.list, {});
  const updateTask = useMutation(api.tasks.update);
  const completeTask = useMutation(api.tasks.complete);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const [cachedTasks, setCachedTasks] = useState<any[] | null>(null);

  useEffect(() => {
    if (allTasks) {
      const todayAndDone = allTasks.filter((t) => t.status === "today" || t.status === "done");
      cacheTodayTasks(todayAndDone);
    } else if (!isConnected) {
      getCachedTodayTasks().then(setCachedTasks);
    }
  }, [allTasks, isConnected]);

  const effectiveTasks = allTasks ?? null;
  const todaySource = effectiveTasks
    ? effectiveTasks.filter((t) => t.status === "today" || t.status === "done")
    : cachedTasks ?? [];

  const todayTasks = todaySource;
  const completedCount = todayTasks.filter((t) => t.status === "done").length;
  const progress = todayTasks.length > 0 ? (completedCount / todayTasks.length) * 100 : 0;

  const highPriority = todayTasks.filter((t) => t.priority === "high" && t.status !== "done");
  const mediumPriority = todayTasks.filter((t) => t.priority === "medium" && t.status !== "done");
  const lowPriority = todayTasks.filter((t) => t.priority === "low" && t.status !== "done");
  const completed = todayTasks.filter((t) => t.status === "done");

  const toggleTask = async (id: Id<"tasks">, currentStatus: string) => {
    if (!isConnected) {
      const newStatus = currentStatus === "done" ? "today" : "done";
      await addToQueue({ type: "updateTask", args: { id, status: newStatus } });
      Alert.alert("Queued", "This change will sync when you're back online.");
      return;
    }
    if (currentStatus === "done") {
      await updateTask({ id, status: "today" });
    } else {
      hapticSuccess();
      await completeTask({ id });
    }
  };

  const deferTask = async (id: Id<"tasks">) => {
    await updateTask({ id, status: "inbox" });
  };

  const onRefresh = useCallback(async () => {
    hapticMedium();
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "800", marginBottom: 12 }}>Today</Text>

        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <AnimatedProgressBar progress={progress} />
            <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>{completedCount} / {todayTasks.length}</Text>
          </View>
        </View>

        {highPriority.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.success, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>High Priority</Text>
            {highPriority.map((t) => (
              <SwipeableTaskRow
                key={t._id}
                task={t}
                onComplete={() => toggleTask(t._id, t.status)}
                onDefer={() => deferTask(t._id)}
                onPress={() => router.push(`/task/${t._id}` as never)}
              />
            ))}
          </View>
        )}
        {mediumPriority.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.warning, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Medium Priority</Text>
            {mediumPriority.map((t) => (
              <SwipeableTaskRow
                key={t._id}
                task={t}
                onComplete={() => toggleTask(t._id, t.status)}
                onDefer={() => deferTask(t._id)}
                onPress={() => router.push(`/task/${t._id}` as never)}
              />
            ))}
          </View>
        )}
        {lowPriority.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Low Priority</Text>
            {lowPriority.map((t) => (
              <SwipeableTaskRow
                key={t._id}
                task={t}
                onComplete={() => toggleTask(t._id, t.status)}
                onDefer={() => deferTask(t._id)}
                onPress={() => router.push(`/task/${t._id}` as never)}
              />
            ))}
          </View>
        )}
        {completed.length > 0 && (
          <View style={{ marginBottom: 20, opacity: 0.6, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }}>
            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Completed</Text>
            {completed.map((t) => (
              <SwipeableTaskRow
                key={t._id}
                task={t}
                onComplete={() => toggleTask(t._id, t.status)}
                onDefer={() => deferTask(t._id)}
                onPress={() => router.push(`/task/${t._id}` as never)}
              />
            ))}
          </View>
        )}
        {todayTasks.length === 0 && (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ color: colors.muted, fontSize: 14 }}>Nothing planned for today yet.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
