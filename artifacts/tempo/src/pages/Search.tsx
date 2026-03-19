import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  useGlobalSearch,
  useListTasks,
  useListNotes,
  useListProjects,
  useListSavedFilters,
  useCreateSavedFilter,
  useDeleteSavedFilter,
  getListSavedFiltersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Search as SearchIcon,
  FileText,
  CheckSquare,
  Loader2,
  Filter,
  Save,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

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

type StatusFilter = "all" | "inbox" | "today" | "scheduled" | "done" | "cancelled";
type PriorityFilter = "all" | "high" | "medium" | "low";
type TypeFilter = "all" | "tasks" | "notes";

export default function Search() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");

  const hasFilters =
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    typeFilter !== "all" ||
    projectFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    tagFilter !== "";

  const isActive = debouncedQuery.length >= 1 || hasFilters;

  const { data: globalResults, isLoading: globalLoading } = useGlobalSearch(
    { q: debouncedQuery },
    { query: { enabled: debouncedQuery.length >= 1 && !hasFilters } }
  );

  const { data: allTasks, isLoading: tasksLoading } = useListTasks(
    {},
    { query: { enabled: isActive && hasFilters } }
  );

  const { data: allNotes, isLoading: notesLoading } = useListNotes(
    undefined,
    { query: { enabled: hasFilters && typeFilter !== "tasks" } }
  );

  const { data: projects } = useListProjects();
  const { data: savedFilters } = useListSavedFilters();
  const createFilter = useCreateSavedFilter();
  const deleteFilter = useDeleteSavedFilter();

  const isLoading = globalLoading || tasksLoading || notesLoading;

  const filteredTasks = (() => {
    if (!isActive) return [];
    if (typeFilter === "notes") return [];

    if (!hasFilters && debouncedQuery && globalResults) {
      return globalResults.tasks ?? [];
    }

    const source = allTasks || [];
    const hasDateFilter = dateFrom !== "" || dateTo !== "";
    return source.filter((task) => {
      if (debouncedQuery && !task.title.toLowerCase().includes(debouncedQuery.toLowerCase())) return false;
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
      if (projectFilter !== "all" && String(task.projectId ?? "") !== projectFilter) return false;
      if (hasDateFilter && !task.scheduledDate) return false;
      if (dateFrom && task.scheduledDate && task.scheduledDate < dateFrom) return false;
      if (dateTo && task.scheduledDate && task.scheduledDate > dateTo) return false;
      if (tagFilter) {
        const tf = tagFilter.toLowerCase();
        if (!task.tags.some((t) => t.toLowerCase().includes(tf))) return false;
      }
      return true;
    });
  })();

  const filteredNotes = (() => {
    if (!isActive) return [];
    if (typeFilter === "tasks") return [];

    if (!hasFilters) {
      return globalResults?.notes ?? [];
    }

    const source = allNotes || [];
    const q = debouncedQuery.toLowerCase();
    return source.filter((note) => {
      if (q && !(note.title || "").toLowerCase().includes(q) && !(note.content || "").toLowerCase().includes(q)) return false;
      if (tagFilter) {
        const tf = tagFilter.toLowerCase();
        const content = (note.content || "").toLowerCase();
        if (!content.includes(`#${tf}`)) return false;
      }
      return true;
    });
  })();

  const hasResults = filteredNotes.length > 0 || filteredTasks.length > 0;

  const clearFilters = useCallback(() => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setTypeFilter("all");
    setProjectFilter("all");
    setDateFrom("");
    setDateTo("");
    setTagFilter("");
  }, []);

  const loadSavedFilter = (conditions: Array<Record<string, unknown>>) => {
    for (const cond of conditions) {
      const field = cond.field as string;
      const value = cond.value as string;
      if (field === "status") setStatusFilter((value || "all") as StatusFilter);
      if (field === "priority") setPriorityFilter((value || "all") as PriorityFilter);
      if (field === "type") setTypeFilter((value || "all") as TypeFilter);
      if (field === "project") setProjectFilter(value || "all");
      if (field === "dateFrom") setDateFrom(value || "");
      if (field === "dateTo") setDateTo(value || "");
      if (field === "tag") setTagFilter(value || "");
      if (field === "query") setQuery(value || "");
    }
    setShowFilters(true);
  };

  const handleSaveFilter = async () => {
    if (!saveName.trim()) return;
    try {
      await createFilter.mutateAsync({
        data: {
          name: saveName,
          conditions: [
            { field: "query", value: query },
            { field: "status", value: statusFilter },
            { field: "priority", value: priorityFilter },
            { field: "type", value: typeFilter },
            { field: "project", value: projectFilter },
            { field: "dateFrom", value: dateFrom },
            { field: "dateTo", value: dateTo },
            { field: "tag", value: tagFilter },
          ],
        },
      });
      queryClient.invalidateQueries({ queryKey: getListSavedFiltersQueryKey() });
      setSaveName("");
      setSaveDialogOpen(false);
      toast({ title: "Search saved" });
    } catch {
      toast({ variant: "destructive", title: "Failed to save search" });
    }
  };

  const handleDeleteFilter = async (id: number) => {
    try {
      await deleteFilter.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListSavedFiltersQueryKey() });
    } catch {
      toast({ variant: "destructive", title: "Failed to delete saved search" });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <SearchIcon className="text-primary h-8 w-8" />
        <h1 className="text-3xl font-display font-bold text-foreground">Search</h1>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search notes and tasks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-28 bg-card border-border"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {isLoading && <Loader2 size={14} className="text-muted-foreground animate-spin" />}
            <Button
              variant={showFilters ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2 gap-1 text-xs"
              onClick={() => setShowFilters((v) => !v)}
            >
              <Filter size={12} />
              Filters
              {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary ml-0.5" />}
              {showFilters ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Show</label>
                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tasks & Notes</SelectItem>
                    <SelectItem value="tasks">Tasks only</SelectItem>
                    <SelectItem value="notes">Notes only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Task Status</label>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any status</SelectItem>
                    <SelectItem value="inbox">Inbox</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Priority</label>
                <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as PriorityFilter)}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {projects && projects.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">Project</label>
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any project</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Scheduled from</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-8 text-xs bg-background"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Scheduled to</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-8 text-xs bg-background"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-medium">Tag</label>
                <Input
                  placeholder="Filter by tag"
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="h-8 text-xs bg-background"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              {hasFilters ? (
                <Button variant="ghost" size="sm" className="text-xs h-7 gap-1" onClick={clearFilters}>
                  <X size={12} /> Clear filters
                </Button>
              ) : (
                <span />
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 gap-1"
                onClick={() => setSaveDialogOpen(true)}
              >
                <Save size={12} /> Save Search
              </Button>
            </div>
          </div>
        )}
      </div>

      {savedFilters && savedFilters.length > 0 && (
        <div className="space-y-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Saved Searches
          </label>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map((sf: { id: number; name: string; conditions: Array<Record<string, unknown>> }) => (
              <div key={sf.id} className="flex items-center gap-0.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs rounded-r-none border-r-0"
                  onClick={() => loadSavedFilter(sf.conditions)}
                >
                  {sf.name}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-l-none text-destructive hover:text-destructive"
                  onClick={() => handleDeleteFilter(sf.id)}
                >
                  <Trash2 size={11} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isActive && !isLoading && (
        <p className="text-sm text-muted-foreground">
          {filteredNotes.length > 0 && `${filteredNotes.length} note${filteredNotes.length !== 1 ? "s" : ""}`}
          {filteredNotes.length > 0 && filteredTasks.length > 0 && " · "}
          {filteredTasks.length > 0 && `${filteredTasks.length} task${filteredTasks.length !== 1 ? "s" : ""}`}
          {!hasResults && "No results found"}
        </p>
      )}

      {!isActive && (
        <div className="text-center py-16">
          <SearchIcon size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">Type to search, or open filters to browse</p>
        </div>
      )}

      <div className="space-y-6">
        {filteredNotes.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={12} /> Notes
            </h2>
            <div className="space-y-2">
              {filteredNotes.map((note) => (
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
                    <p className="text-sm text-muted-foreground line-clamp-2 ml-5">{excerpt(note.content)}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredTasks.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare size={12} /> Tasks
            </h2>
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setLocation(`/tasks/${task.id}`)}
                  className="w-full text-left bg-card border border-border/50 rounded-xl px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckSquare size={14} className={task.status === "done" ? "text-primary shrink-0" : "text-blue-400 shrink-0"} />
                    <span className={`font-medium truncate ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.title}
                    </span>
                    <span className="ml-auto text-[10px] font-medium bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full shrink-0">Task</span>
                  </div>
                  <div className="flex gap-2 ml-5">
                    <span className={`text-[10px] ${
                      task.priority === "high" ? "text-red-400" : task.priority === "medium" ? "text-amber-400" : "text-blue-400"
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{task.status}</span>
                    {task.scheduledDate && (
                      <span className="text-[10px] text-muted-foreground">{task.scheduledDate}</span>
                    )}
                    {task.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] text-primary/70">#{tag}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Save Search</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Input
              autoFocus
              placeholder="Search name"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveFilter()}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSaveFilter} disabled={!saveName.trim() || createFilter.isPending}>
                {createFilter.isPending ? <Loader2 size={14} className="animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
