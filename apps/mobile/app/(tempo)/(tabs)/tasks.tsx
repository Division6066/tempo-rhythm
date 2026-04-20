/**
 * @screen: tasks
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-a.jsx
 * @queries: tasks.listByUser @index by_userId_deletedAt
 * @mutations: tasks.complete
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
import { mockLibraryTasks } from "@tempo/mock-data";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  const [tasks, setTasks] = useState(() => mockLibraryTasks.map((t) => ({ ...t, done: t.status === "done" })));

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 gap-2 p-4">
        <Text className="text-xl font-semibold text-foreground">Tasks</Text>
        <FlatList
          data={tasks}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => (
            <Pressable
              accessible
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.done }}
              accessibilityLabel={item.title}
              hitSlop={6}
              onPress={() =>
                setTasks((prev) =>
                  prev.map((t) => (t.id === item.id ? { ...t, done: !t.done } : t)),
                )
              }
              className="border-b border-border py-3"
            >
              <Text className={item.done ? "text-muted-foreground line-through" : "text-foreground"}>
                {item.title}
              </Text>
              <Text className="text-xs text-muted-foreground">{item.dueLabel}</Text>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
