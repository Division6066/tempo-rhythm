import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../lib/theme";

export default function MoreScreen() {
  const router = useRouter();

  const items = [
    { label: "Projects", icon: "folder" as const, color: colors.teal, route: "/projects" },
    { label: "Notes", icon: "document-text" as const, color: colors.primary, route: "/notes" },
    { label: "Daily Plan", icon: "calendar" as const, color: colors.amber, route: "/plan" },
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
