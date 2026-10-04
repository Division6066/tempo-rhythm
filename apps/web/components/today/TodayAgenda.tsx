import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TodayAgendaEvent } from "@/lib/todayAgenda";

type TodayAgendaProps = {
  events?: TodayAgendaEvent[];
};

export function TodayAgenda({ events = [] }: TodayAgendaProps) {
  return (
    <section
      className="rounded-3xl border border-border/80 bg-card/90 p-5"
      aria-labelledby="today-agenda-heading"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CalendarDays className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2
            id="today-agenda-heading"
            className="font-heading text-xl font-semibold text-foreground"
          >
            Today&apos;s agenda
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Calendar events for today, when anything is on the board.
          </p>
        </div>
      </div>

      {events.length > 0 ? (
        <ol className="mt-5 space-y-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3"
            >
              <p className="text-sm font-semibold text-primary">{event.timeLabel}</p>
              <p className="mt-1 font-medium text-foreground">{event.title}</p>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-5">
          <p className="text-sm font-medium text-foreground">
            No calendar events for today yet.
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            If nothing is scheduled, that can be useful information too. You can
            keep the day simple or add events from Calendar when you want.
          </p>
          <Button asChild variant="outline" className="mt-4 rounded-full">
            <Link href="/calendar">Open Calendar</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
