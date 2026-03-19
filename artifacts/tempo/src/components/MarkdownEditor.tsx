import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelRightClose, Columns, Check, Loader2, AlertCircle } from "lucide-react";
import MarkdownToolbar from "./MarkdownToolbar";
import type { ImperativePanelHandle } from "react-resizable-panels";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  disabled?: boolean;
  preprocessValue?: (raw: string) => string;
  saveStatus?: "saved" | "saving" | "unsaved";
  voiceProps?: {
    isRecording: boolean;
    isTranscribing: boolean;
    onStartRecording: () => void;
    onStopRecording: () => void;
  };
}

const SPLIT_POS_KEY = "tempo-editor-split";

export default function MarkdownEditor({
  value,
  onChange,
  height = 500,
  disabled = false,
  preprocessValue,
  saveStatus,
  voiceProps,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const editorPanelRef = useRef<ImperativePanelHandle>(null);
  const previewPanelRef = useRef<ImperativePanelHandle>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">("split");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMod = e.metaKey || e.ctrlKey;
    const ta = textareaRef.current;
    if (!ta) return;

    if (isMod && e.key === "b") {
      e.preventDefault();
      wrapSelectionInTextarea("**", "**");
    } else if (isMod && e.key === "i") {
      e.preventDefault();
      wrapSelectionInTextarea("*", "*");
    } else if (isMod && e.key === "k") {
      e.preventDefault();
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selectedText = value.substring(start, end) || "link text";
      const newValue = value.substring(0, start) + `[${selectedText}](url)` + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        ta.focus();
        const urlStart = start + selectedText.length + 3;
        ta.setSelectionRange(urlStart, urlStart + 3);
      }, 0);
    } else if (isMod && e.shiftKey && e.key === "c") {
      e.preventDefault();
      const block = "\n```\n\n```\n";
      const start = ta.selectionStart;
      const newValue = value.substring(0, start) + block + value.substring(start);
      onChange(newValue);
      setTimeout(() => {
        ta.focus();
        ta.setSelectionRange(start + 5, start + 5);
      }, 0);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const lineEnd = value.indexOf("\n", end);
      const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;
      const line = value.substring(lineStart, actualLineEnd);

      const listMatch = line.match(/^(\s*)([-*]|\d+\.|- \[[ x]\])\s/);
      if (listMatch) {
        if (e.shiftKey) {
          if (line.startsWith("  ")) {
            const newValue = value.substring(0, lineStart) + line.substring(2) + value.substring(actualLineEnd);
            onChange(newValue);
            setTimeout(() => {
              ta.focus();
              ta.setSelectionRange(Math.max(lineStart, start - 2), Math.max(lineStart, end - 2));
            }, 0);
          }
        } else {
          const newValue = value.substring(0, lineStart) + "  " + line + value.substring(actualLineEnd);
          onChange(newValue);
          setTimeout(() => {
            ta.focus();
            ta.setSelectionRange(start + 2, end + 2);
          }, 0);
        }
      } else {
        if (!e.shiftKey) {
          const newValue = value.substring(0, start) + "  " + value.substring(end);
          onChange(newValue);
          setTimeout(() => {
            ta.focus();
            ta.setSelectionRange(start + 2, start + 2);
          }, 0);
        }
      }
    }
  }, [value, onChange]);

  const wrapSelectionInTextarea = useCallback((prefix: string, suffix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selectedText = value.substring(start, end) || "text";
    const newValue = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);
    onChange(newValue);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  }, [value, onChange]);

  const handleToolbarInsert = useCallback((newValue: string, cursorPos: number) => {
    onChange(newValue);
    setTimeout(() => {
      const ta = textareaRef.current;
      if (ta) {
        ta.focus();
        ta.setSelectionRange(cursorPos, cursorPos);
      }
    }, 0);
  }, [onChange]);

  const getTextareaValue = useCallback(() => value, [value]);

  const processedValue = useMemo(() => {
    return preprocessValue ? preprocessValue(value) : value;
  }, [value, preprocessValue]);

  const wordCount = useMemo(() => {
    const words = value.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }, [value]);

  const readingTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  const handleCollapseEditor = useCallback(() => {
    setViewMode("preview");
    editorPanelRef.current?.collapse();
  }, []);

  const handleCollapsePreview = useCallback(() => {
    setViewMode("editor");
    previewPanelRef.current?.collapse();
  }, []);

  const handleResetSplit = useCallback(() => {
    setViewMode("split");
    editorPanelRef.current?.resize(50);
    previewPanelRef.current?.resize(50);
  }, []);

  const handlePanelResize = useCallback(() => {
    const editorSize = editorPanelRef.current?.getSize() ?? 50;
    const previewSize = previewPanelRef.current?.getSize() ?? 50;
    if (editorSize < 5) setViewMode("preview");
    else if (previewSize < 5) setViewMode("editor");
    else setViewMode("split");
  }, []);

  const saveIndicator = saveStatus && (
    <div className="flex items-center gap-1.5 text-xs">
      {saveStatus === "saved" && (
        <span className="text-green-400 flex items-center gap-1"><Check size={12} /> Saved</span>
      )}
      {saveStatus === "saving" && (
        <span className="text-muted-foreground flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Saving…</span>
      )}
      {saveStatus === "unsaved" && (
        <span className="text-amber-400 flex items-center gap-1"><AlertCircle size={12} /> Unsaved</span>
      )}
    </div>
  );

  const previewContent = (
    <div className="prose prose-invert prose-sm max-w-none p-4 overflow-y-auto h-full">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {processedValue}
      </ReactMarkdown>
    </div>
  );

  const editorContent = (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      placeholder="Start typing (Markdown supported, use #tags @mentions [[wiki links]])..."
      className="w-full h-full resize-none bg-transparent text-foreground font-mono text-sm p-4 outline-none placeholder:text-muted-foreground/50"
      spellCheck={false}
    />
  );

  if (isMobile) {
    return (
      <div className="flex flex-col border border-border rounded-lg overflow-hidden" style={{ height }}>
        {mobileTab === "edit" && (
          <MarkdownToolbar
            textareaRef={textareaRef}
            onInsert={handleToolbarInsert}
            getValue={getTextareaValue}
            voiceProps={voiceProps}
          />
        )}
        <div className="flex items-center justify-between border-b border-border bg-card/30 px-2">
          <div className="flex">
            <button
              onClick={() => setMobileTab("edit")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                mobileTab === "edit"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setMobileTab("preview")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                mobileTab === "preview"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              Preview
            </button>
          </div>
          {saveIndicator}
        </div>
        <div className="flex-1 overflow-hidden">
          {mobileTab === "edit" ? editorContent : previewContent}
        </div>
        <div className="flex items-center justify-end px-3 py-1 border-t border-border bg-card/30 text-xs text-muted-foreground">
          {wordCount} words · {readingTime} min read
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border border-border rounded-lg overflow-hidden" style={{ height }}>
      <MarkdownToolbar
        textareaRef={textareaRef}
        onInsert={handleToolbarInsert}
        getValue={getTextareaValue}
        voiceProps={voiceProps}
      />
      <div className="flex items-center justify-between border-b border-border bg-card/30 px-2 py-0.5">
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className={`h-6 w-6 ${viewMode === "editor" ? "text-primary" : "text-muted-foreground"}`}
            onClick={handleCollapsePreview}
            title="Editor only"
          >
            <PanelRightClose size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-6 w-6 ${viewMode === "split" ? "text-primary" : "text-muted-foreground"}`}
            onClick={handleResetSplit}
            title="Split view"
          >
            <Columns size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-6 w-6 ${viewMode === "preview" ? "text-primary" : "text-muted-foreground"}`}
            onClick={handleCollapseEditor}
            title="Preview only"
          >
            <PanelLeftClose size={14} />
          </Button>
        </div>
        {saveIndicator}
      </div>
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={() => handlePanelResize()}
          autoSaveId={SPLIT_POS_KEY}
        >
          <ResizablePanel
            ref={editorPanelRef}
            defaultSize={50}
            minSize={0}
            collapsible
            collapsedSize={0}
          >
            {viewMode !== "preview" && (
              <div className="h-full overflow-hidden">
                {editorContent}
              </div>
            )}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            ref={previewPanelRef}
            defaultSize={50}
            minSize={0}
            collapsible
            collapsedSize={0}
          >
            {viewMode !== "editor" && (
              <div className="h-full overflow-y-auto bg-card/20">
                {previewContent}
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <div className="flex items-center justify-end px-3 py-1 border-t border-border bg-card/30 text-xs text-muted-foreground">
        {wordCount} words · {readingTime} min read
      </div>
    </div>
  );
}
