/**
 * @screen: habits
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
 * @queries: habits.listByUser @index by_userId_deletedAt
 * @mutations: habits.logCompletion
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
import { mockHabits } from "@tempo/mock-data";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 gap-2 p-4">
        <Text className="text-xl font-semibold text-foreground">Habits</Text>
        <FlatList
          data={mockHabits}
          keyExtractor={(h) => h.id}
          renderItem={({ item }) => (
            <Pressable
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Log habit ${item.name}`}
              hitSlop={6}
              className="flex-row items-center justify-between border-b border-border py-3"
            >
              <Text className="text-foreground">{item.name}</Text>
              <Text className="text-xs text-muted-foreground">{item.streak}d</Text>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
