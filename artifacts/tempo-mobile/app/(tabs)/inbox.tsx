import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../tempo-app/convex/_generated/api";
import type { Id } from "../../../../tempo-app/convex/_generated/dataModel";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut, Layout as LayoutAnimation } from "react-native-reanimated";
import { useThemeColors } from "../../lib/theme";
import { useNetwork } from "../../lib/NetworkContext";
import { cacheInboxTasks, getCachedInboxTasks } from "../../lib/offlineCache";
import { addToQueue } from "../../lib/offlineQueue";
import SwipeableTaskRow from "../../components/SwipeableTaskRow";
import { hapticSuccess } from "../../lib/haptics";

type StagedTask = { title: string; priority: string; estimatedMinutes?: number };

export default function InboxScreen() {
  const colors = useThemeColors();
  const { isConnected } = useNetwork();
  const tasks = useQuery(api.tasks.list, { status: "inbox" });
  const stagedSuggestions = useQuery(api.staging.listPending, { type: "extractedTasks" });
  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);
  const removeTask = useMutation(api.tasks.remove);
  const completeTask = useMutation(api.tasks.complete);
  const extractTasks = useAction(api.ai.extractTasks);
  const createStaged = useMutation(api.staging.create);
  const acceptStaged = useMutation(api.staging.accept);
  const rejectStaged = useMutation(api.staging.reject);
  const router = useRouter();

  const [quickTask, setQuickTask] = useState("");
  const [brainDump, setBrainDump] = useState("");
  const [showDump, setShowDump] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [cachedTasksList, setCachedTasksList] = useState<any[] | null>(null);

  useEffect(() => {
    if (tasks) {
      cacheInboxTasks(tasks);
    } else if (!isConnected) {
      getCachedInboxTasks().then(setCachedTasksList);
    }
  }, [tasks, isConnected]);

  const effectiveTasks = tasks ?? cachedTasksList;

  const handleQuickAdd = async () => {
    if (!quickTask.trim()) return;
    if (!isConnected) {
      await addToQueue({ type: "createTask", args: { title: quickTask, status: "inbox", priority: "medium" } });
      setQuickTask("");
      Alert.alert("Queued", "Task will be created when you're back online.");
      return;
    }
    await createTask({ title: quickTask, status: "inbox", priority: "medium" });
    setQuickTask("");
  };

  const normalizePriority = (p: string): string => {
    const lower = p.toLowerCase();
    if (lower === "high" || lower === "medium" || lower === "low") return lower;
    return "medium";
  };

  const handleExtract = async () => {
    if (!brainDump.trim()) return;
    if (!isConnected) {
      Alert.alert("Requires Connection", "AI task extraction needs an internet connection.");
      return;
    }
    setExtracting(true);
    try {
      const res = await extractTasks({ text: brainDump });
      if (res.tasks) {
        await createStaged({
          type: "extractedTasks",
          data: { tasks: res.tasks, sourceText: brainDump },
          reasoning: `Extracted ${res.tasks.length} task(s) from brain dump.`,
        });
        setBrainDump("");
        setShowDump(false);
      }
    } finally {
      setExtracting(false);
    }
  };

  const handleAcceptExtracted = async (suggestionId: Id<"stagedSuggestions">, extractedTasks: StagedTask[]) => {
    for (const t of extractedTasks) {
      await createTask({
        title: t.title,
        priority: normalizePriority(t.priority),
        estimatedMinutes: t.estimatedMinutes ?? undefined,
        status: "inbox",
        aiGenerated: true,
      });
    }
    await acceptStaged({ id: suggestionId });
  };

  const handleComplete = async (id: Id<"tasks">) => {
    hapticSuccess();
    await completeTask({ id });
  };

  const handleDefer = async (id: Id<"tasks">) => {
    await updateTask({ id, status: "today" });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <Ionicons name="file-tray" size={28} color={colors.primary} />
          <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "800", flex: 1 }}>Inbox</Text>
          <Pressable onPress={() => router.push("/extract" as never)} style={{ backgroundColor: "rgba(157,78,221,0.15)", borderRadius: 10, width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="sparkles" size={18} color="#9D4EDD" />
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
          <TextInput
            value={quickTask}
            onChangeText={setQuickTask}
            placeholder="Quick capture..."
            placeholderTextColor={colors.muted}
            onSubmitEditing={handleQuickAdd}
            returnKeyType="done"
            style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: colors.foreground, fontSize: 14, borderWidth: 1, borderColor: colors.border }}
          />
          <Pressable onPress={handleQuickAdd} style={{ backgroundColor: colors.primary, borderRadius: 12, width: 48, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="add" size={22} color="#fff" />
          </Pressable>
        </View>

        {showDump ? (
          <Animated.View entering={FadeIn.duration(200)} style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
            <TextInput
              value={brainDump}
              onChangeText={setBrainDump}
              placeholder="Type all your messy thoughts here..."
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
              style={{ minHeight: 120, color: colors.foreground, fontSize: 14, marginBottom: 12 }}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
              <Pressable onPress={() => setShowDump(false)} style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
                <Text style={{ color: colors.muted, fontWeight: "600" }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleExtract}
                disabled={extracting || !isConnected}
                style={{ backgroundColor: !isConnected ? colors.surfaceLight : colors.primary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 6, opacity: extracting || !isConnected ? 0.6 : 1 }}
              >
                <Ionicons name={!isConnected ? "cloud-offline-outline" : "sparkles"} size={16} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "700" }}>{!isConnected ? "Offline" : extracting ? "Extracting..." : "Extract Tasks"}</Text>
              </Pressable>
            </View>
          </Animated.View>
        ) : (
          <Pressable
            onPress={() => {
              if (!isConnected) {
                Alert.alert("Requires Connection", "AI task extraction needs an internet connection.");
                return;
              }
              setShowDump(true);
            }}
            style={{ borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border, borderStyle: "dashed", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, opacity: !isConnected ? 0.5 : 1 }}
          >
            <Ionicons name={!isConnected ? "cloud-offline-outline" : "sparkles"} size={16} color={colors.muted} />
            <Text style={{ color: colors.muted, fontWeight: "600" }}>{!isConnected ? "Brain Dump (Offline)" : "Brain Dump (AI Extract)"}</Text>
          </Pressable>
        )}

        {stagedSuggestions && stagedSuggestions.length > 0 && stagedSuggestions.map((suggestion) => {
          const extractedTasks = (suggestion.data as { tasks: StagedTask[] }).tasks || [];
          return (
            <Animated.View key={suggestion._id} entering={FadeIn.duration(300)} layout={LayoutAnimation.springify()} style={{ backgroundColor: "rgba(201,100,66,0.08)", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "rgba(201,100,66,0.3)" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <Ionicons name="sparkles" size={14} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "700" }}>AI Extracted Tasks ({extractedTasks.length})</Text>
              </View>
              {extractedTasks.map((t: StagedTask, i: number) => (
                <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>{t.title}</Text>
                  <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
                    <View style={{ backgroundColor: "rgba(201,100,66,0.15)", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ color: colors.primary, fontSize: 10, fontWeight: "600" }}>{t.priority}</Text>
                    </View>
                    {t.estimatedMinutes && <Text style={{ color: colors.muted, fontSize: 10 }}>{t.estimatedMinutes}m</Text>}
                  </View>
                </View>
              ))}
              <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Pressable onPress={() => rejectStaged({ id: suggestion._id })} style={{ flexDirection: "row", alignItems: "center", gap: 4, padding: 10 }}>
                  <Ionicons name="close" size={16} color={colors.destructive} />
                  <Text style={{ color: colors.destructive, fontWeight: "600", fontSize: 13 }}>Reject</Text>
                </Pressable>
                <Pressable onPress={() => handleAcceptExtracted(suggestion._id, extractedTasks)} style={{ backgroundColor: colors.success, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Accept</Text>
                </Pressable>
              </View>
            </Animated.View>
          );
        })}

        {effectiveTasks?.map((task) => (
          <SwipeableTaskRow
            key={task._id}
            task={{ ...task, priority: task.priority || "medium" }}
            onComplete={() => handleComplete(task._id)}
            onDefer={() => handleDefer(task._id)}
            onPress={() => router.push(`/task/${task._id}` as never)}
          />
        ))}

        {effectiveTasks && effectiveTasks.length === 0 && !stagedSuggestions?.length && (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ color: colors.muted, fontSize: 14 }}>Inbox is empty.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
