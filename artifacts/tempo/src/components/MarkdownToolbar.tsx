import React, { useCallback, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heading1, Heading2, Heading3, Bold, Italic, Strikethrough,
  Code, Quote, FileCode, Minus, List, ListOrdered, CheckSquare,
  Table, Link, Mic, Square, Loader2, Brackets,
} from "lucide-react";

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
}

type ToolAction = {
  icon: React.ReactNode;
  label: string;
  action: () => void;
};

export default function MarkdownToolbar({ textareaRef, onInsert, getValue, voiceProps }: MarkdownToolbarProps) {
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showLinkPopover && linkInputRef.current) {
      linkInputRef.current.focus();
    }
  }, [showLinkPopover]);

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
