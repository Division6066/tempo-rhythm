import { useEffect } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";

export default function TemplatesScreen() {
  const templates = useQuery(api.templates.list);
  const seedBuiltIn = useMutation(api.templates.seedBuiltIn);
  const createNote = useMutation(api.notes.create);
  const removeTemplate = useMutation(api.templates.remove);
  const router = useRouter();

  useEffect(() => {
    if (templates && templates.length === 0) {
      seedBuiltIn();
    }
  }, [templates, seedBuiltIn]);

  const handleApply = async (template: { name: string; content: string }) => {
    const dateStr = new Date().toISOString().split("T")[0];
    const content = template.content
      .replace(/\{\{date\}\}/g, dateStr)
      .replace(/\{\{title\}\}/g, template.name);
    await createNote({ title: `${template.name} - ${dateStr}`, content });
    Alert.alert("Created", "Note created from template", [
      { text: "OK", onPress: () => router.push("/notes" as never) },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", marginLeft: 12 }}>Templates</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {templates?.map((tmpl) => (
          <Pressable
            key={tmpl._id}
            onPress={() => handleApply(tmpl)}
            style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "700" }}>{tmpl.name}</Text>
                {tmpl.description && (
                  <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{tmpl.description}</Text>
                )}
                <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
                  {tmpl.category && (
                    <View style={{ backgroundColor: "rgba(108,99,255,0.15)", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ color: colors.primary, fontSize: 10, fontWeight: "600" }}>{tmpl.category}</Text>
                    </View>
                  )}
                  {tmpl.isBuiltIn && (
                    <View style={{ backgroundColor: colors.surfaceLight, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ color: colors.muted, fontSize: 10, fontWeight: "600" }}>Built-in</Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name="copy-outline" size={20} color={colors.primary} />
            </View>
          </Pressable>
        ))}

        {templates && templates.length === 0 && (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ color: colors.muted, fontSize: 14 }}>Loading templates...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
