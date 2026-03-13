import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../lib/theme";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const taskId = id as Id<"tasks">;

  const task = useQuery(api.tasks.get, { id: taskId });
  const updateTask = useMutation(api.tasks.update);
  const deleteTask = useMutation(api.tasks.remove);
  const chunkTask = useAction(api.ai.chunkTask);

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
        const newNotes = notes + "\n\nAI Chunked Subtasks:\n" + res.subtasks.map((s: { title: string; estimatedMinutes: number }) => `- ${s.title} (${s.estimatedMinutes}m)`).join("\n");
        setNotes(newNotes);
        await updateTask({ id: taskId, notes: newNotes });
      }
    } finally {
      setChunking(false);
    }
  };

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
