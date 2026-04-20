/**
 * @screen: templates
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
 * @queries: templates.listStarters (Long Run 2)
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
import { mockTemplateStarters } from "@tempo/mock-data";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 gap-2 p-4">
        <Text className="text-xl font-semibold text-foreground">Templates</Text>
        <FlatList
          data={[...mockTemplateStarters]}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => (
            <Pressable
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Run template ${item.name}`}
              hitSlop={6}
              className="mb-2 rounded-lg border border-border bg-card p-3"
            >
              <Text className="text-lg">{item.emoji}</Text>
              <Text className="font-medium text-foreground">{item.name}</Text>
              <Text className="text-xs text-muted-foreground">{item.kicker}</Text>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
