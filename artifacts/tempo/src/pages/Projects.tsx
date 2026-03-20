import { useState, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { useListProjects, useCreateProject, useListTasks, useUpdateProject, useReorderProjects, getListProjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { FolderGit2, Plus, ChevronRight, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ViewToggle } from "@/components/ViewToggle";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { KanbanBoard, type KanbanColumn } from "@/components/KanbanBoard";
import { useViewPreference } from "@/hooks/useViewPreference";
import type { Project } from "@workspace/api-client-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableProjectCard({ project, getTaskCounts, onClick }: { project: Project; getTaskCounts: (id: number) => { total: number; done: number }; onClick: () => void }) {
  const counts = getTaskCounts(project.id);
  const progress = counts.total > 0 ? (counts.done / counts.total) * 100 : 0;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(project.id) });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="glass border-border/50 hover:border-primary/30 transition-colors cursor-pointer group">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 -ml-2 touch-none"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical size={16} />
              </button>
              <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: project.color || "#6C63FF" }} onClick={onClick} />
              <div onClick={onClick}>
                <h3 className="font-semibold text-lg">{project.name}</h3>
                {project.description && <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>}
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" onClick={onClick} />
          </div>
          {counts.total > 0 && (
            <div className="mt-3 flex items-center gap-3" onClick={onClick}>
              <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-muted-foreground">{counts.done}/{counts.total}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Projects() {
  const [, setLocation] = useLocation();
  const { data: projects, isLoading } = useListProjects();
  const { data: tasks } = useListTasks();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const reorderProjects = useReorderProjects();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#C96442");
  const [description, setDescription] = useState("");
  const [viewMode, setViewMode] = useViewPreference("projects");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createProject.mutateAsync({
        data: { name, color, description, status: "active" }
      });
      setOpen(false);
      setName("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      toast({ title: "Project created" });
    } catch {
      toast({ variant: "destructive", title: "Failed to create project" });
    }
  };

  const getTaskCounts = useCallback((projectId: number) => {
    const projectTasks = tasks?.filter(t => t.projectId === projectId) || [];
    const done = projectTasks.filter(t => t.status === "done").length;
    return { total: projectTasks.length, done };
  }, [tasks]);

  const allProjects = projects || [];
  const active = allProjects.filter(p => p.status === "active");
  const archived = allProjects.filter(p => p.status === "archived");

  const kanbanColumns: KanbanColumn<Project>[] = useMemo(() => [
    { id: "active", title: "Active", items: active },
    { id: "archived", title: "Archived", items: archived },
  ], [active, archived]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active: dragActive, over } = event;
    if (!over || dragActive.id === over.id) return;

    const oldIndex = active.findIndex(p => String(p.id) === String(dragActive.id));
    const newIndex = active.findIndex(p => String(p.id) === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(active, oldIndex, newIndex);
    try {
      await reorderProjects.mutateAsync({
        data: { projectIds: newOrder.map(p => p.id) },
      });
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
    } catch {
      toast({ variant: "destructive", title: "Failed to reorder projects" });
    }
  }, [active, reorderProjects, queryClient, toast]);

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderGit2 className="text-success h-8 w-8" />
            <h1 className="text-3xl font-display font-bold">Projects</h1>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass border-border/50 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-56 mt-2" />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Skeleton className="h-1.5 flex-1 rounded-full" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const colors = ["#C96442", "#6B9E7D", "#C9A54E", "#B85450", "#9D7E6C", "#5B8A9A", "#B07398", "#5A8F6E"];

  const handleProjectListDragEnd = handleDragEnd;

  const handleKanbanDragEnd = async (itemId: string, _from: string, to: string) => {
    const projectId = parseInt(itemId, 10);
    const newStatus = to as "active" | "archived";
    try {
      await updateProject.mutateAsync({ id: projectId, data: { status: newStatus } });
      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
    } catch {}
  };

  const tableColumns: DataTableColumn<Project>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color || "#C96442" }} />
          <span className="font-medium text-foreground">{p.name}</span>
        </div>
      ),
      sortValue: (p) => p.name,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (p) => (
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          p.status === "active"
            ? "bg-success/10 text-success"
            : "bg-muted text-muted-foreground"
        }`}>
          {p.status}
        </span>
      ),
      sortValue: (p) => p.status,
    },
    {
      key: "taskCount",
      label: "Tasks",
      sortable: true,
      render: (p) => {
        const counts = getTaskCounts(p.id);
        return <span className="text-muted-foreground text-xs">{counts.total}</span>;
      },
      sortValue: (p) => getTaskCounts(p.id).total,
    },
    {
      key: "progress",
      label: "% Complete",
      sortable: true,
      render: (p) => {
        const counts = getTaskCounts(p.id);
        const pct = counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-muted-foreground text-xs">{pct}%</span>
          </div>
        );
      },
      sortValue: (p) => {
        const counts = getTaskCounts(p.id);
        return counts.total > 0 ? (counts.done / counts.total) * 100 : 0;
      },
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (p) => (
        <span className="text-muted-foreground text-xs">{new Date(p.createdAt).toLocaleDateString()}</span>
      ),
      sortValue: (p) => new Date(p.createdAt).getTime(),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderGit2 className="text-success h-8 w-8" />
          <h1 className="text-3xl font-display font-bold">Projects</h1>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle current={viewMode} onChange={setViewMode} />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2"><Plus size={16} /> New Project</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle>Create Project</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Project name"
                  className="bg-background"
                  autoFocus
                />
                <Input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Short description (optional)"
                  className="bg-background"
                />
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? "border-white scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={!name.trim() || createProject.isPending}>
                  Create
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {viewMode === "list" && (
        <>
          {active.length === 0 && archived.length === 0 ? (
            <div className="text-center py-12">
              <FolderGit2 className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-30" />
              <p className="text-muted-foreground mb-4">No projects yet.</p>
              <Button variant="outline" onClick={() => setOpen(true)}>Create your first project</Button>
            </div>
          ) : (
            <>
              {active.length > 0 && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={active.map(p => String(p.id))} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {active.map(project => (
                        <SortableProjectCard
                          key={project.id}
                          project={project}
                          getTaskCounts={getTaskCounts}
                          onClick={() => setLocation(`/projects/${project.id}`)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
              {archived.length > 0 && (
                <div className="space-y-3 pt-4">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Archived</h2>
                  {archived.map(project => (
                    <Card
                      key={project.id}
                      className="glass border-border/30 opacity-60 cursor-pointer"
                      onClick={() => setLocation(`/projects/${project.id}`)}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color || "#C96442" }} />
                        <span className="text-sm">{project.name}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {viewMode === "kanban" && (
        <KanbanBoard
          columns={kanbanColumns}
          renderCard={(project: Project) => {
            const counts = getTaskCounts(project.id);
            const progress = counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0;
            return (
              <div
                onClick={() => setLocation(`/projects/${project.id}`)}
                className="glass p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-all border border-border/50"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: project.color || "#C96442" }} />
                  <h4 className="text-sm font-medium text-foreground truncate">{project.name}</h4>
                </div>
                {project.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{project.description}</p>
                )}
                {counts.total > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{progress}%</span>
                  </div>
                )}
              </div>
            );
          }}
        />
      )}
    </div>
  );
}
