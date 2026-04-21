"use client";

import { useState } from "react";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { mockCalendarWeek, mockEvents, mockTasks } from "@tempo/mock-data";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";
import { useDemoToast } from "@/components/tempo/DemoToast";

type View = "day" | "week" | "month";

/**
 * CalendarScreen — day / week / month views, with event lanes + unscheduled.
 * @source docs/design/claude-export/design-system/screens-3.jsx (ScreenCalendar)
 */
export function CalendarScreen() {
  const toast = useDemoToast();
  const [view, setView] = useState<View>("week");
  const [activeDay, setActiveDay] = useState(mockCalendarWeek.activeDay);

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="Library"
        title="Calendar"
        lede="Scheduled blocks, unscheduled intake, and empty space left on purpose."
        right={
          <>
            {(["day", "week", "month"] as const).map((v) => (
              /*
               * @behavior: Switch calendar view granularity.
               * @convex-query-needed: calendar.listRange
               */
              <Button
                key={v}
                variant={view === v ? "primary" : "subtle"}
                size="sm"
                onClick={() => setView(v)}
              >
                {v}
              </Button>
            ))}
            {/*
             * @behavior: Create new calendar event from button.
             * @convex-mutation-needed: calendar.createEvent
             */}
            <Button
              variant="soft"
              size="sm"
              onClick={() => toast("Created. (demo) calendar.createEvent.")}
            >
              + Event
            </Button>
          </>
        }
      />

      <div className="grid gap-5 px-6 py-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <SoftCard tone="default" padding="md">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-h4 font-serif">April · {view}</h3>
            <div className="font-tabular text-caption text-muted-foreground">
              week 17
            </div>
          </div>

          <div className="mb-3 grid grid-cols-7 gap-1">
            {mockCalendarWeek.days.map((day, i) => {
              const isActive = day === activeDay;
              const date = 14 + i;
              return (
                /*
                 * @behavior: Select a day to focus; load that day's events.
                 * @convex-query-needed: calendar.listForDate
                 */
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDay(day)}
                  className={[
                    "flex flex-col items-center rounded-lg px-2 py-3 text-small transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-sunken text-muted-foreground hover:bg-surface",
                  ].join(" ")}
                >
                  <span className="font-eyebrow">{day}</span>
                  <span className="font-tabular text-h4">{date}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3">
            <div className="font-eyebrow">Scheduled</div>
            {mockEvents
              .filter((ev) => ev.lane === "scheduled")
              .map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between rounded-lg border-l-4 border-primary bg-card p-3"
                >
                  <div>
                    <div className="text-body">{ev.title}</div>
                    <div className="font-tabular text-caption text-muted-foreground">
                      {ev.startLabel} – {ev.endLabel}
                    </div>
                  </div>
                  {/*
                   * @behavior: Reschedule by opening event editor (demo toast only).
                   * @convex-mutation-needed: calendar.updateEvent
                   */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast("Opened editor. (demo) calendar.updateEvent.")}
                  >
                    Edit
                  </Button>
                </div>
              ))}

            <div className="pt-3 font-eyebrow">Unscheduled intake</div>
            {mockEvents
              .filter((ev) => ev.lane === "unscheduled")
              .map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between rounded-lg border border-dashed border-border-soft bg-surface-sunken p-3"
                >
                  <span className="text-body">{ev.title}</span>
                  {/*
                   * @behavior: Schedule this item by assigning a time block.
                   * @convex-mutation-needed: calendar.scheduleFromIntake
                   */}
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={() => toast("Scheduled. (demo) calendar.scheduleFromIntake.")}
                  >
                    Schedule
                  </Button>
                </div>
              ))}
          </div>
        </SoftCard>

        <div className="flex flex-col gap-5">
          <SoftCard tone="default" padding="md">
            <div className="font-eyebrow mb-3">Unplanned tasks</div>
            <div className="flex flex-col gap-2">
              {mockTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg bg-surface-sunken p-3"
                >
                  <div>
                    <div className="text-small">{task.title}</div>
                    <div className="text-caption text-muted-foreground">
                      {task.estimateMinutes}m · {task.energy} energy
                    </div>
                  </div>
                  <Pill tone="amber">drag</Pill>
                </div>
              ))}
            </div>
          </SoftCard>

          <SoftCard tone="sunken" padding="md">
            <div className="font-eyebrow mb-2">Privacy</div>
            <p className="text-small text-muted-foreground">
              Calendar is local-first. Nothing leaves Convex without your
              explicit sync in Integrations.
            </p>
          </SoftCard>
        </div>
      </div>
    </div>
  );
}
