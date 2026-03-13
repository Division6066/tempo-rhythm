import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";

type FilterCondition = { field: string; operator: string; value: string };

export default function FiltersScreen() {
  const savedFilters = useQuery(api.savedFilters.list);
  const allTasks = useQuery(api.tasks.list, {});
  const createFilter = useMutation(api.savedFilters.create);
  const removeFilter = useMutation(api.savedFilters.remove);
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<FilterCondition[]>([]);
  const [filterName, setFilterName] = useState("");

  const applyFilter = (conditions: FilterCondition[]) => {
    setActiveFilter(conditions);
  };

  const filteredTasks = (allTasks || []).filter((task) => {
    if (activeFilter.length === 0) return true;
    return activeFilter.every((condition) => {
      const val = String((task as Record<string, unknown>)[condition.field] ?? "").toLowerCase();
      const condVal = condition.value.toLowerCase();
      if (condition.operator === "equals") return val === condVal;
      if (condition.operator === "contains") return val.includes(condVal);
      return true;
    });
  });

  const handleSave = async () => {
    if (!filterName.trim() || activeFilter.length === 0) return;
    await createFilter({ name: filterName, conditions: activeFilter });
    setFilterName("");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", marginLeft: 12, flex: 1 }}>Filters</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {savedFilters && savedFilters.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Saved Filters</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {(savedFilters as Array<{ _id: Id<"savedFilters">; name: string; conditions: FilterCondition[] }>).map((f) => (
                <Pressable
                  key={f._id}
                  onPress={() => applyFilter(f.conditions)}
                  onLongPress={() => removeFilter({ id: f._id })}
                  style={{ backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.border }}
                >
                  <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>{f.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "700", marginBottom: 10 }}>Quick Filters</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {[
              { label: "High Priority", conditions: [{ field: "priority", operator: "equals", value: "high" }] },
              { label: "Today", conditions: [{ field: "status", operator: "equals", value: "today" }] },
              { label: "Inbox", conditions: [{ field: "status", operator: "equals", value: "inbox" }] },
              { label: "Done", conditions: [{ field: "status", operator: "equals", value: "done" }] },
            ].map((preset) => (
              <Pressable
                key={preset.label}
                onPress={() => setActiveFilter(preset.conditions)}
                style={{ backgroundColor: "rgba(108,99,255,0.12)", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }}
              >
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>{preset.label}</Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setActiveFilter([])}
              style={{ backgroundColor: colors.surfaceLight, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }}
            >
              <Text style={{ color: colors.muted, fontSize: 13, fontWeight: "600" }}>Clear</Text>
            </Pressable>
          </View>
        </View>

        <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
          {activeFilter.length > 0 ? `Filtered Tasks (${filteredTasks.length})` : `All Tasks (${filteredTasks.length})`}
        </Text>

        {filteredTasks.map((task) => (
          <Pressable
            key={task._id}
            onPress={() => router.push(`/task/${task._id}` as never)}
            style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border }}
          >
            <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>{task.title}</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
              <View style={{ backgroundColor: "rgba(108,99,255,0.15)", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ color: colors.primary, fontSize: 10, fontWeight: "600" }}>{task.status}</Text>
              </View>
              <View style={{ backgroundColor: "rgba(255,179,71,0.15)", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ color: colors.amber, fontSize: 10, fontWeight: "600" }}>{task.priority}</Text>
              </View>
            </View>
          </Pressable>
        ))}

        {filteredTasks.length === 0 && (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ color: colors.muted, fontSize: 14 }}>No tasks match this filter.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
