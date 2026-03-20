import { useCallback } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer, type View } from "react-big-calendar";
import withDragAndDrop, { type EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  type: "event" | "task";
  priority?: string;
}

const DnDCalendar = withDragAndDrop<CalendarEvent>(BigCalendar);

interface CalendarComponentProps {
  events: CalendarEvent[];
  defaultView?: "month" | "week";
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  onEventDrop?: (args: EventInteractionArgs<CalendarEvent>) => void;
  onEventResize?: (args: EventInteractionArgs<CalendarEvent>) => void;
  onDropFromOutside?: (args: { start: string | Date; end: string | Date; allDay?: boolean }) => void;
  dragFromOutsideItem?: () => CalendarEvent;
  date?: Date;
  onNavigate?: (date: Date) => void;
  onView?: (view: View) => void;
  view?: View;
}

function eventStyleGetter(event: CalendarEvent) {
  let backgroundColor = "hsl(244, 99%, 69%)";
  if (event.type === "task") {
    if (event.priority === "high") backgroundColor = "hsl(168, 100%, 39%)";
    else if (event.priority === "medium") backgroundColor = "hsl(33, 100%, 64%)";
    else backgroundColor = "hsl(240, 10%, 60%)";
  }
  return {
    style: {
      backgroundColor,
      borderRadius: "6px",
      border: "none",
      color: "#fff",
      fontSize: "12px",
      padding: "2px 6px",
    },
  };
}

export default function CalendarComponent({
  events,
  defaultView = "month",
  onSelectEvent,
  onSelectSlot,
  onEventDrop,
  onEventResize,
  onDropFromOutside,
  dragFromOutsideItem,
  date,
  onNavigate,
  onView,
  view,
}: CalendarComponentProps) {
  const draggableAccessor = useCallback(() => true, []);
  const resizableAccessor = useCallback(
    (event: CalendarEvent) => view === "day" || view === "week",
    [view]
  );

  return (
    <div className="tempo-calendar rounded-xl overflow-hidden border border-border bg-card">
      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={defaultView}
        view={view}
        date={date}
        onNavigate={onNavigate}
        onView={onView}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable
        draggableAccessor={draggableAccessor}
        resizableAccessor={resizableAccessor}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        resizable
        eventPropGetter={eventStyleGetter}
        style={{ minHeight: 500 }}
        popup
        views={["month", "week", "day"]}
        step={15}
        timeslots={4}
        onDropFromOutside={onDropFromOutside}
        dragFromOutsideItem={dragFromOutsideItem}
      />
    </div>
  );
}
