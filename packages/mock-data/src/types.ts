/**
 * Shared TypeScript types for Tempo Flow fixtures.
 *
 * These mirror the shape of what Convex will return in Long Run 2 — they
 * use plain JS Date/number types rather than Convex `Id<"...">` branded
 * types so tests and previews aren't coupled to Convex codegen.
 */

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";

export type MockTask = {
  id: string;
  title: string;
  notes?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId?: string;
  goalId?: string;
  dueAt?: number; // epoch ms
  completedAt?: number;
  createdAt: number;
  /** Library/tasks list label from design export (e.g. "Today", "Tomorrow"). */
  dueLabel?: string;
  /** Estimated minutes from design export TaskRow. */
  estimatedMinutes?: number;
  /** Design-export energy hint: low | medium | high */
  energy?: "low" | "medium" | "high";
  /** Tag slug without # */
  tag?: string;
  /** Coach / AI flagged row */
  coachSuggested?: boolean;
};

export type MockHabit = {
  id: string;
  name: string;
  cadence: "daily" | "weekly" | "weekdays";
  streak: number;
  longestStreak?: number;
  completionRatio?: number; // 0..1 for ring
  /** Epoch ms of the last 7 completed days (may be shorter if new). */
  recentCompletions: number[];
  color: "moss" | "brick" | "amber" | "slate" | "orange";
};

export type MockNote = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  updatedAt: number;
};

export type MockJournalEntry = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  /** Mood chips from design export (screens-2.jsx). */
  mood: "settled" | "tired" | "anxious" | "steady" | "bright" | "low" | "meh";
  body: string;
  prompt?: string;
  wordCount?: number;
};

export type MockCalendarEvent = {
  id: string;
  title: string;
  startAt: number;
  endAt: number;
  location?: string;
  taskId?: string;
  source: "tempo" | "google" | "ics";
};

export type MockCoachMessage = {
  id: string;
  role: "coach" | "user" | "system";
  body: string;
  timestamp: number;
  suggestion?: {
    kind: "accept" | "tweak" | "skip";
    taskIds?: string[];
    preview: string;
  };
};

export type MockRoutine = {
  id: string;
  name: string;
  description: string;
  steps: Array<{ id: string; title: string; durationMin: number }>;
  lastRunAt?: number;
};

export type MockGoal = {
  id: string;
  title: string;
  description: string;
  progress: number; // 0..1
  milestones: Array<{ id: string; title: string; done: boolean }>;
  targetAt?: number;
};

export type MockProject = {
  id: string;
  name: string;
  color: "moss" | "brick" | "amber" | "slate" | "orange";
  taskIds: string[];
  noteIds: string[];
};

export type MockTemplateTone =
  | "amber"
  | "orange"
  | "slate"
  | "moss"
  | "rust"
  | "tempo";

export type MockTemplate = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  stepCount: number;
  lastRunAt?: number;
  kicker?: string;
  cadence?: string;
  author?: string;
  tone?: MockTemplateTone;
  starred?: boolean;
};

export type MockBrainDumpSortedItem = {
  text: string;
  type: "task" | "reminder" | "worry" | "idea" | "note";
  confidence: number;
};

export type MockPlanBlock = {
  id: string;
  startLabel: string;
  endLabel: string;
  title: string;
  tone: "moss" | "accent" | "slate";
};

export type MockDailyNoteTaskLine = {
  id: string;
  title: string;
  done: boolean;
  time?: string;
  tag?: string;
  energy?: "low" | "medium" | "high";
};

export type MockDailyNoteBody = {
  fileName: string;
  headline: string;
  topTasks: MockDailyNoteTaskLine[];
  laterTasks: MockDailyNoteTaskLine[];
  streakLabel: string;
  coachGreeting: string;
};

export type MockUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  trialEndsAt: number;
  isPremium: boolean;
  preferences: {
    theme: "light" | "dark" | "system";
    dyslexiaFont: boolean;
    reducedMotion: boolean;
  };
};
