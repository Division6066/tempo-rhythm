import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useGlobalSearch, Note, Task } from "@workspace/api-client-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FileText, CheckCircle2, Calendar, Filter, LayoutTemplate, StickyNote, Search } from "lucide-react";

const QUICK_ACTIONS = [
  { label: "Calendar", icon: Calendar, path: "/calendar" },
  { label: "Period Notes", icon: StickyNote, path: "/period-notes" },
  { label: "Task Filters", icon: Filter, path: "/filters" },
  { label: "Templates", icon: LayoutTemplate, path: "/templates" },
  { label: "Notes", icon: FileText, path: "/notes" },
  { label: "New Note", icon: FileText, path: "/notes/new" },
];

export default function CommandBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: searchResults } = useGlobalSearch(
    { q: query },
    { query: { enabled: query.length >= 2 } }
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const navigate = useCallback((path: string) => {
    setOpen(false);
    setQuery("");
    setLocation(path);
  }, [setLocation]);

  const filteredActions = query
    ? QUICK_ACTIONS.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()))
    : QUICK_ACTIONS;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg p-0 gap-0">
        <div className="flex items-center gap-2 px-4 border-b border-border">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or jump to..."
            className="border-none bg-transparent focus-visible:ring-0 text-base h-12"
            autoFocus
          />
          <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredActions.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 mb-1">Quick Actions</p>
              {filteredActions.map((action) => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-sm text-left"
                >
                  <action.icon size={16} className="text-muted-foreground" />
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {searchResults?.notes && searchResults.notes.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 mb-1">Notes</p>
              {searchResults.notes.map((note: Note) => (
                <button
                  key={note.id}
                  onClick={() => navigate(`/notes/${note.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-sm text-left"
                >
                  <FileText size={16} className="text-primary" />
                  <span className="truncate">{note.title}</span>
                </button>
              ))}
            </div>
          )}

          {searchResults?.tasks && searchResults.tasks.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 mb-1">Tasks</p>
              {searchResults.tasks.map((task: Task) => (
                <button
                  key={task.id}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-sm text-left"
                >
                  <CheckCircle2 size={16} className="text-amber-400" />
                  <span className="truncate">{task.title}</span>
                </button>
              ))}
            </div>
          )}

          {query.length >= 2 && !searchResults?.notes?.length && !searchResults?.tasks?.length && filteredActions.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-6">No results found</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
