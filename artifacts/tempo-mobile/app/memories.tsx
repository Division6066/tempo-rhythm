import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../tempo-app/convex/_generated/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";
import type { Id } from "../../../tempo-app/convex/_generated/dataModel";

const TIER_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  hot: { label: "Hot", color: "#FF6B6B", icon: "flame" },
  warm: { label: "Warm", color: "#FFB347", icon: "sunny" },
  cold: { label: "Cold", color: "#3B82F6", icon: "snow" },
};

export default function MemoriesScreen() {
  const router = useRouter();
  const memories = useQuery(api.memories.list);
  const removeMemory = useMutation(api.memories.remove);

  const handleDelete = (id: Id<"memories">) => {
    Alert.alert("Delete Memory", "Remove this memory from the AI's context?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: () => removeMemory({ id }) },
    ]);
  };

  const grouped: Record<string, typeof memories> = { hot: [], warm: [], cold: [] };
  memories?.forEach((m) => {
    const tier = m.tier || "warm";
    if (!grouped[tier]) grouped[tier] = [];
    grouped[tier]!.push(m);
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", marginLeft: 12, flex: 1 }}>AI Memories</Text>
        <View style={{ backgroundColor: "rgba(108,99,255,0.15)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>{memories?.length || 0} total</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {(!memories || memories.length === 0) && (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Ionicons name="bulb-outline" size={48} color={colors.surfaceLight} style={{ marginBottom: 12 }} />
            <Text style={{ color: colors.muted, fontSize: 14, textAlign: "center" }}>No memories yet. Chat with TEMPO to build context.</Text>
          </View>
        )}

        {(["hot", "warm", "cold"] as const).map((tier) => {
          const items = grouped[tier] || [];
          if (items.length === 0) return null;
          const config = TIER_CONFIG[tier];
          return (
            <View key={tier} style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <Ionicons name={config.icon as any} size={16} color={config.color} />
                <Text style={{ color: config.color, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
                  {config.label} ({items.length})
                </Text>
              </View>
              {items.map((memory) => (
                <View
                  key={memory._id}
                  style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border }}
                >
                  <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 20, marginBottom: 8 }}>{memory.content}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <Text style={{ color: colors.muted, fontSize: 10 }}>
                        Decay: {memory.decay}%
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 10 }}>
                        {new Date(memory.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Pressable onPress={() => handleDelete(memory._id)} hitSlop={10} style={{ padding: 4 }}>
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
