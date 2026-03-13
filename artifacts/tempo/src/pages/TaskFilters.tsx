import { useState } from "react";
import { useLocation } from "wouter";
import {
  useListTasks,
  useListSavedFilters,
  useCreateSavedFilter,
  useDeleteSavedFilter,
  getListSavedFiltersQueryKey,
  ListTasksStatus,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Filter, Save, Trash2, CheckCircle2 } from "lucide-react";

type TaskStatus = "inbox" | "today" | "scheduled" | "done" | "cancelled";
type TaskPriority = "high" | "medium" | "low";

function isValidStatus(s: string): s is TaskStatus {
  return ["inbox", "today", "scheduled", "done", "cancelled"].includes(s);
}

export default function TaskFilters() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState("");

  const statusParam = isValidStatus(statusFilter) ? statusFilter as typeof ListTasksStatus[keyof typeof ListTasksStatus] : undefined;
  const { data: tasks } = useListTasks(statusParam ? { status: statusParam } : {});
  const { data: savedFilters } = useListSavedFilters();
  const createFilter = useCreateSavedFilter();
  const deleteFilter = useDeleteSavedFilter();

  let filteredTasks = tasks || [];
  if (priorityFilter !== "all") {
    filteredTasks = filteredTasks.filter((t: { priority: string }) => t.priority === priorityFilter);
  }
  if (searchFilter) {
    const s = searchFilter.toLowerCase();
    filteredTasks = filteredTasks.filter((t: { title: string }) => t.title.toLowerCase().includes(s));
  }

  const handleSaveFilter = async () => {
    if (!filterName) return;
    try {
      const conditions: Array<Record<string, unknown>> = [
        { field: "status", value: statusFilter },
        { field: "priority", value: priorityFilter },
        { field: "search", value: searchFilter },
      ];
      await createFilter.mutateAsync({
        data: {
          name: filterName,
          conditions,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListSavedFiltersQueryKey() });
      setFilterName("");
      setSaveDialogOpen(false);
      toast({ title: "Filter saved" });
    } catch {
      toast({ variant: "destructive", title: "Failed to save filter" });
    }
  };

  const handleLoadFilter = (conditions: Array<Record<string, unknown>>) => {
    for (const cond of conditions) {
      const field = cond.field as string;
      const value = cond.value as string;
      if (field === "status") setStatusFilter(value || "all");
      if (field === "priority") setPriorityFilter(value || "all");
      if (field === "search") setSearchFilter(value || "");
    }
  };

  const handleDeleteFilter = async (id: number) => {
    try {
      await deleteFilter.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListSavedFiltersQueryKey() });
    } catch {
      toast({ variant: "destructive", title: "Failed to delete filter" });
    }
  };

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Filter size={24} className="text-primary" /> Task Filters
        </h1>
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1"><Save size={14} /> Save Filter</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Save Current Filter</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Filter name" value={filterName} onChange={(e) => setFilterName(e.target.value)} />
              <Button className="w-full" onClick={handleSaveFilter} disabled={createFilter.isPending}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {savedFilters && savedFilters.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Saved Filters</label>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map((sf: { id: number; name: string; conditions: Array<Record<string, unknown>> }) => (
              <div key={sf.id} className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleLoadFilter(sf.conditions)}
                >
                  {sf.name}
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteFilter(sf.id)}>
                  <Trash2 size={12} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <Input
          placeholder="Search tasks..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="inbox">Inbox</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Priority</label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">{filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}</div>

      <div className="space-y-2">
        {filteredTasks.map((task: { id: number; title: string; status: string; priority: string; scheduledDate?: string | null }) => (
          <button
            key={task.id}
            onClick={() => setLocation(`/tasks/${task.id}`)}
            className="w-full text-left p-3 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2
                size={18}
                className={task.status === "done" ? "text-green-400" : "text-muted-foreground"}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </p>
                <div className="flex gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{task.status}</span>
                  <span className={`text-[10px] ${task.priority === "high" ? "text-red-400" : task.priority === "medium" ? "text-amber-400" : "text-blue-400"}`}>
                    {task.priority}
                  </span>
                  {task.scheduledDate && <span className="text-[10px] text-muted-foreground">{task.scheduledDate}</span>}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
