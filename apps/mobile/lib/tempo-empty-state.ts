export type TempoEmptyStateCopy = {
  screenId: string;
  title: string;
  summary: string;
  actionLabel: string;
};

const DEFAULT_ACTION_LABEL = "Start gently";

export const tempoEmptyStateCopy = {
  today: {
    screenId: "today",
    title: "Today",
    summary:
      "No plans are waiting here yet. You can begin with one gentle next step when you want to shape the day.",
    actionLabel: "Plan one small thing",
  },
  tasks: {
    screenId: "tasks",
    title: "Tasks",
    summary:
      "Your task list is clear. Add something only when it would make today feel easier to hold.",
    actionLabel: "Add a task",
  },
  notes: {
    screenId: "notes",
    title: "Notes",
    summary:
      "No notes are saved yet. This can stay quiet until a thought feels worth catching.",
    actionLabel: "Capture a note",
  },
  coach: {
    screenId: "coach",
    title: "Coach",
    summary:
      "No coach thread has started yet. When you want company, the first message can be simple.",
    actionLabel: "Open a gentle check-in",
  },
  calendar: {
    screenId: "calendar",
    title: "Calendar",
    summary:
      "No events are connected yet. The calendar can stay open space until a real commitment belongs here.",
    actionLabel: "Connect a calendar",
  },
  capture: {
    screenId: "capture",
    title: "Capture",
    summary:
      "Nothing has been captured yet. You can drop a thought here without sorting it first.",
    actionLabel: "Capture a loose thought",
  },
  habits: {
    screenId: "habits",
    title: "Habits",
    summary:
      "No habits are tracked yet. Start with something kind and repeatable when it feels useful.",
    actionLabel: "Choose a tiny habit",
  },
  journal: {
    screenId: "journal",
    title: "Journal",
    summary:
      "No journal entries are here yet. A blank page is allowed to stay blank until reflection helps.",
    actionLabel: "Write one line",
  },
  templates: {
    screenId: "templates",
    title: "Templates",
    summary:
      "No templates are saved yet. Reuse can come later, after you notice what helps more than once.",
    actionLabel: "Browse starter shapes",
  },
} as const satisfies Record<string, TempoEmptyStateCopy>;

export type TempoEmptyStateScreenId = keyof typeof tempoEmptyStateCopy;

export function getTempoEmptyStateCopy(
  screenId: TempoEmptyStateScreenId,
): TempoEmptyStateCopy {
  return tempoEmptyStateCopy[screenId];
}

export function emptyStateActionLabel(
  actionLabel?: string,
): string {
  return actionLabel ?? DEFAULT_ACTION_LABEL;
}

export const emptyStateReassurance =
  "Nothing is missing. When you are ready, this screen will hold the next small step without making the blank space feel like a problem.";

export const emptyStateLeaveQuiet =
  "You can leave this empty until the next step feels clear.";
