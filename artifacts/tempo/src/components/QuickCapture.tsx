import { useState, useEffect, useCallback, useRef } from "react";
import { useCreateTask, getListTasksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Sparkles, Eye, EyeOff, Mic, ListChecks, Inbox } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Markdown from "react-markdown";
import { ExtractModal } from "./ExtractModal";

export function QuickCapture({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [content, setContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [extractModalOpen, setExtractModalOpen] = useState(false);
  const createTask = useCreateTask();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.max(120, el.scrollHeight) + "px";
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setContent("");
      setShowPreview(false);
    }
  }, [open]);

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) return;

    try {
      const firstNonEmpty = content.split("\n").find(line => line.trim()) || "Quick Capture";
      await createTask.mutateAsync({
        data: {
          title: firstNonEmpty.trim().slice(0, 100),
          status: "inbox",
          priority: "medium",
          notes: content,
        }
      });
      setContent("");
      setShowPreview(false);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
      toast({ title: "Captured to Inbox", description: "Saved successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to save", description: "Please try again." });
    }
  }, [content, createTask, onOpenChange, queryClient, toast]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleSubmit]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Sparkles className="text-primary" size={20} />
            Quick Capture
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-3">
          <div className="flex items-center gap-1 justify-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showPreview ? "Edit" : "Preview Markdown"}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="inline-flex">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-50 cursor-not-allowed pointer-events-none"
                    tabIndex={-1}
                    aria-disabled="true"
                  >
                    <Mic size={16} />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Voice coming in Phase 13</TooltipContent>
            </Tooltip>
          </div>

          {showPreview ? (
            <div className="min-h-[120px] rounded-md border border-border bg-background px-3 py-2 text-sm prose prose-sm dark:prose-invert max-w-none">
              {content.trim() ? (
                <Markdown>{content}</Markdown>
              ) : (
                <p className="text-muted-foreground">Nothing to preview</p>
              )}
            </div>
          ) : (
            <Textarea
              ref={textareaRef}
              autoFocus
              value={content}
              onChange={(e) => { setContent(e.target.value); autoResize(); }}
              placeholder="What's on your mind? (Markdown supported)"
              className="bg-background border-border text-sm min-h-[120px] resize-none focus-visible:ring-primary/50"
              style={{ overflow: "hidden" }}
            />
          )}

          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                setExtractModalOpen(true);
              }}
            >
              <ListChecks size={14} className="mr-1.5" />
              Extract Tasks with AI
            </Button>

            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={createTask.isPending || !content.trim()}
                onClick={handleSubmit}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Inbox size={14} className="mr-1.5" />
                {createTask.isPending ? "Saving..." : "Save to Inbox"}
              </Button>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground text-right">
            ⌘+Enter to save
          </p>
        </div>
      </DialogContent>
      <ExtractModal open={extractModalOpen} onOpenChange={setExtractModalOpen} />
    </Dialog>
  );
}