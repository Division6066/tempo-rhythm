import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  useListCalendarEvents,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
  useListTasks,
  useUpdateTask,
  useCreateTask,
  getListCalendarEventsQueryKey,
  getListTasksQueryKey,
} from "@workspace/api-client-react";
import type { CalendarEvent as ApiCalendarEvent, Task } from "@workspace/api-client-react";
import type { EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Plus, Trash2, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import CalendarComponent, { type CalendarEvent } from "@/components/CalendarComponent";
import type { View } from "react-big-calendar";
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";

function mapApiEventToCalendarEvent(e: ApiCalendarEvent): CalendarEvent {
  const startHour = e.startTime ? parseInt(e.startTime.split(":")[0]) : 9;
  const startMin = e.startTime ? parseInt(e.startTime.split(":")[1]) : 0;
  const endHour = e.endTime ? parseInt(e.endTime.split(":")[0]) : startHour + 1;
  const endMin = e.endTime ? parseInt(e.endTime.split(":")[1]) : startMin;

  const start = new Date(e.date + "T00:00:00");
  start.setHours(startHour, startMin);
  const end = new Date(e.date + "T00:00:00");
  end.setHours(endHour, endMin);

  return { id: e.id, title: e.title, start, end, type: "event" };
}

function mapTaskToCalendarEvent(t: Task): CalendarEvent | null {
  if (!t.scheduledDate) return null;
  const start = new Date(t.scheduledDate + "T09:00:00");
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return { id: t.id, title: t.title, start, end, type: "task", priority: t.priority };
}

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TIMELINE_START_HOUR = 6;
const TIMELINE_END_HOUR = 24;
const HOUR_HEIGHT = 80;
const HOUR_LABEL_WIDTH = 60;

type DayItem = { id: number; title: string; startTime: string | null; endTime?: string | null; type: "event" | "task"; priority?: string; duration?: number };
type ExtendedView = View | "day-timeline";

export default function Calendar() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<ExtendedView>("month");

  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);
  const [createTaskDate, setCreateTaskDate] = useState<Date | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [selectedSlotDate, setSelectedSlotDate] = useState<Date | null>(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventEndTime, setNewEventEndTime] = useState("");

  const [dayViewDate, setDayViewDate] = useState(new Date());
  const [showMiniMonth, setShowMiniMonth] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [miniMonthYear, setMiniMonthYear] = useState(new Date().getFullYear());
  const [miniMonthMonth, setMiniMonthMonth] = useState(new Date().getMonth());

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");

  const timelineRef = useRef<HTMLDivElement>(null);

  const rangeStart = format(subMonths(startOfMonth(currentDate), 1), "yyyy-MM-dd");
  const rangeEnd = format(addMonths(endOfMonth(currentDate), 1), "yyyy-MM-dd");

  const { data: events, isLoading: eventsLoading } = useListCalendarEvents({ startDate: rangeStart, endDate: rangeEnd });
  const { data: tasks, isLoading: tasksLoading } = useListTasks({ startDate: rangeStart, endDate: rangeEnd });
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();
  const updateTask = useUpdateTask();
  const createTask = useCreateTask();

  const isLoading = eventsLoading || tasksLoading;

  const today = new Date();
  const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentView === "day-timeline" && timelineRef.current) {
      const now = new Date();
      const scrollTo = Math.max(0, (now.getHours() - TIMELINE_START_HOUR - 1) * HOUR_HEIGHT);
      timelineRef.current.scrollTop = scrollTo;
    }
  }, [currentView]);

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const result: CalendarEvent[] = [];
    events?.forEach((e: ApiCalendarEvent) => {
      result.push(mapApiEventToCalendarEvent(e));
    });
    tasks?.forEach((t: Task) => {
      const mapped = mapTaskToCalendarEvent(t);
      if (mapped) result.push(mapped);
    });
    return result;
  }, [events, tasks]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, DayItem[]> = {};
    events?.forEach((e) => {
      const d = e.date;
      if (!map[d]) map[d] = [];
      map[d].push({ id: e.id, title: e.title, startTime: e.startTime ?? null, endTime: e.endTime ?? null, type: "event", duration: e.duration ?? undefined });
    });
    tasks?.forEach((t) => {
      if (t.scheduledDate) {
        const d = t.scheduledDate;
        if (!map[d]) map[d] = [];
        map[d].push({ id: t.id, title: t.title, startTime: t.startTime ?? null, type: "task", priority: t.priority });
      }
    });
    return map;
  }, [events, tasks]);

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      if (event.type === "task") {
        setLocation(`/tasks/${event.id}`);
      } else {
        setEditingEvent(event);
        setEditTitle(event.title);
        setEditStartTime(format(event.start, "HH:mm"));
        setEditEndTime(format(event.end, "HH:mm"));
        setShowEditDialog(true);
      }
    },
    [setLocation]
  );

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date }) => {
      setCreateTaskDate(slotInfo.start);
      setNewTaskTitle("");
      setShowCreateTaskDialog(true);
    },
    []
  );

  const handleEventDrop = useCallback(
    async (args: EventInteractionArgs<CalendarEvent>) => {
      const newDate = format(new Date(args.start), "yyyy-MM-dd");
      const newStartTime = format(new Date(args.start), "HH:mm");

      try {
        if (args.event.type === "task") {
          await updateTask.mutateAsync({
            id: args.event.id,
            data: { scheduledDate: newDate, startTime: newStartTime },
          });
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        } else {
          await updateEvent.mutateAsync({
            id: args.event.id,
            data: {
              date: newDate,
              startTime: newStartTime,
              endTime: format(new Date(args.end), "HH:mm"),
            },
          });
          queryClient.invalidateQueries({ queryKey: getListCalendarEventsQueryKey() });
        }
        toast({ title: "Rescheduled" });
      } catch {
        toast({ variant: "destructive", title: "Failed to reschedule" });
      }
    },
    [updateTask, updateEvent, queryClient, toast]
  );

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !createTaskDate) return;
    try {
      await createTask.mutateAsync({
        data: {
          title: newTaskTitle,
          scheduledDate: format(createTaskDate, "yyyy-MM-dd"),
          status: "scheduled" as const,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
      setShowCreateTaskDialog(false);
      setNewTaskTitle("");
      toast({ title: "Task created" });
    } catch {
      toast({ variant: "destructive", title: "Failed to create task" });
    }
  };

  const prevDay = useCallback(() => {
    const prev = new Date(dayViewDate);
    prev.setDate(prev.getDate() - 1);
    setDayViewDate(prev);
    setCurrentDate(prev);
    setMiniMonthYear(prev.getFullYear());
    setMiniMonthMonth(prev.getMonth());
  }, [dayViewDate]);

  const nextDay = useCallback(() => {
    const next = new Date(dayViewDate);
    next.setDate(next.getDate() + 1);
    setDayViewDate(next);
    setCurrentDate(next);
    setMiniMonthYear(next.getFullYear());
    setMiniMonthMonth(next.getMonth());
  }, [dayViewDate]);

  useEffect(() => {
    if (currentView !== "day-timeline") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); prevDay(); }
      if (e.key === "ArrowRight") { e.preventDefault(); nextDay(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentView, prevDay, nextDay]);

  const goToDayToday = () => {
    const now = new Date();
    setDayViewDate(now);
    setCurrentDate(now);
    setMiniMonthYear(now.getFullYear());
    setMiniMonthMonth(now.getMonth());
  };

  const openAddEventDialog = () => {
    setSelectedSlotDate(createTaskDate ?? new Date());
    setNewEventTitle("");
    setNewEventTime("");
    setNewEventEndTime("");
    setShowCreateTaskDialog(false);
    setShowAddEventDialog(true);
  };

  const handleAddEvent = async () => {
    if (!newEventTitle.trim() || !selectedSlotDate) return;
    try {
      await createEvent.mutateAsync({
        data: {
          title: newEventTitle,
          date: format(selectedSlotDate, "yyyy-MM-dd"),
          startTime: newEventTime || null,
          endTime: newEventEndTime || null,
          duration: 60,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListCalendarEventsQueryKey() });
      setShowAddEventDialog(false);
      setNewEventTitle("");
      toast({ title: "Event added" });
    } catch {
      toast({ variant: "destructive", title: "Failed to add event" });
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent || !editTitle.trim()) return;
    try {
      await updateEvent.mutateAsync({
        id: editingEvent.id,
        data: {
          title: editTitle,
          startTime: editStartTime || null,
          endTime: editEndTime || null,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListCalendarEventsQueryKey() });
      setShowEditDialog(false);
      setEditingEvent(null);
      toast({ title: "Event updated" });
    } catch {
      toast({ variant: "destructive", title: "Failed to update event" });
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent) return;
    try {
      await deleteEvent.mutateAsync({ id: editingEvent.id });
      queryClient.invalidateQueries({ queryKey: getListCalendarEventsQueryKey() });
      setShowEditDialog(false);
      setEditingEvent(null);
      toast({ title: "Event deleted" });
    } catch {
      toast({ variant: "destructive", title: "Failed to delete event" });
    }
  };

  const switchToDay = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    setDayViewDate(date);
    setCurrentDate(date);
    setMiniMonthYear(y);
    setMiniMonthMonth(m - 1);
    setCurrentView("day-timeline");
  };

  const handleDayTimelineEventClick = (item: DayItem) => {
    if (item.type === "task") {
      setLocation(`/tasks/${item.id}`);
    } else {
      const ev = calendarEvents.find(e => e.id === item.id && e.type === "event");
      if (ev) {
        setEditingEvent(ev);
        setEditTitle(ev.title);
        setEditStartTime(format(ev.start, "HH:mm"));
        setEditEndTime(format(ev.end, "HH:mm"));
        setShowEditDialog(true);
      }
    }
  };

  const renderDayTimeline = () => {
    const dayViewDateStr = formatDateStr(dayViewDate.getFullYear(), dayViewDate.getMonth(), dayViewDate.getDate());
    const dayItems = eventsByDate[dayViewDateStr] || [];
    const timedItems = dayItems.filter(item => item.startTime);
    const allDayItems = dayItems.filter(item => !item.startTime);

    const totalHours = TIMELINE_END_HOUR - TIMELINE_START_HOUR;
    const timelineHeight = totalHours * HOUR_HEIGHT;

    const nowHours = currentTime.getHours();
    const nowMinutes = currentTime.getMinutes();
    const nowTotalMinutes = nowHours * 60 + nowMinutes;
    const timelineStartMinutes = TIMELINE_START_HOUR * 60;
    const timelineEndMinutes = TIMELINE_END_HOUR * 60;
    const showCurrentTime = dayViewDateStr === todayStr && nowTotalMinutes >= timelineStartMinutes && nowTotalMinutes <= timelineEndMinutes;
    const currentTimeTop = showCurrentTime ? ((nowTotalMinutes - timelineStartMinutes) / 60) * HOUR_HEIGHT : 0;

    const dayDate = dayViewDate;
    const dayTitle = `${DAY_NAMES_FULL[dayDate.getDay()]}, ${MONTH_NAMES[dayDate.getMonth()]} ${dayDate.getDate()}, ${dayDate.getFullYear()}`;

    return (
      <div className="flex gap-0">
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={prevDay}><ChevronLeft size={20} /></Button>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">{dayTitle}</h2>
              <Button variant="outline" size="sm" className="text-xs h-7" onClick={goToDayToday}>Today</Button>
              <Button
                size="sm"
                className="gap-1"
                onClick={() => {
                  setSelectedSlotDate(dayViewDate);
                  setNewEventTitle("");
                  setNewEventTime("");
                  setNewEventEndTime("");
                  setShowAddEventDialog(true);
                }}
              >
                <Plus size={14} /> Add Event
              </Button>
            </div>
            <Button variant="ghost" size="icon" onClick={nextDay}><ChevronRight size={20} /></Button>
          </div>

          {allDayItems.length > 0 && (
            <div className="mb-2 px-2">
              <div className="flex items-center gap-2 px-2 py-1.5 bg-muted/50 rounded-lg border border-border/50">
                <span className="text-xs text-muted-foreground font-medium w-[52px] text-right shrink-0">All day</span>
                <div className="flex flex-wrap gap-1 flex-1">
                  {allDayItems.map(item => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className={`text-xs px-2 py-1 rounded-md cursor-pointer ${
                        item.type === "event"
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                      onClick={() => handleDayTimelineEventClick(item)}
                    >
                      {item.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div
            ref={timelineRef}
            className="overflow-y-auto flex-1 rounded-lg border border-border bg-card"
            style={{ maxHeight: "calc(100vh - 240px)" }}
          >
            <div className="relative" style={{ height: timelineHeight }}>
              {Array.from({ length: totalHours }).map((_, i) => {
                const hour = TIMELINE_START_HOUR + i;
                const label = hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
                return (
                  <div key={hour} className="absolute w-full" style={{ top: i * HOUR_HEIGHT }}>
                    <div className="flex items-start">
                      <div className="text-[11px] text-muted-foreground font-mono pr-2 text-right shrink-0" style={{ width: HOUR_LABEL_WIDTH }}>
                        {label}
                      </div>
                      <div className="flex-1 border-t border-border/60" />
                    </div>
                    <div className="absolute w-full" style={{ top: HOUR_HEIGHT / 2 }}>
                      <div className="flex items-start">
                        <div style={{ width: HOUR_LABEL_WIDTH }} className="shrink-0" />
                        <div className="flex-1 border-t border-border/20 border-dashed" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {showCurrentTime && (
                <div className="absolute w-full z-20 pointer-events-none" style={{ top: currentTimeTop }}>
                  <div className="flex items-center">
                    <div style={{ width: HOUR_LABEL_WIDTH - 6 }} className="flex justify-end">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                    </div>
                    <div className="flex-1 h-[2px] bg-red-500" />
                  </div>
                </div>
              )}

              {timedItems.map(item => {
                const startMinutes = parseTimeToMinutes(item.startTime!);
                let durationMin = 60;
                if (item.endTime) {
                  durationMin = parseTimeToMinutes(item.endTime) - startMinutes;
                  if (durationMin <= 0) durationMin = 60;
                } else if (item.duration) {
                  durationMin = item.duration;
                }

                const top = ((startMinutes - TIMELINE_START_HOUR * 60) / 60) * HOUR_HEIGHT;
                const height = Math.max(30, (durationMin / 60) * HOUR_HEIGHT);
                const isEvent = item.type === "event";

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className={`absolute z-10 rounded-md px-2 py-1 overflow-hidden cursor-pointer transition-opacity hover:opacity-90 ${
                      isEvent
                        ? "bg-indigo-500/20 border border-indigo-500/40 border-l-[3px] border-l-indigo-500"
                        : "bg-amber-500/15 border border-amber-500/30 border-l-[3px] border-l-amber-500"
                    }`}
                    style={{
                      top,
                      height,
                      left: HOUR_LABEL_WIDTH + 4,
                      right: 8,
                    }}
                    onClick={() => handleDayTimelineEventClick(item)}
                  >
                    <div className="flex items-start gap-1.5 h-full">
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-medium truncate ${isEvent ? "text-indigo-200" : "text-amber-200"}`}>
                          {item.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {item.startTime}{item.endTime ? ` - ${item.endTime}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {showMiniMonth && (
          <div className="ml-3 shrink-0" style={{ width: 200 }}>
            <div className="bg-card rounded-xl border border-border p-3">
              <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                  if (miniMonthMonth === 0) { setMiniMonthYear(miniMonthYear - 1); setMiniMonthMonth(11); }
                  else setMiniMonthMonth(miniMonthMonth - 1);
                }}><ChevronLeft size={14} /></Button>
                <span className="text-xs font-semibold">{MONTH_NAMES[miniMonthMonth]} {miniMonthYear}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                  if (miniMonthMonth === 11) { setMiniMonthYear(miniMonthYear + 1); setMiniMonthMonth(0); }
                  else setMiniMonthMonth(miniMonthMonth + 1);
                }}><ChevronRight size={14} /></Button>
              </div>
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {DAY_HEADERS.map(d => (
                  <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-0.5">{d.charAt(0)}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: getFirstDayOfMonth(miniMonthYear, miniMonthMonth) }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-full aspect-square" />
                ))}
                {Array.from({ length: getDaysInMonth(miniMonthYear, miniMonthMonth) }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = formatDateStr(miniMonthYear, miniMonthMonth, day);
                  const dayViewDateStr = formatDateStr(dayViewDate.getFullYear(), dayViewDate.getMonth(), dayViewDate.getDate());
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === dayViewDateStr;
                  const hasItems = (eventsByDate[dateStr] || []).length > 0;
                  return (
                    <button
                      key={dateStr}
                      onClick={() => switchToDay(dateStr)}
                      className={`w-full aspect-square rounded text-[11px] flex items-center justify-center relative transition-colors
                        ${isToday ? "bg-primary/20 text-primary font-bold" : ""}
                        ${isSelected ? "ring-1.5 ring-primary bg-primary/10" : ""}
                        ${!isToday && !isSelected ? "hover:bg-muted" : ""}
                      `}
                    >
                      {day}
                      {hasItems && !isToday && !isSelected && (
                        <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary/50" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs mt-1 text-muted-foreground"
              onClick={() => setShowMiniMonth(false)}
            >
              Hide calendar
            </Button>
          </div>
        )}

        {!showMiniMonth && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-1 h-8 w-8 shrink-0 self-start mt-1"
            onClick={() => setShowMiniMonth(true)}
            title="Show mini calendar"
          >
            <CalendarIcon size={16} />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <CalendarIcon size={24} className="text-primary" /> Calendar
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
            <Button
              variant={currentView === "month" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs px-3"
              onClick={() => setCurrentView("month")}
            >
              Month
            </Button>
            <Button
              variant={currentView === "week" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs px-3"
              onClick={() => setCurrentView("week")}
            >
              Week
            </Button>
            <Button
              variant={currentView === "day-timeline" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs px-3"
              onClick={() => {
                setDayViewDate(currentDate);
                setMiniMonthYear(currentDate.getFullYear());
                setMiniMonthMonth(currentDate.getMonth());
                setCurrentView("day-timeline");
              }}
            >
              Day
            </Button>
          </div>
          <Button
            size="sm"
            className="gap-1 min-h-[44px]"
            onClick={() => {
              setCreateTaskDate(new Date());
              setNewTaskTitle("");
              setShowCreateTaskDialog(true);
            }}
          >
            <Plus size={14} /> Add Task
          </Button>
        </div>
      </div>

      {currentView === "day-timeline" ? (
        <div className="bg-card rounded-xl border border-border p-4">
          {renderDayTimeline()}
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[500px] w-full rounded-xl" />
        </div>
      ) : calendarEvents.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CalendarIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium text-foreground">No events yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click any date on the calendar to create a task for that day.
            </p>
          </div>
          <Button
            onClick={() => {
              setCreateTaskDate(new Date());
              setNewTaskTitle("");
              setShowCreateTaskDialog(true);
            }}
            className="gap-2 min-h-[44px]"
          >
            <Plus size={16} /> Create First Task
          </Button>
          <div className="mt-8">
            <CalendarComponent
              events={[]}
              defaultView="month"
              view={currentView as View}
              date={currentDate}
              onNavigate={setCurrentDate}
              onView={(v) => setCurrentView(v)}
              onSelectSlot={handleSelectSlot}
            />
          </div>
        </div>
      ) : (
        <CalendarComponent
          events={calendarEvents}
          defaultView="month"
          view={currentView as View}
          date={currentDate}
          onNavigate={setCurrentDate}
          onView={(v) => setCurrentView(v)}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleEventDrop}
        />
      )}

      <Dialog open={showCreateTaskDialog} onOpenChange={setShowCreateTaskDialog}>
        <DialogContent className="max-md:min-h-screen max-md:min-w-full max-md:rounded-none">
          <DialogHeader>
            <DialogTitle>
              Create Task
              {createTaskDate && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  {format(createTaskDate, "MMMM d, yyyy")}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="min-h-[44px]"
              autoFocus
            />
            <Button className="w-full min-h-[44px]" onClick={handleCreateTask} disabled={createTask.isPending || !newTaskTitle.trim()}>
              {createTask.isPending ? (
                <>
                  <Spinner className="mr-2" /> Saving…
                </>
              ) : (
                "Create Task"
              )}
            </Button>
            <Button variant="outline" className="w-full min-h-[44px]" onClick={openAddEventDialog}>
              Or add a calendar event instead
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddEventDialog} onOpenChange={setShowAddEventDialog}>
        <DialogContent className="max-md:min-h-screen max-md:min-w-full max-md:rounded-none">
          <DialogHeader>
            <DialogTitle>
              Add Event
              {selectedSlotDate && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  {format(selectedSlotDate, "MMMM d, yyyy")}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Event title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className="min-h-[44px]"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Start Time</label>
                <Input type="time" value={newEventTime} onChange={(e) => setNewEventTime(e.target.value)} className="min-h-[44px]" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">End Time</label>
                <Input type="time" value={newEventEndTime} onChange={(e) => setNewEventEndTime(e.target.value)} className="min-h-[44px]" />
              </div>
            </div>
            <Button className="w-full min-h-[44px]" onClick={handleAddEvent} disabled={createEvent.isPending || !newEventTitle.trim()}>
              {createEvent.isPending ? (
                <>
                  <Spinner className="mr-2" /> Saving…
                </>
              ) : (
                "Add Event"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-md:min-h-screen max-md:min-w-full max-md:rounded-none">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Event title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="min-h-[44px]"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Start Time</label>
                <Input type="time" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} className="min-h-[44px]" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">End Time</label>
                <Input type="time" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} className="min-h-[44px]" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="min-h-[44px] gap-1"
                onClick={handleDeleteEvent}
                disabled={deleteEvent.isPending}
              >
                {deleteEvent.isPending ? <Spinner className="mr-1" /> : <Trash2 size={14} />}
                Delete
              </Button>
              <Button
                className="flex-1 min-h-[44px]"
                onClick={handleUpdateEvent}
                disabled={updateEvent.isPending || !editTitle.trim()}
              >
                {updateEvent.isPending ? (
                  <>
                    <Spinner className="mr-2" /> Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
