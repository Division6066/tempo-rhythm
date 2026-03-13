import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../lib/theme";

type Subtask = { title: string; priority: string; estimatedMinutes: number; tags: string[] };

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const taskId = id as Id<"tasks">;

  const task = useQuery(api.tasks.get, { id: taskId });
  const updateTask = useMutation(api.tasks.update);
  const deleteTask = useMutation(api.tasks.remove);
  const createTask = useMutation(api.tasks.create);
  const chunkTask = useAction(api.ai.chunkTask);
  const createStaged = useMutation(api.staging.create);
  const stagedSuggestions = useQuery(api.staging.listPending, { type: "chunkedTask" });
  const acceptStaged = useMutation(api.staging.accept);
  const rejectStaged = useMutation(api.staging.reject);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("inbox");
  const [priority, setPriority] = useState("medium");
  const [chunking, setChunking] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNotes(task.notes || "");
      setStatus(task.status);
      setPriority(task.priority);
    }
  }, [task]);

  const handleSave = async () => {
    await updateTask({ id: taskId, title, notes, status, priority });
  };

  const handleDelete = () => {
    Alert.alert("Delete Task", "Are you sure?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteTask({ id: taskId }); router.back(); } },
    ]);
  };

  const handleChunk = async () => {
    setChunking(true);
    try {
      const res = await chunkTask({ taskTitle: title, taskNotes: notes });
      if (res.subtasks?.length) {
        await createStaged({
          type: "chunkedTask",
          data: { parentTaskId: taskId, subtasks: res.subtasks, reasoning: res.reasoning },
          reasoning: res.reasoning,
        });
      }
    } finally {
      setChunking(false);
    }
  };

  const handleAcceptChunks = async (suggestionId: Id<"stagedSuggestions">, subtasks: Subtask[]) => {
    for (const s of subtasks) {
      await createTask({
        title: s.title,
        priority: s.priority,
        estimatedMinutes: s.estimatedMinutes,
        status: task?.status || "inbox",
        parentTaskId: taskId,
        aiGenerated: true,
      });
    }
    await acceptStaged({ id: suggestionId });
  };

  const thisTaskStaged = stagedSuggestions?.filter(
    (s) => (s.data as { parentTaskId: string }).parentTaskId === taskId
  ) || [];

  if (!task) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.muted }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const statuses = ["inbox", "today", "scheduled", "done", "cancelled"];
  const priorities = ["high", "medium", "low"];
  const priorityColors: Record<string, string> = { high: colors.teal, medium: colors.amber, low: colors.muted };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => { handleSave(); router.back(); }} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable onPress={handleChunk} disabled={chunking} style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(108,99,255,0.1)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "rgba(108,99,255,0.3)" }}>
            <Ionicons name="sparkles" size={14} color={colors.primary} />
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" }}>{chunking ? "..." : "Chunk"}</Text>
          </Pressable>
          <Pressable onPress={handleDelete} hitSlop={12}>
            <Ionicons name="trash-outline" size={22} color={colors.danger} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          onBlur={handleSave}
          style={{ color: colors.foreground, fontSize: 24, fontWeight: "800", marginBottom: 20 }}
          placeholder="Task title"
          placeholderTextColor={colors.muted}
        />

        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Status</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {statuses.map((s) => (
              <Pressable key={s} onPress={() => { setStatus(s); setTimeout(() => updateTask({ id: taskId, status: s }), 0); }} style={{ backgroundColor: status === s ? colors.primary : colors.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: status === s ? colors.primary : colors.border }}>
                <Text style={{ color: status === s ? "#fff" : colors.foreground, fontSize: 13, fontWeight: "600", textTransform: "capitalize" }}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Priority</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {priorities.map((p) => (
              <Pressable key={p} onPress={() => { setPriority(p); setTimeout(() => updateTask({ id: taskId, priority: p }), 0); }} style={{ backgroundColor: priority === p ? `${priorityColors[p]}33` : colors.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: priority === p ? priorityColors[p] : colors.border, flex: 1, alignItems: "center" }}>
                <Text style={{ color: priority === p ? priorityColors[p] : colors.foreground, fontSize: 13, fontWeight: "600", textTransform: "capitalize" }}>{p}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {thisTaskStaged.length > 0 && thisTaskStaged.map((suggestion) => {
          const data = suggestion.data as { subtasks: Subtask[]; reasoning: string };
          return (
            <View key={suggestion._id} style={{ backgroundColor: "rgba(108,99,255,0.08)", borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: "rgba(108,99,255,0.3)" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Ionicons name="sparkles" size={14} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "700" }}>AI Subtasks</Text>
              </View>
              <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 10 }}>{data.reasoning}</Text>
              {data.subtasks.map((s, i) => (
                <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>{s.title}</Text>
                  <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>{s.estimatedMinutes}m - {s.priority}</Text>
                </View>
              ))}
              <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Pressable onPress={() => rejectStaged({ id: suggestion._id })} style={{ flexDirection: "row", alignItems: "center", gap: 4, padding: 10 }}>
                  <Ionicons name="close" size={16} color={colors.danger} />
                  <Text style={{ color: colors.danger, fontWeight: "600", fontSize: 13 }}>Reject</Text>
                </Pressable>
                <Pressable onPress={() => handleAcceptChunks(suggestion._id, data.subtasks)} style={{ backgroundColor: colors.teal, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Accept</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        <View>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            onBlur={handleSave}
            placeholder="Add some details..."
            placeholderTextColor={colors.muted}
            multiline
            textAlignVertical="top"
            style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, color: colors.foreground, fontSize: 14, lineHeight: 22, minHeight: 200, borderWidth: 1, borderColor: colors.border }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
