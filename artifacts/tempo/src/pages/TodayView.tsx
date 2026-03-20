import { useState, useMemo, useCallback, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useListTasks, useUpdateTask, useCreateTask, useAiPrioritize, getListTasksQueryKey, Task } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw } from "lucide-react";
import TaskCard from "@/components/TaskCard";
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors, DragOverlay, DragStartEvent, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { AlertTriangle, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type PrioritySection = "high" | "medium" | "low";
type ScoreMap = Record<number, { score: number; reason: string }>;

function DroppableSection({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[40px] rounded-lg transition-colors ${isOver ? "bg-primary/5 ring-1 ring-primary/20" : ""}`}
    >
      {children}
    </div>
  );
}

function applySectionOrder(tasks: Task[], orderMap: Record<PrioritySection, number[]>, section: PrioritySection): Task[] {
  const order = orderMap[section];
  if (!order || order.length === 0) return tasks;
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const ordered: Task[] = [];
  for (const id of order) {
    const task = taskMap.get(id);
    if (task) {
      ordered.push(task);
      taskMap.delete(id);
    }
  }
  for (const task of taskMap.values()) {
    ordered.push(task);
  }
  return ordered;
}

export default function TodayView() {
  const { data: todayActive, isLoading: loadingActive } = useListTasks({ status: "today" });
  const { data: todayDone, isLoading: loadingDone } = useListTasks({ status: "done" });
  const prioritize = useAiPrioritize();
  const updateTask = useUpdateTask();
  const createTask = useCreateTask();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [aiSortedIds, setAiSortedIds] = useState<number[] | null>(null);
  const [aiScores, setAiScores] = useState<ScoreMap>({});
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [addingInSection, setAddingInSection] = useState<PrioritySection | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [activeDragId, setActiveDragId] = useState<number | null>(null);
  const [sectionOrder, setSectionOrder] = useState<Record<PrioritySection, number[]>>({
    high: [],
    medium: [],
    low: [],
  });
  const isCancellingRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const isLoading = loadingActive || loadingDone;
  const activeTasks = todayActive || [];
  const doneTasks = todayDone || [];
  const todayTasks = [...activeTasks, ...doneTasks];
  const completedCount = doneTasks.length;
  const progress = todayTasks.length > 0 ? (completedCount / todayTasks.length) * 100 : 0;

  const today = new Date(new Date().toDateString());

  const overdueTasks = activeTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < today
  );
  const nonOverdueTasks = activeTasks.filter(
    (t) => !t.dueDate || new Date(t.dueDate) >= today
  );

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    todayTasks.forEach((t) => t.tags?.forEach((tag: string) => tags.add(tag)));
    return Array.from(tags);
  }, [todayTasks]);

  const allProjects = useMemo(() => {
    const projects = new Set<string>();
    todayTasks.forEach((t) => {
      if (t.projectId) projects.add(String(t.projectId));
    });
    return Array.from(projects);
  }, [todayTasks]);

  const filterTasks = useCallback(
    (tasks: Task[]) => {
      if (activeFilter === "all") return tasks;
      if (activeFilter.startsWith("tag:")) {
        const tag = activeFilter.slice(4);
        return tasks.filter((t) => t.tags?.includes(tag));
      }
      if (activeFilter.startsWith("project:")) {
        const pid = activeFilter.slice(8);
        return tasks.filter((t) => String(t.projectId) === pid);
      }
      return tasks;
    },
    [activeFilter]
  );

  const filteredOverdue = filterTasks(overdueTasks);
  const rawHigh = filterTasks(nonOverdueTasks.filter((t) => t.priority === "high"));
  const rawMedium = filterTasks(nonOverdueTasks.filter((t) => t.priority === "medium"));
  const rawLow = filterTasks(nonOverdueTasks.filter((t) => t.priority === "low"));
  const completed = filterTasks(doneTasks);

  const highPriority = applySectionOrder(rawHigh, sectionOrder, "high");
  const mediumPriority = applySectionOrder(rawMedium, sectionOrder, "medium");
  const lowPriority = applySectionOrder(rawLow, sectionOrder, "low");

  const activeTask = activeDragId
    ? todayTasks.find((t) => t.id === activeDragId) || null
    : null;

  const getSectionTasks = (section: PrioritySection): Task[] => {
    switch (section) {
      case "high": return highPriority;
      case "medium": return mediumPriority;
      case "low": return lowPriority;
    }
  };

  const findSectionForTask = (taskId: number): PrioritySection | null => {
    if (highPriority.some((t) => t.id === taskId)) return "high";
    if (mediumPriority.some((t) => t.id === taskId)) return "medium";
    if (lowPriority.some((t) => t.id === taskId)) return "low";
    if (filteredOverdue.some((t) => t.id === taskId)) {
      const task = filteredOverdue.find((t) => t.id === taskId);
      return (task?.priority as PrioritySection) || "high";
    }
    return null;
  };

  const resolveDropTarget = (id: string | number): PrioritySection | null => {
    if (typeof id === "string" && id.startsWith("section-")) {
      return id.replace("section-", "") as PrioritySection;
    }
    return findSectionForTask(id as number);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as number);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;
    const sourceSection = findSectionForTask(activeId);
    const targetSection = resolveDropTarget(overId);

    if (!sourceSection || !targetSection) return;

    if (sourceSection === targetSection && typeof overId === "number" && activeId !== overId) {
      const sectionTasks = getSectionTasks(sourceSection);
      const ids = sectionTasks.map((t) => t.id);
      const oldIndex = ids.indexOf(activeId);
      const newIndex = ids.indexOf(overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(ids, oldIndex, newIndex);
        setSectionOrder((prev) => ({
          ...prev,
          [sourceSection]: newOrder,
        }));
      }
    } else if (sourceSection !== targetSection) {
      setSectionOrder((prev) => ({
        ...prev,
        [sourceSection]: prev[sourceSection].filter((id) => id !== activeId),
      }));
      await updateTask.mutateAsync({
        id: activeId,
        data: { priority: targetSection },
      });
      queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
    }
  };

  const handleInlineAdd = async (priority: PrioritySection) => {
    if (isCancellingRef.current) {
      isCancellingRef.current = false;
      return;
    }
    if (!newTaskTitle.trim()) {
      setAddingInSection(null);
      setNewTaskTitle("");
      return;
    }
    await createTask.mutateAsync({
      data: {
        title: newTaskTitle.trim(),
        status: "today",
        priority,
      },
    });
    queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
    setNewTaskTitle("");
    setAddingInSection(null);
  };

  const handleCancelAdd = () => {
    isCancellingRef.current = true;
    setAddingInSection(null);
    setNewTaskTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, priority: PrioritySection) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleInlineAdd(priority);
    } else if (e.key === "Escape") {
      handleCancelAdd();
    }
  };

  const handleAiPrioritize = useCallback(async () => {
    if (activeTasks.length === 0) return;
    try {
      const res = await prioritize.mutateAsync({
        data: {
          tasks: activeTasks.map(t => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            estimatedMinutes: t.estimatedMinutes,
          })),
        },
      });
      setAiSortedIds(res.orderedTaskIds);
      const scoreMap: ScoreMap = {};
      if (res.scores) {
        for (const s of res.scores) {
          scoreMap[s.taskId] = { score: s.score, reason: s.reason };
        }
      }
      setAiScores(scoreMap);
    } catch {
      toast({ variant: "destructive", title: "AI prioritization failed" });
    }
  }, [activeTasks, prioritize, toast]);

  const resetSort = useCallback(() => {
    setAiSortedIds(null);
    setAiScores({});
  }, []);

  const sortedActiveTasks = aiSortedIds
    ? aiSortedIds
        .map(id => activeTasks.find(t => t.id === id))
        .filter((t): t is Task => !!t)
        .concat(activeTasks.filter(t => !aiSortedIds.includes(t.id)))
    : null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-32 mb-2" />
          <div className="flex items-center gap-4 mb-2">
            <Skeleton className="h-2 flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        {["High Priority", "Medium Priority", "Low Priority"].map((label) => (
          <div key={label} className="space-y-3">
            <Skeleton className="h-4 w-24" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex items-center gap-2 ml-8">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  const filterChips = [
    { label: "All", value: "all" },
    ...allTags.map((tag) => ({ label: tag, value: `tag:${tag}` })),
    ...allProjects.map((pid) => ({ label: `Project ${pid}`, value: `project:${pid}` })),
  ];

  const renderInlineAdd = (priority: PrioritySection) => {
    if (addingInSection === priority) {
      return (
        <div className="glass p-3 rounded-xl flex items-center gap-3 border border-primary/30">
          <Plus className="h-4 w-4 text-primary" />
          <input
            autoFocus
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
            placeholder="Task title..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, priority)}
            onBlur={() => handleInlineAdd(priority)}
          />
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              handleCancelAdd();
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={() => {
          setAddingInSection(priority);
          setNewTaskTitle("");
        }}
        className="w-full flex items-center gap-2 p-3 rounded-xl text-sm text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/30 transition-colors border border-dashed border-border/30 hover:border-border/60"
      >
        <Plus className="h-4 w-4" />
        Add task
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-display font-bold text-foreground">Today</h1>
          <div className="flex items-center gap-2">
            {aiSortedIds && (
              <button
                onClick={resetSort}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={12} /> Reset to manual order
              </button>
            )}
            {activeTasks.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleAiPrioritize}
                disabled={prioritize.isPending}
                className="border-primary/50 text-primary gap-1.5 h-8 text-xs"
              >
                <Sparkles size={14} />
                {prioritize.isPending ? "Prioritizing..." : "AI Prioritize"}
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <Progress value={progress} className="h-2 flex-1" />
          <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
            {completedCount} / {todayTasks.length} done
          </span>
        </div>
      </div>

      {filterChips.length > 1 && !sortedActiveTasks && (
        <div className="flex items-center gap-2 flex-wrap">
          {filterChips.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setActiveFilter(chip.value)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                activeFilter === chip.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {sortedActiveTasks && sortedActiveTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={10} /> AI Prioritized
          </h2>
          {sortedActiveTasks.map(task => (
            <TaskCard key={task.id} task={task} aiScore={aiScores[task.id] || null} />
          ))}
        </div>
      )}

      {!sortedActiveTasks && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-6">
            {filteredOverdue.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <h2 className="text-xs font-semibold text-destructive uppercase tracking-wider">Overdue</h2>
                </div>
                <SortableContext items={filteredOverdue.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  {filteredOverdue.map((task) => (
                    <TaskCard key={task.id} task={task} sortable />
                  ))}
                </SortableContext>
              </div>
            )}

            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-success uppercase tracking-wider">High Priority</h2>
              <DroppableSection id="section-high">
                <SortableContext items={highPriority.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-0">
                    {highPriority.map((task) => (
                      <TaskCard key={task.id} task={task} sortable />
                    ))}
                  </div>
                </SortableContext>
              </DroppableSection>
              {renderInlineAdd("high")}
            </div>

            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-warning uppercase tracking-wider">Medium Priority</h2>
              <DroppableSection id="section-medium">
                <SortableContext items={mediumPriority.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-0">
                    {mediumPriority.map((task) => (
                      <TaskCard key={task.id} task={task} sortable />
                    ))}
                  </div>
                </SortableContext>
              </DroppableSection>
              {renderInlineAdd("medium")}
            </div>

            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Low Priority</h2>
              <DroppableSection id="section-low">
                <SortableContext items={lowPriority.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-0">
                    {lowPriority.map((task) => (
                      <TaskCard key={task.id} task={task} sortable />
                    ))}
                  </div>
                </SortableContext>
              </DroppableSection>
              {renderInlineAdd("low")}
            </div>
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="opacity-80">
                <TaskCard task={activeTask} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {completed.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border/50">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed</h2>
          <div className="opacity-60">
            {completed.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {todayTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nothing planned for today yet.</p>
        </div>
      )}
    </div>
  );
}
