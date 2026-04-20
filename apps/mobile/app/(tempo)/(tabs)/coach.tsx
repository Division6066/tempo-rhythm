/**
 * @screen: coach
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-a.jsx
 * @queries: messages.listByConversation @index by_conversationId_createdAt
 * @mutations: messages.appendUser
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
import { mockCoachMessages, mockCoachScopeSummary } from "@tempo/mock-data";
import { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  const [draft, setDraft] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 gap-2 p-4">
        <Text className="text-xl font-semibold text-foreground">Coach</Text>
        <Text className="text-xs text-muted-foreground">{mockCoachScopeSummary}</Text>
        <FlatList
          className="flex-1"
          data={mockCoachMessages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <View
              className={`mb-2 max-w-[90%] rounded-xl border border-border p-3 ${
                item.role === "user" ? "self-end bg-surface-inverse" : "self-start bg-card"
              }`}
            >
              <Text className={item.role === "user" ? "text-cream" : "text-foreground"}>{item.body}</Text>
            </View>
          )}
        />
        <TextInput
          accessibilityLabel="Message to coach"
          value={draft}
          onChangeText={setDraft}
          placeholder="Reply…"
          className="rounded-lg border border-border bg-card p-3 text-base text-foreground"
        />
        {/*
          @action sendCoachMessageMobile
          @mutation: messages.appendUser
          @auth: required
          @env: NEXT_PUBLIC_CONVEX_URL
        */}
        <Pressable
          accessible
          accessibilityRole="button"
          accessibilityLabel="Send message"
          hitSlop={8}
          onPress={() => setDraft("")}
          className="rounded-lg bg-primary py-3"
        >
          <Text className="text-center text-sm font-medium text-primary-foreground">Send</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
