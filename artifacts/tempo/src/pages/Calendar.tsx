import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  useListCalendarEvents,
  useCreateCalendarEvent,
  useDeleteCalendarEvent,
  useListTasks,
  getListCalendarEventsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Trash2, LayoutGrid, Rows3 } from "lucide-react";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function formatDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function getWeekDates(date: Date) {
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(start.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type ViewMode = "month" | "week";

export default function Calendar() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventEndTime, setNewEventEndTime] = useState("");
  const [newEventDuration, setNewEventDuration] = useState("60");
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [weekAnchor, setWeekAnchor] = useState(new Date());

  const startDate = formatDate(currentYear, currentMonth, 1);
  const endDate = formatDate(currentYear, currentMonth, getDaysInMonth(currentYear, currentMonth));

  const { data: events } = useListCalendarEvents({ startDate, endDate });
  const { data: tasks } = useListTasks({ startDate, endDate });
  const createEvent = useCreateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();

  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const eventsByDate = useMemo(() => {
    const map: Record<string, Array<{ id: number; title: string; startTime: string | null; endTime?: string | null; type: "event" | "task"; priority?: string }>> = {};
    events?.forEach((e) => {
      const d = e.date;
      if (!map[d]) map[d] = [];
      map[d].push({ id: e.id, title: e.title, startTime: e.startTime ?? null, endTime: e.endTime ?? null, type: "event" });
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

  const prevPeriod = () => {
    if (viewMode === "month") {
      if (currentMonth === 0) { setCurrentYear(currentYear - 1); setCurrentMonth(11); }
      else setCurrentMonth(currentMonth - 1);
    } else {
      const prev = new Date(weekAnchor);
      prev.setDate(prev.getDate() - 7);
      setWeekAnchor(prev);
      setCurrentMonth(prev.getMonth());
      setCurrentYear(prev.getFullYear());
    }
  };
  const nextPeriod = () => {
    if (viewMode === "month") {
      if (currentMonth === 11) { setCurrentYear(currentYear + 1); setCurrentMonth(0); }
      else setCurrentMonth(currentMonth + 1);
    } else {
      const next = new Date(weekAnchor);
      next.setDate(next.getDate() + 7);
      setWeekAnchor(next);
      setCurrentMonth(next.getMonth());
      setCurrentYear(next.getFullYear());
    }
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setWeekAnchor(new Date());
    setSelectedDate(todayStr);
  };

  const handleAddEvent = async () => {
    if (!newEventTitle || !selectedDate) return;
    try {
      await createEvent.mutateAsync({
        data: {
          title: newEventTitle,
          date: selectedDate,
          startTime: newEventTime || null,
          endTime: newEventEndTime || null,
          duration: parseInt(newEventDuration) || 60,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListCalendarEventsQueryKey() });
      setNewEventTitle("");
      setNewEventTime("");
      setNewEventEndTime("");
      setNewEventDuration("60");
      setShowAddDialog(false);
      toast({ title: "Event added" });
    } catch {
      toast({ variant: "destructive", title: "Failed to add event" });
    }
  };

  const handleDeleteEvent = async (id: number) => {
    try {
      await deleteEvent.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListCalendarEventsQueryKey() });
    } catch {
      toast({ variant: "destructive", title: "Failed to delete event" });
    }
  };

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];
  const weekDates = getWeekDates(weekAnchor);

  const priorityDotColor = (p?: string) => {
    if (p === "high") return "bg-teal-400";
    if (p === "medium") return "bg-amber-400";
    return "bg-muted-foreground";
  };

  const renderDayCell = (dateStr: string, dayNum: number, isCurrentMonth = true) => {
    const dayEvents = eventsByDate[dateStr] || [];
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;
    return (
      <button
        key={dateStr}
        onClick={() => setSelectedDate(dateStr)}
        className={`aspect-square rounded-lg flex flex-col items-center justify-center relative text-sm transition-colors
          ${!isCurrentMonth ? "opacity-30" : ""}
          ${isToday ? "bg-primary/20 text-primary font-bold" : ""}
          ${isSelected ? "ring-2 ring-primary" : ""}
          ${!isToday && !isSelected ? "hover:bg-muted" : ""}
        `}
      >
        {dayNum}
        {dayEvents.length > 0 && (
          <div className="flex gap-0.5 mt-0.5">
            {dayEvents.slice(0, 3).map((item, j) => (
              <div key={j} className={`w-1.5 h-1.5 rounded-full ${item.type === "event" ? "bg-primary" : priorityDotColor(item.priority)}`} />
            ))}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <CalendarIcon size={24} className="text-primary" /> Calendar
        </h1>
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "month" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("month")}
          >
            <LayoutGrid size={16} />
          </Button>
          <Button
            variant={viewMode === "week" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("week")}
          >
            <Rows3 size={16} />
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={prevPeriod}><ChevronLeft size={20} /></Button>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">
              {viewMode === "month"
                ? `${MONTH_NAMES[currentMonth]} ${currentYear}`
                : `Week of ${weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
            </h2>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={goToToday}>Today</Button>
          </div>
          <Button variant="ghost" size="icon" onClick={nextPeriod}><ChevronRight size={20} /></Button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_HEADERS.map((d) => (
            <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">{d}</div>
          ))}
        </div>

        {viewMode === "month" ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: getFirstDayOfMonth(currentYear, currentMonth) }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: getDaysInMonth(currentYear, currentMonth) }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDate(currentYear, currentMonth, day);
              return renderDayCell(dateStr, day);
            })}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {weekDates.map((d) => {
              const dateStr = formatDate(d.getFullYear(), d.getMonth(), d.getDate());
              return renderDayCell(dateStr, d.getDate(), d.getMonth() === currentMonth);
            })}
          </div>
        )}
      </div>

      {viewMode === "week" && (
        <div className="space-y-2">
          {weekDates.map(d => {
            const dateStr = formatDate(d.getFullYear(), d.getMonth(), d.getDate());
            const dayItems = eventsByDate[dateStr] || [];
            if (dayItems.length === 0) return null;
            return (
              <div key={dateStr} className="bg-card rounded-lg border border-border/50 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </p>
                <div className="space-y-1">
                  {dayItems.map(item => (
                    <div key={`${item.type}-${item.id}`} className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${item.type === "event" ? "bg-primary" : priorityDotColor(item.priority)}`} />
                      {item.startTime && <span className="text-xs text-muted-foreground font-mono w-12">{item.startTime}</span>}
                      <span className="truncate">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedDate && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</h3>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1"><Plus size={14} /> Add Event</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Event</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Event title" value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Start Time</label>
                      <Input type="time" value={newEventTime} onChange={(e) => setNewEventTime(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">End Time</label>
                      <Input type="time" value={newEventEndTime} onChange={(e) => setNewEventEndTime(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Duration (min)</label>
                    <Input type="number" value={newEventDuration} onChange={(e) => setNewEventDuration(e.target.value)} />
                  </div>
                  <Button className="w-full" onClick={handleAddEvent} disabled={createEvent.isPending}>
                    {createEvent.isPending ? "Adding..." : "Add Event"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No events or tasks scheduled</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents
                .sort((a, b) => (a.startTime || "99:99").localeCompare(b.startTime || "99:99"))
                .map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-8 rounded-full ${item.type === "event" ? "bg-primary" : priorityDotColor(item.priority)}`} />
                    <div>
                      {item.startTime && (
                        <span className="text-xs text-muted-foreground font-mono block">{item.startTime}{item.endTime ? ` - ${item.endTime}` : ""}</span>
                      )}
                      <p className="text-sm font-medium">{item.title}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.type === "event" ? "bg-primary/20 text-primary" : "bg-amber-500/20 text-amber-400"}`}>
                        {item.type}
                      </span>
                    </div>
                  </div>
                  {item.type === "event" && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteEvent(item.id)}>
                      <Trash2 size={14} />
                    </Button>
                  )}
                  {item.type === "task" && (
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => setLocation(`/tasks/${item.id}`)}>
                      View
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
