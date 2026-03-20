import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../tempo-app/convex/_generated/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";
import { hapticLight, hapticSuccess } from "../lib/haptics";
import type { Id } from "../../../tempo-app/convex/_generated/dataModel";

const TAG_COLORS = [
  "#6C63FF", "#00C9A7", "#FFB347", "#FF6B6B", "#9D4EDD",
  "#3B82F6", "#F472B6", "#34D399", "#FBBF24", "#EF4444",
  "#8B5CF6", "#06B6D4",
];

export default function TagsScreen() {
  const router = useRouter();
  const tags = useQuery(api.tags.list);
  const createTag = useMutation(api.tags.create);
  const removeTag = useMutation(api.tags.remove);

  const [showModal, setShowModal] = useState(false);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState(TAG_COLORS[0]);

  const handleCreate = async () => {
    if (!tagName.trim()) return;
    await createTag({ name: tagName.trim(), color: tagColor });
    hapticSuccess();
    setShowModal(false);
    setTagName("");
    setTagColor(TAG_COLORS[0]);
  };

  const handleDelete = (id: Id<"tags">, name: string) => {
    Alert.alert("Delete Tag", `Remove "${name}"?`, [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: () => removeTag({ id }) },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", marginLeft: 12, flex: 1 }}>Tags</Text>
        <Pressable onPress={() => setShowModal(true)} style={{ backgroundColor: colors.primary, borderRadius: 10, width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="add" size={20} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {(!tags || tags.length === 0) && (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Ionicons name="pricetags-outline" size={48} color={colors.surfaceLight} style={{ marginBottom: 12 }} />
            <Text style={{ color: colors.muted, fontSize: 14 }}>No tags yet. Create one!</Text>
          </View>
        )}

        {tags?.map((tag) => (
          <View
            key={tag._id}
            style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.border }}
          >
            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: tag.color || colors.primary }} />
            <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "600", flex: 1 }}>{tag.name}</Text>
            <Pressable onPress={() => handleDelete(tag._id, tag.name)} hitSlop={10} style={{ padding: 6 }}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade">
        <Pressable onPress={() => setShowModal(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", marginBottom: 16 }}>Create Tag</Text>
            <TextInput
              value={tagName}
              onChangeText={setTagName}
              placeholder="Tag name"
              placeholderTextColor={colors.muted}
              autoFocus
              style={{ backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: colors.foreground, fontSize: 15, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}
            />
            <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600", marginBottom: 8 }}>Color</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
              {TAG_COLORS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => { setTagColor(c); hapticLight(); }}
                  style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c, borderWidth: 2, borderColor: tagColor === c ? "#fff" : "transparent" }}
                />
              ))}
            </View>
            <Pressable onPress={handleCreate} style={{ backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Create</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
