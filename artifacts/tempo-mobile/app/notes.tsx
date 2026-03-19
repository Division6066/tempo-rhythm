import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { api } from "../../../tempo-app/convex/_generated/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";

export default function NotesScreen() {
  const notes = useQuery(api.notes.list);
  const router = useRouter();

  const pinned = notes?.filter((n) => n.isPinned) || [];
  const other = notes?.filter((n) => !n.isPinned) || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", marginLeft: 12, flex: 1 }}>Notes</Text>
        <Pressable onPress={() => router.push("/note/new" as never)} style={{ backgroundColor: colors.primary, borderRadius: 10, width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="add" size={20} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {pinned.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Ionicons name="pin" size={12} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>Pinned</Text>
            </View>
            {pinned.map((note) => (
              <Pressable key={note._id} onPress={() => router.push(`/note/${note._id}` as never)} style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "rgba(108,99,255,0.3)", height: 100 }}>
                <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "700" }} numberOfLines={1}>{note.title || "Untitled"}</Text>
                <Text style={{ color: colors.muted, fontSize: 13, marginTop: 6 }} numberOfLines={2}>{note.content || "Empty note"}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>All Notes</Text>
          {other.length === 0 && pinned.length === 0 ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ color: colors.muted, fontSize: 14 }}>You don&apos;t have any notes yet.</Text>
            </View>
          ) : (
            other.map((note) => (
              <Pressable key={note._id} onPress={() => router.push(`/note/${note._id}` as never)} style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border, height: 100 }}>
                <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }} numberOfLines={1}>{note.title || "Untitled"}</Text>
                <Text style={{ color: colors.muted, fontSize: 13, marginTop: 6 }} numberOfLines={2}>{note.content || "Empty note"}</Text>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
