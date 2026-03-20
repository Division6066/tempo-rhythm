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

const FOLDER_ICONS: { icon: string; label: string }[] = [
  { icon: "folder", label: "Folder" },
  { icon: "briefcase", label: "Work" },
  { icon: "home", label: "Home" },
  { icon: "heart", label: "Health" },
  { icon: "school", label: "Learning" },
  { icon: "people", label: "Social" },
  { icon: "code-slash", label: "Code" },
  { icon: "cash", label: "Finance" },
];

export default function FoldersScreen() {
  const router = useRouter();
  const folders = useQuery(api.folders.list);
  const tasks = useQuery(api.tasks.list, {});
  const notes = useQuery(api.notes.list);
  const createFolder = useMutation(api.folders.create);
  const removeFolder = useMutation(api.folders.remove);

  const [showModal, setShowModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderDesc, setFolderDesc] = useState("");
  const [folderIcon, setFolderIcon] = useState("folder");

  const getContents = (folderId: string) => {
    const folderTasks = (tasks || []).filter((t) => t.folderId === folderId);
    const folderNotes = (notes || []).filter((n) => n.folderId === folderId);
    return { tasks: folderTasks.length, notes: folderNotes.length };
  };

  const handleCreate = async () => {
    if (!folderName.trim()) return;
    await createFolder({ name: folderName.trim(), description: folderDesc.trim() || undefined, icon: folderIcon });
    hapticSuccess();
    setShowModal(false);
    setFolderName("");
    setFolderDesc("");
    setFolderIcon("folder");
  };

  const handleDelete = (id: Id<"folders">, name: string) => {
    Alert.alert("Delete Folder", `Remove "${name}"? Items inside won't be deleted.`, [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: () => removeFolder({ id }) },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", marginLeft: 12, flex: 1 }}>Folders & Areas</Text>
        <Pressable onPress={() => setShowModal(true)} style={{ backgroundColor: colors.primary, borderRadius: 10, width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="add" size={20} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {(!folders || folders.length === 0) && (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Ionicons name="folder-open-outline" size={48} color={colors.surfaceLight} style={{ marginBottom: 12 }} />
            <Text style={{ color: colors.muted, fontSize: 14 }}>No folders yet. Create one to organize!</Text>
          </View>
        )}

        {folders?.map((folder) => {
          const contents = getContents(folder._id);
          return (
            <Pressable
              key={folder._id}
              onPress={() => router.push(`/folder/${folder._id}` as never)}
              style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 18, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${colors.primary}20`, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name={(folder.icon || "folder") as any} size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700" }}>{folder.name}</Text>
                  {folder.description && <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{folder.description}</Text>}
                  <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
                    <Text style={{ color: colors.muted, fontSize: 11 }}>{contents.tasks} tasks</Text>
                    <Text style={{ color: colors.muted, fontSize: 11 }}>{contents.notes} notes</Text>
                  </View>
                </View>
                <Pressable onPress={() => handleDelete(folder._id, folder.name)} hitSlop={10} style={{ padding: 6 }}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade">
        <Pressable onPress={() => setShowModal(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", marginBottom: 16 }}>Create Folder</Text>
            <TextInput
              value={folderName}
              onChangeText={setFolderName}
              placeholder="Folder name"
              placeholderTextColor={colors.muted}
              autoFocus
              style={{ backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: colors.foreground, fontSize: 15, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}
            />
            <TextInput
              value={folderDesc}
              onChangeText={setFolderDesc}
              placeholder="Description (optional)"
              placeholderTextColor={colors.muted}
              style={{ backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: colors.foreground, fontSize: 15, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}
            />
            <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600", marginBottom: 8 }}>Icon</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
              {FOLDER_ICONS.map((fi) => (
                <Pressable
                  key={fi.icon}
                  onPress={() => { setFolderIcon(fi.icon); hapticLight(); }}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: folderIcon === fi.icon ? `${colors.primary}30` : colors.background,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: folderIcon === fi.icon ? colors.primary : colors.border,
                  }}
                >
                  <Ionicons name={fi.icon} size={20} color={folderIcon === fi.icon ? colors.primary : colors.muted} />
                </Pressable>
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
