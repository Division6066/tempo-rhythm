"use client";

import { useMemo, useState } from "react";
import { Button, Pill, SoftCard } from "@tempo/ui/primitives";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";

const ITEMS = [
  { id: "a1", type: "task", actor: "you", text: "Completed ‘Review PR from Sam'", when: "2m ago" },
  { id: "a2", type: "coach", actor: "coach", text: "Suggested: stage Tempo 1.0 post outline", when: "8m ago" },
  { id: "a3", type: "habit", actor: "you", text: "Checked in: Morning meds", when: "1h ago" },
  { id: "a4", type: "journal", actor: "you", text: "Journal entry saved", when: "2h ago" },
  { id: "a5", type: "note", actor: "you", text: "Edited ‘Launch copy scratchpad'", when: "yesterday" },
  { id: "a6", type: "routine", actor: "you", text: "Completed routine: Morning startup", when: "yesterday" },
];

type Filter = "all" | "task" | "coach" | "habit" | "journal" | "note" | "routine";

/**
 * ActivityScreen — chronological feed of user + coach activity.
 * @source docs/design/claude-export/design-system/screens-5.jsx (ScreenActivity)
 */
export function ActivityScreen() {
  const [filter, setFilter] = useState<Filter>("all");
  const filtered = useMemo(
    () => ITEMS.filter((item) => filter === "all" || item.type === filter),
    [filter],
  );

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "task", label: "Tasks" },
    { id: "coach", label: "Coach" },
    { id: "habit", label: "Habits" },
    { id: "journal", label: "Journal" },
    { id: "note", label: "Notes" },
    { id: "routine", label: "Routines" },
  ];

  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="You"
        title="Recent activity"
        lede="Everything that's happened — the only log Tempo keeps."
      />

      <div className="flex flex-wrap gap-2 px-6">
        {filters.map((f) => (
          /*
           * @behavior: Filter activity feed by type.
           * @convex-query-needed: activity.listByType
           */
          <Button
            key={f.id}
            variant={filter === f.id ? "primary" : "subtle"}
            size="sm"
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="px-6 py-6">
        <SoftCard tone="default" padding="md">
          <ol className="relative border-l border-border-soft pl-5">
            {filtered.map((item) => (
              <li key={item.id} className="mb-4">
                <span
                  className={[
                    "absolute -left-1.5 mt-1 block h-3 w-3 rounded-full",
                    item.actor === "coach" ? "bg-[color:var(--color-tempo-orange)]" : "bg-primary",
                  ].join(" ")}
                />
                <div className="flex items-center gap-2">
                  <Pill tone={item.actor === "coach" ? "orange" : "slate"}>
                    {item.type}
                  </Pill>
                  <span className="font-tabular text-caption text-muted-foreground">
                    {item.when}
                  </span>
                </div>
                <p className="mt-1 text-body">{item.text}</p>
              </li>
            ))}
          </ol>
        </SoftCard>
      </div>
    </div>
  );
}
