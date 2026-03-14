import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useGlobalSearch, useListNotes, useListProjects, Note, Task, Project } from "@workspace/api-client-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  FileText, CheckCircle2, Calendar, Filter, LayoutTemplate, StickyNote,
  Search, FolderKanban, FolderOpen, Tag, Brain, Timer,
  Home, Sun, Inbox, Sparkles, Plus, Wand2, ListChecks, ClipboardList, Mic
} from "lucide-react";

interface CommandBarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const GO_TO_ACTIONS = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Today", icon: Sun, path: "/today" },
  { label: "Inbox", icon: Inbox, path: "/inbox" },
  { label: "Calendar", icon: Calendar, path: "/calendar" },
  { label: "Notes", icon: FileText, path: "/notes" },
  { label: "Projects", icon: FolderKanban, path: "/projects" },
  { label: "Areas / Folders", icon: FolderOpen, path: "/folders" },
  { label: "Tags", icon: Tag, path: "/tags" },
  { label: "Daily Plan", icon: Calendar, path: "/plan" },
  { label: "Focus Timer", icon: Timer, path: "/focus" },
  { label: "AI Chat", icon: Sparkles, path: "/chat" },
  { label: "AI Memory", icon: Brain, path: "/memories" },
  { label: "Period Notes", icon: StickyNote, path: "/period-notes" },
  { label: "Task Filters", icon: Filter, path: "/filters" },
  { label: "Templates", icon: LayoutTemplate, path: "/templates" },
  { label: "New Note", icon: Plus, path: "/notes/new" },
];

const AI_COMMANDS = [
  { label: "Plan My Day", icon: Wand2, path: "/chat?action=plan" },
  { label: "Extract Tasks", icon: ListChecks, path: "/chat?action=extract" },
  { label: "Summarize Note", icon: ClipboardList, path: "/chat?action=summarize" },
  { label: "Quick Capture", icon: Mic, path: "/chat?action=capture" },
];

export default function CommandBar({ open: controlledOpen, onOpenChange: controlledOnOpenChange }: CommandBarProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [, setLocation] = useLocation();
  const listRef = useRef<HTMLDivElement>(null);

  const { data: searchResults } = useGlobalSearch(
    { q: query },
    { query: { enabled: query.length >= 2 } }
  );

  const { data: recentNotes } = useListNotes(
    undefined,
    { query: { enabled: open && query.length < 2 } }
  );

  const { data: allProjects } = useListProjects(
    undefined,
    { query: { enabled: open } }
  );

  const recentNotesList = (recentNotes || [])
    .sort((a: Note, b: Note) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);

  const filteredProjects = query.length >= 2
    ? (allProjects || []).filter((p: Project) => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  const navigate = useCallback((path: string) => {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
    setLocation(path);
  }, [setLocation, setOpen]);

  const filteredGoTo = query
    ? GO_TO_ACTIONS.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()))
    : GO_TO_ACTIONS.slice(0, 8);

  const filteredCommands = query
    ? AI_COMMANDS.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()))
    : AI_COMMANDS;

  const allItems: { label: string; path: string; type: string }[] = [];

  if (filteredGoTo.length > 0) {
    filteredGoTo.forEach(a => allItems.push({ label: a.label, path: a.path, type: "goto" }));
  }
  if (query.length < 2 && recentNotesList.length > 0) {
    recentNotesList.forEach((n: Note) => allItems.push({ label: n.title, path: `/notes/${n.id}`, type: "recent_note" }));
  }
  if (searchResults?.notes && searchResults.notes.length > 0) {
    searchResults.notes.forEach((n: Note) => allItems.push({ label: n.title, path: `/notes/${n.id}`, type: "note" }));
  }
  if (searchResults?.tasks && searchResults.tasks.length > 0) {
    searchResults.tasks.forEach((t: Task) => allItems.push({ label: t.title, path: `/tasks/${t.id}`, type: "task" }));
  }
  if (filteredProjects.length > 0) {
    filteredProjects.forEach((p: Project) => allItems.push({ label: p.name, path: `/projects/${p.id}`, type: "project" }));
  }
  if (filteredCommands.length > 0) {
    filteredCommands.forEach(a => allItems.push({ label: a.label, path: a.path, type: "command" }));
  }

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && allItems[selectedIndex]) {
      e.preventDefault();
      navigate(allItems[selectedIndex].path);
    }
  };

  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector('[data-selected="true"]');
      selected?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  let currentIdx = 0;
  const renderItem = (label: string, path: string, icon: React.ReactNode) => {
    const idx = currentIdx++;
    const isSelected = idx === selectedIndex;
    return (
      <button
        key={path + label}
        data-selected={isSelected}
        onClick={() => navigate(path)}
        onMouseEnter={() => setSelectedIndex(idx)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
          isSelected ? "bg-muted" : "hover:bg-muted/50"
        }`}
      >
        {icon}
        <span className="truncate">{label}</span>
      </button>
    );
  };

  const renderSectionHeader = (title: string) => (
    <p key={`header-${title}`} className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 mb-1 mt-2 first:mt-0">{title}</p>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setQuery(""); setSelectedIndex(0); } }}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0">
        <div className="flex items-center gap-2 px-4 border-b border-border">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search or jump to..."
            className="border-none bg-transparent focus-visible:ring-0 text-base h-12"
            autoFocus
          />
          <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0">ESC</kbd>
        </div>

        <div className="px-4 py-1.5 border-b border-border">
          <p className="text-[10px] text-muted-foreground">
            Tip: <code className="bg-muted px-1 rounded">is:open date:today #tag</code> for advanced filters
          </p>
        </div>

        <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
          {filteredGoTo.length > 0 && (
            <div className="mb-2">
              {renderSectionHeader("Go to")}
              {filteredGoTo.map((action) =>
                renderItem(action.label, action.path, <action.icon size={16} className="text-muted-foreground" />)
              )}
            </div>
          )}

          {query.length < 2 && recentNotesList.length > 0 && (
            <div className="mb-2">
              {renderSectionHeader("Recent Notes")}
              {recentNotesList.map((note: Note) =>
                renderItem(note.title, `/notes/${note.id}`, <FileText size={16} className="text-primary" />)
              )}
            </div>
          )}

          {searchResults?.notes && searchResults.notes.length > 0 && (
            <div className="mb-2">
              {renderSectionHeader("Notes")}
              {searchResults.notes.map((note: Note) =>
                renderItem(note.title, `/notes/${note.id}`, <FileText size={16} className="text-primary" />)
              )}
            </div>
          )}

          {searchResults?.tasks && searchResults.tasks.length > 0 && (
            <div className="mb-2">
              {renderSectionHeader("Tasks")}
              {searchResults.tasks.map((task: Task) =>
                renderItem(task.title, `/tasks/${task.id}`, <CheckCircle2 size={16} className="text-amber-400" />)
              )}
            </div>
          )}

          {filteredProjects.length > 0 && (
            <div className="mb-2">
              {renderSectionHeader("Projects")}
              {filteredProjects.map((project: Project) =>
                renderItem(project.name, `/projects/${project.id}`, <FolderKanban size={16} className="text-teal-400" />)
              )}
            </div>
          )}

          {filteredCommands.length > 0 && (
            <div className="mb-2">
              {renderSectionHeader("Commands")}
              {filteredCommands.map((action) =>
                renderItem(action.label, action.path, <action.icon size={16} className="text-primary" />)
              )}
            </div>
          )}

          {query.length >= 2 && allItems.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-6">No results found</p>
          )}
        </div>

        <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground">
          <span>↑↓ navigate</span>
          <span>Enter select</span>
          <span>Esc close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}