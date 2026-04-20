/**
 * @screen: plan
 * @category: Flow
 * @source: docs/design/claude-export/design-system/screens-1.jsx:L301-L383
 * @queries:
 *   - planBlocks.listForDay (Long Run 2; @todo: requires schema add planBlocks + by_userId_deletedAt)
 *   - tasks.listByUser withIndex("by_userId_deletedAt")
 * @mutations:
 *   - planBlocks.replaceDay (Long Run 2)
 * @routes-to: /today
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
"use client";

import { useState } from "react";
import { mockCoachPlanBubble, mockPlanBlocks, mockPlanCoachEnergyCaption, mockPlanSummary } from "@tempo/mock-data";
import { Button, CoachBubble, SoftCard } from "@tempo/ui/primitives";
import { Leaf, Pebble, Sparkles } from "@tempo/ui/icons";
import { ScreenSurface, type ViewMode } from "@/components/tempo-port/ScreenSurface";

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

function blockToneClasses(tone: (typeof mockPlanBlocks)[0]["tone"]) {
  if (tone === "accent") {
    return "border-l-[3px] border-primary bg-[color:var(--color-tempo-orange)]/12";
  }
  if (tone === "moss") {
    return "border-l-[3px] border-[color:var(--color-moss)] bg-[color:var(--color-moss)]/10";
  }
  return "border-l-[3px] border-[color:var(--color-slate-blue)] bg-[color:var(--color-slate-blue)]/10";
}

export default function Page() {
  const [mode, setMode] = useState<ViewMode>("ready");
  const [dayWeek, setDayWeek] = useState<"day" | "week">("day");

  return (
    <ScreenSurface mode={mode} onModeChange={setMode}>
      <div className="mx-auto max-w-6xl space-y-8 p-6 pb-24 md:p-8">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="font-eyebrow text-muted-foreground">Plan · Thursday</p>
            <h1 className="text-h1 font-serif text-foreground">Let&apos;s stage today.</h1>
            <p className="max-w-xl text-body leading-relaxed text-muted-foreground">
              Coach suggests six blocks based on yesterday&apos;s energy curve and your two anchors (pages + walk).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-border bg-surface-sunken p-0.5">
              {/*
                @action setPlanGranularityDay
                @query: planBlocks.listForDay
                @auth: required
                @env: NEXT_PUBLIC_CONVEX_URL
                @source: screens-1.jsx:L323
              */}
              <Button
                type="button"
                variant={dayWeek === "day" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setDayWeek("day")}
              >
                Day
              </Button>
              {/*
                @action setPlanGranularityWeek
                @query: planBlocks.listForWeek (Long Run 2)
                @auth: required
                @env: NEXT_PUBLIC_CONVEX_URL
                @source: screens-1.jsx:L324
              */}
              <Button
                type="button"
                variant={dayWeek === "week" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setDayWeek("week")}
              >
                Week
              </Button>
            </div>
            {/*
              @action replanWithCoach
              @action-call: coach.replanDay (Long Run 2)
              @auth: required
              @errors: toast
              @env: NEXT_PUBLIC_CONVEX_URL
              @source: screens-1.jsx:L326
            */}
            <Button type="button" variant="primary" size="md" leadingIcon={<Sparkles size={14} />}>
              Re-plan
            </Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <SoftCard padding="md">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 className="text-h3 font-serif text-foreground">Timeline</h2>
              <span className="text-caption text-muted-foreground">{mockPlanSummary}</span>
            </div>
            <ul className="space-y-2">
              {mockPlanBlocks.map((b) => (
                <li
                  key={b.id}
                  className={[
                    "rounded-lg border border-border-soft px-4 py-3",
                    blockToneClasses(b.tone),
                  ].join(" ")}
                >
                  <div className="font-medium text-foreground">{b.title}</div>
                  <div className="text-caption text-muted-foreground">
                    {b.startLabel}–{b.endLabel}
                  </div>
                </li>
              ))}
            </ul>
          </SoftCard>

          <aside className="space-y-6">
            <SoftCard padding="md">
              <p className="mb-3 font-eyebrow text-muted-foreground">Energy check-in</p>
              <EnergyBarPreview level={4} />
              <p className="mt-2 text-caption text-muted-foreground">{mockPlanCoachEnergyCaption}</p>
            </SoftCard>
            <SoftCard padding="md">
              <p className="mb-3 font-eyebrow text-muted-foreground">Anchors</p>
              <ul className="space-y-3 text-small text-foreground">
                <li className="flex items-center gap-2">
                  <Pebble size={16} className="shrink-0 text-muted-foreground" />
                  <span>Morning pages — 8:00</span>
                </li>
                <li className="flex items-center gap-2">
                  <Leaf size={16} className="shrink-0 text-muted-foreground" />
                  <span>10-minute walk — 12:30</span>
                </li>
              </ul>
            </SoftCard>
            <SoftCard tone="sunken" padding="md">
              <CoachBubble>{mockCoachPlanBubble}</CoachBubble>
            </SoftCard>
          </aside>
        </div>
      </div>
    </ScreenSurface>
  );
}
