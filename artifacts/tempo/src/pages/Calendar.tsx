import { useState, useMemo, useCallback } from "react";
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
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react";
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

export default function Calendar() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>("month");

  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);
  const [createTaskDate, setCreateTaskDate] = useState<Date | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [selectedSlotDate, setSelectedSlotDate] = useState<Date | null>(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventEndTime, setNewEventEndTime] = useState("");

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");

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

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <CalendarIcon size={24} className="text-primary" /> Calendar
        </h1>
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

      {isLoading ? (
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
              view={currentView}
              date={currentDate}
              onNavigate={setCurrentDate}
              onView={setCurrentView}
              onSelectSlot={handleSelectSlot}
            />
          </div>
        </div>
      ) : (
        <CalendarComponent
          events={calendarEvents}
          defaultView="month"
          view={currentView}
          date={currentDate}
          onNavigate={setCurrentDate}
          onView={setCurrentView}
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
