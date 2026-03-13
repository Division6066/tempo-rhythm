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
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Trash2 } from "lucide-react";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  const [newEventDuration, setNewEventDuration] = useState("60");

  const startDate = formatDate(currentYear, currentMonth, 1);
  const endDate = formatDate(currentYear, currentMonth, getDaysInMonth(currentYear, currentMonth));

  const { data: events } = useListCalendarEvents({ startDate, endDate });
  const { data: tasks } = useListTasks({ startDate, endDate });
  const createEvent = useCreateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const eventsByDate = useMemo(() => {
    const map: Record<string, Array<{ id: number; title: string; startTime: string | null; type: "event" | "task" }>> = {};
    events?.forEach((e) => {
      const d = e.date;
      if (!map[d]) map[d] = [];
      map[d].push({ id: e.id, title: e.title, startTime: e.startTime ?? null, type: "event" });
    });
    tasks?.forEach((t) => {
      if (t.scheduledDate) {
        const d = t.scheduledDate;
        if (!map[d]) map[d] = [];
        map[d].push({ id: t.id, title: t.title, startTime: t.startTime ?? null, type: "task" });
      }
    });
    return map;
  }, [events, tasks]);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentYear(currentYear - 1); setCurrentMonth(11); }
    else setCurrentMonth(currentMonth - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentYear(currentYear + 1); setCurrentMonth(0); }
    else setCurrentMonth(currentMonth + 1);
  };

  const handleAddEvent = async () => {
    if (!newEventTitle || !selectedDate) return;
    try {
      await createEvent.mutateAsync({
        data: {
          title: newEventTitle,
          date: selectedDate,
          startTime: newEventTime || null,
          duration: parseInt(newEventDuration) || 60,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListCalendarEventsQueryKey() });
      setNewEventTitle("");
      setNewEventTime("");
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

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <CalendarIcon size={24} className="text-primary" /> Calendar
        </h1>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft size={20} /></Button>
          <h2 className="text-lg font-semibold">{MONTH_NAMES[currentMonth]} {currentYear}</h2>
          <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight size={20} /></Button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_HEADERS.map((d) => (
            <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = formatDate(currentYear, currentMonth, day);
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center relative text-sm transition-colors
                  ${isToday ? "bg-primary/20 text-primary font-bold" : ""}
                  ${isSelected ? "ring-2 ring-primary" : ""}
                  ${!isToday && !isSelected ? "hover:bg-muted" : ""}
                `}
              >
                {day}
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((_, j) => (
                      <div key={j} className="w-1 h-1 rounded-full bg-primary" />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

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
                      <label className="text-xs text-muted-foreground">Duration (min)</label>
                      <Input type="number" value={newEventDuration} onChange={(e) => setNewEventDuration(e.target.value)} />
                    </div>
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
              {selectedEvents.map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {item.startTime && <span className="text-xs text-muted-foreground font-mono">{item.startTime}</span>}
                    <div>
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
