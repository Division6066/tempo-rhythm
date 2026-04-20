/**
 * @screen: today
 * @category: Flow
 * @source: docs/design/claude-export/design-system/screens-1.jsx:L4-L111
 * @summary: Single-column daily canvas. Brain-dump composer + staged plan + coach suggestion.
 * @queries:
 *   - tasks.listByUser({ userId, deletedAt: undefined }) withIndex("by_userId_deletedAt")
 *   - habits.listByUser({ userId, deletedAt: undefined }) withIndex("by_userId_deletedAt")
 *   - coach.latestSuggestion (conversations/messages — @todo: requires schema add Long Run 2)
 * @mutations:
 *   - tasks.complete({ taskId }) @index by_userId_status
 *   - tasks.softDelete({ taskId }) @index by_userId_deletedAt @soft-delete: yes
 * @routes-to: /plan, /brain-dump, /coach
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 * @notes: Copy from Claude export; Vercel preview uses mock-data only until Long Run 2.
 */
"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  mockCoachTodayBubble,
  mockTodayPage,
  mockTodayTasks,
} from "@tempo/mock-data";
import { Button, CoachBubble, Pill, Ring, SoftCard, TaskRow } from "@tempo/ui/primitives";
import { Clock, Plus, Sparkles } from "@tempo/ui/icons";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

function taskMeta(t: (typeof mockTodayTasks)[0]): string {
  const parts: string[] = [];
  if (t.dueLabel) {
    parts.push(t.dueLabel);
  }
  if (t.estimatedMinutes != null) {
    parts.push(`${t.estimatedMinutes} min`);
  }
  if (t.energy) {
    parts.push(`${t.energy} energy`);
  }
  return parts.join(" · ");
}

function EnergyBarPreview({ level }: { level: number }) {
  return (
    <div className="flex gap-1" role="img" aria-label={`Energy level ${level} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={[
            "h-2 w-6 rounded-full",
            i < level ? "bg-primary" : "bg-surface-sunken",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>("ready");
  const [tasks, setTasks] = useState(() =>
    mockTodayTasks.map((t) => ({
      ...t,
      done: t.status === "done",
    })),
  );

  const doneCount = useMemo(() => tasks.filter((t) => t.done).length, [tasks]);
  const total = tasks.length;
  const ringPct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const toggle = (taskId: string, next: boolean) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              done: next,
              status: next ? ("done" as const) : ("todo" as const),
            }
          : t,
      ),
    );
  };

  const dateEyebrow = mockTodayPage.dateLabel.replace(", ", " · ");
  const streakLabel = `${mockTodayPage.streakDays} days`;
  const anchors = mockTodayPage.habitsSidebar.map((h) =>
    "streakLabel" in h
      ? {
          label: h.name,
          ring: h.ringPct,
          pill: h.streakLabel,
          pillTone: "moss" as const,
        }
      : {
          label: h.name,
          ring: h.ringPct,
          pill: h.pill,
          pillTone: h.pill === "due" ? ("amber" as const) : ("neutral" as const),
        },
  );
  const upNext = mockTodayPage.upNextLines;

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-6xl space-y-8 p-6 pb-24 md:p-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="font-eyebrow text-muted-foreground">{dateEyebrow}</p>
            <h1 className="text-h1 font-serif text-foreground">{mockTodayPage.greeting}</h1>
            <p className="max-w-xl text-body leading-relaxed text-muted-foreground">
              {mockTodayPage.lede}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="text-right">
              <p className="font-eyebrow text-muted-foreground">Energy</p>
              <EnergyBarPreview level={mockTodayPage.energyLevel} />
            </div>
            <div className="hidden h-10 w-px bg-border-soft sm:block" aria-hidden />
            <div className="text-right">
              <p className="font-eyebrow text-muted-foreground">Streak</p>
              <p className="font-serif text-[22px] font-medium text-foreground">
                {streakLabel}
              </p>
            </div>
            {/*
              @action openPlanWithCoach
              @navigate: /plan
              @query: planBlocks.listForDay (Long Run 2; @todo: requires schema add planBlocks)
              @auth: required
              @errors: toast on failure
              @env: NEXT_PUBLIC_CONVEX_URL
              @source: screens-1.jsx:L18-L19
            */}
            <Button
              type="button"
              variant="primary"
              size="md"
              leadingIcon={<Sparkles size={14} />}
              onClick={() => router.push("/plan")}
            >
              Plan with Coach
            </Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_minmax(280px,360px)]">
          <div className="space-y-6">
            <SoftCard padding="md">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-eyebrow text-muted-foreground">Today&apos;s anchors</p>
                  <h2 className="text-h2 font-serif text-foreground">
                    {doneCount} of {total} things
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <Ring size={40} stroke={3} value={ringPct} max={100}>
                    <span className="text-caption font-tabular">{ringPct}</span>
                  </Ring>
                  {/*
                    @action openQuickCapture
                    @mutation: tasks.createDraft (Long Run 2)
                    @index: by_userId_deletedAt
                    @soft-delete: no
                    @optimistic: prepend row
                    @auth: required
                    @errors: inline field error
                    @env: NEXT_PUBLIC_CONVEX_URL
                    @source: screens-1.jsx:L50
                  */}
                  <Button type="button" variant="soft" size="sm" leadingIcon={<Plus size={14} />}>
                    Add
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-border-soft rounded-lg border border-border-soft">
                {tasks.map((t) => (
                  <TaskRow
                    key={t.id}
                    taskId={t.id}
                    title={t.title}
                    done={t.done}
                    meta={taskMeta(t)}
                    onToggle={(id, next) => toggle(id, next)}
                    trailing={
                      t.coachSuggested ? (
                        <Pill tone="orange" className="shrink-0">
                          Coach
                        </Pill>
                      ) : null
                    }
                  />
                ))}
              </div>
              <SoftCard tone="sunken" padding="sm" className="mt-4 border-border-soft">
                <p className="text-small text-muted-foreground">
                  Two overdue things from yesterday. Carry them to today, or let them rest?
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {/*
                    @action carryOverOverdue
                    @mutation: tasks.bulkReschedule (Long Run 2)
                    @index: by_userId_dueAt
                    @soft-delete: no
                    @confirm: undoable 5s
                    @auth: required
                    @errors: toast
                    @env: NEXT_PUBLIC_CONVEX_URL
                  */}
                  <Button type="button" size="sm" variant="soft">
                    Carry to today
                  </Button>
                  {/*
                    @action dismissOverduePrompt
                    @mutation: none (client dismiss + optional coach.dismissPrompt)
                    @auth: required
                    @errors: none
                    @env: NEXT_PUBLIC_CONVEX_URL
                  */}
                  <Button type="button" size="sm" variant="ghost">
                    Let them rest
                  </Button>
                </div>
              </SoftCard>
            </SoftCard>

            <SoftCard tone="sunken" padding="md">
              <CoachBubble
                actions={
                  <>
                    {/*
                      @action acceptCoachStageOutline
                      @mutation: coach.acceptSuggestion (Long Run 2; maps to messages insert)
                      @index: by_conversationId_createdAt
                      @soft-delete: no
                      @optimistic: disable buttons until ack
                      @auth: required
                      @errors: toast
                      @env: NEXT_PUBLIC_CONVEX_URL
                      @source: screens-1.jsx:L64
                    */}
                    <Button type="button" size="sm" variant="primary">
                      Stage the outline
                    </Button>
                    {/*
                      @action skipCoachSuggestion
                      @mutation: coach.skipSuggestion
                      @auth: required
                      @errors: toast
                      @env: NEXT_PUBLIC_CONVEX_URL
                      @source: screens-1.jsx:L65
                    */}
                    <Button type="button" size="sm" variant="ghost">
                      Not now
                    </Button>
                  </>
                }
              >
                {mockCoachTodayBubble}
              </CoachBubble>
            </SoftCard>
          </div>

          <aside className="space-y-6">
            <SoftCard padding="md">
              <p className="mb-3 font-eyebrow text-muted-foreground">Habits · today</p>
              <div className="space-y-4">
                {anchors.map((h) => (
                  <div key={h.label} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <Ring size={32} stroke={3} value={Math.round(h.ring * 100)} max={100} />
                      <span className="truncate font-medium text-foreground">{h.label}</span>
                    </div>
                    <Pill tone={h.pillTone}>{h.pill}</Pill>
                  </div>
                ))}
              </div>
            </SoftCard>

            <SoftCard padding="md">
              <p className="mb-3 font-eyebrow text-muted-foreground">Up next</p>
              <ul className="space-y-0 divide-y divide-border-soft">
                {upNext.map((line) => (
                  <li key={line} className="flex items-center gap-2 py-2 text-small text-foreground">
                    <Clock size={14} strokeWidth={1.5} className="shrink-0 text-muted-foreground" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </SoftCard>

            <SoftCard tone="sunken" padding="md" className="border-dashed border-border-soft">
              <p className="font-eyebrow text-muted-foreground">Pebble of the day</p>
              <p className="mt-2 font-serif text-lg leading-relaxed text-foreground">
                {mockTodayPage.pebbleQuote}
              </p>
            </SoftCard>
          </aside>
        </div>
      </div>
    </ScreenSurface>
  );
}
