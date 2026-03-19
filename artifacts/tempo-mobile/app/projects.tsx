import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../tempo-app/convex/_generated/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";

export default function ProjectsScreen() {
  const projects = useQuery(api.projects.list);
  const createProject = useMutation(api.projects.create);
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState("#6C63FF");

  const projectColors = ["#6C63FF", "#00C9A7", "#FFB347", "#FF6B6B", "#9D4EDD", "#3B82F6"];
  const active = projects?.filter((p) => p.status === "active") || [];

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createProject({ name, color: selectedColor, status: "active" });
    setShowModal(false);
    setName("");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", marginLeft: 12, flex: 1 }}>Projects</Text>
        <Pressable onPress={() => setShowModal(true)} style={{ backgroundColor: colors.primary, borderRadius: 10, width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="add" size={20} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {active.length === 0 ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ color: colors.muted, fontSize: 14 }}>No active projects.</Text>
          </View>
        ) : (
          active.map((project) => (
            <View key={project._id} style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 18, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: project.color || colors.primary }} />
              <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700" }}>{project.name}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade">
        <Pressable onPress={() => setShowModal(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", marginBottom: 16 }}>Create Project</Text>
            <TextInput value={name} onChangeText={setName} placeholder="Project name" placeholderTextColor={colors.muted} autoFocus style={{ backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: colors.foreground, fontSize: 15, marginBottom: 16, borderWidth: 1, borderColor: colors.border }} />
            <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600", marginBottom: 8 }}>Color</Text>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
              {projectColors.map((c) => (
                <Pressable key={c} onPress={() => setSelectedColor(c)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c, borderWidth: 2, borderColor: selectedColor === c ? "#fff" : "transparent" }} />
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
