import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import {
  useListNotes,
  useCreateNote,
  useListTasks,
  useCompleteTask,
  useCreateTask,
  getListNotesQueryKey,
  getListTasksQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar as CalendarIcon,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  type PeriodType,
  getCurrentPeriodDate,
  prevPeriodDate,
  nextPeriodDate,
  formatPeriodLabel,
  getPeriodDateRange,
  getTemplateContent,
} from "@/lib/periodUtils";

export default function PeriodNotes() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [periodType, setPeriodType] = useState<PeriodType>("weekly");
  const [currentDate, setCurrentDate] = useState(() => getCurrentPeriodDate("weekly"));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const autoCreateAttempted = useRef<string>("");

  useEffect(() => {
    setCurrentDate(getCurrentPeriodDate(periodType));
    autoCreateAttempted.current = "";
  }, [periodType]);

  const { data: notes, isLoading: notesLoading } = useListNotes({ periodType });
  const createNote = useCreateNote();
  const completeTask = useCompleteTask();
  const createTask = useCreateTask();

  const currentNote = notes?.find((n) => n.periodDate === currentDate);
  const dateRange = getPeriodDateRange(periodType, currentDate);

  const { data: allPeriodTasks } = useListTasks({
    startDate: dateRange.start,
    endDate: dateRange.end,
  });
  const periodTasks = allPeriodTasks?.filter((t) => t.status !== "done");

  const autoCreateNote = useCallback(async () => {
    const key = `${periodType}:${currentDate}`;
    if (autoCreateAttempted.current === key) return;
    autoCreateAttempted.current = key;

    const label = formatPeriodLabel(periodType, currentDate);
    try {
      await createNote.mutateAsync({
        data: {
          title: label,
          content: getTemplateContent(periodType, label),
          periodType,
          periodDate: currentDate,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
    } catch {
      autoCreateAttempted.current = "";
      toast({ variant: "destructive", title: "Failed to auto-create note" });
    }
  }, [periodType, currentDate, createNote, queryClient, toast]);

  useEffect(() => {
    if (!notesLoading && notes && !currentNote) {
      autoCreateNote();
    }
  }, [notesLoading, notes, currentNote, autoCreateNote]);

  const navigatePrev = () => {
    setCurrentDate(prevPeriodDate(periodType, currentDate));
    autoCreateAttempted.current = "";
  };
  const navigateNext = () => {
    setCurrentDate(nextPeriodDate(periodType, currentDate));
    autoCreateAttempted.current = "";
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.target instanceof HTMLButtonElement) return;
      if (pickerOpen) return;
      if (e.key === "ArrowLeft") navigatePrev();
      if (e.key === "ArrowRight") navigateNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [periodType, currentDate, pickerOpen]);

  const handlePickDate = (date: Date | undefined) => {
    if (!date) return;
    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();

    let newDate: string;
    switch (periodType) {
      case "daily":
        newDate = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        break;
      case "weekly": {
        const day = date.getDay();
        const monday = new Date(date);
        monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
        newDate = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
        break;
      }
      case "monthly":
        newDate = `${y}-${String(m + 1).padStart(2, "0")}-01`;
        break;
      case "quarterly": {
        const q = Math.floor(m / 3);
        newDate = `${y}-${String(q * 3 + 1).padStart(2, "0")}-01`;
        break;
      }
      case "yearly":
        newDate = `${y}-01-01`;
        break;
    }
    setCurrentDate(newDate);
    autoCreateAttempted.current = "";
    setPickerOpen(false);
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      await completeTask.mutateAsync({ id: taskId });
      queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
    } catch {
      toast({ variant: "destructive", title: "Failed to complete task" });
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      await createTask.mutateAsync({
        data: {
          title: newTaskTitle.trim(),
          scheduledDate: dateRange.start,
        },
      });
      setNewTaskTitle("");
      queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
    } catch {
      toast({ variant: "destructive", title: "Failed to add task" });
    }
  };

  const label = formatPeriodLabel(periodType, currentDate);

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <CalendarIcon size={24} className="text-primary" /> Period Notes
        </h1>
      </div>

      <Tabs value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
        <TabsList className="w-full">
          <TabsTrigger value="daily" className="flex-1">Daily</TabsTrigger>
          <TabsTrigger value="weekly" className="flex-1">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1">Monthly</TabsTrigger>
          <TabsTrigger value="quarterly" className="flex-1">Quarterly</TabsTrigger>
          <TabsTrigger value="yearly" className="flex-1">Yearly</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center justify-center gap-2">
        <Button variant="ghost" size="icon" onClick={navigatePrev} className="shrink-0">
          <ChevronLeft size={20} />
        </Button>

        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[180px] gap-2 font-medium">
              <CalendarIcon size={16} />
              {label}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            {periodType === "yearly" ? (
              <YearPicker
                currentYear={new Date(currentDate + "T12:00:00").getFullYear()}
                onSelect={(year) => {
                  setCurrentDate(`${year}-01-01`);
                  autoCreateAttempted.current = "";
                  setPickerOpen(false);
                }}
              />
            ) : periodType === "monthly" || periodType === "quarterly" ? (
              <MonthPicker
                currentDate={currentDate}
                quarterly={periodType === "quarterly"}
                onSelect={(dateStr) => {
                  setCurrentDate(dateStr);
                  autoCreateAttempted.current = "";
                  setPickerOpen(false);
                }}
              />
            ) : (
              <Calendar
                mode="single"
                selected={new Date(currentDate + "T12:00:00")}
                onSelect={handlePickDate}
                initialFocus
              />
            )}
          </PopoverContent>
        </Popover>

        <Button variant="ghost" size="icon" onClick={navigateNext} className="shrink-0">
          <ChevronRight size={20} />
        </Button>
      </div>

      {notesLoading || createNote.isPending ? (
        <div className="flex h-[20vh] items-center justify-center">
          <div className="w-12 h-12 rounded-full animate-breathe bg-primary/20" />
        </div>
      ) : currentNote ? (
        <button
          onClick={() => setLocation(`/notes/${currentNote.id}`)}
          className="w-full text-left p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{currentNote.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click to open and edit
              </p>
            </div>
          </div>
        </button>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <CalendarIcon size={48} className="mx-auto mb-3 opacity-30" />
          <p>Creating note for this period...</p>
        </div>
      )}

      <Collapsible open={tasksOpen} onOpenChange={setTasksOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between px-1 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              Upcoming Tasks ({periodTasks?.length || 0})
            </span>
            {tasksOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-1">
            {periodTasks && periodTasks.length > 0 ? (
              periodTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card border border-border"
                >
                  <Checkbox
                    checked={task.status === "done"}
                    onCheckedChange={() => {
                      if (task.status !== "done") handleCompleteTask(task.id);
                    }}
                  />
                  <span
                    className={`flex-1 text-sm truncate ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}
                  >
                    {task.title}
                  </span>
                  {task.scheduledDate && (
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      {task.scheduledDate}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground px-3 py-2">
                No tasks scheduled for this period
              </p>
            )}

            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add task to this period..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTask();
                }}
                className="h-8 text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                className="gap-1 shrink-0 h-8"
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim() || createTask.isPending}
              >
                <Plus size={14} /> Add
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {notes && notes.length > 1 && (
        <div className="space-y-2 pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            All {periodType} notes
          </p>
          <div className="space-y-1">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => {
                  if (note.periodDate) {
                    setCurrentDate(note.periodDate);
                    autoCreateAttempted.current = "";
                  }
                  setLocation(`/notes/${note.id}`);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-colors text-sm ${
                  note.periodDate === currentDate
                    ? "bg-primary/10 border-primary/30"
                    : "bg-card border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-primary shrink-0" />
                  <span className="truncate">{note.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MonthPicker({
  currentDate,
  quarterly,
  onSelect,
}: {
  currentDate: string;
  quarterly: boolean;
  onSelect: (dateStr: string) => void;
}) {
  const d = new Date(currentDate + "T12:00:00");
  const [year, setYear] = useState(d.getFullYear());
  const currentMonth = d.getMonth();
  const currentYear = d.getFullYear();

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const quarterLabels = ["Q1", "Q2", "Q3", "Q4"];
  const quarterMonths = [0, 3, 6, 9];

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setYear(year - 1)}>
          <ChevronLeft size={16} />
        </Button>
        <span className="text-sm font-medium">{year}</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setYear(year + 1)}>
          <ChevronRight size={16} />
        </Button>
      </div>
      {quarterly ? (
        <div className="grid grid-cols-2 gap-2">
          {quarterLabels.map((label, i) => {
            const qMonth = quarterMonths[i];
            const isSelected = year === currentYear && qMonth === Math.floor(currentMonth / 3) * 3;
            return (
              <Button
                key={label}
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                onClick={() => onSelect(`${year}-${String(qMonth + 1).padStart(2, "0")}-01`)}
                className="text-sm"
              >
                {label}
              </Button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {months.map((label, i) => {
            const isSelected = year === currentYear && i === currentMonth;
            return (
              <Button
                key={label}
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                onClick={() => onSelect(`${year}-${String(i + 1).padStart(2, "0")}-01`)}
                className="text-sm"
              >
                {label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function YearPicker({
  currentYear,
  onSelect,
}: {
  currentYear: number;
  onSelect: (year: number) => void;
}) {
  const startYear = currentYear - 5;
  const years = Array.from({ length: 11 }, (_, i) => startYear + i);

  return (
    <div className="p-3 grid grid-cols-3 gap-2">
      {years.map((year) => (
        <Button
          key={year}
          variant={year === currentYear ? "default" : "ghost"}
          size="sm"
          onClick={() => onSelect(year)}
          className="text-sm"
        >
          {year}
        </Button>
      ))}
    </div>
  );
}
