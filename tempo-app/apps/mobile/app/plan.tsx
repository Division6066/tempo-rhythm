import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";
import { format } from "date-fns";

export default function PlanScreen() {
  const plans = useQuery(api.dailyPlans.list, { date: new Date().toISOString().split("T")[0] });
  const generatePlan = useAction(api.ai.generatePlan);
  const router = useRouter();

  const [generatedPlan, setGeneratedPlan] = useState<{ blocks: Array<{ type: string; title?: string }>; reasoning: string } | null>(null);
  const [generating, setGenerating] = useState(false);

  const existingPlan = plans && plans.length > 0 ? plans[0] : null;
  const hasPlan = !!existingPlan || !!generatedPlan;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generatePlan({ date: new Date().toISOString().split("T")[0] });
      setGeneratedPlan(res as typeof generatedPlan);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <View style={{ marginLeft: 12 }}>
          <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800" }}>Daily Plan</Text>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>{format(new Date(), "EEEE, MMMM do")}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {!hasPlan && (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(108,99,255,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Ionicons name="sparkles" size={36} color={colors.primary} />
            </View>
            <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", marginBottom: 8 }}>Let&apos;s plan your day</Text>
            <Text style={{ color: colors.muted, fontSize: 14, textAlign: "center", maxWidth: 280, marginBottom: 24 }}>
              AI will look at your tasks, energy, and routines to build a realistic plan.
            </Text>
            <Pressable onPress={handleGenerate} disabled={generating} style={{ backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14, flexDirection: "row", alignItems: "center", gap: 8, opacity: generating ? 0.7 : 1 }}>
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>{generating ? "Analyzing..." : "Generate AI Plan"}</Text>
            </Pressable>
          </View>
        )}

        {generatedPlan && !existingPlan && (
          <View>
            <View style={{ backgroundColor: "rgba(108,99,255,0.1)", borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "rgba(108,99,255,0.3)" }}>
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "700", marginBottom: 4 }}>AI Reasoning</Text>
              <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 20 }}>{generatedPlan.reasoning}</Text>
            </View>

            {generatedPlan.blocks.map((block, i) => (
              <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "700", marginBottom: 6 }}>{block.title || block.type}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{JSON.stringify(block, null, 2)}</Text>
              </View>
            ))}

            <View style={{ flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 16 }}>
              <Pressable onPress={() => setGeneratedPlan(null)} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,107,107,0.15)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,107,107,0.3)" }}>
                <Ionicons name="close" size={22} color={colors.danger} />
              </Pressable>
              <Pressable style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(0,201,167,0.15)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(0,201,167,0.3)" }}>
                <Ionicons name="checkmark" size={22} color={colors.teal} />
              </Pressable>
            </View>
          </View>
        )}

        {existingPlan && (existingPlan.blocks as Array<{ title?: string; type?: string }>).map((block, i) => (
          <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "700", marginBottom: 6 }}>{block.title || "Block"}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>{JSON.stringify(block, null, 2)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
