import React, { useCallback, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heading1, Heading2, Heading3, Bold, Italic, Strikethrough,
  Code, Quote, FileCode, Minus, List, ListOrdered, CheckSquare,
  Table, Link, Mic, Square, Loader2, Brackets, Sparkles,
  PenLine, FileText, Zap, Brain, Expand, Languages, ListChecks,
  ChevronDown,
} from "lucide-react";

export type AiAction = "rewrite" | "summarize" | "simplify" | "adhd-friendly" | "expand" | "translate" | "extract-tasks";

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onInsert: (newValue: string, cursorPos: number) => void;
  getValue: () => string;
  voiceProps?: {
    isRecording: boolean;
    isTranscribing: boolean;
    onStartRecording: () => void;
    onStopRecording: () => void;
  };
  onAiAction?: (action: AiAction, selectedText: string) => void;
}

type ToolAction = {
  icon: React.ReactNode;
  label: string;
  action: () => void;
};

const AI_ACTIONS: { action: AiAction; icon: React.ReactNode; label: string }[] = [
  { action: "rewrite", icon: <PenLine size={14} />, label: "Rewrite" },
  { action: "summarize", icon: <FileText size={14} />, label: "Summarize" },
  { action: "simplify", icon: <Zap size={14} />, label: "Simplify" },
  { action: "adhd-friendly", icon: <Brain size={14} />, label: "Make ADHD-Friendly" },
  { action: "expand", icon: <Expand size={14} />, label: "Expand" },
  { action: "translate", icon: <Languages size={14} />, label: "Translate" },
  { action: "extract-tasks", icon: <ListChecks size={14} />, label: "Extract Tasks" },
];

export default function MarkdownToolbar({ textareaRef, onInsert, getValue, voiceProps, onAiAction }: MarkdownToolbarProps) {
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);
  const aiMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showLinkPopover && linkInputRef.current) {
      linkInputRef.current.focus();
    }
  }, [showLinkPopover]);

  useEffect(() => {
    if (!showAiMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (aiMenuRef.current && !aiMenuRef.current.contains(e.target as Node)) {
        setShowAiMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showAiMenu]);

  const getSelection = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return { start: 0, end: 0, text: "", before: "", after: "" };
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const value = getValue();
    return {
      start,
      end,
      text: value.substring(start, end),
      before: value.substring(0, start),
      after: value.substring(end),
    };
  }, [textareaRef, getValue]);

  const wrapSelection = useCallback((prefix: string, suffix: string) => {
    const sel = getSelection();
    const selectedText = sel.text || "text";
    const newValue = sel.before + prefix + selectedText + suffix + sel.after;
    const cursorPos = sel.start + prefix.length + selectedText.length;
    onInsert(newValue, cursorPos);
  }, [getSelection, onInsert]);

  const insertAtLineStart = useCallback((prefix: string) => {
    const sel = getSelection();
    const value = getValue();
    const lineStart = value.lastIndexOf("\n", sel.start - 1) + 1;
    const newValue = value.substring(0, lineStart) + prefix + value.substring(lineStart);
    const cursorPos = sel.start + prefix.length;
    onInsert(newValue, cursorPos);
  }, [getSelection, getValue, onInsert]);

  const insertBlock = useCallback((block: string) => {
    const sel = getSelection();
    const needsNewline = sel.before.length > 0 && !sel.before.endsWith("\n");
    const prefix = needsNewline ? "\n" : "";
    const newValue = sel.before + prefix + block + sel.after;
    const cursorPos = sel.start + prefix.length + block.length;
    onInsert(newValue, cursorPos);
  }, [getSelection, onInsert]);

  const handleLinkInsert = useCallback(() => {
    const sel = getSelection();
    const linkText = sel.text || "link text";
    const url = linkUrl || "https://";
    const newValue = sel.before + `[${linkText}](${url})` + sel.after;
    const cursorPos = sel.start + `[${linkText}](${url})`.length;
    onInsert(newValue, cursorPos);
    setShowLinkPopover(false);
    setLinkUrl("");
  }, [getSelection, linkUrl, onInsert]);

  const insertTable = useCallback(() => {
    const table = "\n| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Cell 1 | Cell 2 | Cell 3 |\n";
    insertBlock(table);
  }, [insertBlock]);

  const insertWikiLink = useCallback(() => {
    wrapSelection("[[", "]]");
  }, [wrapSelection]);

  const handleAiAction = useCallback((action: AiAction) => {
    const sel = getSelection();
    const text = sel.text || getValue();
    onAiAction?.(action, text);
    setShowAiMenu(false);
  }, [getSelection, getValue, onAiAction]);

  const tools: ToolAction[][] = [
    [
      { icon: <Heading1 size={15} />, label: "Heading 1", action: () => insertAtLineStart("# ") },
      { icon: <Heading2 size={15} />, label: "Heading 2", action: () => insertAtLineStart("## ") },
      { icon: <Heading3 size={15} />, label: "Heading 3", action: () => insertAtLineStart("### ") },
    ],
    [
      { icon: <Bold size={15} />, label: "Bold (Cmd+B)", action: () => wrapSelection("**", "**") },
      { icon: <Italic size={15} />, label: "Italic (Cmd+I)", action: () => wrapSelection("*", "*") },
      { icon: <Strikethrough size={15} />, label: "Strikethrough", action: () => wrapSelection("~~", "~~") },
      { icon: <Code size={15} />, label: "Inline Code", action: () => wrapSelection("`", "`") },
    ],
    [
      { icon: <Quote size={15} />, label: "Blockquote", action: () => insertAtLineStart("> ") },
      { icon: <FileCode size={15} />, label: "Code Block", action: () => insertBlock("\n```\ncode\n```\n") },
      { icon: <Minus size={15} />, label: "Horizontal Rule", action: () => insertBlock("\n---\n") },
    ],
    [
      { icon: <List size={15} />, label: "Bullet List", action: () => insertAtLineStart("- ") },
      { icon: <ListOrdered size={15} />, label: "Numbered List", action: () => insertAtLineStart("1. ") },
      { icon: <CheckSquare size={15} />, label: "Checkbox", action: () => insertAtLineStart("- [ ] ") },
    ],
    [
      { icon: <Table size={15} />, label: "Table", action: insertTable },
      { icon: <Link size={15} />, label: "Link (Cmd+K)", action: () => setShowLinkPopover(true) },
      { icon: <Brackets size={15} />, label: "Wiki Link", action: insertWikiLink },
    ],
  ];

  return (
    <div className="relative">
      <div className="flex items-center gap-0.5 flex-wrap border-b border-border bg-card/50 px-2 py-1">
        {tools.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {gi > 0 && <div className="w-px h-5 bg-border mx-1" />}
            {group.map((tool, ti) => (
              <Button
                key={ti}
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={tool.action}
                title={tool.label}
              >
                {tool.icon}
              </Button>
            ))}
          </div>
        ))}
        {voiceProps && (
          <>
            <div className="w-px h-5 bg-border mx-1" />
            {voiceProps.isTranscribing ? (
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled>
                <Loader2 size={15} className="animate-spin" />
              </Button>
            ) : voiceProps.isRecording ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={voiceProps.onStopRecording}
                title="Stop Recording"
              >
                <Square size={15} />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={voiceProps.onStartRecording}
                title="Voice Note"
              >
                <Mic size={15} />
              </Button>
            )}
          </>
        )}
        {onAiAction && (
          <>
            <div className="w-px h-5 bg-border mx-1" />
            <div className="relative" ref={aiMenuRef}>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 gap-1 text-primary hover:bg-primary/10 text-xs font-medium"
                onClick={() => setShowAiMenu(!showAiMenu)}
              >
                <Sparkles size={14} /> AI ✦ <ChevronDown size={12} />
              </Button>
              {showAiMenu && (
                <div className="absolute top-full right-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[180px]">
                  {AI_ACTIONS.map((item) => (
                    <button
                      key={item.action}
                      onClick={() => handleAiAction(item.action)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {showLinkPopover && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-lg p-3 flex items-center gap-2">
          <Input
            ref={linkInputRef}
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            className="h-8 w-56 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLinkInsert();
              if (e.key === "Escape") setShowLinkPopover(false);
            }}
          />
          <Button size="sm" className="h-8" onClick={handleLinkInsert}>Insert</Button>
          <Button size="sm" variant="ghost" className="h-8" onClick={() => setShowLinkPopover(false)}>Cancel</Button>
        </div>
      )}
    </div>
  );
}
