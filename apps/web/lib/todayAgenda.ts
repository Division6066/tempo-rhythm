export type TodayAgendaEvent = {
  id: string;
  title: string;
  timeLabel: string;
};

const agendaTimeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

export function formatAgendaTimeLabel(startsAtMs: number): string {
  return agendaTimeFormatter.format(new Date(startsAtMs));
}

export function mapCalendarEventsToAgenda(
  events: ReadonlyArray<{ _id: string; title: string; startsAtMs: number }>,
): TodayAgendaEvent[] {
  return events
    .toSorted((left, right) => left.startsAtMs - right.startsAtMs)
    .map((event) => ({
      id: event._id,
      title: event.title,
      timeLabel: formatAgendaTimeLabel(event.startsAtMs),
    }));
}

export function visibleHabitsFrom<T>(habits: readonly T[], limit = 5): {
  visible: T[];
  hiddenCount: number;
} {
  const visible = habits.slice(0, limit);
  return {
    visible,
    hiddenCount: Math.max(habits.length - visible.length, 0),
  };
}
