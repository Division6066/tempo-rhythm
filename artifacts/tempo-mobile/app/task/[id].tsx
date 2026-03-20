import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../tempo-app/convex/_generated/api";
import type { Id } from "../../../../tempo-app/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../lib/theme";
import { hapticSuccess, hapticWarning, hapticLight } from "../../lib/haptics";

type Subtask = { title: string; priority: string; estimatedMinutes: number; tags: string[] };

const RECURRENCE_OPTIONS = [
  { value: "", label: "None" },
  { value: "daily", label: "Daily" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const taskId = id as Id<"tasks">;

  const task = useQuery(api.tasks.get, { id: taskId });
  const allTasks = useQuery(api.tasks.list, {});
  const updateTask = useMutation(api.tasks.update);
  const completeTask = useMutation(api.tasks.complete);
  const deleteTask = useMutation(api.tasks.remove);
  const createTask = useMutation(api.tasks.create);
  const chunkTask = useAction(api.ai.chunkTask);
  const createStaged = useMutation(api.staging.create);
  const stagedSuggestions = useQuery(api.staging.listPending, { type: "chunkedTask" });
  const acceptStaged = useMutation(api.staging.accept);
  const rejectStaged = useMutation(api.staging.reject);
  const tags = useQuery(api.tags.list);
  const projects = useQuery(api.projects.list);
  const folders = useQuery(api.folders.list);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("inbox");
  const [priority, setPriority] = useState("medium");
  const [scheduledDate, setScheduledDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");
  const [recurrenceRule, setRecurrenceRule] = useState("");
  const [chunking, setChunking] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  const subtasks = allTasks?.filter((t) => t.parentTaskId === taskId) || [];

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNotes(task.notes || "");
      setStatus(task.status);
      setPriority(task.priority);
      setScheduledDate(task.scheduledDate || "");
      setStartTime(task.startTime || "");
      setDuration(task.duration?.toString() || "");
      setRecurrenceRule(task.recurrenceRule || "");
    }
  }, [task]);

  const handleSave = async () => {
    await updateTask({
      id: taskId,
      title,
      notes,
      status,
      priority,
      scheduledDate: scheduledDate || null,
      startTime: startTime || null,
      duration: duration ? parseInt(duration, 10) : null,
      recurrenceRule: recurrenceRule || null,
    });
  };

  const handleComplete = async () => {
    hapticSuccess();
    await completeTask({ id: taskId });
    if (task?.recurrenceRule) {
      Alert.alert("Completed", "Next occurrence has been created.");
    }
    router.back();
  };

  const handleDelete = () => {
    hapticWarning();
    Alert.alert("Delete Task", "Are you sure?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await deleteTask({ id: taskId }); router.back(); } },
    ]);
  };

  const handleChunk = async () => {
    setChunking(true);
    try {
      const res = await chunkTask({ taskTitle: title, taskNotes: notes });
      if (res.subtasks?.length) {
        await createStaged({
          type: "chunkedTask",
          data: { parentTaskId: taskId, subtasks: res.subtasks, reasoning: res.reasoning },
          reasoning: res.reasoning,
        });
      }
    } finally {
      setChunking(false);
    }
  };

  const handleAcceptChunks = async (suggestionId: Id<"stagedSuggestions">, subs: Subtask[]) => {
    hapticSuccess();
    for (const s of subs) {
      await createTask({
        title: s.title,
        priority: s.priority,
        estimatedMinutes: s.estimatedMinutes,
        status: task?.status || "inbox",
        parentTaskId: taskId,
        aiGenerated: true,
      });
    }
    await acceptStaged({ id: suggestionId });
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    hapticLight();
    await createTask({
      title: newSubtaskTitle.trim(),
      priority: task?.priority || "medium",
      status: task?.status || "inbox",
      parentTaskId: taskId,
      aiGenerated: false,
    });
    setNewSubtaskTitle("");
  };

  const handleToggleSubtask = async (subtask: { _id: Id<"tasks">; status: string }) => {
    hapticLight();
    if (subtask.status === "done") {
      await updateTask({ id: subtask._id, status: "today" });
    } else {
      await completeTask({ id: subtask._id });
    }
  };

  const handleToggleTag = async (tagName: string) => {
    hapticLight();
    const currentTags = task?.tags || [];
    const newTags = currentTags.includes(tagName)
      ? currentTags.filter((t) => t !== tagName)
      : [...currentTags, tagName];
    await updateTask({ id: taskId, tags: newTags });
  };

  const handleSetProject = async (projectId: Id<"projects"> | null) => {
    hapticLight();
    await updateTask({ id: taskId, projectId });
    setShowProjectPicker(false);
  };

  const handleSetFolder = async (folderId: Id<"folders"> | null) => {
    hapticLight();
    await updateTask({ id: taskId, folderId });
    setShowFolderPicker(false);
  };

  const thisTaskStaged = stagedSuggestions?.filter(
    (s) => (s.data as { parentTaskId: string }).parentTaskId === taskId
  ) || [];

  if (!task) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.muted }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const statuses = ["inbox", "today", "scheduled", "done", "cancelled"];
  const priorities = ["high", "medium", "low"];
  const priorityColors: Record<string, string> = { high: colors.teal, medium: colors.amber, low: colors.muted };
  const currentProject = projects?.find((p) => p._id === task.projectId);
  const currentFolder = folders?.find((f) => f._id === task.folderId);
  const completedSubtasks = subtasks.filter((s) => s.status === "done").length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={async () => { await handleSave(); router.back(); }} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable onPress={handleChunk} disabled={chunking} style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(108,99,255,0.1)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "rgba(108,99,255,0.3)" }}>
            <Ionicons name="sparkles" size={14} color={colors.primary} />
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" }}>{chunking ? "..." : "Chunk"}</Text>
          </Pressable>
          <Pressable onPress={handleDelete} hitSlop={12}>
            <Ionicons name="trash-outline" size={22} color={colors.danger} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          onBlur={handleSave}
          style={{ color: colors.foreground, fontSize: 24, fontWeight: "800", marginBottom: 20 }}
          placeholder="Task title"
          placeholderTextColor={colors.muted}
        />

        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Status</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {statuses.map((s) => (
              <Pressable key={s} onPress={() => { setStatus(s); setTimeout(() => updateTask({ id: taskId, status: s }), 0); }} style={{ backgroundColor: status === s ? colors.primary : colors.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: status === s ? colors.primary : colors.border }}>
                <Text style={{ color: status === s ? "#fff" : colors.foreground, fontSize: 13, fontWeight: "600", textTransform: "capitalize" }}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Priority</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {priorities.map((p) => (
              <Pressable key={p} onPress={() => { setPriority(p); setTimeout(() => updateTask({ id: taskId, priority: p }), 0); }} style={{ backgroundColor: priority === p ? `${priorityColors[p]}33` : colors.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: priority === p ? priorityColors[p] : colors.border, flex: 1, alignItems: "center" }}>
                <Text style={{ color: priority === p ? priorityColors[p] : colors.foreground, fontSize: 13, fontWeight: "600", textTransform: "capitalize" }}>{p}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Project</Text>
          <Pressable
            onPress={() => setShowProjectPicker(true)}
            style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: colors.border }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {currentProject && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: currentProject.color || colors.primary }} />}
              <Text style={{ color: currentProject ? colors.foreground : colors.muted, fontSize: 14, fontWeight: "600" }}>
                {currentProject?.name || "No project"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Folder</Text>
          <Pressable
            onPress={() => setShowFolderPicker(true)}
            style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: colors.border }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name={currentFolder ? "folder" : "folder-outline"} size={16} color={currentFolder ? colors.teal : colors.muted} />
              <Text style={{ color: currentFolder ? colors.foreground : colors.muted, fontSize: 14, fontWeight: "600" }}>
                {currentFolder?.name || "No folder"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </View>

        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>Tags</Text>
            <Pressable onPress={() => setShowTagPicker(!showTagPicker)} hitSlop={8}>
              <Ionicons name={showTagPicker ? "chevron-up" : "add-circle-outline"} size={20} color={colors.primary} />
            </Pressable>
          </View>
          {task.tags.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: showTagPicker ? 10 : 0 }}>
              {task.tags.map((tag) => (
                <View key={tag} style={{ backgroundColor: `${colors.primary}22`, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>{tag}</Text>
                  <Pressable onPress={() => handleToggleTag(tag)} hitSlop={8}>
                    <Ionicons name="close-circle" size={14} color={colors.primary} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          {showTagPicker && tags && tags.length > 0 && (
            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {tags.filter((t) => !task.tags.includes(t.name)).map((tag) => (
                  <Pressable key={tag._id} onPress={() => handleToggleTag(tag.name)} style={{ backgroundColor: `${tag.color || colors.primary}22`, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: `${tag.color || colors.primary}44` }}>
                    <Text style={{ color: tag.color || colors.primary, fontSize: 12, fontWeight: "600" }}>{tag.name}</Text>
                  </Pressable>
                ))}
              </View>
              {tags.filter((t) => !task.tags.includes(t.name)).length === 0 && (
                <Text style={{ color: colors.muted, fontSize: 12, textAlign: "center" }}>All tags assigned</Text>
              )}
            </View>
          )}
        </View>

        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>
              Subtasks {subtasks.length > 0 && `(${completedSubtasks}/${subtasks.length})`}
            </Text>
          </View>
          {subtasks.length > 0 && (
            <View style={{ marginBottom: 10 }}>
              {subtasks.map((sub) => (
                <Pressable
                  key={sub._id}
                  onPress={() => router.push(`/task/${sub._id}` as never)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.surface, borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: colors.border }}
                >
                  <Pressable onPress={() => handleToggleSubtask(sub)} hitSlop={10}>
                    <Ionicons name={sub.status === "done" ? "checkmark-circle" : "ellipse-outline"} size={20} color={sub.status === "done" ? colors.teal : colors.muted} />
                  </Pressable>
                  <Text style={{ color: sub.status === "done" ? colors.muted : colors.foreground, fontSize: 13, fontWeight: "600", flex: 1, textDecorationLine: sub.status === "done" ? "line-through" : "none" }}>
                    {sub.title}
                  </Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.muted} />
                </Pressable>
              ))}
            </View>
          )}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              value={newSubtaskTitle}
              onChangeText={setNewSubtaskTitle}
              placeholder="Add subtask..."
              placeholderTextColor={colors.muted}
              onSubmitEditing={handleAddSubtask}
              returnKeyType="done"
              style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 10, padding: 12, color: colors.foreground, fontSize: 13, borderWidth: 1, borderColor: colors.border }}
            />
            <Pressable
              onPress={handleAddSubtask}
              disabled={!newSubtaskTitle.trim()}
              style={{ backgroundColor: newSubtaskTitle.trim() ? colors.primary : colors.surfaceLight, borderRadius: 10, width: 44, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="add" size={20} color={newSubtaskTitle.trim() ? "#fff" : colors.muted} />
            </Pressable>
          </View>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Schedule</Text>
          <TextInput
            value={scheduledDate}
            onChangeText={setScheduledDate}
            onBlur={handleSave}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.muted}
            style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12, color: colors.foreground, borderWidth: 1, borderColor: colors.border, marginBottom: 8 }}
          />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.muted, fontSize: 10, marginBottom: 4 }}>Start Time</Text>
              <TextInput
                value={startTime}
                onChangeText={setStartTime}
                onBlur={handleSave}
                placeholder="HH:MM"
                placeholderTextColor={colors.muted}
                style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12, color: colors.foreground, borderWidth: 1, borderColor: colors.border }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.muted, fontSize: 10, marginBottom: 4 }}>Duration (min)</Text>
              <TextInput
                value={duration}
                onChangeText={setDuration}
                onBlur={handleSave}
                placeholder="60"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12, color: colors.foreground, borderWidth: 1, borderColor: colors.border }}
              />
            </View>
          </View>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Recurrence</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {RECURRENCE_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => { setRecurrenceRule(opt.value); setTimeout(handleSave, 0); }}
                style={{
                  backgroundColor: recurrenceRule === opt.value ? colors.primary : colors.surface,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderWidth: 1,
                  borderColor: recurrenceRule === opt.value ? colors.primary : colors.border,
                }}
              >
                <Text style={{ color: recurrenceRule === opt.value ? "#fff" : colors.foreground, fontSize: 12, fontWeight: "600" }}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {task.status !== "done" && (
          <Pressable
            onPress={handleComplete}
            style={{ backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 20 }}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              {task.recurrenceRule ? "Complete & Create Next" : "Mark Complete"}
            </Text>
          </Pressable>
        )}

        {thisTaskStaged.length > 0 && thisTaskStaged.map((suggestion) => {
          const data = suggestion.data as { subtasks: Subtask[]; reasoning: string };
          return (
            <View key={suggestion._id} style={{ backgroundColor: "rgba(108,99,255,0.08)", borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: "rgba(108,99,255,0.3)" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Ionicons name="sparkles" size={14} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "700" }}>AI Subtasks</Text>
              </View>
              <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 10 }}>{data.reasoning}</Text>
              {data.subtasks.map((s, i) => (
                <View key={i} style={{ backgroundColor: colors.surface, borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>{s.title}</Text>
                  <Text style={{ color: colors.muted, fontSize: 10, marginTop: 2 }}>{s.estimatedMinutes}m - {s.priority}</Text>
                </View>
              ))}
              <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Pressable onPress={() => rejectStaged({ id: suggestion._id })} style={{ flexDirection: "row", alignItems: "center", gap: 4, padding: 10 }}>
                  <Ionicons name="close" size={16} color={colors.danger} />
                  <Text style={{ color: colors.danger, fontWeight: "600", fontSize: 13 }}>Reject</Text>
                </Pressable>
                <Pressable onPress={() => handleAcceptChunks(suggestion._id, data.subtasks)} style={{ backgroundColor: colors.teal, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Accept</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        <View>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            onBlur={handleSave}
            placeholder="Add some details..."
            placeholderTextColor={colors.muted}
            multiline
            textAlignVertical="top"
            style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 16, color: colors.foreground, fontSize: 14, lineHeight: 22, minHeight: 200, borderWidth: 1, borderColor: colors.border }}
          />
        </View>
      </ScrollView>

      <Modal visible={showProjectPicker} transparent animationType="fade">
        <Pressable onPress={() => setShowProjectPicker(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20, maxHeight: 400, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800", marginBottom: 16 }}>Assign Project</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Pressable
                onPress={() => handleSetProject(null)}
                style={{ padding: 14, borderRadius: 10, marginBottom: 6, backgroundColor: !task.projectId ? `${colors.primary}22` : "transparent", flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <Ionicons name="remove-circle-outline" size={18} color={colors.muted} />
                <Text style={{ color: !task.projectId ? colors.primary : colors.foreground, fontSize: 15, fontWeight: "600" }}>No project</Text>
              </Pressable>
              {(projects || []).filter((p) => p.status === "active").map((project) => (
                <Pressable
                  key={project._id}
                  onPress={() => handleSetProject(project._id)}
                  style={{ padding: 14, borderRadius: 10, marginBottom: 6, backgroundColor: task.projectId === project._id ? `${colors.primary}22` : "transparent", flexDirection: "row", alignItems: "center", gap: 10 }}
                >
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: project.color || colors.primary }} />
                  <Text style={{ color: task.projectId === project._id ? colors.primary : colors.foreground, fontSize: 15, fontWeight: "600" }}>{project.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showFolderPicker} transparent animationType="fade">
        <Pressable onPress={() => setShowFolderPicker(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20, maxHeight: 400, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800", marginBottom: 16 }}>Assign Folder</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Pressable
                onPress={() => handleSetFolder(null)}
                style={{ padding: 14, borderRadius: 10, marginBottom: 6, backgroundColor: !task.folderId ? `${colors.teal}22` : "transparent", flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <Ionicons name="folder-open-outline" size={18} color={colors.muted} />
                <Text style={{ color: !task.folderId ? colors.teal : colors.foreground, fontSize: 15, fontWeight: "600" }}>No folder</Text>
              </Pressable>
              {(folders || []).map((folder) => (
                <Pressable
                  key={folder._id}
                  onPress={() => handleSetFolder(folder._id)}
                  style={{ padding: 14, borderRadius: 10, marginBottom: 6, backgroundColor: task.folderId === folder._id ? `${colors.teal}22` : "transparent", flexDirection: "row", alignItems: "center", gap: 10 }}
                >
                  <Ionicons name="folder" size={18} color={task.folderId === folder._id ? colors.teal : colors.muted} />
                  <Text style={{ color: task.folderId === folder._id ? colors.teal : colors.foreground, fontSize: 15, fontWeight: "600" }}>{folder.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
