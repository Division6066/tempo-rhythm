import { useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useListTasks, useCreateTask, useAiExtractTasks, useAiPrioritize, getListTasksQueryKey, getListStagedSuggestionsQueryKey, useDeleteTask, useUpdateTask, useListStagedSuggestions, useCreateStagedSuggestion, useAcceptStagedSuggestion, useRejectStagedSuggestion, useUpdateStagedSuggestionData, Task } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Inbox as InboxIcon, Sparkles, CornerDownLeft, Trash2, Check, X, Pencil, RotateCcw } from "lucide-react";
import TaskCard from "@/components/TaskCard";
import { useToast } from "@/hooks/use-toast";

type ExtractedTask = { title: string; priority: string; estimatedMinutes?: number | null; tags?: string[] };
type ScoreMap = Record<number, { score: number; reason: string }>;

export default function Inbox() {
  const { toast } = useToast();
  const { data: tasks, isLoading } = useListTasks({ status: "inbox" });
  const { data: stagedSuggestions } = useListStagedSuggestions({ type: "extractedTasks", status: "pending" });
  const createTask = useCreateTask();
  const extractTasks = useAiExtractTasks();
  const prioritize = useAiPrioritize();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const createStaged = useCreateStagedSuggestion();
  const acceptStaged = useAcceptStagedSuggestion();
  const rejectStaged = useRejectStagedSuggestion();
  const updateStagedData = useUpdateStagedSuggestionData();
  const queryClient = useQueryClient();

  const [quickTask, setQuickTask] = useState("");
  const [brainDump, setBrainDump] = useState("");
  const [isDumping, setIsDumping] = useState(false);
  const [editingSuggestionId, setEditingSuggestionId] = useState<number | null>(null);
  const [editingTasks, setEditingTasks] = useState<ExtractedTask[]>([]);
  const [aiSortedIds, setAiSortedIds] = useState<number[] | null>(null);
  const [aiScores, setAiScores] = useState<ScoreMap>({});

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListStagedSuggestionsQueryKey() });
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTask.trim()) return;
    await createTask.mutateAsync({ data: { title: quickTask, status: "inbox" } });
    setQuickTask("");
    invalidateAll();
  };

  const handleExtract = async () => {
    if (!brainDump.trim()) return;
    const res = await extractTasks.mutateAsync({ data: { text: brainDump } });
    if (res.tasks) {
      await createStaged.mutateAsync({
        data: {
          type: "extractedTasks",
          data: { tasks: res.tasks, sourceText: brainDump },
          reasoning: `Extracted ${res.tasks.length} task(s) from brain dump.`,
        },
      });
      setBrainDump("");
      setIsDumping(false);
      invalidateAll();
    }
  };

  const handleAcceptExtracted = async (suggestionId: number, extractedTasks: ExtractedTask[]) => {
    for (const t of extractedTasks) {
      await createTask.mutateAsync({
        data: {
          title: t.title,
          priority: t.priority as any,
          estimatedMinutes: t.estimatedMinutes ?? undefined,
          tags: t.tags,
          status: "inbox",
          aiGenerated: true,
        },
      });
    }
    await acceptStaged.mutateAsync({ id: suggestionId });
    invalidateAll();
  };

  const handleRejectExtracted = async (suggestionId: number) => {
    await rejectStaged.mutateAsync({ id: suggestionId });
    invalidateAll();
  };

  const startEditing = (suggestionId: number, tasks: ExtractedTask[]) => {
    setEditingSuggestionId(suggestionId);
    setEditingTasks(tasks.map(t => ({ ...t })));
  };

  const cancelEditing = () => {
    setEditingSuggestionId(null);
    setEditingTasks([]);
  };

  const updateEditingTask = (index: number, field: keyof ExtractedTask, value: string | number | null) => {
    setEditingTasks(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
  };

  const removeEditingTask = (index: number) => {
    setEditingTasks(prev => prev.filter((_, i) => i !== index));
  };

  const saveEdits = async (suggestionId: number) => {
    const suggestion = stagedSuggestions?.find(s => s.id === suggestionId);
    if (!suggestion) return;
    const existingData = suggestion.data as Record<string, unknown>;
    await updateStagedData.mutateAsync({
      id: suggestionId,
      data: { data: { ...existingData, tasks: editingTasks } },
    });
    setEditingSuggestionId(null);
    setEditingTasks([]);
    invalidateAll();
  };

  const moveToToday = async (id: number) => {
    await updateTask.mutateAsync({ id, data: { status: "today" } });
    invalidateAll();
  };

  const removeTask = async (id: number) => {
    await deleteTask.mutateAsync({ id });
    invalidateAll();
  };

  const handleAiPrioritize = useCallback(async () => {
    if (!tasks || tasks.length === 0) return;
    try {
      const res = await prioritize.mutateAsync({
        data: {
          tasks: tasks.map(t => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            estimatedMinutes: t.estimatedMinutes,
          })),
        },
      });
      setAiSortedIds(res.orderedTaskIds);
      const scoreMap: ScoreMap = {};
      if (res.scores) {
        for (const s of res.scores) {
          scoreMap[s.taskId] = { score: s.score, reason: s.reason };
        }
      }
      setAiScores(scoreMap);
    } catch {
      toast({ variant: "destructive", title: "AI prioritization failed" });
    }
  }, [tasks, prioritize, toast]);

  const resetSort = useCallback(() => {
    setAiSortedIds(null);
    setAiScores({});
  }, []);

  const displayTasks = aiSortedIds && tasks
    ? aiSortedIds
        .map(id => tasks.find(t => t.id === id))
        .filter((t): t is Task => !!t)
        .concat(tasks.filter(t => !aiSortedIds.includes(t.id)))
    : tasks;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <InboxIcon className="text-primary h-8 w-8" />
          <h1 className="text-3xl font-display font-bold text-foreground">Inbox</h1>
        </div>
        <div className="flex items-center gap-2">
          {aiSortedIds && (
            <button
              onClick={resetSort}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={12} /> Reset to manual order
            </button>
          )}
          {tasks && tasks.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleAiPrioritize}
              disabled={prioritize.isPending}
              className="border-primary/50 text-primary gap-1.5 h-8 text-xs"
            >
              <Sparkles size={14} />
              {prioritize.isPending ? "Prioritizing..." : "AI Prioritize"}
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleQuickAdd} className="flex gap-2">
        <Input
          value={quickTask}
          onChange={(e) => setQuickTask(e.target.value)}
          placeholder="Quick capture..."
          className="bg-card border-border"
        />
        <Button type="submit" disabled={!quickTask.trim() || createTask.isPending}>Add</Button>
      </form>

      {isDumping ? (
        <div className="space-y-3 bg-card p-4 rounded-xl border border-border">
          <Textarea
            value={brainDump}
            onChange={(e) => setBrainDump(e.target.value)}
            placeholder="Type all your messy thoughts here. AI will extract actionable tasks..."
            className="min-h-[150px] bg-background border-border resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsDumping(false)}>Cancel</Button>
            <Button
              onClick={handleExtract}
              disabled={!brainDump.trim() || extractTasks.isPending}
              className="bg-primary text-primary-foreground gap-2"
            >
              <Sparkles size={16} />
              {extractTasks.isPending ? "Extracting..." : "Extract Tasks"}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setIsDumping(true)}
          className="w-full border-dashed border-border/50 text-muted-foreground gap-2 h-12"
        >
          <Sparkles size={16} />
          Brain Dump (AI Extract)
        </Button>
      )}

      {stagedSuggestions && stagedSuggestions.length > 0 && (
        <div className="space-y-4">
          {stagedSuggestions.map((suggestion) => {
            const extractedTasks = ((suggestion.data as Record<string, unknown>)?.tasks as ExtractedTask[]) || [];
            const isEditing = editingSuggestionId === suggestion.id;
            const displayTasksSuggestion = isEditing ? editingTasks : extractedTasks;
            return (
              <div key={suggestion.id} className="bg-primary/5 border border-primary/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                    <Sparkles size={14} />
                    AI Extracted Tasks ({displayTasksSuggestion.length})
                    {isEditing && <span className="text-xs text-amber-400 font-normal ml-1">Editing</span>}
                  </h3>
                  <span className="text-xs text-muted-foreground">{suggestion.reasoning}</span>
                </div>
                <div className="space-y-2">
                  {displayTasksSuggestion.map((t, i) => (
                    <div key={i} className="bg-card/50 p-3 rounded-lg border border-border/50">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={t.title}
                              onChange={(e) => updateEditingTask(i, "title", e.target.value)}
                              className="bg-background border-border text-sm h-8"
                              placeholder="Task title"
                            />
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeEditingTask(i)}>
                              <X size={14} />
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={t.priority}
                              onChange={(e) => updateEditingTask(i, "priority", e.target.value)}
                              className="bg-background border border-border rounded-md text-xs px-2 py-1 text-foreground"
                            >
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                            <Input
                              type="number"
                              value={t.estimatedMinutes ?? ""}
                              onChange={(e) => updateEditingTask(i, "estimatedMinutes", e.target.value ? parseInt(e.target.value) : null)}
                              className="bg-background border-border text-xs h-7 w-20"
                              placeholder="min"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">{t.title}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t.priority}</span>
                              {t.estimatedMinutes && <span className="text-[10px] text-muted-foreground">{t.estimatedMinutes}m</span>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-border/30">
                  <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 gap-1" onClick={() => handleRejectExtracted(suggestion.id)}>
                    <X size={14} /> Reject All
                  </Button>
                  {isEditing ? (
                    <>
                      <Button variant="ghost" size="sm" className="text-muted-foreground gap-1" onClick={cancelEditing}>
                        Cancel
                      </Button>
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1" onClick={() => saveEdits(suggestion.id)} disabled={updateStagedData.isPending}>
                        <Check size={14} /> {updateStagedData.isPending ? "Saving..." : "Save Edits"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" className="text-amber-400 hover:bg-amber-500/10 gap-1" onClick={() => startEditing(suggestion.id, extractedTasks)}>
                        <Pencil size={14} /> Edit
                      </Button>
                      <Button size="sm" className="bg-[hsl(168,100%,39%)] hover:bg-[hsl(168,100%,45%)] text-white gap-1" onClick={() => handleAcceptExtracted(suggestion.id, extractedTasks)}>
                        <Check size={14} /> Accept All
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-3 mt-8">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : displayTasks?.length === 0 && (!stagedSuggestions || stagedSuggestions.length === 0) ? (
          <div className="text-center py-16 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <InboxIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">Inbox is empty</p>
              <p className="text-sm text-muted-foreground mt-1">Capture your first task above or use the brain dump to extract tasks from your thoughts.</p>
            </div>
            <Button onClick={() => document.querySelector<HTMLInputElement>('input[placeholder="Quick capture..."]')?.focus()} className="gap-2 min-h-[44px]">
              <InboxIcon size={16} /> Create First Task
            </Button>
          </div>
        ) : (
          displayTasks?.map(task => (
            <div key={task.id} className="relative group">
              <TaskCard task={task} aiScore={aiScores[task.id] || null} />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-card/80 backdrop-blur-sm p-1 rounded-lg">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:bg-primary/20" onClick={() => moveToToday(task.id)} title="Move to Today">
                  <CornerDownLeft size={16} />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/20" onClick={() => removeTask(task.id)} title="Delete">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
