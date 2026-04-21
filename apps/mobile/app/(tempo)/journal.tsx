/**
 * @screen: journal
 * @platform: mobile
 * @tier: A
 * @prd: PRD §4 Screen 6, PRD §4 Screen 7, PRD §14
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
 * @source: docs/design/screen-inventory.md#mobile--12-screens
 * @summary: Journal feed with daily prompt, mood tags, and entry cards.
 */
import { mockJournal } from "@tempo/mock-data";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const moodChips = ["foggy", "okay", "bright"] as const;

export default function JournalScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5 pt-4">
        <Text className="text-3xl font-semibold text-foreground">Journal</Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          34 entries · end-to-end encrypted at rest.
        </Text>

        <View className="mt-4 rounded-2xl border border-border bg-card p-4">
          <Text className="text-xs uppercase tracking-[1px] text-muted-foreground">
            Morning intention
          </Text>
          <Text className="mt-2 text-base text-foreground">
            If today goes well, what did I spend time on?
          </Text>
          {/* @behavior: Opens today's journal entry prefilled with the current prompt.
              @navigate: /(tempo)/journal?entry=today
              @convex-query-needed: journalEntries.getByDate
              @convex-mutation-needed: journalEntries.upsertDraft
              @provider-needed: none
              @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx#MobileJournal */}
          <Pressable
            onPress={() => router.push("/(tempo)/journal?entry=today")}
            className="mt-3 self-start rounded-full border border-border px-4 py-2"
          >
            <Text className="text-xs font-semibold text-foreground">Start writing</Text>
          </Pressable>
        </View>

        <View className="mt-3 flex-row gap-2">
          {moodChips.map((mood) => (
            <Pressable
              key={mood}
              className="rounded-full border border-border px-3 py-1.5"
              onPress={() => undefined}
            >
              {/* @behavior: Filters journal feed by selected mood tag.
                  @convex-query-needed: journalEntries.listByMood
                  @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx#MobileJournal */}
              <Text className="text-xs text-muted-foreground">{mood}</Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-4 gap-3 pb-6">
          {mockJournal.map((entry) => (
            <Pressable
              key={entry.id}
              onPress={() => router.push(`/(tempo)/journal?entryId=${entry.id}`)}
              className="rounded-2xl border border-border bg-card p-4"
            >
              {/* @behavior: Opens a full journal entry detail with prompt context and AI tools.
                  @navigate: /(tempo)/journal?entryId={entry.id}
                  @convex-query-needed: journalEntries.getById
                  @convex-action-needed: coach.respondToJournal
                  @schema-delta: journalEntries.promptType may need explicit enum alignment with UI chips
                  @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx#MobileJournal */}
              <View className="flex-row items-center justify-between">
                <Text className="text-xs uppercase tracking-[1px] text-muted-foreground">
                  {entry.dateLabel}
                </Text>
                <Text className="rounded-full bg-secondary px-2 py-1 text-[10px] text-muted-foreground">
                  mood · {entry.mood}
                </Text>
              </View>
              <Text className="mt-2 text-sm text-foreground">{entry.excerpt}</Text>
              <View className="mt-2 flex-row flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <Text key={tag} className="text-[10px] text-muted-foreground">
                    {tag}
                  </Text>
                ))}
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
