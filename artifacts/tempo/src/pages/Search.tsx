import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGlobalSearch } from "@workspace/api-client-react";
import { Search as SearchIcon, FileText, CheckSquare, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

function excerpt(text: string, maxLen = 120): string {
  if (!text) return "";
  const clean = text.replace(/#+\s/g, "").replace(/\*+/g, "").trim();
  return clean.length > maxLen ? clean.slice(0, maxLen) + "…" : clean;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [, setLocation] = useLocation();

  const { data, isLoading } = useGlobalSearch(
    { q: debouncedQuery },
    { query: { enabled: debouncedQuery.length >= 1 } }
  );

  const notes = data?.notes ?? [];
  const tasks = data?.tasks ?? [];
  const hasResults = notes.length > 0 || tasks.length > 0;
  const hasQuery = debouncedQuery.length >= 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SearchIcon className="text-primary h-8 w-8" />
        <h1 className="text-3xl font-display font-bold text-foreground">Search</h1>
      </div>

      <div className="relative">
        <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          placeholder="Search notes and tasks…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-card border-border"
        />
        {isLoading && (
          <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />
        )}
      </div>

      {hasQuery && !isLoading && hasResults && (
        <p className="text-sm text-muted-foreground">
          {notes.length > 0 && `${notes.length} note${notes.length !== 1 ? "s" : ""}`}
          {notes.length > 0 && tasks.length > 0 && " · "}
          {tasks.length > 0 && `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {hasQuery && !isLoading && !hasResults && (
        <div className="text-center py-16">
          <SearchIcon size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No results for "{debouncedQuery}"</p>
        </div>
      )}

      {!hasQuery && (
        <div className="text-center py-16">
          <SearchIcon size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Type to search across notes and tasks</p>
        </div>
      )}

      <div className="space-y-6">
        {notes.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={12} /> Notes
            </h2>
            <div className="space-y-2">
              {notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => setLocation(`/notes/${note.id}`)}
                  className="w-full text-left bg-card border border-border/50 rounded-xl px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={14} className="text-primary shrink-0" />
                    <span className="font-medium text-foreground truncate">{note.title || "Untitled"}</span>
                    <span className="ml-auto text-[10px] font-medium bg-primary/15 text-primary px-1.5 py-0.5 rounded-full shrink-0">Note</span>
                  </div>
                  {note.content && (
                    <p className="text-sm text-muted-foreground line-clamp-2 ml-5">
                      {excerpt(note.content)}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {tasks.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare size={12} /> Tasks
            </h2>
            <div className="space-y-2">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setLocation(`/tasks/${task.id}`)}
                  className="w-full text-left bg-card border border-border/50 rounded-xl px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckSquare size={14} className="text-blue-400 shrink-0" />
                    <span className="font-medium text-foreground truncate">{task.title || "Untitled"}</span>
                    <span className="ml-auto text-[10px] font-medium bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full shrink-0">Task</span>
                  </div>
                  {task.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2 ml-5">
                      {excerpt(task.notes)}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
