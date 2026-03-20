import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelRightClose, Columns, Check, Loader2, AlertCircle } from "lucide-react";
import MarkdownToolbar from "./MarkdownToolbar";
import WikiLinkAutocomplete from "./WikiLinkAutocomplete";
import TagAutocomplete from "./TagAutocomplete";
import type { AiAction } from "./MarkdownToolbar";
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
  allNotes?: Array<{ id: number; title: string }>;
  allTags?: string[];
  onCreateNote?: (title: string) => void;
  onAiAction?: (action: AiAction, selectedText: string) => void;
}

function getCaretCoordinates(textarea: HTMLTextAreaElement): { top: number; left: number } {
  const div = document.createElement("div");
  const style = window.getComputedStyle(textarea);
  const props = [
    "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing",
    "wordSpacing", "textIndent", "paddingTop", "paddingLeft", "paddingRight",
    "borderTopWidth", "borderLeftWidth", "boxSizing", "whiteSpace", "wordWrap", "overflowWrap",
  ];
  props.forEach((p) => {
    div.style.setProperty(p, style.getPropertyValue(p));
  });
  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.whiteSpace = "pre-wrap";
  div.style.width = style.width;
  div.style.height = "auto";
  div.style.overflow = "hidden";

  const text = textarea.value.substring(0, textarea.selectionStart);
  div.textContent = text;
  const span = document.createElement("span");
  span.textContent = "|";
  div.appendChild(span);
  document.body.appendChild(div);

  const rect = textarea.getBoundingClientRect();
  const top = rect.top + span.offsetTop - textarea.scrollTop + parseInt(style.lineHeight || "20");
  const left = rect.left + span.offsetLeft - textarea.scrollLeft;

  document.body.removeChild(div);
  return { top: Math.min(top, rect.bottom - 50), left: Math.min(left, rect.right - 250) };
}

const SPLIT_POS_KEY = "tempo-editor-split";

function makeHeadingId(level: number, text: string): string {
  return `h-${level}-${text.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`;
}

function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractTextFromChildren).join("");
  if (children && typeof children === "object" && "props" in children) {
    const el = children as React.ReactElement<{ children?: React.ReactNode }>;
    return extractTextFromChildren(el.props.children);
  }
  return String(children ?? "");
}

export default function MarkdownEditor({
  value,
  onChange,
  height = 500,
  disabled = false,
  preprocessValue,
  saveStatus,
  voiceProps,
  allNotes,
  allTags,
  onCreateNote,
  onAiAction,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const editorPanelRef = useRef<ImperativePanelHandle>(null);
  const previewPanelRef = useRef<ImperativePanelHandle>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">("split");
  const [collapsedHeadings, setCollapsedHeadings] = useState<Set<string>>(new Set());

  const [wikiLinkState, setWikiLinkState] = useState<{
    active: boolean;
    query: string;
    position: { top: number; left: number };
  }>({ active: false, query: "", position: { top: 0, left: 0 } });

  const [tagState, setTagState] = useState<{
    active: boolean;
    query: string;
    position: { top: number; left: number };
  }>({ active: false, query: "", position: { top: 0, left: 0 } });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const checkAutocomplete = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;

    const pos = ta.selectionStart;
    const textBefore = ta.value.substring(0, pos);

    const wikiMatch = textBefore.match(/\[\[([^\]]*)$/);
    if (wikiMatch && allNotes) {
      const coords = getCaretCoordinates(ta);
      setWikiLinkState({ active: true, query: wikiMatch[1], position: coords });
      setTagState((prev) => ({ ...prev, active: false }));
      return;
    }

    const tagMatch = textBefore.match(/(?:^|\s)#([\w-]*)$/);
    if (tagMatch && allTags && allTags.length > 0) {
      const coords = getCaretCoordinates(ta);
      setTagState({ active: true, query: tagMatch[1], position: coords });
      setWikiLinkState((prev) => ({ ...prev, active: false }));
      return;
    }

    setWikiLinkState((prev) => ({ ...prev, active: false }));
    setTagState((prev) => ({ ...prev, active: false }));
  }, [allNotes, allTags]);

  const handleWikiSelect = useCallback(
    (title: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const pos = ta.selectionStart;
      const textBefore = ta.value.substring(0, pos);
      const match = textBefore.match(/\[\[([^\]]*)$/);
      if (!match) return;
      const start = pos - match[1].length;
      const newValue = ta.value.substring(0, start) + title + "]]" + ta.value.substring(pos);
      onChange(newValue);
      setWikiLinkState((prev) => ({ ...prev, active: false }));
      setTimeout(() => {
        const newPos = start + title.length + 2;
        ta.focus();
        ta.setSelectionRange(newPos, newPos);
      }, 0);
    },
    [onChange]
  );

  const handleWikiCreate = useCallback(
    (title: string) => {
      handleWikiSelect(title);
      onCreateNote?.(title);
    },
    [handleWikiSelect, onCreateNote]
  );

  const handleTagSelect = useCallback(
    (tag: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const pos = ta.selectionStart;
      const textBefore = ta.value.substring(0, pos);
      const match = textBefore.match(/(?:^|\s)#([\w-]*)$/);
      if (!match) return;
      const start = pos - match[1].length;
      const newValue = ta.value.substring(0, start) + tag + ta.value.substring(pos);
      onChange(newValue);
      setTagState((prev) => ({ ...prev, active: false }));
      setTimeout(() => {
        const newPos = start + tag.length;
        ta.focus();
        ta.setSelectionRange(newPos, newPos);
      }, 0);
    },
    [onChange]
  );

  const toggleHeading = useCallback((headingId: string) => {
    setCollapsedHeadings((prev) => {
      const next = new Set(prev);
      if (next.has(headingId)) {
        next.delete(headingId);
      } else {
        next.add(headingId);
      }
      return next;
    });
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
    <CollapsiblePreview
      source={processedValue}
      collapsedHeadings={collapsedHeadings}
      onToggleHeading={toggleHeading}
    />
  );

  const editorContent = (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onKeyUp={checkAutocomplete}
      onClick={checkAutocomplete}
      disabled={disabled}
      placeholder="Start typing (Markdown supported, use #tags @mentions [[wiki links]])..."
      className="w-full h-full resize-none bg-transparent text-foreground font-mono text-sm p-4 outline-none placeholder:text-muted-foreground/50"
      spellCheck={false}
    />
  );

  const autocompleteOverlays = (
    <>
      {wikiLinkState.active && allNotes && (
        <WikiLinkAutocomplete
          notes={allNotes}
          query={wikiLinkState.query}
          position={wikiLinkState.position}
          onSelect={handleWikiSelect}
          onCreate={handleWikiCreate}
          onClose={() => setWikiLinkState((prev) => ({ ...prev, active: false }))}
        />
      )}
      {tagState.active && allTags && (
        <TagAutocomplete
          tags={allTags}
          query={tagState.query}
          position={tagState.position}
          onSelect={handleTagSelect}
          onClose={() => setTagState((prev) => ({ ...prev, active: false }))}
        />
      )}
    </>
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
            onAiAction={onAiAction}
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
        {autocompleteOverlays}
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
        onAiAction={onAiAction}
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
      {autocompleteOverlays}
    </div>
  );
}

function CollapsiblePreview({
  source,
  collapsedHeadings,
  onToggleHeading,
}: {
  source: string;
  collapsedHeadings: Set<string>;
  onToggleHeading: (id: string) => void;
}) {
  const lines = source.split("\n");

  interface Section {
    level: number;
    id: string;
    headingLine: string;
    contentLines: string[];
  }

  const sections: Section[] = [];
  let currentSection: Section | null = null;
  const preambleLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (currentSection) sections.push(currentSection);
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      currentSection = { level, id: makeHeadingId(level, text), headingLine: line, contentLines: [] };
    } else if (currentSection) {
      currentSection.contentLines.push(line);
    } else {
      preambleLines.push(line);
    }
  }
  if (currentSection) sections.push(currentSection);

  const outputLines: string[] = [...preambleLines];
  const collapsedStack: number[] = [];

  for (const section of sections) {
    while (collapsedStack.length > 0 && collapsedStack[collapsedStack.length - 1] >= section.level) {
      collapsedStack.pop();
    }

    if (collapsedStack.length > 0) {
      continue;
    }

    outputLines.push(section.headingLine);

    if (collapsedHeadings.has(section.id)) {
      collapsedStack.push(section.level);
    } else {
      outputLines.push(...section.contentLines);
    }
  }

  const resultMarkdown = outputLines.join("\n");

  function makeHeadingComponent(level: number) {
    const Tag = `h${level}` as React.ElementType;
    return function HeadingComponent({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
      const text = extractTextFromChildren(children);
      const id = makeHeadingId(level, text);
      const isCollapsed = collapsedHeadings.has(id);
      return (
        <Tag {...(props as Record<string, unknown>)} onClick={() => onToggleHeading(id)} style={{ cursor: "pointer", position: "relative" }}>
          <span style={{ opacity: 0.5, marginRight: "0.4em", fontSize: "0.75em" }}>
            {isCollapsed ? "▶" : "▼"}
          </span>
          {children}
        </Tag>
      );
    };
  }

  return (
    <div className="prose prose-invert prose-sm max-w-none p-4 overflow-y-auto h-full collapsible-preview">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: makeHeadingComponent(1),
          h2: makeHeadingComponent(2),
          h3: makeHeadingComponent(3),
          h4: makeHeadingComponent(4),
          h5: makeHeadingComponent(5),
          h6: makeHeadingComponent(6),
        }}
      >
        {resultMarkdown.trim()}
      </ReactMarkdown>
    </div>
  );
}
