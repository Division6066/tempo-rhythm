import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../tempo-app/convex/_generated/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, useTheme } from "../../lib/theme";
import type { Id } from "../../../../tempo-app/convex/_generated/dataModel";
import { hapticSuccess, hapticMedium } from "../../lib/haptics";

function TaskRow({ task, onToggle, onPress }: { task: { _id: Id<"tasks">; title: string; status: string; priority: string; estimatedMinutes?: number }; onToggle: () => void; onPress: () => void }) {
  const isDone = task.status === "done";
  const priorityColor = task.priority === "high" ? colors.teal : task.priority === "medium" ? colors.amber : colors.muted;

  return (
    <Pressable onPress={onPress} style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.border }}>
      <Pressable onPress={onToggle} hitSlop={12}>
        <Ionicons name={isDone ? "checkmark-circle" : "ellipse-outline"} size={22} color={isDone ? colors.primary : colors.muted} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={{ color: isDone ? colors.muted : colors.foreground, fontSize: 14, fontWeight: "600", textDecorationLine: isDone ? "line-through" : "none" }}>{task.title}</Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
          <View style={{ backgroundColor: `${priorityColor}33`, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ color: priorityColor, fontSize: 10, fontWeight: "600" }}>{task.priority}</Text>
          </View>
          {task.estimatedMinutes && <Text style={{ color: colors.muted, fontSize: 10 }}>{task.estimatedMinutes}m</Text>}
        </View>
      </View>
    </Pressable>
  );
}

export default function TodayScreen() {
  const allTasks = useQuery(api.tasks.list, {});
  const updateTask = useMutation(api.tasks.update);
  const completeTask = useMutation(api.tasks.complete);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const todayTasks = (allTasks || []).filter((t) => t.status === "today" || t.status === "done");
  const completedCount = todayTasks.filter((t) => t.status === "done").length;
  const progress = todayTasks.length > 0 ? (completedCount / todayTasks.length) * 100 : 0;

  const highPriority = todayTasks.filter((t) => t.priority === "high" && t.status !== "done");
  const mediumPriority = todayTasks.filter((t) => t.priority === "medium" && t.status !== "done");
  const lowPriority = todayTasks.filter((t) => t.priority === "low" && t.status !== "done");
  const completed = todayTasks.filter((t) => t.status === "done");

  const toggleTask = async (id: Id<"tasks">, currentStatus: string) => {
    if (currentStatus === "done") {
      await updateTask({ id, status: "today" });
    } else {
      hapticSuccess();
      await completeTask({ id });
    }
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
            <View style={{ flex: 1, height: 6, backgroundColor: colors.surfaceLight, borderRadius: 3, overflow: "hidden" }}>
              <View style={{ height: "100%", backgroundColor: colors.primary, borderRadius: 3, width: `${progress}%` }} />
            </View>
            <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600" }}>{completedCount} / {todayTasks.length}</Text>
          </View>
        </View>

        {highPriority.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.teal, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>High Priority</Text>
            {highPriority.map((t) => <TaskRow key={t._id} task={t} onToggle={() => toggleTask(t._id, t.status)} onPress={() => router.push(`/task/${t._id}` as never)} />)}
          </View>
        )}
        {mediumPriority.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.amber, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Medium Priority</Text>
            {mediumPriority.map((t) => <TaskRow key={t._id} task={t} onToggle={() => toggleTask(t._id, t.status)} onPress={() => router.push(`/task/${t._id}` as never)} />)}
          </View>
        )}
        {lowPriority.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Low Priority</Text>
            {lowPriority.map((t) => <TaskRow key={t._id} task={t} onToggle={() => toggleTask(t._id, t.status)} onPress={() => router.push(`/task/${t._id}` as never)} />)}
          </View>
        )}
        {completed.length > 0 && (
          <View style={{ marginBottom: 20, opacity: 0.6, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }}>
            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Completed</Text>
            {completed.map((t) => <TaskRow key={t._id} task={t} onToggle={() => toggleTask(t._id, t.status)} onPress={() => router.push(`/task/${t._id}` as never)} />)}
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
