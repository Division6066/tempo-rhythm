import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../../lib/theme";

export default function MoreScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const items = [
    { label: "Projects", icon: "folder" as const, color: colors.success, route: "/projects" },
    { label: "Notes", icon: "document-text" as const, color: colors.primary, route: "/notes" },
    { label: "Calendar", icon: "calendar" as const, color: colors.warning, route: "/calendar" },
    { label: "Daily Plan", icon: "today" as const, color: colors.warning, route: "/plan" },
    { label: "Focus Timer", icon: "timer" as const, color: "#FF6B6B", route: "/focus" },
    { label: "Extract Tasks", icon: "sparkles" as const, color: "#9D4EDD", route: "/extract" },
    { label: "Search", icon: "search" as const, color: "#3B82F6", route: "/search" },
    { label: "Tags", icon: "pricetags" as const, color: colors.success, route: "/tags" },
    { label: "Folders & Areas", icon: "folder-open" as const, color: colors.primary, route: "/folders" },
    { label: "AI Memories", icon: "bulb" as const, color: colors.warning, route: "/memories" },
    { label: "Templates", icon: "copy" as const, color: colors.success, route: "/templates" },
    { label: "Filters", icon: "filter" as const, color: colors.primary, route: "/filters" },
    { label: "Settings", icon: "settings" as const, color: colors.muted, route: "/settings" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "800", marginBottom: 24 }}>More</Text>

        {items.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => router.push(item.route as never)}
            style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 18, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1, borderColor: colors.border }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${item.color}20`, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", flex: 1 }}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
