import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../tempo-app/convex/_generated/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../../lib/theme";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, Easing, FadeInDown } from "react-native-reanimated";
import FloatingActionButton from "../../components/FloatingActionButton";
import AnimatedProgressBar from "../../components/AnimatedProgressBar";
import { format } from "date-fns";
import { hapticMedium } from "../../lib/haptics";
import { useNetwork } from "../../lib/NetworkContext";
import { cacheAllTasks, getCachedAllTasks, cacheProjects, getCachedProjects } from "../../lib/offlineCache";
import { addToQueue } from "../../lib/offlineQueue";

function AnimatedStatCard({ label, value, icon, color, delay }: { label: string; value: number; icon: keyof typeof Ionicons.glyphMap; color: string; delay: number }) {
  const colors = useThemeColors();
  const scale = useSharedValue(0);
  const counterValue = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    counterValue.value = withTiming(value, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [value, scale, counterValue]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={[{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: colors.border }, cardStyle]}>
      <Ionicons name={icon} size={18} color={color} style={{ marginBottom: 8 }} />
      <Text style={{ color: colors.foreground, fontSize: 22, fontWeight: "800" }}>{value}</Text>
      <Text style={{ color: colors.muted, fontSize: 9, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" }}>{label}</Text>
    </Animated.View>
  );
}

function AnimatedProgressRing({ done, total }: { done: number; total: number }) {
  const colors = useThemeColors();
  const scale = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 80 });
  }, [done, total, scale]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[{ width: 80, height: 80, alignItems: "center", justifyContent: "center" }, ringStyle]}>
      <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "800" }}>{done}</Text>
      <Text style={{ color: colors.muted, fontSize: 11 }}>/ {total}</Text>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const colors = useThemeColors();
  const { isConnected } = useNetwork();
  const liveTasks = useQuery(api.tasks.list, {});
  const liveProjects = useQuery(api.projects.list);
  const createTask = useMutation(api.tasks.create);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const [cachedTasks, setCachedTasks] = useState<any[] | null>(null);
  const [cachedProjectsList, setCachedProjectsList] = useState<any[] | null>(null);

  useEffect(() => {
    if (liveTasks) {
      cacheAllTasks(liveTasks);
    } else if (!isConnected) {
      getCachedAllTasks().then(setCachedTasks);
    }
  }, [liveTasks, isConnected]);

  useEffect(() => {
    if (liveProjects) {
      cacheProjects(liveProjects);
    } else if (!isConnected) {
      getCachedProjects().then(setCachedProjectsList);
    }
  }, [liveProjects, isConnected]);

  const tasks = liveTasks ?? cachedTasks;
  const projects = liveProjects ?? cachedProjectsList;

  const todayTasks = tasks?.filter((t) => t.status === "today" || t.status === "done") || [];
  const inboxTasks = tasks?.filter((t) => t.status === "inbox") || [];
  const doneToday = todayTasks.filter((t) => t.status === "done").length;
  const totalToday = todayTasks.length;
  const progress = totalToday > 0 ? (doneToday / totalToday) * 100 : 0;

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

  const handleAIPress = () => {
    if (!isConnected) {
      Alert.alert("Requires Connection", "AI features need an internet connection to work.");
      return;
    }
    router.push("/(tabs)/chat" as never);
  };

  const handlePlanPress = () => {
    if (!isConnected) {
      Alert.alert("Requires Connection", "Plan generation needs an internet connection to work.");
      return;
    }
    router.push("/plan" as never);
  };

  const fabActions = [
    {
      label: "Add task",
      icon: "add-circle" as keyof typeof Ionicons.glyphMap,
      color: colors.primary,
      onPress: () => {
        if (!isConnected) {
          addToQueue({ type: "createTask", args: { title: "New task", status: "inbox", priority: "medium" } });
          Alert.alert("Queued", "Task will be created when you're back online.");
          return;
        }
        createTask({ title: "New task", status: "inbox", priority: "medium" });
      },
    },
    {
      label: "New note",
      icon: "document-text" as keyof typeof Ionicons.glyphMap,
      color: colors.success,
      onPress: () => router.push("/notes" as never),
    },
    {
      label: "Plan my day",
      icon: "sunny" as keyof typeof Ionicons.glyphMap,
      color: colors.warning,
      onPress: handlePlanPress,
    },
    {
      label: "Open chat",
      icon: "sparkles" as keyof typeof Ionicons.glyphMap,
      color: "#C96442",
      onPress: handleAIPress,
    },
  ];

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
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" }}>
              {format(new Date(), "EEEE, MMM do")}
            </Text>
            <Pressable onPress={() => router.push("/search" as never)} hitSlop={10} style={{ padding: 4 }}>
              <Ionicons name="search" size={22} color={colors.muted} />
            </Pressable>
          </View>
          <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "800", marginBottom: 24 }}>
            {getGreeting()}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
            <AnimatedProgressRing done={doneToday} total={totalToday} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700", marginBottom: 4 }}>Today&apos;s Progress</Text>
              <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 8 }}>
                {doneToday === totalToday && totalToday > 0 ? "All done!" : "Keep going!"}
              </Text>
              <AnimatedProgressBar progress={progress} />
              <View style={{ marginTop: 12 }}>
                <Pressable
                  onPress={handlePlanPress}
                  style={{ backgroundColor: !isConnected ? colors.surfaceLight : colors.primary, borderRadius: 12, paddingVertical: 12, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}
                >
                  {!isConnected && <Ionicons name="cloud-offline-outline" size={14} color={colors.muted} />}
                  <Text style={{ color: !isConnected ? colors.muted : "#fff", fontWeight: "700", fontSize: 14 }}>Plan my day</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
          <AnimatedStatCard label="Today" value={totalToday} icon="sunny" color={colors.warning} delay={200} />
          <AnimatedStatCard label="Inbox" value={inboxTasks.length} icon="file-tray" color={colors.info} delay={300} />
          <AnimatedStatCard label="Projects" value={projects?.filter((p: any) => p.status === "active").length || 0} icon="folder" color={colors.success} delay={400} />
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
          <Pressable
            onPress={() => router.push("/focus" as never)}
            style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: colors.border }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,107,107,0.15)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="timer" size={18} color="#FF6B6B" />
            </View>
            <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>Focus</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/extract" as never)}
            style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: colors.border }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(157,78,221,0.15)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="sparkles" size={18} color="#9D4EDD" />
            </View>
            <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>Extract</Text>
          </Pressable>
        </View>

        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <Pressable
            onPress={handleAIPress}
            style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 18, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: !isConnected ? colors.border : "rgba(201,100,66,0.3)", marginBottom: 24, opacity: !isConnected ? 0.6 : 1 }}
          >
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "rgba(201,100,66,0.2)", alignItems: "center", justifyContent: "center", marginRight: 14 }}>
              <Ionicons name={!isConnected ? "cloud-offline-outline" : "sparkles"} size={24} color={!isConnected ? colors.muted : colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700" }}>AI Assistant</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{!isConnected ? "Requires connection" : "Chat, plan, or chunk tasks"}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
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
                  <View style={{ backgroundColor: task.priority === "high" ? "rgba(107,158,125,0.2)" : task.priority === "medium" ? "rgba(201,165,78,0.2)" : "rgba(138,133,128,0.2)", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ color: task.priority === "high" ? colors.success : task.priority === "medium" ? colors.warning : colors.muted, fontSize: 10, fontWeight: "600" }}>{task.priority}</Text>
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
        </Animated.View>
      </ScrollView>

      <FloatingActionButton actions={fabActions} />
    </SafeAreaView>
  );
}
