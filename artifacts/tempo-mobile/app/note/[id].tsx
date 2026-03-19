import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../tempo-app/convex/_generated/api";
import type { Id } from "../../../../tempo-app/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../lib/theme";

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isNew = id === "new";
  const noteId = !isNew ? (id as Id<"notes">) : undefined;

  const note = useQuery(api.notes.get, noteId ? { id: noteId } : "skip");
  const createNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);
  const deleteNote = useMutation(api.notes.remove);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (note && !isNew) {
      setTitle(note.title);
      setContent(note.content);
      setIsPinned(note.isPinned);
    }
  }, [note, isNew]);

  const handleSave = async () => {
    if (!title && !content) return;
    if (isNew) {
      await createNote({ title: title || "Untitled", content, isPinned });
      router.back();
    } else if (noteId) {
      await updateNote({ id: noteId, title, content, isPinned });
    }
  };

  const handleDelete = () => {
    if (isNew) { router.back(); return; }
    Alert.alert("Delete Note", "Are you sure?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { if (noteId) { await deleteNote({ id: noteId }); router.back(); } } },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={async () => { await handleSave(); router.back(); }} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable onPress={() => { setIsPinned(!isPinned); if (!isNew && noteId) updateNote({ id: noteId, isPinned: !isPinned }); }} hitSlop={12}>
            <Ionicons name={isPinned ? "pin" : "pin-outline"} size={22} color={isPinned ? colors.primary : colors.muted} />
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
          placeholder="Note Title"
          placeholderTextColor={colors.muted}
          style={{ color: colors.foreground, fontSize: 24, fontWeight: "800", marginBottom: 20 }}
        />
        <TextInput
          value={content}
          onChangeText={setContent}
          onBlur={handleSave}
          placeholder="Start typing..."
          placeholderTextColor={colors.muted}
          multiline
          textAlignVertical="top"
          style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, color: colors.foreground, fontSize: 15, lineHeight: 24, minHeight: 400, borderWidth: 1, borderColor: colors.border }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
