/**
 * @screen: plan
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/screens-1.jsx
 * @queries: planBlocks (Long Run 2)
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
import { mockPlanBlocks, mockPlanSummary } from "@tempo/mock-data";
import { useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlanScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 gap-3 p-4">
        {/*
          @action closePlan
          @navigate: back to tabs
        */}
        <Pressable
          accessible
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => router.back()}
        >
          <Text className="text-sm text-primary">← Back</Text>
        </Pressable>
        <Text className="text-xl font-semibold text-foreground">Planning</Text>
        <Text className="text-xs text-muted-foreground">{mockPlanSummary}</Text>
        <FlatList
          data={[...mockPlanBlocks]}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => (
            <View className="mb-2 rounded-lg border border-border bg-card p-3">
              <Text className="font-medium text-foreground">{item.title}</Text>
              <Text className="text-xs text-muted-foreground">
                {item.startLabel}–{item.endLabel}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
