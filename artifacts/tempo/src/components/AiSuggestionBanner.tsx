import { useState, useEffect, useRef } from "react";
import { Sparkles, X, Check, Folder, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiSuggestionBannerProps {
  folder: string | null;
  project: string | null;
  tags: string[];
  confidence: number;
  onApply: () => void;
  onDismiss: () => void;
}

export default function AiSuggestionBanner({ folder, project, tags, confidence, onApply, onDismiss }: AiSuggestionBannerProps) {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 8000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onDismiss]);

  if (!visible) return null;

  const parts: string[] = [];
  if (folder) parts.push(`📁 ${folder}`);
  if (project) parts.push(`📋 ${project}`);
  if (tags.length > 0) parts.push(tags.map(t => `🏷 #${t}`).join(" "));

  if (parts.length === 0) return null;

  return (
    <div className="flex items-center gap-3 bg-primary/5 border border-primary/30 rounded-xl px-4 py-3 animate-in slide-in-from-top-2 duration-300">
      <Sparkles size={16} className="text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-medium text-primary">AI suggests:</span>{" "}
          {parts.join(" / ")}
          <span className="text-muted-foreground ml-2">— {Math.round(confidence)}% confident</span>
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="sm"
          className="bg-primary text-primary-foreground gap-1 h-7 text-xs"
          onClick={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
            onApply();
            setVisible(false);
          }}
        >
          <Check size={12} /> Apply
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
            onDismiss();
            setVisible(false);
          }}
        >
          <X size={14} />
        </Button>
      </div>
    </div>
  );
}
