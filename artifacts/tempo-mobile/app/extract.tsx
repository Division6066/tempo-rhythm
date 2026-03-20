import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../tempo-app/convex/_generated/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";
import { hapticSuccess } from "../lib/haptics";

type ExtractedTask = { title: string; priority: string; estimatedMinutes?: number };

export default function ExtractScreen() {
  const router = useRouter();
  const extractTasks = useAction(api.ai.extractTasks);
  const createTask = useMutation(api.tasks.create);

  const [text, setText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedTask[]>([]);
  const [accepted, setAccepted] = useState<Set<number>>(new Set());

  const handleExtract = async () => {
    if (!text.trim()) return;
    setExtracting(true);
    try {
      const res = await extractTasks({ text });
      if (res.tasks && res.tasks.length > 0) {
        setExtracted(res.tasks);
        setAccepted(new Set(res.tasks.map((_: ExtractedTask, i: number) => i)));
      } else {
        Alert.alert("No tasks found", "Try adding more detail to your text.");
      }
    } catch {
      Alert.alert("Error", "Failed to extract tasks. Please try again.");
    } finally {
      setExtracting(false);
    }
  };

  const toggleTask = (index: number) => {
    setAccepted((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const normalizePriority = (p: string): string => {
    const lower = p.toLowerCase();
    if (lower === "high" || lower === "medium" || lower === "low") return lower;
    return "medium";
  };

  const handleAcceptAll = async () => {
    const tasksToCreate = extracted.filter((_, i) => accepted.has(i));
    for (const t of tasksToCreate) {
      await createTask({
        title: t.title,
        priority: normalizePriority(t.priority),
        estimatedMinutes: t.estimatedMinutes ?? undefined,
        status: "inbox",
        aiGenerated: true,
      });
    }
    hapticSuccess();
    router.back();
  };

  const priorityColor = (p: string) => {
    if (p === "high") return colors.teal;
    if (p === "medium") return colors.amber;
    return colors.muted;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", marginLeft: 12 }}>Extract Tasks</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {extracted.length === 0 ? (
          <>
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(108,99,255,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Ionicons name="sparkles" size={32} color={colors.primary} />
              </View>
              <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800", marginBottom: 4 }}>Brain Dump</Text>
              <Text style={{ color: colors.muted, fontSize: 13, textAlign: "center" }}>Paste messy text and AI will extract tasks for you.</Text>
            </View>

            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Paste meeting notes, emails, thoughts..."
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 18,
                color: colors.foreground,
                fontSize: 15,
                lineHeight: 22,
                minHeight: 200,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 16,
              }}
            />

            <Pressable
              onPress={handleExtract}
              disabled={extracting || !text.trim()}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
                opacity: extracting || !text.trim() ? 0.6 : 1,
              }}
            >
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                {extracting ? "Extracting..." : "Extract Tasks"}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={{ backgroundColor: "rgba(108,99,255,0.08)", borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "rgba(108,99,255,0.2)", flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="sparkles" size={16} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "700" }}>
                Found {extracted.length} task{extracted.length !== 1 ? "s" : ""}
              </Text>
            </View>

            {extracted.map((task, i) => (
              <Pressable
                key={i}
                onPress={() => toggleTask(i)}
                style={{
                  backgroundColor: accepted.has(i) ? colors.surface : "rgba(38,38,64,0.3)",
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  borderWidth: 1,
                  borderColor: accepted.has(i) ? colors.border : "transparent",
                  opacity: accepted.has(i) ? 1 : 0.5,
                }}
              >
                <Ionicons
                  name={accepted.has(i) ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                  color={accepted.has(i) ? colors.primary : colors.muted}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>{task.title}</Text>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                    <View style={{ backgroundColor: `${priorityColor(task.priority)}33`, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ color: priorityColor(task.priority), fontSize: 10, fontWeight: "600" }}>{task.priority}</Text>
                    </View>
                    {task.estimatedMinutes && <Text style={{ color: colors.muted, fontSize: 10 }}>{task.estimatedMinutes}m</Text>}
                  </View>
                </View>
              </Pressable>
            ))}

            <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
              <Pressable
                onPress={() => { setExtracted([]); setText(""); }}
                style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 16, alignItems: "center", borderWidth: 1, borderColor: colors.border }}
              >
                <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 15 }}>Start Over</Text>
              </Pressable>
              <Pressable
                onPress={handleAcceptAll}
                disabled={accepted.size === 0}
                style={{ flex: 1, backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 16, alignItems: "center", opacity: accepted.size === 0 ? 0.5 : 1 }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Add {accepted.size} Tasks</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
