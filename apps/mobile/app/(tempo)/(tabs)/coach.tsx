/**
 * @screen: coach
 * @tier: A
 * @platform: mobile
 * @owner: cursor-cloud-2
 * @prd: PRD §4 Screen 12, PRD §6, PRD §8, PRD §9, PRD §11, PRD §12
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-a.jsx (MobileCoach)
 * @summary: Persistent coach thread with text + walkie-talkie composer and extraction card.
 */
import {
  mockCoachScreen,
  mockCoachThread,
  mockTodayScreen,
  mockUser,
} from "@tempo/mock-data";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  const router = useRouter();
  const voiceCapByTier = {
    basic: 30,
    pro: 90,
    max: 180,
  } as const;
  const voiceCap = voiceCapByTier[mockUser.tier];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 pt-4">
        <View className="mb-3 flex-row items-center gap-3">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-orange-500">
            <Text className="text-sm font-semibold text-white">T</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">
              Tempo Coach
            </Text>
            <Text className="text-xs text-muted-foreground">
              Warmth {mockUser.coachDial}/10 · {mockUser.tier.toUpperCase()}
            </Text>
          </View>
          {/* @behavior: Open voice settings with minute usage context and daily cap explanations. */}
          {/* @navigate: /(tempo)/settings */}
          {/* @convex-query-needed: profiles.getVoiceUsageToday */}
          {/* @tier-caps: basic 30 min/day, pro 90 min/day, max 180 min/day */}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(tempo)/settings")}
          >
            <Text className="rounded-full border border-border px-2 py-1 text-[10px] text-muted-foreground">
              {mockUser.voiceMinutesUsedToday}/{voiceCap}m
            </Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ gap: 10 }}>
          <Text className="text-center text-[10px] uppercase tracking-[1.5px] text-muted-foreground">
            Today
          </Text>

          {mockCoachThread.map((message) => {
            const isAssistant = message.role === "assistant";
            return (
              <View
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                  isAssistant
                    ? "self-start bg-card border border-border"
                    : "self-end bg-orange-500"
                }`}
              >
                <Text
                  className={`text-sm ${isAssistant ? "text-foreground" : "text-white"}`}
                >
                  {message.content}
                </Text>
                <Text
                  className={`mt-1 text-[10px] ${
                    isAssistant ? "text-muted-foreground" : "text-orange-100"
                  }`}
                >
                  {message.createdAtLabel}
                </Text>
              </View>
            );
          })}

          <View className="rounded-2xl border border-border bg-card px-3 py-3">
            <Text className="text-[10px] uppercase tracking-[1.3px] text-muted-foreground">
              Extract actions
            </Text>
            {[mockTodayScreen.quickActions[0], mockTodayScreen.quickActions[1]].map(
              (action) => (
                <View key={action} className="mt-2 flex-row items-center gap-2">
                  {/* @behavior: Toggle extracted task selection before creating proposal cards in plan/today. */}
                  {/* @convex-mutation-needed: proposals.createBatchFromCoachMessage */}
                  {/* @confirm: required before state mutation */}
                  <Pressable
                    accessibilityRole="checkbox"
                    className="h-4 w-4 rounded-full border border-border"
                  />
                  <Text className="flex-1 text-sm text-foreground">{action}</Text>
                </View>
              ),
            )}
            {/* @behavior: Create accept/edit/reject proposal cards from selected extraction items. */}
            {/* @convex-mutation-needed: proposals.createFromCoachExtraction */}
            {/* @confirm: mandatory accept-reject flow */}
            {/* @navigate: /(tempo)/(tabs)/today */}
            <Pressable className="mt-3 rounded-full bg-orange-500 px-4 py-2">
              <Text className="text-center text-xs font-semibold text-white">
                Add to Today
              </Text>
            </Pressable>
          </View>

          <View className="mb-2 mt-1 flex-row flex-wrap gap-2">
            {mockCoachScreen.suggestedPrompts.map((prompt) => (
              // @behavior: Send one-tap prompt into the coach thread as user input.
              // @convex-action-needed: coach.sendMessage
              <Pressable
                key={prompt}
                className="rounded-full border border-border px-3 py-1.5"
              >
                <Text className="text-xs text-muted-foreground">{prompt}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View className="mb-4 mt-3 flex-row items-center gap-2 border-t border-border pt-3">
          {/* @behavior: Hold-to-talk walkie-talkie button; release triggers transcription and appends draft text only in RAM until user sends. */}
          {/* @convex-action-needed: voice.transcribeWalkieTalkie */}
          {/* @provider-needed: openrouter (STT) */}
          {/* @tier-caps: basic 30 min/day, pro 90 min/day, max 180 min/day */}
          {/* @source: docs/design/claude-export/design-system/mobile/mobile-screens-a.jsx (voice affordance) */}
          <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-orange-500">
            <Text className="text-xs text-white">Mic</Text>
          </Pressable>
          <TextInput
            placeholder="Type or dictate..."
            placeholderTextColor="#9ca3af"
            className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground"
          />
          {/* @behavior: Send text message and stream assistant response back into thread. */}
          {/* @convex-action-needed: coach.sendMessage */}
          {/* @convex-query-needed: coach.getConversationMessages */}
          {/* @provider-needed: openrouter */}
          {/* @streaming: token stream via action */}
          {/* @schema-delta: coachMessages.ragScopeLabel (optional UI debug field for scope chip) */}
          <Pressable className="rounded-full bg-foreground px-4 py-2">
            <Text className="text-xs font-semibold text-background">Send</Text>
          </Pressable>
        </View>

        <Text className="mb-2 text-center text-[10px] text-muted-foreground">
          source · mobile-screens-a.jsx · tier-A mock-only
        </Text>
      </View>
    </SafeAreaView>
  );
}
