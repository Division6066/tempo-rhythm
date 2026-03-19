import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../tempo-app/convex/_generated/api";
import type { Id } from "../../../../tempo-app/convex/_generated/dataModel";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../lib/theme";

type StagedTask = { title: string; priority: string; estimatedMinutes?: number };

export default function InboxScreen() {
  const tasks = useQuery(api.tasks.list, { status: "inbox" });
  const stagedSuggestions = useQuery(api.staging.listPending, { type: "extractedTasks" });
  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);
  const removeTask = useMutation(api.tasks.remove);
  const extractTasks = useAction(api.ai.extractTasks);
  const createStaged = useMutation(api.staging.create);
  const acceptStaged = useMutation(api.staging.accept);
  const rejectStaged = useMutation(api.staging.reject);
  const router = useRouter();

  const [quickTask, setQuickTask] = useState("");
  const [brainDump, setBrainDump] = useState("");
  const [showDump, setShowDump] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const handleQuickAdd = async () => {
    if (!quickTask.trim()) return;
    await createTask({ title: quickTask, status: "inbox", priority: "medium" });
    setQuickTask("");
  };

  const handleExtract = async () => {
    if (!brainDump.trim()) return;
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
        priority: t.priority,
        estimatedMinutes: t.estimatedMinutes ?? undefined,
        status: "inbox",
        aiGenerated: true,
      });
    }
    await acceptStaged({ id: suggestionId });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <Ionicons name="file-tray" size={28} color={colors.primary} />
          <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "800" }}>Inbox</Text>
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
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
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
              <Pressable onPress={handleExtract} disabled={extracting} style={{ backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 6, opacity: extracting ? 0.6 : 1 }}>
                <Ionicons name="sparkles" size={16} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "700" }}>{extracting ? "Extracting..." : "Extract Tasks"}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable onPress={() => setShowDump(true)} style={{ borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border, borderStyle: "dashed", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Ionicons name="sparkles" size={16} color={colors.muted} />
            <Text style={{ color: colors.muted, fontWeight: "600" }}>Brain Dump (AI Extract)</Text>
          </Pressable>
        )}

        {stagedSuggestions && stagedSuggestions.length > 0 && stagedSuggestions.map((suggestion) => {
          const extractedTasks = (suggestion.data as { tasks: StagedTask[] }).tasks || [];
          return (
            <View key={suggestion._id} style={{ backgroundColor: "rgba(108,99,255,0.08)", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "rgba(108,99,255,0.3)" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <Ionicons name="sparkles" size={14} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "700" }}>AI Extracted Tasks ({extractedTasks.length})</Text>
              </View>
              {extractedTasks.map((t: StagedTask, i: number) => (
                <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>{t.title}</Text>
                  <View style={{ flexDirection: "row", gap: 6, marginTop: 4 }}>
                    <View style={{ backgroundColor: "rgba(108,99,255,0.15)", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ color: colors.primary, fontSize: 10, fontWeight: "600" }}>{t.priority}</Text>
                    </View>
                    {t.estimatedMinutes && <Text style={{ color: colors.muted, fontSize: 10 }}>{t.estimatedMinutes}m</Text>}
                  </View>
                </View>
              ))}
              <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Pressable onPress={() => rejectStaged({ id: suggestion._id })} style={{ flexDirection: "row", alignItems: "center", gap: 4, padding: 10 }}>
                  <Ionicons name="close" size={16} color={colors.danger} />
                  <Text style={{ color: colors.danger, fontWeight: "600", fontSize: 13 }}>Reject</Text>
                </Pressable>
                <Pressable onPress={() => handleAcceptExtracted(suggestion._id, extractedTasks)} style={{ backgroundColor: colors.teal, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Accept</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        {tasks?.map((task) => (
          <Pressable
            key={task._id}
            onPress={() => router.push(`/task/${task._id}` as never)}
            style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.border }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>{task.title}</Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                {task.aiGenerated && (
                  <View style={{ backgroundColor: "rgba(108,99,255,0.15)", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ color: colors.primary, fontSize: 10, fontWeight: "600" }}>AI</Text>
                  </View>
                )}
              </View>
            </View>
            <Pressable onPress={() => updateTask({ id: task._id, status: "today" })} hitSlop={10} style={{ padding: 6 }}>
              <Ionicons name="arrow-forward-circle-outline" size={22} color={colors.primary} />
            </Pressable>
            <Pressable onPress={() => { Alert.alert("Delete?", "Remove this task?", [{ text: "Cancel" }, { text: "Delete", style: "destructive", onPress: () => removeTask({ id: task._id }) }]); }} hitSlop={10} style={{ padding: 6 }}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </Pressable>
          </Pressable>
        ))}
        {tasks && tasks.length === 0 && !stagedSuggestions?.length && (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ color: colors.muted, fontSize: 14 }}>Inbox is empty.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
