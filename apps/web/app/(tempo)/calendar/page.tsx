/**
 * @screen: calendar
 * @category: Library
 * @source: docs/design/claude-export/design-system/screens-2.jsx / screens-3.jsx
 * @queries: calendarEvents.listRange (Long Run 2; @todo: requires schema add calendarEvents)
 * @mutations: calendarEvents.createExternalLink (Long Run 2)
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import { useMemo, useState } from "react";
import { mockCalendarEvents, mockCalendarWeekLabel } from "@tempo/mock-data";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

function formatTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function Page() {
  const [mode, setMode] = useState<ViewMode>("ready");

  const grouped = useMemo(() => {
    const map = new Map<string, typeof mockCalendarEvents>();
    for (const ev of mockCalendarEvents) {
      const day = new Date(ev.startAt).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const list = map.get(day) ?? [];
      list.push(ev);
      map.set(day, list);
    }
    return [...map.entries()];
  }, []);

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-4xl space-y-8 p-6 pb-24 md:p-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-eyebrow text-muted-foreground">Library · Calendar</p>
            <h1 className="text-h1 font-serif text-foreground">Your week at a glance.</h1>
            <p className="mt-1 text-body text-muted-foreground">{mockCalendarWeekLabel}</p>
          </div>
          {/*
            @action createCalendarBlock
            @mutation: calendarEvents.create (Long Run 2)
            @auth: required
            @errors: toast
            @env: NEXT_PUBLIC_CONVEX_URL
          */}
          <Button type="button" variant="primary">
            Add block
          </Button>
        </header>

        <div className="space-y-6">
          {grouped.map(([day, events]) => (
            <SoftCard key={day} padding="md">
              <h2 className="font-serif text-lg text-foreground">{day}</h2>
              <ul className="mt-3 space-y-2">
                {events.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex flex-col gap-1 rounded-lg border border-border-soft bg-surface-sunken/50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <span className="font-medium text-foreground">{ev.title}</span>
                      <span className="ml-2 text-caption font-tabular text-muted-foreground">
                        {formatTime(ev.startAt)} – {formatTime(ev.endAt)}
                      </span>
                    </div>
                    <Pill tone={ev.source === "tempo" ? "orange" : "slate"}>{ev.source}</Pill>
                  </li>
                ))}
              </ul>
            </SoftCard>
          ))}
        </div>
      </div>
    </ScreenSurface>
  );
}
