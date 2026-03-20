import { useState } from "react";
import { useAiExtractTasks, useCreateTask, getListTasksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, CheckCircle2, Circle, Loader2, Inbox, X } from "lucide-react";

interface ExtractedTaskItem {
  title: string;
  priority: "high" | "medium" | "low";
  estimatedMinutes?: number | null;
  tags?: string[];
  accepted: boolean;
}

interface ExtractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExtractModal({ open, onOpenChange }: ExtractModalProps) {
  const [text, setText] = useState("");
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTaskItem[]>([]);
  const [hasExtracted, setHasExtracted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const extractMutation = useAiExtractTasks();
  const createTask = useCreateTask();

  const handleClose = () => {
    setText("");
    setExtractedTasks([]);
    setHasExtracted(false);
    onOpenChange(false);
  };

  const handleExtract = async () => {
    if (!text.trim()) return;
    try {
      const result = await extractMutation.mutateAsync({ data: { text } });
      setExtractedTasks(
        result.tasks.map((t: { title: string; priority: string; estimatedMinutes?: number | null; tags?: string[] }) => ({
          title: t.title,
          priority: t.priority as "high" | "medium" | "low",
          estimatedMinutes: t.estimatedMinutes ?? undefined,
          tags: t.tags,
          accepted: true,
        }))
      );
      setHasExtracted(true);
    } catch {
      toast({ variant: "destructive", title: "Extraction failed" });
    }
  };

  const toggleAccepted = (idx: number) => {
    setExtractedTasks((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, accepted: !t.accepted } : t))
    );
  };

  const removeTask = (idx: number) => {
    setExtractedTasks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateAccepted = async () => {
    const accepted = extractedTasks.filter((t) => t.accepted);
    if (accepted.length === 0) return;

    let created = 0;
    for (const task of accepted) {
      try {
        await createTask.mutateAsync({
          data: {
            title: task.title,
            status: "inbox",
            priority: task.priority,
            estimatedMinutes: task.estimatedMinutes,
            tags: task.tags || [],
            aiGenerated: true,
          },
        });
        created++;
      } catch {}
    }

    queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
    toast({ title: `Created ${created} task${created !== 1 ? "s" : ""} in inbox` });
    handleClose();
  };

  const priorityColors = {
    high: "text-red-400 bg-red-400/10",
    medium: "text-amber-400 bg-amber-400/10",
    low: "text-blue-400 bg-blue-400/10",
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border shadow-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Sparkles className="text-primary" size={20} />
            AI Task Extraction
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!hasExtracted ? (
            <>
              <Textarea
                autoFocus
                placeholder="Paste messy notes, brain dump, or meeting notes..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[140px] bg-background border-border text-sm"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleExtract}
                  disabled={extractMutation.isPending || !text.trim()}
                >
                  {extractMutation.isPending ? (
                    <><Loader2 size={14} className="mr-1.5 animate-spin" />Extracting...</>
                  ) : (
                    <><Sparkles size={14} className="mr-1.5" />Extract Tasks</>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              {extractedTasks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No tasks found. Try with more specific text.
                </div>
              ) : (
                <div className="space-y-2">
                  {extractedTasks.map((task, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-colors ${
                        task.accepted ? "bg-muted/30 border-primary/20" : "bg-card/50 border-border opacity-60"
                      }`}
                    >
                      <button onClick={() => toggleAccepted(idx)} className="mt-0.5 flex-shrink-0">
                        {task.accepted ? (
                          <CheckCircle2 size={16} className="text-primary" />
                        ) : (
                          <Circle size={16} className="text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!task.accepted ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                          {task.estimatedMinutes && (
                            <span className="text-[10px] text-muted-foreground">~{task.estimatedMinutes}m</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeTask(idx)}
                        className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setHasExtracted(false); setExtractedTasks([]); }}
                >
                  Try Again
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreateAccepted}
                    disabled={createTask.isPending || extractedTasks.filter((t) => t.accepted).length === 0}
                  >
                    {createTask.isPending ? (
                      <><Loader2 size={14} className="mr-1.5 animate-spin" />Creating...</>
                    ) : (
                      <><Inbox size={14} className="mr-1.5" />Add {extractedTasks.filter((t) => t.accepted).length} to Inbox</>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
