import { mockAtUtcHour } from "./constants";
import type { MockCoachMessage } from "./types";

export const mockCoachWarmthLevel = 6;

export const mockCoachScopeSummary = "scope: 2 notes · 1 project";

export const mockCoachScopeItems = [
  { kind: "note" as const, title: "Launch notes" },
  { kind: "note" as const, title: "Onboarding copy" },
  { kind: "project" as const, title: "Tempo 1.0" },
];

export const mockCoachPastThreads = [
  "Shipping worries · Mon",
  "Outline: launch post · Sun",
  "Weekly review · Fri",
] as const;

/** Coach thread — screens-1.jsx ScreenCoach */
export const mockCoachMessages: MockCoachMessage[] = [
  {
    id: "coach-msg-1",
    role: "coach",
    body: "Morning. I noticed you dumped seven things earlier. Three of them look like worries about shipping. Want to talk about those, or should I stage the tasks first?",
    timestamp: mockAtUtcHour(9, 12),
  },
  {
    id: "coach-msg-2",
    role: "user",
    body: "Stage the tasks. I'll come back to the worries tonight.",
    timestamp: mockAtUtcHour(9, 13),
  },
  {
    id: "coach-msg-3",
    role: "coach",
    body: "Good. I'll add Finish landing copy, Book dentist, and Ask Sam about Convex to today. The dentist is quick — five minutes. Can we try it after your walk?",
    timestamp: mockAtUtcHour(9, 14),
  },
  {
    id: "coach-msg-4",
    role: "user",
    body: "Sure. Keep it gentle.",
    timestamp: mockAtUtcHour(9, 15),
  },
  {
    id: "coach-msg-5",
    role: "coach",
    body: "Always. One small note — you've mentioned shipping speed three times this week. It might be worth fifteen minutes of journal time on Friday. I'll leave a gentle prompt, not a task.",
    timestamp: mockAtUtcHour(9, 16),
  },
];

export const mockCoachQuickPills = [
  "Stage tasks",
  "Draft journal prompt",
  "Review this week",
] as const;

/** Today card coach copy — screens-1.jsx */
export const mockCoachTodayBubble =
  "Nice work on morning pages. When you're ready, the Tempo 1.0 post is the biggest thing — sixty minutes, high-energy. Want me to stage the outline first?";

export const mockCoachTodaySuggestion = {
  preview:
    "Two overdue things from yesterday. Carry them to today, or let them rest?",
  kind: "accept" as const,
  taskIds: ["task-today-3", "task-today-4"],
};

/** Planning sidebar — screens-1.jsx */
export const mockCoachPlanBubble =
  "Five things feels full but fine. If the afternoon wobbles, the founder questions can slide to Friday — they're not time-locked.";

export const mockCoachPersonalityLabel = "Gentle";

/** Plan blocks metadata exported from tasks package conceptually — ids here for coach links */
export const mockPlanCoachEnergyCaption =
  "Feeling alert — Coach leaned the day toward deeper work before noon.";
