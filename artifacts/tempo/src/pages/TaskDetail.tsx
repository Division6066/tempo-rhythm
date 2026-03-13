import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { 
  useGetTask, 
  useUpdateTask, 
  useDeleteTask, 
  useAiChunkTask,
  getListTasksQueryKey,
  getGetTaskQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Sparkles, Trash2, Calendar as CalendarIcon, Hash } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function TaskDetail() {
  const [, params] = useRoute("/tasks/:id");
  const taskId = parseInt(params?.id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: task, isLoading } = useGetTask(taskId, {
    query: {
      enabled: !!taskId,
      queryKey: getGetTaskQueryKey(taskId)
    }
  });

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const chunkTask = useAiChunkTask();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<any>("inbox");
  const [priority, setPriority] = useState<any>("medium");
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

  const handleSave = async () => {
    try {
      await updateTask.mutateAsync({
        id: taskId,
        data: {
          title,
          notes,
          status,
          priority,
          estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : null
        }
      });
      queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(taskId) });
      toast({ title: "Task updated" });
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to update task" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync({ id: taskId });
      queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
      toast({ title: "Task deleted" });
      setLocation("/");
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to delete task" });
    }
  };

  const handleChunk = async () => {
    try {
      const res = await chunkTask.mutateAsync({
        data: {
          taskTitle: title,
          taskNotes: notes
        }
      });
      if (res.subtasks && res.subtasks.length > 0) {
        toast({ title: "Task chunked!", description: res.reasoning });
        // Assuming we update the task description with the subtasks for now
        // since we don't have a subtask API yet.
        const newNotes = notes + "\n\n**AI Chunked Subtasks:**\n" + res.subtasks.map((s: any) => `- [ ] ${s.title} (${s.estimatedMinutes}m)`).join("\n");
        setNotes(newNotes);
        handleSave();
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Failed to chunk task" });
    }
  };

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" /></div>;
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
          <Button variant="outline" size="sm" onClick={handleChunk} disabled={chunkTask.isPending} className="border-primary/50 text-primary gap-2">
            <Sparkles size={16} />
            Chunk this task
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20" onClick={handleDelete}>
            <Trash2 size={20} />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Input 
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={handleSave}
          className="text-2xl font-display font-bold border-none bg-transparent px-0 focus-visible:ring-0"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</label>
            <Select value={status} onValueChange={(val) => { setStatus(val); setTimeout(handleSave, 0); }}>
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
            <Select value={priority} onValueChange={(val) => { setPriority(val); setTimeout(handleSave, 0); }}>
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
            onChange={e => setEstimatedMinutes(e.target.value)}
            onBlur={handleSave}
            placeholder="e.g. 30"
            className="bg-card border-border w-1/3"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Notes</label>
          <Textarea 
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={handleSave}
            placeholder="Add some details..."
            className="min-h-[200px] bg-card border-border resize-none"
          />
        </div>
      </div>
    </div>
  );
}