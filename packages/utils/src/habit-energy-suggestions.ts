export type EnergyLevel = "low" | "medium" | "high";
export type EnergySuggestionStatus = "pending" | "accepted" | "rejected";

export type EnergySuggestion = {
  id: string;
  habitName: string;
  energy: EnergyLevel;
  title: string;
  body: string;
  status?: EnergySuggestionStatus;
};

export const habitRoutineCopy = {
  habits: {
    title: "Habits",
    summary: "Habit rings with weekly progress.",
    mobileSummary: "Mobile habits with ring rows.",
    suggestionPrompt: "Pick the habit that fits your energy right now.",
    acceptLabel: "Add this gentle step",
    rejectLabel: "Not for now",
    emptyState: "No habit rhythm here yet. Start with one tiny repeatable action.",
  },
  routines: {
    title: "Routines",
    summary: "Routine library.",
    mobileSummary: "Mobile routines.",
    suggestionPrompt: "Choose a routine that meets today's energy.",
    acceptLabel: "Use this routine",
    rejectLabel: "Leave it for later",
    emptyState: "No routine saved yet. A calm starter flow can begin with one step.",
  },
} as const;

export function resolveEnergySuggestion(
  suggestions: readonly EnergySuggestion[],
  suggestionId: string,
  status: Exclude<EnergySuggestionStatus, "pending">
): EnergySuggestion[] {
  let found = false;
  const resolved = suggestions.map((suggestion) => {
    if (suggestion.id !== suggestionId) {
      return suggestion;
    }

    found = true;
    return {
      ...suggestion,
      status,
    };
  });

  if (!found) {
    throw new Error("Suggestion not found");
  }

  return resolved;
}
