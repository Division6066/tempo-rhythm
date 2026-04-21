"use client";

import { Button, SoftCard } from "@tempo/ui/primitives";
import { ScreenHeader } from "@/components/tempo/ScreenHeader";

const STATES = [
  {
    id: "tasks-empty",
    emoji: "🌿",
    title: "No tasks today.",
    body: "That's a valid state. Would you like to add one, or rest?",
    cta: "Add a task",
  },
  {
    id: "notes-empty",
    emoji: "📓",
    title: "Your notes are empty.",
    body: "Pick up any thread — an idea, a worry, a reminder.",
    cta: "New note",
  },
  {
    id: "calendar-empty",
    emoji: "🕰",
    title: "No events scheduled.",
    body: "Quiet afternoons are a feature, not a bug.",
    cta: "Add event",
  },
  {
    id: "projects-empty",
    emoji: "🗂",
    title: "No active projects.",
    body: "Projects help you group work. Keep this number small.",
    cta: "New project",
  },
  {
    id: "habits-empty",
    emoji: "🔁",
    title: "No habits yet.",
    body: "One tiny daily thing beats ten things you won't do.",
    cta: "Start a habit",
  },
  {
    id: "coach-empty",
    emoji: "🧠",
    title: "No coach conversation yet.",
    body: "Say hi. Coach stays quiet until you're ready.",
    cta: "Start talking",
  },
];

/**
 * EmptyStatesScreen — a library of gentle empty states shown across app.
 * @source docs/design/claude-export/design-system/screens-6.jsx (ScreenEmptyStates)
 */
export function EmptyStatesScreen() {
  return (
    <div className="flex flex-col">
      <ScreenHeader
        eyebrow="You"
        title="Empty states"
        lede="How Tempo talks when there's nothing to show. No guilt. No hustle."
      />

      <div className="grid gap-5 px-6 py-6 md:grid-cols-2 xl:grid-cols-3">
        {STATES.map((state) => (
          <SoftCard key={state.id} tone="sunken" padding="md">
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span aria-hidden className="text-4xl">
                {state.emoji}
              </span>
              <h3 className="font-serif text-h4">{state.title}</h3>
              <p className="text-small text-muted-foreground">{state.body}</p>
              {/*
               * @behavior: Each empty-state CTA routes to the matching capture surface.
               * @convex-mutation-needed: (varies per state)
               */}
              <Button variant="soft" size="sm">
                {state.cta}
              </Button>
            </div>
          </SoftCard>
        ))}
      </div>
    </div>
  );
}
