import { useState } from "react";
import { useAiExtractTasks, useCreateTask, getListTasksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
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

export default function Extract() {
  const [text, setText] = useState("");
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTaskItem[]>([]);
  const [hasExtracted, setHasExtracted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const extractMutation = useAiExtractTasks();
  const createTask = useCreateTask();

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
      toast({ variant: "destructive", title: "Extraction failed", description: "Please try again." });
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
    if (accepted.length === 0) {
      toast({ variant: "destructive", title: "No tasks selected" });
      return;
    }

    let created = 0;
    let failed = 0;

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
      } catch {
        failed++;
      }
    }

    queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });

    if (created > 0) {
      toast({ title: `Created ${created} task${created !== 1 ? "s" : ""} in inbox` + (failed > 0 ? ` (${failed} failed)` : "") });
    }
    if (failed > 0 && created === 0) {
      toast({ variant: "destructive", title: "Failed to create tasks" });
    }

    setText("");
    setExtractedTasks([]);
    setHasExtracted(false);
  };

  const priorityColors = {
    high: "text-red-400 bg-red-400/10",
    medium: "text-amber-400 bg-amber-400/10",
    low: "text-blue-400 bg-blue-400/10",
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Sparkles className="text-primary h-8 w-8" />
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">AI Extract</h1>
          <p className="text-sm text-muted-foreground">Paste messy notes and let AI extract actionable tasks</p>
        </div>
      </div>

      <div className="space-y-3">
        <Textarea
          placeholder="Paste your messy notes, brain dump, meeting notes, or any text here...&#10;&#10;Examples:&#10;- Need to call dentist and schedule appointment before end of month&#10;- Remember to review the project proposal and send feedback to team&#10;- Buy groceries: milk, eggs, bread"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[180px] bg-card border-border text-sm"
        />
        <Button
          onClick={handleExtract}
          disabled={extractMutation.isPending || !text.trim()}
          className="w-full"
        >
          {extractMutation.isPending ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Extracting tasks...
            </>
          ) : (
            <>
              <Sparkles size={16} className="mr-2" />
              Extract Tasks with AI
            </>
          )}
        </Button>
      </div>

      {hasExtracted && extractedTasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No tasks extracted. Try with more specific action items.
        </div>
      )}

      {extractedTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Extracted Tasks ({extractedTasks.filter((t) => t.accepted).length} selected)
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExtractedTasks((prev) => prev.map((t) => ({ ...t, accepted: true })))}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExtractedTasks((prev) => prev.map((t) => ({ ...t, accepted: false })))}
              >
                Deselect All
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {extractedTasks.map((task, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                  task.accepted ? "bg-card border-primary/30" : "bg-card/50 border-border opacity-60"
                }`}
              >
                <button
                  onClick={() => toggleAccepted(idx)}
                  className="mt-0.5 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                >
                  {task.accepted ? (
                    <CheckCircle2 size={18} className="text-primary" />
                  ) : (
                    <Circle size={18} />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${!task.accepted ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    {task.estimatedMinutes && (
                      <span className="text-[10px] text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                        ~{task.estimatedMinutes}m
                      </span>
                    )}
                    {(task.tags || []).map((tag) => (
                      <span key={tag} className="text-[10px] text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => removeTask(idx)}
                  className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <Button
            onClick={handleCreateAccepted}
            disabled={createTask.isPending || extractedTasks.filter((t) => t.accepted).length === 0}
            className="w-full"
          >
            {createTask.isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Creating tasks...
              </>
            ) : (
              <>
                <Inbox size={16} className="mr-2" />
                Create {extractedTasks.filter((t) => t.accepted).length} Accepted Task{extractedTasks.filter((t) => t.accepted).length !== 1 ? "s" : ""} in Inbox
              </>
            )}
          </Button>

          {extractMutation.data && (
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground transition-colors">Raw AI output</summary>
              <pre className="mt-2 p-3 bg-muted rounded-lg overflow-auto text-[10px]">
                {JSON.stringify(extractMutation.data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
