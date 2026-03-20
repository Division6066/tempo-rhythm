import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { api } from "../../../../tempo-app/convex/_generated/api";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../lib/theme";
import type { Id } from "../../../../tempo-app/convex/_generated/dataModel";

export default function FolderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const folder = useQuery(api.folders.get, { id: id as Id<"folders"> });
  const tasks = useQuery(api.tasks.list, {});
  const notes = useQuery(api.notes.list);

  const folderTasks = (tasks || []).filter((t) => t.folderId === id);
  const folderNotes = (notes || []).filter((n) => n.folderId === id);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800" }}>{folder?.name || "Folder"}</Text>
          {folder?.description && <Text style={{ color: colors.muted, fontSize: 12 }}>{folder.description}</Text>}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {folderTasks.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
              Tasks ({folderTasks.length})
            </Text>
            {folderTasks.map((task) => (
              <Pressable
                key={task._id}
                onPress={() => router.push(`/task/${task._id}` as never)}
                style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.border }}
              >
                <Ionicons name={task.status === "done" ? "checkmark-circle" : "ellipse-outline"} size={20} color={task.status === "done" ? colors.teal : colors.muted} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: task.status === "done" ? colors.muted : colors.foreground, fontSize: 14, fontWeight: "600" }}>{task.title}</Text>
                  <Text style={{ color: colors.muted, fontSize: 10, marginTop: 4 }}>{task.priority} · {task.status}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {folderNotes.length > 0 && (
          <View>
            <Text style={{ color: colors.teal, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
              Notes ({folderNotes.length})
            </Text>
            {folderNotes.map((note) => (
              <Pressable
                key={note._id}
                onPress={() => router.push(`/note/${note._id}` as never)}
                style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border }}
              >
                <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", marginBottom: 4 }}>{note.title}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={2}>{note.content.substring(0, 100)}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {folderTasks.length === 0 && folderNotes.length === 0 && (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Ionicons name="folder-open-outline" size={48} color={colors.surfaceLight} style={{ marginBottom: 12 }} />
            <Text style={{ color: colors.muted, fontSize: 14 }}>This folder is empty.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
