import { useState, useCallback, useRef } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { api } from "../../../tempo-app/convex/_generated/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";

export default function SearchScreen() {
  const router = useRouter();
  const tasks = useQuery(api.tasks.list, {});
  const notes = useQuery(api.notes.list);
  const [query, setQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  const q = query.toLowerCase().trim();

  const filteredTasks = q.length >= 2
    ? (tasks || []).filter((t) => t.title.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q))
    : [];

  const filteredNotes = q.length >= 2
    ? (notes || []).filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
    : [];

  const totalResults = filteredTasks.length + filteredNotes.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border }}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search tasks & notes..."
            placeholderTextColor={colors.muted}
            autoFocus
            style={{ flex: 1, color: colors.foreground, fontSize: 15, paddingVertical: 12, paddingHorizontal: 10 }}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {q.length < 2 && (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Ionicons name="search-outline" size={48} color={colors.surfaceLight} style={{ marginBottom: 12 }} />
            <Text style={{ color: colors.muted, fontSize: 14, textAlign: "center" }}>Type at least 2 characters to search</Text>
          </View>
        )}

        {q.length >= 2 && totalResults === 0 && (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Ionicons name="file-tray-outline" size={48} color={colors.surfaceLight} style={{ marginBottom: 12 }} />
            <Text style={{ color: colors.muted, fontSize: 14, textAlign: "center" }}>No results for "{query}"</Text>
          </View>
        )}

        {filteredTasks.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
              Tasks ({filteredTasks.length})
            </Text>
            {filteredTasks.slice(0, 20).map((task) => (
              <Pressable
                key={task._id}
                onPress={() => router.push(`/task/${task._id}` as never)}
                style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.border }}
              >
                <Ionicons
                  name={task.status === "done" ? "checkmark-circle" : "ellipse-outline"}
                  size={20}
                  color={task.status === "done" ? colors.teal : colors.muted}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: task.status === "done" ? colors.muted : colors.foreground, fontSize: 14, fontWeight: "600", textDecorationLine: task.status === "done" ? "line-through" : "none" }}>
                    {task.title}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                    <Text style={{ color: colors.muted, fontSize: 10, textTransform: "capitalize" }}>{task.status}</Text>
                    <Text style={{ color: colors.muted, fontSize: 10 }}>{task.priority}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {filteredNotes.length > 0 && (
          <View>
            <Text style={{ color: colors.teal, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
              Notes ({filteredNotes.length})
            </Text>
            {filteredNotes.slice(0, 20).map((note) => (
              <Pressable
                key={note._id}
                onPress={() => router.push(`/note/${note._id}` as never)}
                style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border }}
              >
                <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", marginBottom: 4 }}>{note.title}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={2}>
                  {note.content.substring(0, 120)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
