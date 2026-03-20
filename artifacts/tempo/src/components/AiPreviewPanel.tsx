import { useState } from "react";
import { X, RotateCcw, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AiPreviewPanelProps {
  result: string;
  isLoading: boolean;
  action: string;
  onInsert: () => void;
  onRetry: () => void;
  onDismiss: () => void;
  deepThink: boolean;
  onToggleDeepThink: (v: boolean) => void;
}

const ACTION_LABELS: Record<string, string> = {
  rewrite: "Rewrite",
  summarize: "Summary",
  simplify: "Simplified",
  "adhd-friendly": "ADHD-Friendly",
  expand: "Expanded",
  translate: "Translation",
};

export default function AiPreviewPanel({
  result,
  isLoading,
  action,
  onInsert,
  onRetry,
  onDismiss,
  deepThink,
  onToggleDeepThink,
}: AiPreviewPanelProps) {
  return (
    <div className="fixed right-0 top-0 bottom-0 w-[380px] max-w-[90vw] bg-card border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <span className="font-semibold text-sm">
            AI {ACTION_LABELS[action] || action}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDismiss}>
          <X size={16} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 animate-pulse" />
              <Loader2 size={24} className="absolute inset-0 m-auto text-primary animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">
              {deepThink ? "Deep thinking..." : "Processing..."}
            </p>
          </div>
        ) : result ? (
          <div className="prose prose-sm prose-invert max-w-none text-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No result yet
          </div>
        )}
      </div>

      <div className="border-t border-border px-4 py-3 space-y-3">
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={deepThink}
            onChange={(e) => onToggleDeepThink(e.target.checked)}
            className="rounded border-border"
          />
          Deep Think (multi-model)
        </label>

        <div className="flex gap-2">
          <Button
            onClick={onInsert}
            disabled={isLoading || !result}
            className="flex-1 gap-1.5"
            size="sm"
          >
            <Check size={14} /> Insert
          </Button>
          <Button
            onClick={onRetry}
            disabled={isLoading}
            variant="outline"
            className="gap-1.5"
            size="sm"
          >
            <RotateCcw size={14} /> Try Again
          </Button>
          <Button
            onClick={onDismiss}
            variant="ghost"
            size="sm"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
