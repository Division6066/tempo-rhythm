/**
 * @screen: capture
 * @tier: A
 * @platform: mobile
 * @prd: PRD §4 Screen 11 (Brain Dump), PRD §9 (Voice), PRD §11 (RAG)
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-a.jsx (MobileBrainDump section)
 * @summary: Modal capture composer with triage and voice handoff.
 */
import { mockCaptureScreen, mockTodayScreen } from "@tempo/mock-data";
import { router } from "expo-router";
import { Mic, Sparkles, X } from "lucide-react-native";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-6 pt-4 pb-3 border-b border-border/70">
        <Text className="text-xs text-muted-foreground uppercase tracking-[2px]">Capture</Text>
        {/* @behavior: Close modal and return to previous context.
            @navigate: router.back()
            @convex-query-needed: uiState.currentDraftCapture
            @prd: PRD §4 Screen 11
            @source: mobile-screens-a.jsx#MobileBrainDump */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close capture"
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full border border-border bg-card"
        >
          <X size={16} className="text-muted-foreground" />
        </Pressable>
      </View>

      <View className="flex-1 p-6 gap-4">
        <Text className="text-2xl font-semibold text-foreground">Tell me everything.</Text>
        <Text className="text-sm text-muted-foreground">{mockTodayScreen.greeting}</Text>

        <View className="flex-row gap-2">
          {mockCaptureScreen.modes.map((mode) => (
            <Text
              key={mode}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
            >
              {mode}
            </Text>
          ))}
        </View>

        {/* @behavior: Draft text locally and keep it unsaved until triage is pressed.
            @convex-mutation-needed: captures.upsertDraft
            @convex-query-needed: captures.getDraft
            @schema-delta: captures.mode
            @prd: PRD §4 Screen 11
            @source: mobile-screens-a.jsx#MobileBrainDump */}
        <TextInput
          multiline={true}
          numberOfLines={10}
          textAlignVertical="top"
          placeholder={mockCaptureScreen.placeholder}
          placeholderTextColor="#8a7f72"
          className="min-h-[220px] rounded-2xl border border-border bg-card px-4 py-4 text-base text-foreground"
        />

        <Text className="text-xs text-muted-foreground">{mockCaptureScreen.voiceHint}</Text>

        <View className="mt-auto flex-row items-center gap-3">
          {/* @behavior: Hold to record and release to transcribe text into the draft area.
              @convex-action-needed: voice.transcribePushToTalk
              @provider-needed: openrouter
              @tier-caps: basic 30 min/day, pro 90 min/day, max 180 min/day
              @schema-delta: voiceSessions.durationMs
              @prd: PRD §9.1, PRD §15.1
              @source: mobile-screens-a.jsx#MobileBrainDump */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Record voice capture"
            className="h-12 w-12 items-center justify-center rounded-full border border-border bg-card"
          >
            <Mic size={18} className="text-muted-foreground" />
          </Pressable>

          {/* @behavior: Run AI triage and open the tasks tab with a staged preview list.
              @convex-action-needed: brainDump.processDraft
              @convex-mutation-needed: proposals.createFromBrainDump
              @provider-needed: openrouter
              @navigate: /(tempo)/(tabs)/tasks
              @confirm: user approves extracted tasks before apply
              @prd: PRD §4 Screen 11, PRD §6.2
              @source: mobile-screens-a.jsx#MobileBrainDump */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Triage capture into tasks"
            onPress={() => router.push("/(tempo)/(tabs)/tasks")}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-full bg-accent px-5 py-3"
          >
            <Sparkles size={14} color="#fff" />
            <Text className="text-sm font-semibold text-white">Triage</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
