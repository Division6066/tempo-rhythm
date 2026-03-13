"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Clock, Sparkles, Trash2 } from "lucide-react";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as Id<"tasks">;

  const task = useQuery(api.tasks.get, { id: taskId });
  const updateTask = useMutation(api.tasks.update);
  const deleteTask = useMutation(api.tasks.remove);
  const chunkTask = useAction(api.ai.chunkTask);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("inbox");
  const [priority, setPriority] = useState("medium");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [chunking, setChunking] = useState(false);

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
    await updateTask({
      id: taskId,
      title,
      notes,
      status,
      priority,
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : null,
    });
  };

  const handleDelete = async () => {
    await deleteTask({ id: taskId });
    router.push("/");
  };

  const handleChunk = async () => {
    setChunking(true);
    try {
      const res = await chunkTask({ taskTitle: title, taskNotes: notes });
      if (res.subtasks && res.subtasks.length > 0) {
        const newNotes = notes + "\n\n**AI Chunked Subtasks:**\n" + res.subtasks.map((s: { title: string; estimatedMinutes: number }) => `- [ ] ${s.title} (${s.estimatedMinutes}m)`).join("\n");
        setNotes(newNotes);
        await updateTask({ id: taskId, notes: newNotes });
      }
    } finally {
      setChunking(false);
    }
  };

  if (!task) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="w-16 h-16 rounded-full animate-breathe bg-primary/20" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleChunk} disabled={chunking} className="border-primary/50 text-primary gap-2">
              <Sparkles size={16} />
              {chunking ? "Chunking..." : "Chunk this task"}
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20" onClick={handleDelete}>
              <Trash2 size={20} />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleSave} className="text-2xl font-bold border-none bg-transparent px-0 focus-visible:ring-0" />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</label>
              <select value={status} onChange={(e) => { setStatus(e.target.value); setTimeout(handleSave, 0); }} className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm">
                <option value="inbox">Inbox</option>
                <option value="today">Today</option>
                <option value="scheduled">Scheduled</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Priority</label>
              <select value={priority} onChange={(e) => { setPriority(e.target.value); setTimeout(handleSave, 0); }} className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1">
              <Clock size={12} /> Estimated Minutes
            </label>
            <Input type="number" value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(e.target.value)} onBlur={handleSave} placeholder="e.g. 30" className="bg-card border-border w-1/3" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Notes</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={handleSave} placeholder="Add some details..." className="min-h-[200px] bg-card border-border resize-none" />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
