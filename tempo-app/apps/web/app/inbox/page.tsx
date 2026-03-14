"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import AppLayout from "@/components/AppLayout";
import TaskCard from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Inbox as InboxIcon, Sparkles, CornerDownLeft, Trash2, Check, X, Edit3 } from "lucide-react";

type StagedTask = { title: string; priority: string; estimatedMinutes?: number; tags?: string[] };

export default function InboxPage() {
  const tasks = useQuery(api.tasks.list, { status: "inbox" });
  const stagedSuggestions = useQuery(api.staging.listPending, { type: "extractedTasks" });
  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);
  const removeTask = useMutation(api.tasks.remove);
  const extractTasks = useAction(api.ai.extractTasks);
  const createStaged = useMutation(api.staging.create);
  const acceptStaged = useMutation(api.staging.accept);
  const rejectStaged = useMutation(api.staging.reject);

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

  const [extractError, setExtractError] = useState("");

  const handleExtract = async () => {
    if (!brainDump.trim()) return;
    setExtracting(true);
    setExtractError("");
    try {
      const res = await extractTasks({ text: brainDump });
      if (res.tasks) {
        await createStaged({
          type: "extractedTasks",
          data: { tasks: res.tasks, sourceText: brainDump },
          reasoning: `Extracted ${res.tasks.length} task(s) from brain dump.`,
        });
        setBrainDump("");
        setIsDumping(false);
      }
    } catch {
      setExtractError("AI extraction is currently unavailable. You can still add tasks manually above.");
    } finally {
      setExtracting(false);
    }
  };

  const handleAcceptExtracted = async (suggestionId: Id<"stagedSuggestions">, extractedTasks: StagedTask[]) => {
    for (const t of extractedTasks) {
      await createTask({
        title: t.title,
        priority: t.priority,
        estimatedMinutes: t.estimatedMinutes ?? undefined,
        status: "inbox",
        aiGenerated: true,
      });
    }
    await acceptStaged({ id: suggestionId });
  };

  const handleRejectExtracted = async (suggestionId: Id<"stagedSuggestions">) => {
    await rejectStaged({ id: suggestionId });
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
            {extractError && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg px-4 py-3">
                {extractError}
              </div>
            )}
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

        {stagedSuggestions && stagedSuggestions.length > 0 && (
          <div className="space-y-4">
            {stagedSuggestions.map((suggestion) => {
              const extractedTasks = (suggestion.data as { tasks: StagedTask[] }).tasks || [];
              return (
                <div key={suggestion._id} className="bg-primary/5 border border-primary/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                      <Sparkles size={14} />
                      AI Extracted Tasks ({extractedTasks.length})
                    </h3>
                    <span className="text-xs text-muted-foreground">{suggestion.reasoning}</span>
                  </div>
                  <div className="space-y-2">
                    {extractedTasks.map((t: StagedTask, i: number) => (
                      <div key={i} className="bg-card/50 p-3 rounded-lg flex items-center justify-between border border-border/50">
                        <div>
                          <p className="text-sm font-medium text-foreground">{t.title}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t.priority}</span>
                            {t.estimatedMinutes && <span className="text-[10px] text-muted-foreground">{t.estimatedMinutes}m</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-border/30">
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 gap-1" onClick={() => handleRejectExtracted(suggestion._id)}>
                      <X size={14} /> Reject All
                    </Button>
                    <Button size="sm" className="bg-teal-500 hover:bg-teal-400 text-white gap-1" onClick={() => handleAcceptExtracted(suggestion._id, extractedTasks)}>
                      <Check size={14} /> Accept All
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
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
