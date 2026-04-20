/**
 * @screen: routines
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
 * @queries: routines (Long Run 2)
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
import { mockRoutines } from "@tempo/mock-data";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 gap-2 p-4">
        <Text className="text-xl font-semibold text-foreground">Routines</Text>
        <FlatList
          data={mockRoutines}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => (
            <Pressable
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Open routine ${item.name}`}
              hitSlop={6}
              className="rounded-lg border border-border bg-card p-3"
            >
              <Text className="font-medium text-foreground">{item.name}</Text>
              <Text className="text-xs text-muted-foreground">{item.description}</Text>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
