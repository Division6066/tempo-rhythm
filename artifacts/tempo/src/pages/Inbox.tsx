import { useState } from "react";
import { useListTasks, useCreateTask, useAiExtractTasks, getListTasksQueryKey, useDeleteTask, useUpdateTask } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Inbox as InboxIcon, Sparkles, CornerDownLeft, Trash2, Calendar } from "lucide-react";
import TaskCard from "@/components/TaskCard";

export default function Inbox() {
  const { data: tasks, isLoading } = useListTasks({ status: "inbox" });
  const createTask = useCreateTask();
  const extractTasks = useAiExtractTasks();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const queryClient = useQueryClient();

  const [quickTask, setQuickTask] = useState("");
  const [brainDump, setBrainDump] = useState("");
  const [isDumping, setIsDumping] = useState(false);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTask.trim()) return;
    await createTask.mutateAsync({ data: { title: quickTask, status: "inbox" } });
    setQuickTask("");
    queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
  };

  const handleExtract = async () => {
    if (!brainDump.trim()) return;
    const res = await extractTasks.mutateAsync({ data: { text: brainDump } });
    if (res.tasks) {
      for (const t of res.tasks) {
        await createTask.mutateAsync({ 
          data: { 
            title: t.title, 
            priority: t.priority as any, 
            estimatedMinutes: t.estimatedMinutes, 
            tags: t.tags,
            status: "inbox",
            aiGenerated: true
          } 
        });
      }
      setBrainDump("");
      setIsDumping(false);
      queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
    }
  };

  const moveToToday = async (id: number) => {
    await updateTask.mutateAsync({ id, data: { status: "today" } });
    queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
  };

  const removeTask = async (id: number) => {
    await deleteTask.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <InboxIcon className="text-primary h-8 w-8" />
        <h1 className="text-3xl font-display font-bold text-foreground">Inbox</h1>
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

      <div className="space-y-3 mt-8">
        {isLoading ? (
          <div className="flex justify-center p-8"><div className="w-8 h-8 rounded-full animate-breathe bg-primary/20" /></div>
        ) : tasks?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Inbox is empty.</p>
          </div>
        ) : (
          tasks?.map(task => (
            <div key={task.id} className="relative group">
              <TaskCard task={task} />
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