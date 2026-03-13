"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Search,
  FileText,
  CheckSquare,
  Calendar,
  Plus,
  Settings,
  Inbox,
  Sun,
  BookTemplate,
  Filter,
  Hash,
} from "lucide-react";

type QuickAction = {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  category: "action" | "navigate";
};

export function CommandBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const notes = useQuery(api.notes.search, query.length > 0 ? { query } : "skip");
  const allTasks = useQuery(api.tasks.list, {});

  const filteredTasks = (allTasks || [])
    .filter(
      (t) =>
        query.length > 0 &&
        t.title.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setSelectedIndex(0);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const quickActions: QuickAction[] = [
    {
      id: "new-task",
      label: "Create new task",
      icon: <Plus size={16} />,
      action: () => router.push("/inbox"),
      category: "action",
    },
    {
      id: "new-note",
      label: "Create new note",
      icon: <Plus size={16} />,
      action: () => router.push("/notes/new"),
      category: "action",
    },
    {
      id: "nav-today",
      label: "Go to Today",
      icon: <Sun size={16} />,
      action: () => router.push("/today"),
      category: "navigate",
    },
    {
      id: "nav-inbox",
      label: "Go to Inbox",
      icon: <Inbox size={16} />,
      action: () => router.push("/inbox"),
      category: "navigate",
    },
    {
      id: "nav-calendar",
      label: "Go to Calendar",
      icon: <Calendar size={16} />,
      action: () => router.push("/calendar"),
      category: "navigate",
    },
    {
      id: "nav-notes",
      label: "Go to Notes",
      icon: <FileText size={16} />,
      action: () => router.push("/notes"),
      category: "navigate",
    },
    {
      id: "nav-templates",
      label: "Go to Templates",
      icon: <BookTemplate size={16} />,
      action: () => router.push("/templates"),
      category: "navigate",
    },
    {
      id: "nav-filters",
      label: "Go to Filters",
      icon: <Filter size={16} />,
      action: () => router.push("/filters"),
      category: "navigate",
    },
    {
      id: "nav-settings",
      label: "Go to Settings",
      icon: <Settings size={16} />,
      action: () => router.push("/settings"),
      category: "navigate",
    },
  ];

  const filteredActions = query.length === 0
    ? quickActions
    : quickActions.filter((a) =>
        a.label.toLowerCase().includes(query.toLowerCase())
      );

  const allResults = [
    ...filteredTasks.map((t) => ({
      id: `task-${t._id}`,
      type: "task" as const,
      label: t.title,
      action: () => router.push(`/tasks/${t._id}`),
    })),
    ...(notes || []).map((n) => ({
      id: `note-${n._id}`,
      type: "note" as const,
      label: n.title,
      action: () => router.push(`/notes/${n._id}`),
    })),
    ...filteredActions.map((a) => ({
      id: a.id,
      type: "action" as const,
      label: a.label,
      action: a.action,
    })),
  ];

  const totalResults = allResults.length;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(totalResults, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + Math.max(totalResults, 1)) % Math.max(totalResults, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (allResults[selectedIndex]) {
        allResults[selectedIndex].action();
        setOpen(false);
      }
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search notes, tasks, or type a command..."
            className="border-none bg-transparent focus-visible:ring-0 px-0 text-base"
          />
          <kbd className="hidden sm:inline-flex text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto py-2">
          {query.length > 0 && filteredTasks.length > 0 && (
            <div className="px-3 py-1">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-2 mb-1">
                Tasks
              </p>
              {filteredTasks.map((t, i) => (
                <button
                  key={t._id}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left cursor-pointer transition-colors ${i === selectedIndex ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"}`}
                  onClick={() => {
                    router.push(`/tasks/${t._id}`);
                    setOpen(false);
                  }}
                >
                  <CheckSquare size={14} className="shrink-0 text-muted-foreground" />
                  <span className="text-sm truncate">{t.title}</span>
                </button>
              ))}
            </div>
          )}

          {query.length > 0 && notes && notes.length > 0 && (
            <div className="px-3 py-1">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-2 mb-1">
                Notes
              </p>
              {notes.map((n, i) => {
                const idx = filteredTasks.length + i;
                return (
                  <button
                    key={n._id}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left cursor-pointer transition-colors ${idx === selectedIndex ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"}`}
                    onClick={() => {
                      router.push(`/notes/${n._id}`);
                      setOpen(false);
                    }}
                  >
                    <FileText size={14} className="shrink-0 text-muted-foreground" />
                    <span className="text-sm truncate">{n.title}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="px-3 py-1">
            {query.length === 0 && (
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-2 mb-1">
                Quick Actions
              </p>
            )}
            {filteredActions.map((action, i) => {
              const idx = filteredTasks.length + (notes?.length || 0) + i;
              return (
                <button
                  key={action.id}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left cursor-pointer transition-colors ${idx === selectedIndex ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"}`}
                  onClick={() => {
                    action.action();
                    setOpen(false);
                  }}
                >
                  <span className="text-muted-foreground shrink-0">{action.icon}</span>
                  <span className="text-sm">{action.label}</span>
                </button>
              );
            })}
          </div>

          {query.length > 0 && totalResults === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No results found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
