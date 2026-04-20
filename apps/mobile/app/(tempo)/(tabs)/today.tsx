/**
 * @screen: today
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-a.jsx
 * @queries: tasks.listToday @index by_userId_deletedAt (Convex)
 * @mutations: tasks.complete
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
import { mockCoachTodayBubble, mockTodayPage, mockTodayTasks } from "@tempo/mock-data";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  const router = useRouter();
  const [tasks, setTasks] = useState(() => mockTodayTasks.map((t) => ({ ...t, done: t.status === "done" })));
  const done = useMemo(() => tasks.filter((t) => t.done).length, [tasks]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 gap-4 p-4">
        <Text className="font-mono text-xs uppercase text-muted-foreground">{mockTodayPage.dateLabel}</Text>
        <Text className="text-2xl font-semibold text-foreground">{mockTodayPage.greeting}</Text>
        <Text className="text-sm leading-relaxed text-muted-foreground">{mockTodayPage.lede}</Text>
        {/*
          @action openPlanFromToday
          @navigate: /plan (stack)
          @query: planBlocks.listForDay
          @auth: required
          @env: NEXT_PUBLIC_CONVEX_URL
        */}
        <Pressable
          accessible
          accessibilityRole="button"
          accessibilityLabel="Plan with Coach"
          hitSlop={8}
          onPress={() => router.push("/plan")}
          className="self-start rounded-lg bg-primary px-4 py-3"
        >
          <Text className="text-sm font-medium text-primary-foreground">Plan with Coach</Text>
        </Pressable>
        <Text className="text-xs text-muted-foreground">
          {done} of {tasks.length} things
        </Text>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              accessible
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.done }}
              accessibilityLabel={`Toggle ${item.title}`}
              hitSlop={6}
              onPress={() =>
                setTasks((prev) =>
                  prev.map((t) =>
                    t.id === item.id ? { ...t, done: !t.done } : t,
                  ),
                )
              }
              className="border-b border-border py-3"
            >
              <Text className={item.done ? "text-muted-foreground line-through" : "text-foreground"}>
                {item.title}
              </Text>
            </Pressable>
          )}
        />
        <View className="rounded-xl border border-border bg-card p-3">
          <Text className="text-sm text-foreground">{mockCoachTodayBubble}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
