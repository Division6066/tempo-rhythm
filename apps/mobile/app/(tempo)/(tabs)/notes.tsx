/**
 * @screen: notes
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-a.jsx
 * @queries: notes.listByUser @index by_userId_deletedAt
 * @navigate: note detail (Long Run 2 stack)
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
import { mockNotes } from "@tempo/mock-data";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 gap-2 p-4">
        <Text className="text-xl font-semibold text-foreground">Notes</Text>
        <FlatList
          data={mockNotes}
          keyExtractor={(n) => n.id}
          renderItem={({ item }) => (
            <Pressable
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Open note ${item.title}`}
              hitSlop={6}
              className="rounded-lg border border-border bg-card p-3"
            >
              <Text className="font-medium text-foreground">{item.title}</Text>
              <Text className="mt-1 text-xs text-muted-foreground" numberOfLines={2}>
                {item.body}
              </Text>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
