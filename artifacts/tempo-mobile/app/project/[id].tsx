import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../tempo-app/convex/_generated/api";
import type { Id } from "../../../../tempo-app/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../lib/theme";
import { hapticSuccess, hapticLight } from "../../lib/haptics";

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const projectId = id as Id<"projects">;

  const project = useQuery(api.projects.get, { id: projectId });
  const allTasks = useQuery(api.tasks.list, {});
  const notes = useQuery(api.notes.getNotesByProject, { projectId });
  const completeTask = useMutation(api.tasks.complete);
  const updateTask = useMutation(api.tasks.update);

  const projectTasks = (allTasks || []).filter((t) => t.projectId === projectId);
  const activeTasks = projectTasks.filter((t) => t.status !== "done" && t.status !== "cancelled");
  const completedTasks = projectTasks.filter((t) => t.status === "done");
  const totalTasks = projectTasks.length;
  const completedCount = completedTasks.length;
  const progress = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  const handleToggleTask = async (taskId: Id<"tasks">, currentStatus: string) => {
    hapticLight();
    if (currentStatus === "done") {
      await updateTask({ id: taskId, status: "today" });
    } else {
      hapticSuccess();
      await completeTask({ id: taskId });
    }
  };

  if (!project) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.muted }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginLeft: 12, flex: 1 }}>
          <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: project.color || colors.primary }} />
          <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800" }}>{project.name}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700" }}>Progress</Text>
            <Text style={{ color: colors.muted, fontSize: 13, fontWeight: "600" }}>{completedCount}/{totalTasks} tasks</Text>
          </View>
          <View style={{ height: 8, backgroundColor: colors.surfaceLight, borderRadius: 4, overflow: "hidden" }}>
            <View style={{ height: "100%", backgroundColor: project.color || colors.primary, borderRadius: 4, width: `${progress}%` }} />
          </View>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8 }}>
            {progress === 100 && totalTasks > 0 ? "All tasks complete!" : `${Math.round(progress)}% complete`}
          </Text>
        </View>

        {project.description && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Description</Text>
            <Text style={{ color: colors.foreground, fontSize: 14, lineHeight: 22 }}>{project.description}</Text>
          </View>
        )}

        {activeTasks.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700", marginBottom: 12 }}>Active Tasks</Text>
            {activeTasks.map((task) => {
              const priorityColor = task.priority === "high" ? colors.teal : task.priority === "medium" ? colors.amber : colors.muted;
              return (
                <Pressable
                  key={task._id}
                  onPress={() => router.push(`/task/${task._id}` as never)}
                  style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.border }}
                >
                  <Pressable onPress={() => handleToggleTask(task._id, task.status)} hitSlop={12}>
                    <Ionicons name="ellipse-outline" size={22} color={colors.muted} />
                  </Pressable>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>{task.title}</Text>
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                      <View style={{ backgroundColor: `${priorityColor}33`, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                        <Text style={{ color: priorityColor, fontSize: 10, fontWeight: "600" }}>{task.priority}</Text>
                      </View>
                      {task.estimatedMinutes && <Text style={{ color: colors.muted, fontSize: 10 }}>{task.estimatedMinutes}m</Text>}
                      <View style={{ backgroundColor: `${colors.primary}22`, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                        <Text style={{ color: colors.primary, fontSize: 10, fontWeight: "600" }}>{task.status}</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                </Pressable>
              );
            })}
          </View>
        )}

        {completedTasks.length > 0 && (
          <View style={{ marginBottom: 20, opacity: 0.7 }}>
            <Text style={{ color: colors.muted, fontSize: 14, fontWeight: "700", marginBottom: 12 }}>Completed ({completedTasks.length})</Text>
            {completedTasks.slice(0, 5).map((task) => (
              <Pressable
                key={task._id}
                onPress={() => router.push(`/task/${task._id}` as never)}
                style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 6, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.border }}
              >
                <Pressable onPress={() => handleToggleTask(task._id, task.status)} hitSlop={12}>
                  <Ionicons name="checkmark-circle" size={22} color={colors.teal} />
                </Pressable>
                <Text style={{ color: colors.muted, fontSize: 13, fontWeight: "600", textDecorationLine: "line-through", flex: 1 }}>{task.title}</Text>
              </Pressable>
            ))}
            {completedTasks.length > 5 && (
              <Text style={{ color: colors.muted, fontSize: 12, textAlign: "center", marginTop: 4 }}>
                +{completedTasks.length - 5} more completed
              </Text>
            )}
          </View>
        )}

        {notes && notes.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700", marginBottom: 12 }}>Notes</Text>
            {notes.map((note) => (
              <Pressable
                key={note._id}
                onPress={() => router.push(`/note/${note._id}` as never)}
                style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: colors.border }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Ionicons name="document-text-outline" size={16} color={colors.primary} />
                  <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>{note.title}</Text>
                  {note.isPinned && <Ionicons name="pin" size={12} color={colors.amber} />}
                </View>
                {note.content && (
                  <Text numberOfLines={2} style={{ color: colors.muted, fontSize: 12, marginLeft: 24 }}>
                    {note.content.slice(0, 120)}
                  </Text>
                )}
              </Pressable>
            ))}
          </View>
        )}

        {totalTasks === 0 && (!notes || notes.length === 0) && (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Ionicons name="folder-open-outline" size={48} color={colors.muted} style={{ marginBottom: 12, opacity: 0.5 }} />
            <Text style={{ color: colors.muted, fontSize: 14, textAlign: "center" }}>
              No tasks or notes in this project yet.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
