import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { api } from "../../../../tempo-app/convex/_generated/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, useTheme } from "../../lib/theme";
import { format } from "date-fns";
import { hapticMedium } from "../../lib/haptics";

export default function HomeScreen() {
  const { colors } = useTheme();
  const tasks = useQuery(api.tasks.list, {});
  const projects = useQuery(api.projects.list);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const todayTasks = tasks?.filter((t) => t.status === "today") || [];
  const inboxTasks = tasks?.filter((t) => t.status === "inbox") || [];
  const doneToday = todayTasks.filter((t) => t.status === "done").length;
  const totalToday = todayTasks.length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
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
        style={{ flex: 1 }}
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
        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
          {format(new Date(), "EEEE, MMM do")}
        </Text>
        <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "800", marginBottom: 24 }}>
          {getGreeting()}
        </Text>

        <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
            <View style={{ width: 80, height: 80, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "800" }}>{doneToday}</Text>
              <Text style={{ color: colors.muted, fontSize: 11 }}>/ {totalToday}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700", marginBottom: 4 }}>Today&apos;s Progress</Text>
              <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 12 }}>
                {doneToday === totalToday && totalToday > 0 ? "All done!" : "Keep going!"}
              </Text>
              <Pressable
                onPress={() => router.push("/plan" as never)}
                style={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12, alignItems: "center" }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Plan my day</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Today", value: totalToday, icon: "sunny" as const, color: colors.amber },
            { label: "Inbox", value: inboxTasks.length, icon: "file-tray" as const, color: "#60A5FA" },
            { label: "Projects", value: projects?.filter((p) => p.status === "active").length || 0, icon: "folder" as const, color: colors.teal },
          ].map((stat) => (
            <View key={stat.label} style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: colors.border }}>
              <Ionicons name={stat.icon} size={18} color={stat.color} style={{ marginBottom: 8 }} />
              <Text style={{ color: colors.foreground, fontSize: 22, fontWeight: "800" }}>{stat.value}</Text>
              <Text style={{ color: colors.muted, fontSize: 9, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => router.push("/(tabs)/chat" as never)}
          style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 18, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "rgba(108,99,255,0.3)", marginBottom: 24 }}
        >
          <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(108,99,255,0.2)", alignItems: "center", justifyContent: "center", marginRight: 14 }}>
            <Ionicons name="sparkles" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700" }}>AI Assistant</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Chat, plan, or chunk tasks</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </Pressable>

        <View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700" }}>Up Next</Text>
            <Pressable onPress={() => router.push("/(tabs)/today" as never)}>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>View all</Text>
            </Pressable>
          </View>
          {todayTasks
            .filter((t) => t.status !== "done")
            .slice(0, 3)
            .map((task) => (
              <Pressable
                key={task._id}
                onPress={() => router.push(`/task/${task._id}` as never)}
                style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}
              >
                <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>{task.title}</Text>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                  <View style={{ backgroundColor: task.priority === "high" ? "rgba(0,201,167,0.2)" : task.priority === "medium" ? "rgba(255,179,71,0.2)" : "rgba(136,136,170,0.2)", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ color: task.priority === "high" ? colors.teal : task.priority === "medium" ? colors.amber : colors.muted, fontSize: 10, fontWeight: "600" }}>{task.priority}</Text>
                  </View>
                  {task.estimatedMinutes && (
                    <Text style={{ color: colors.muted, fontSize: 10 }}>{task.estimatedMinutes}m</Text>
                  )}
                </View>
              </Pressable>
            ))}
          {todayTasks.filter((t) => t.status !== "done").length === 0 && (
            <View style={{ padding: 32, alignItems: "center", backgroundColor: `${colors.surface}80`, borderRadius: 14, borderWidth: 1, borderColor: colors.border, borderStyle: "dashed" }}>
              <Ionicons name="sunny-outline" size={28} color={colors.muted} style={{ marginBottom: 8, opacity: 0.5 }} />
              <Text style={{ color: colors.muted, fontSize: 13 }}>No upcoming tasks today.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
