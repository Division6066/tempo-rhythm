import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../lib/theme";
import { format, startOfWeek, startOfMonth } from "date-fns";

export default function PeriodNoteScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();
  const createNote = useMutation(api.notes.create);
  const updateNote = useMutation(api.notes.update);
  const savingRef = useRef(false);
  const createdRef = useRef(false);

  const now = new Date();
  const periodDate =
    type === "weekly"
      ? format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd")
      : format(startOfMonth(now), "yyyy-MM-dd");

  const existingNote = useQuery(api.notes.getByPeriod, {
    periodType: type || "weekly",
    periodDate,
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setContent(existingNote.content);
      createdRef.current = true;
    } else if (existingNote === null && !createdRef.current) {
      const label = type === "weekly" ? "Weekly" : "Monthly";
      setTitle(`${label} Note - ${periodDate}`);
    }
  }, [existingNote, type, periodDate]);

  const handleSave = useCallback(async () => {
    if (savingRef.current) return;
    if (!title && !content) return;
    if (existingNote === undefined) return;
    savingRef.current = true;
    try {
      if (existingNote) {
        await updateNote({ id: existingNote._id, title, content });
      } else if (!createdRef.current) {
        createdRef.current = true;
        await createNote({
          title: title || `${type === "weekly" ? "Weekly" : "Monthly"} Note`,
          content,
          periodType: type,
          periodDate,
        });
      }
    } finally {
      savingRef.current = false;
    }
  }, [title, content, existingNote, type, periodDate, createNote, updateNote]);

  const handleBack = useCallback(async () => {
    await handleSave();
    router.back();
  }, [handleSave, router]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, justifyContent: "space-between" }}>
        <Pressable onPress={handleBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>
          {type === "weekly" ? "Weekly" : "Monthly"} Note
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: "rgba(108,99,255,0.1)", borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: "rgba(108,99,255,0.2)" }}>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>
            {periodDate}
          </Text>
        </View>

        <TextInput
          value={title}
          onChangeText={setTitle}
          onBlur={handleSave}
          placeholder="Note Title"
          placeholderTextColor={colors.muted}
          style={{ color: colors.foreground, fontSize: 22, fontWeight: "800", marginBottom: 16 }}
        />

        <TextInput
          value={content}
          onChangeText={setContent}
          onBlur={handleSave}
          placeholder="Start writing your reflections..."
          placeholderTextColor={colors.muted}
          multiline
          textAlignVertical="top"
          style={{
            backgroundColor: colors.surface,
            borderRadius: 14,
            padding: 16,
            color: colors.foreground,
            fontSize: 15,
            lineHeight: 24,
            minHeight: 400,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
