/**
 * @screen: journal
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
 * @queries: journalEntries (Long Run 2)
 * @mutations: journalEntries.upsertDay
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
import { mockJournalEntries, mockJournalPromptTitle, mockJournalTodayDraft } from "@tempo/mock-data";
import { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  const [draft, setDraft] = useState(mockJournalTodayDraft);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 gap-3 p-4">
        <Text className="text-xl font-semibold text-foreground">Journal</Text>
        <Text className="text-xs text-muted-foreground">{mockJournalPromptTitle}</Text>
        <TextInput
          accessibilityLabel="Journal draft"
          multiline
          value={draft}
          onChangeText={setDraft}
          className="min-h-40 rounded-lg border border-border bg-card p-3 text-base text-foreground"
        />
        {/*
          @action saveJournalMobile
          @mutation: journalEntries.upsertDay
          @auth: required
          @env: NEXT_PUBLIC_CONVEX_URL
        */}
        <Pressable
          accessible
          accessibilityRole="button"
          accessibilityLabel="Save journal entry"
          hitSlop={8}
          className="rounded-lg bg-primary py-3"
        >
          <Text className="text-center text-sm font-medium text-primary-foreground">Save</Text>
        </Pressable>
        <Text className="text-sm font-medium text-foreground">Past</Text>
        <FlatList
          data={[...mockJournalEntries]}
          keyExtractor={(e) => e.id}
          renderItem={({ item }) => (
            <View className="mb-2 rounded-lg border border-border p-2">
              <Text className="text-xs text-muted-foreground">{item.date}</Text>
              <Text className="text-sm text-foreground" numberOfLines={2}>
                {item.body}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
