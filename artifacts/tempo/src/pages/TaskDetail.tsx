import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import {
  useGetTask,
  useUpdateTask,
  useDeleteTask,
  useCreateTask,
  useAiChunkTask,
  getListTasksQueryKey,
  getGetTaskQueryKey,
  useListStagedSuggestions,
  useCreateStagedSuggestion,
  useAcceptStagedSuggestion,
  useRejectStagedSuggestion,
  useUpdateStagedSuggestionData,
  getListStagedSuggestionsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Sparkles, Trash2, Check, X, Pencil } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Subtask = { title: string; priority: string; estimatedMinutes: number; tags: string[] };

export default function TaskDetail() {
  const [, params] = useRoute("/tasks/:id");
  const taskId = parseInt(params?.id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: task, isLoading } = useGetTask(taskId, {
    query: {
      enabled: !!taskId,
      queryKey: getGetTaskQueryKey(taskId),
    },
  });

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const createTask = useCreateTask();
  const chunkTask = useAiChunkTask();
  const createStaged = useCreateStagedSuggestion();
  const { data: stagedSuggestions } = useListStagedSuggestions({ type: "chunkedTask", status: "pending" });
  const acceptStaged = useAcceptStagedSuggestion();
  const rejectStaged = useRejectStagedSuggestion();
  const updateStagedData = useUpdateStagedSuggestionData();

  const [title, setTitle] = useState("");
  const [editingChunkId, setEditingChunkId] = useState<number | null>(null);
  const [editingSubtasks, setEditingSubtasks] = useState<Subtask[]>([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<string>("inbox");
  const [priority, setPriority] = useState<string>("medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNotes(task.notes || "");
      setStatus(task.status);
      setPriority(task.priority);
      setEstimatedMinutes(task.estimatedMinutes?.toString() || "");
    }
  }, [task]);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(taskId) });
    queryClient.invalidateQueries({ queryKey: getListStagedSuggestionsQueryKey() });
  };

  const handleSave = async () => {
    try {
      await updateTask.mutateAsync({
        id: taskId,
        data: {
          title,
          notes,
          status: status as any,
          priority: priority as any,
          estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : null,
        },
      });
      invalidateAll();
    } catch {
      toast({ variant: "destructive", title: "Failed to update task" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync({ id: taskId });
      invalidateAll();
      toast({ title: "Task deleted" });
      setLocation("/");
    } catch {
      toast({ variant: "destructive", title: "Failed to delete task" });
    }
  };

  const handleChunk = async () => {
    try {
      const res = await chunkTask.mutateAsync({
        data: { taskTitle: title, taskNotes: notes },
      });
      if (res.subtasks && res.subtasks.length > 0) {
        await createStaged.mutateAsync({
          data: {
            type: "chunkedTask",
            data: { parentTaskId: taskId, subtasks: res.subtasks, reasoning: res.reasoning },
            reasoning: res.reasoning,
          },
        });
        invalidateAll();
      }
    } catch {
      toast({ variant: "destructive", title: "Failed to chunk task" });
    }
  };

  const handleAcceptChunks = async (suggestionId: number, subtasks: Subtask[]) => {
    for (const s of subtasks) {
      await createTask.mutateAsync({
        data: {
          title: s.title,
          priority: s.priority as any,
          estimatedMinutes: s.estimatedMinutes,
          status: (task?.status as any) || "inbox",
          parentTaskId: taskId,
          aiGenerated: true,
        },
      });
    }
    await acceptStaged.mutateAsync({ id: suggestionId });
    invalidateAll();
    toast({ title: "Subtasks created!" });
  };

  const handleRejectChunks = async (suggestionId: number) => {
    await rejectStaged.mutateAsync({ id: suggestionId });
    invalidateAll();
  };

  const startEditingChunks = (suggestionId: number, subtasks: Subtask[]) => {
    setEditingChunkId(suggestionId);
    setEditingSubtasks(subtasks.map(s => ({ ...s, tags: s.tags ? [...s.tags] : [] })));
  };

  const cancelEditingChunks = () => {
    setEditingChunkId(null);
    setEditingSubtasks([]);
  };

  const updateEditingSubtask = (index: number, field: keyof Subtask, value: unknown) => {
    setEditingSubtasks(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const removeEditingSubtask = (index: number) => {
    setEditingSubtasks(prev => prev.filter((_, i) => i !== index));
  };

  const saveChunkEdits = async (suggestionId: number) => {
    const suggestion = stagedSuggestions?.find(s => s.id === suggestionId);
    if (!suggestion) return;
    const existingData = suggestion.data as Record<string, unknown>;
    await updateStagedData.mutateAsync({
      id: suggestionId,
      data: { data: { ...existingData, subtasks: editingSubtasks } },
    });
    setEditingChunkId(null);
    setEditingSubtasks([]);
    invalidateAll();
  };

  const thisTaskStaged =
    stagedSuggestions?.filter(
      (s) => (s.data as Record<string, unknown>)?.parentTaskId === taskId
    ) || [];

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" />
      </div>
    );
  }

  if (!task) {
    return <div className="p-8 text-center text-muted-foreground">Task not found</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleChunk}
            disabled={chunkTask.isPending}
            className="border-primary/50 text-primary gap-2"
          >
            <Sparkles size={16} />
            {chunkTask.isPending ? "Chunking..." : "Chunk this task"}
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20" onClick={handleDelete}>
            <Trash2 size={20} />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          className="text-2xl font-display font-bold border-none bg-transparent px-0 focus-visible:ring-0"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</label>
            <Select
              value={status}
              onValueChange={(val) => {
                setStatus(val);
                setTimeout(handleSave, 0);
              }}
            >
              <SelectTrigger className="bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inbox">Inbox</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Priority</label>
            <Select
              value={priority}
              onValueChange={(val) => {
                setPriority(val);
                setTimeout(handleSave, 0);
              }}
            >
              <SelectTrigger className="bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1">
            <Clock size={12} /> Estimated Minutes
          </label>
          <Input
            type="number"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(e.target.value)}
            onBlur={handleSave}
            placeholder="e.g. 30"
            className="bg-card border-border w-1/3"
          />
        </div>

        {thisTaskStaged.length > 0 &&
          thisTaskStaged.map((suggestion) => {
            const data = suggestion.data as Record<string, unknown>;
            const subtasks = (data?.subtasks as Subtask[]) || [];
            const reasoning = (data?.reasoning as string) || "";
            const isEditing = editingChunkId === suggestion.id;
            const displaySubtasks = isEditing ? editingSubtasks : subtasks;
            return (
              <div key={suggestion.id} className="bg-primary/5 border border-primary/30 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Sparkles size={14} /> AI Subtasks
                  {isEditing && <span className="text-xs text-amber-400 font-normal ml-1">Editing</span>}
                </h3>
                <p className="text-xs text-muted-foreground">{reasoning}</p>
                <div className="space-y-2">
                  {displaySubtasks.map((s, i) => (
                    <div key={i} className="bg-card/50 p-3 rounded-lg border border-border/50">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={s.title}
                              onChange={(e) => updateEditingSubtask(i, "title", e.target.value)}
                              className="bg-background border-border text-sm h-8"
                              placeholder="Subtask title"
                            />
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeEditingSubtask(i)}>
                              <X size={14} />
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={s.priority}
                              onChange={(e) => updateEditingSubtask(i, "priority", e.target.value)}
                              className="bg-background border border-border rounded-md text-xs px-2 py-1 text-foreground"
                            >
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                            <Input
                              type="number"
                              value={s.estimatedMinutes}
                              onChange={(e) => updateEditingSubtask(i, "estimatedMinutes", parseInt(e.target.value) || 0)}
                              className="bg-background border-border text-xs h-7 w-20"
                              placeholder="min"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{s.title}</p>
                            <span className="text-[10px] text-muted-foreground">
                              {s.estimatedMinutes}m — {s.priority}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-border/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 gap-1"
                    onClick={() => handleRejectChunks(suggestion.id)}
                  >
                    <X size={14} /> Reject
                  </Button>
                  {isEditing ? (
                    <>
                      <Button variant="ghost" size="sm" className="text-muted-foreground gap-1" onClick={cancelEditingChunks}>
                        Cancel
                      </Button>
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1" onClick={() => saveChunkEdits(suggestion.id)} disabled={updateStagedData.isPending}>
                        <Check size={14} /> {updateStagedData.isPending ? "Saving..." : "Save Edits"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" className="text-amber-400 hover:bg-amber-500/10 gap-1" onClick={() => startEditingChunks(suggestion.id, subtasks)}>
                        <Pencil size={14} /> Edit
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[hsl(168,100%,39%)] hover:bg-[hsl(168,100%,45%)] text-white gap-1"
                        onClick={() => handleAcceptChunks(suggestion.id, subtasks)}
                      >
                        <Check size={14} /> Accept & Create
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Notes</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleSave}
            placeholder="Add some details..."
            className="min-h-[200px] bg-card border-border resize-none"
          />
        </div>
      </div>
    </div>
  );
}
