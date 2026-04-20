/**
 * @screen: tasks
 * @tier: A
 * @platform: mobile
 * @owner: cursor-cloud-2
 * @prd: PRD §4 Screen 2 (Tasks), PRD §12 (Tagging Engine)
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-a.jsx
 * @summary: Filterable task list with quick complete and add task CTA.
 */
import { mockTasks } from "@tempo/mock-data";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FilterKey = "all" | "todo" | "in_progress" | "done";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Done" },
];

export default function TasksTabScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const visibleTasks = useMemo(() => {
    if (activeFilter === "all") {
      return mockTasks;
    }
    return mockTasks.filter((task) => task.status === activeFilter);
  }, [activeFilter]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="p-6 pb-10 gap-4">
        <View className="gap-1">
          <Text className="text-2xl font-semibold text-foreground">Tasks</Text>
          <Text className="text-sm text-muted-foreground">
            Filterable list from shared fixtures.
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const selected = filter.key === activeFilter;
            return (
              <Pressable
                key={filter.key}
                className={`rounded-full border px-3 py-2 ${
                  selected ? "border-foreground bg-foreground" : "border-border bg-card"
                }`}
                accessibilityRole="button"
                accessibilityLabel={`Filter tasks by ${filter.label}`}
              >
                {/* @behavior: Switch visible task group to the selected status filter. */}
                {/* @convex-query-needed: tasks.listByStatus */}
                {/* @navigate: stay:/tasks */}
                {/* @source: mobile-screens-a.jsx:tasks filter chips */}
                {/* @prd: §4 Screen 2 */}
                <Text
                  className={`text-xs font-medium ${
                    selected ? "text-background" : "text-foreground"
                  }`}
                  onPress={() => setActiveFilter(filter.key)}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="gap-3">
          {visibleTasks.map((task) => (
            <View key={task.id} className="rounded-2xl border border-border bg-card p-4 gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-medium text-foreground flex-1 mr-3">
                  {task.title}
                </Text>
                <Pressable
                  className="rounded-full border border-border px-3 py-1"
                  accessibilityRole="button"
                  accessibilityLabel={`Toggle completion for ${task.title}`}
                >
                  {/* @behavior: Toggle task done state with optimistic checkmark update. */}
                  {/* @convex-mutation-needed: tasks.toggleStatus */}
                  {/* @source: mobile-screens-a.jsx:task row quick-check */}
                  {/* @prd: §4 Screen 2 */}
                  <Text className="text-xs text-muted-foreground">
                    {task.status === "done" ? "Done" : "Check"}
                  </Text>
                </Pressable>
              </View>
              <Text className="text-xs text-muted-foreground">
                {task.project} · {task.estimateMinutes}m · {task.dueDateLabel}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          className="rounded-full bg-foreground px-4 py-3 self-center"
          accessibilityRole="button"
          accessibilityLabel="Create a new task"
        >
          {/* @behavior: Open task composer as a focused create flow. */}
          {/* @navigate: /(tempo)/capture?mode=task */}
          {/* @convex-mutation-needed: tasks.create */}
          {/* @source: mobile-screens-a.jsx:tasks fab */}
          {/* @prd: §4 Screen 2 */}
          <Text className="text-sm font-semibold text-background">+ New task</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
