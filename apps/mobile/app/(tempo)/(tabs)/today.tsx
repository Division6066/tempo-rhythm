/**
 * @screen: today
 * @tier: A
 * @platform: mobile
 * @prd: §4 Screen 1 (Today), §6 AI Integration, §8 Coach Personality Dial
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-a.jsx
 * @summary: Mock-data daily command center for backend wiring handoff.
 */
import { mockTasks, mockTodayScreen } from "@tempo/mock-data";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  const router = useRouter();
  const topTasks = mockTasks.slice(0, 3);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5 py-4">
        <Text className="text-2xl font-semibold text-foreground">Today</Text>
        <Text className="mt-1 text-sm text-muted-foreground">{mockTodayScreen.title}</Text>

        <View className="mt-4 rounded-2xl border border-border bg-card p-4">
          <Text className="text-sm text-foreground">{mockTodayScreen.greeting}</Text>
          <View className="mt-3 flex-row gap-2">
            {/* @tier: A
                @behavior: Opens capture modal from the Today coach card.
                @navigate: /(tempo)/capture
                @convex-query-needed: plans.getTodayPlan
                @prd: §4 Screen 1, §13
                @source: docs/design/claude-export/design-system/mobile/mobile-screens-a.jsx */}
            <Pressable
              className="rounded-full border border-border bg-background px-3 py-2"
              onPress={() => router.push("/(tempo)/capture")}
            >
              <Text className="text-xs text-foreground">Capture now</Text>
            </Pressable>
            {/* @tier: A
                @behavior: Navigates to Coach tab with plan review context.
                @navigate: /(tempo)/(tabs)/coach
                @convex-query-needed: coach.latestSuggestion
                @prd: §4 Screen 12, §8
                @source: docs/design/claude-export/design-system/mobile/mobile-screens-a.jsx */}
            <Pressable
              className="rounded-full bg-primary px-3 py-2"
              onPress={() => router.push("/(tempo)/(tabs)/coach")}
            >
              <Text className="text-xs text-primary-foreground">Plan with coach</Text>
            </Pressable>
          </View>
        </View>

        <Text className="mt-5 text-xs uppercase tracking-widest text-muted-foreground">
          Top 3 tasks
        </Text>
        <View className="mt-2 rounded-2xl border border-border bg-card">
          {topTasks.map((task, index) => (
            <View
              key={task.id}
              className={`flex-row items-center justify-between px-4 py-3 ${
                index < topTasks.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <View className="flex-1 pr-2">
                <Text className="text-sm text-foreground">{task.title}</Text>
                <Text className="text-xs text-muted-foreground">{task.dueDateLabel}</Text>
              </View>
              {/* @tier: A
                  @behavior: Marks a task complete from Today list row.
                  @convex-mutation-needed: tasks.complete
                  @convex-query-needed: tasks.listToday
                  @prd: §4 Screen 1, §4 Screen 2
                  @source: docs/design/claude-export/design-system/mobile/mobile-screens-a.jsx */}
              <Pressable className="rounded-full border border-border px-3 py-1">
                <Text className="text-xs text-foreground">
                  {task.status === "done" ? "Done" : "Complete"}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        <Text className="mt-5 text-xs uppercase tracking-widest text-muted-foreground">
          Energy check-in
        </Text>
        <View className="mt-2 flex-row gap-2">
          {["low", "medium", "high"].map((energy) => (
            <Pressable key={energy} className="rounded-full border border-border px-4 py-2">
              {/* @tier: A
                  @behavior: Stores today's self-reported energy level for planning.
                  @convex-mutation-needed: plans.setEnergyCheckIn
                  @convex-query-needed: plans.getTodayPlan
                  @schema-delta: plans.energyCheckIn.source
                  @prd: §4 Screen 1, §13
                  @source: docs/design/claude-export/design-system/mobile/mobile-screens-a.jsx */}
              <Text className="text-xs capitalize text-foreground">{energy}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
