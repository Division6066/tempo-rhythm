import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../tempo-app/convex/_generated/api";
import type { Id } from "../../../tempo-app/convex/_generated/dataModel";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";
import { format } from "date-fns";

type PlanBlock = { type: string; title?: string; items?: string[]; tasks?: string[]; task?: string; startTime?: string; duration?: number; prompt?: string };

export default function PlanScreen() {
  const todayDate = new Date().toISOString().split("T")[0];
  const plans = useQuery(api.dailyPlans.list, { date: todayDate });
  const stagedPlans = useQuery(api.staging.listPending, { type: "dailyPlan" });
  const generatePlan = useAction(api.ai.generatePlan);
  const createStaged = useMutation(api.staging.create);
  const acceptStaged = useMutation(api.staging.accept);
  const rejectStaged = useMutation(api.staging.reject);
  const createPlan = useMutation(api.dailyPlans.create);
  const router = useRouter();

  const [generating, setGenerating] = useState(false);

  const existingPlan = plans && plans.length > 0 ? plans[0] : null;
  const pendingStagedPlan = stagedPlans && stagedPlans.length > 0 ? stagedPlans[0] : null;
  const hasPlan = !!existingPlan;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generatePlan({ date: todayDate });
      await createStaged({
        type: "dailyPlan",
        data: { blocks: res.blocks, date: todayDate },
        reasoning: res.reasoning,
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleAcceptPlan = async (suggestionId: Id<"stagedSuggestions">, blocks: PlanBlock[]) => {
    await createPlan({ date: todayDate, blocks, aiGenerated: true });
    await acceptStaged({ id: suggestionId });
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
        {!hasPlan && !pendingStagedPlan && (
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

        {pendingStagedPlan && !hasPlan && (
          <View>
            <View style={{ backgroundColor: "rgba(108,99,255,0.1)", borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "rgba(108,99,255,0.3)" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Ionicons name="sparkles" size={14} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "700" }}>AI Suggestion</Text>
              </View>
              <Text style={{ color: colors.foreground, fontSize: 13, lineHeight: 20 }}>{pendingStagedPlan.reasoning}</Text>
            </View>

            {((pendingStagedPlan.data as { blocks: PlanBlock[] }).blocks || []).map((block: PlanBlock, i: number) => (
              <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "700", marginBottom: 6 }}>{block.title || block.type}</Text>
                {block.items && block.items.map((item, idx) => (
                  <Text key={idx} style={{ color: colors.muted, fontSize: 12, marginBottom: 2 }}>{item}</Text>
                ))}
                {block.tasks && block.tasks.map((task, idx) => (
                  <Text key={idx} style={{ color: colors.muted, fontSize: 12, marginBottom: 2 }}>{task}</Text>
                ))}
                {block.task && <Text style={{ color: colors.muted, fontSize: 12 }}>{block.task}</Text>}
                {block.startTime && <Text style={{ color: colors.primary, fontSize: 11, marginTop: 4 }}>{block.startTime} - {block.duration}min</Text>}
                {block.prompt && <Text style={{ color: colors.muted, fontSize: 12, fontStyle: "italic" }}>{block.prompt}</Text>}
              </View>
            ))}

            <View style={{ flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 16 }}>
              <Pressable onPress={() => rejectStaged({ id: pendingStagedPlan._id })} style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,107,107,0.15)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,107,107,0.3)" }}>
                <Ionicons name="close" size={24} color={colors.danger} />
              </Pressable>
              <Pressable onPress={() => handleAcceptPlan(pendingStagedPlan._id, (pendingStagedPlan.data as { blocks: PlanBlock[] }).blocks)} style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(0,201,167,0.15)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(0,201,167,0.3)" }}>
                <Ionicons name="checkmark" size={24} color={colors.teal} />
              </Pressable>
            </View>
          </View>
        )}

        {existingPlan && (
          <View>
            <View style={{ backgroundColor: "rgba(0,201,167,0.1)", borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: "rgba(0,201,167,0.3)", alignItems: "center" }}>
              <Text style={{ color: colors.teal, fontSize: 13, fontWeight: "600" }}>Plan accepted</Text>
            </View>
            {(existingPlan.blocks as PlanBlock[]).map((block: PlanBlock, i: number) => (
              <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "700", marginBottom: 6 }}>{block.title || "Block"}</Text>
                {block.items && block.items.map((item, idx) => <Text key={idx} style={{ color: colors.foreground, fontSize: 13 }}>{item}</Text>)}
                {block.tasks && block.tasks.map((task, idx) => <Text key={idx} style={{ color: colors.foreground, fontSize: 13 }}>{task}</Text>)}
                {block.task && <Text style={{ color: colors.foreground, fontSize: 13 }}>{block.task}</Text>}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
