"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import AppLayout from "@/components/AppLayout";
import TaskCard from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Inbox as InboxIcon, Sparkles, CornerDownLeft, Trash2 } from "lucide-react";

export default function InboxPage() {
  const tasks = useQuery(api.tasks.list, { status: "inbox" });
  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);
  const removeTask = useMutation(api.tasks.remove);
  const extractTasks = useAction(api.ai.extractTasks);

  const [quickTask, setQuickTask] = useState("");
  const [brainDump, setBrainDump] = useState("");
  const [isDumping, setIsDumping] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTask.trim()) return;
    await createTask({ title: quickTask, status: "inbox" });
    setQuickTask("");
  };

  const handleExtract = async () => {
    if (!brainDump.trim()) return;
    setExtracting(true);
    try {
      const res = await extractTasks({ text: brainDump });
      if (res.tasks) {
        for (const t of res.tasks) {
          await createTask({
            title: t.title,
            priority: t.priority,
            estimatedMinutes: t.estimatedMinutes ?? undefined,
            status: "inbox",
            aiGenerated: true,
          });
        }
        setBrainDump("");
        setIsDumping(false);
      }
    } finally {
      setExtracting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <InboxIcon className="text-primary h-8 w-8" />
          <h1 className="text-3xl font-bold text-foreground">Inbox</h1>
        </div>

        <form onSubmit={handleQuickAdd} className="flex gap-2">
          <Input
            value={quickTask}
            onChange={(e) => setQuickTask(e.target.value)}
            placeholder="Quick capture..."
            className="bg-card border-border"
          />
          <Button type="submit" disabled={!quickTask.trim()}>Add</Button>
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
              <Button onClick={handleExtract} disabled={!brainDump.trim() || extracting} className="bg-primary text-primary-foreground gap-2">
                <Sparkles size={16} />
                {extracting ? "Extracting..." : "Extract Tasks"}
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setIsDumping(true)} className="w-full border-dashed border-border/50 text-muted-foreground gap-2 h-12">
            <Sparkles size={16} />
            Brain Dump (AI Extract)
          </Button>
        )}

        <div className="space-y-3 mt-8">
          {!tasks ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 rounded-full animate-breathe bg-primary/20" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Inbox is empty.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="relative group">
                <TaskCard task={task} />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-card/80 backdrop-blur-sm p-1 rounded-lg">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:bg-primary/20" onClick={() => updateTask({ id: task._id, status: "today" })} title="Move to Today">
                    <CornerDownLeft size={16} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/20" onClick={() => removeTask({ id: task._id })} title="Delete">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
