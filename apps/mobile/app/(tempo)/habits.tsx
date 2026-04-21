/**
 * @screen: habits
 * @tier: A
 * @platform: mobile
 * @owner: cursor-cloud-2
 * @prd: PRD §14
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
 * @source: docs/design/screen-inventory.md#mobile--12-screens
 * @summary: Habit cards with streaks and completion toggles from shared fixtures.
 */
import { mockHabits } from "@tempo/mock-data";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HabitsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 p-6" contentContainerClassName="gap-3 pb-10">
        <View className="flex-row items-end justify-between">
          <Text className="text-2xl font-semibold text-foreground">Habits</Text>
          <Text className="text-xs font-mono text-muted-foreground">PRD §14</Text>
        </View>

        {/* @behavior: Open create-habit sheet with frequency defaults.
            @convex-mutation-needed: habits.create
            @navigate: /(tempo)/habits/create
            @source: mobile-screens-b.jsx (habits add control) */}
        <Pressable
          className="rounded-2xl border border-border bg-card px-4 py-3"
          accessibilityRole="button"
          onPress={() => router.push("/(tempo)/habits/create")}
        >
          <Text className="text-sm font-medium text-foreground">+ New habit</Text>
        </Pressable>

        {mockHabits.map((habit) => (
          <View key={habit.id} className="rounded-2xl border border-border bg-card p-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-base font-semibold text-foreground">{habit.title}</Text>
                <Text className="mt-1 text-xs text-muted-foreground">
                  {habit.frequencyLabel} · streak {habit.streak}d
                </Text>
              </View>
              <Text className="text-xs font-mono text-muted-foreground">{habit.completionPercent}%</Text>
            </View>

            <View className="mt-3 flex-row gap-2">
              {/* @behavior: Toggle today's completion and recalculate streak ring.
                  @convex-mutation-needed: habits.toggleCompletion
                  @convex-query-needed: habits.list
                  @source: mobile-screens-b.jsx (habit ring rows) */}
              <Pressable
                className="rounded-full border border-border px-3 py-2"
                accessibilityRole="button"
              >
                <Text className="text-xs font-medium text-foreground">
                  {habit.completedToday ? "Completed today" : "Mark done"}
                </Text>
              </Pressable>

              {/* @behavior: Open habit detail view for edit history and schedule.
                  @navigate: /(tempo)/habits/[id]
                  @convex-query-needed: habits.getById
                  @source: mobile-screens-b.jsx */}
              <Pressable
                className="rounded-full border border-border px-3 py-2"
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: "/(tempo)/habits/[id]",
                    params: { id: habit.id },
                  })
                }
              >
                <Text className="text-xs font-medium text-foreground">Details</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
