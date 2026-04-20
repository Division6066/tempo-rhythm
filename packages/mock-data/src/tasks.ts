import { mockAtUtcHour, MOCK_REFERENCE_MS } from "./constants";
import type { MockBrainDumpSortedItem, MockPlanBlock, MockTask } from "./types";

/** Today / dashboard rows — screens-1.jsx */
export const mockTodayTasks: MockTask[] = [
  {
    id: "task-today-1",
    title: "Morning pages",
    status: "done",
    priority: "low",
    createdAt: mockAtUtcHour(7, 0),
    dueAt: mockAtUtcHour(8, 0),
    completedAt: mockAtUtcHour(8, 5),
    dueLabel: "08:00",
    estimatedMinutes: 15,
    energy: "low",
  },
  {
    id: "task-today-2",
    title: "Draft Tempo 1.0 launch post",
    status: "in_progress",
    priority: "high",
    createdAt: mockAtUtcHour(8, 0),
    dueAt: mockAtUtcHour(9, 30),
    dueLabel: "09:30",
    estimatedMinutes: 60,
    energy: "high",
    tag: "writing",
    coachSuggested: true,
  },
  {
    id: "task-today-3",
    title: "Review PRs from yesterday",
    status: "todo",
    priority: "medium",
    createdAt: mockAtUtcHour(8, 30),
    dueAt: mockAtUtcHour(11, 0),
    dueLabel: "11:00",
    estimatedMinutes: 30,
    energy: "medium",
  },
  {
    id: "task-today-4",
    title: "10-minute walk",
    status: "todo",
    priority: "low",
    createdAt: mockAtUtcHour(9, 0),
    dueAt: mockAtUtcHour(12, 30),
    dueLabel: "12:30",
    estimatedMinutes: 10,
    energy: "low",
  },
  {
    id: "task-today-5",
    title: "Respond to three founder questions",
    status: "todo",
    priority: "medium",
    createdAt: mockAtUtcHour(9, 15),
    dueAt: mockAtUtcHour(14, 0),
    dueLabel: "14:00",
    estimatedMinutes: 25,
    energy: "medium",
    coachSuggested: true,
  },
];

/** Library · Tasks — screens-1.jsx ScreenTasks */
export const mockLibraryTasks: MockTask[] = [
  {
    id: "task-lib-1",
    title: "Draft Tempo 1.0 launch post",
    status: "todo",
    priority: "high",
    createdAt: MOCK_REFERENCE_MS - 86400000,
    dueLabel: "Today",
    estimatedMinutes: 60,
    energy: "high",
    tag: "writing",
    coachSuggested: true,
  },
  {
    id: "task-lib-2",
    title: "Finish landing copy",
    status: "todo",
    priority: "medium",
    createdAt: MOCK_REFERENCE_MS - 172800000,
    dueLabel: "Today",
    estimatedMinutes: 45,
    energy: "medium",
    tag: "writing",
  },
  {
    id: "task-lib-3",
    title: "Review PRs from yesterday",
    status: "todo",
    priority: "medium",
    createdAt: MOCK_REFERENCE_MS - 3600000,
    dueLabel: "Today",
    estimatedMinutes: 30,
    energy: "medium",
  },
  {
    id: "task-lib-4",
    title: "Book dentist",
    status: "todo",
    priority: "low",
    createdAt: MOCK_REFERENCE_MS - 259200000,
    dueLabel: "Tomorrow",
    estimatedMinutes: 5,
    energy: "low",
    tag: "admin",
  },
  {
    id: "task-lib-5",
    title: "Ask Sam about the Convex migration",
    status: "todo",
    priority: "medium",
    createdAt: MOCK_REFERENCE_MS - 432000000,
    dueLabel: "Fri",
    estimatedMinutes: 15,
    energy: "medium",
    tag: "eng",
  },
  {
    id: "task-lib-6",
    title: "Publish weekly recap",
    status: "todo",
    priority: "low",
    createdAt: MOCK_REFERENCE_MS - 518400000,
    dueLabel: "Sun",
    estimatedMinutes: 25,
    energy: "low",
    coachSuggested: true,
  },
  {
    id: "task-lib-7",
    title: "Read one chapter of the Bach book",
    status: "done",
    priority: "low",
    createdAt: MOCK_REFERENCE_MS - 604800000,
    dueLabel: "Anytime",
    estimatedMinutes: 30,
    energy: "low",
    completedAt: MOCK_REFERENCE_MS - 7200000,
  },
];

/** Linked tasks on goal / project detail — screens-3.jsx */
export const mockGoalLinkedTaskTitles = [
  "Finish landing copy",
  "Launch post draft",
  "Submit to Apple",
] as const;

export const mockProjectDetailTasks: MockTask[] = [
  {
    id: "task-proj-1",
    title: "Finish landing copy",
    status: "todo",
    priority: "medium",
    projectId: "proj-tempo-10",
    createdAt: MOCK_REFERENCE_MS - 86400000,
  },
  {
    id: "task-proj-2",
    title: "Review PRs",
    status: "todo",
    priority: "medium",
    projectId: "proj-tempo-10",
    createdAt: MOCK_REFERENCE_MS - 72000000,
  },
  {
    id: "task-proj-3",
    title: "Submit to Apple",
    status: "todo",
    priority: "high",
    projectId: "proj-tempo-10",
    createdAt: MOCK_REFERENCE_MS - 36000000,
  },
  {
    id: "task-proj-4",
    title: "Push Android alpha",
    status: "done",
    priority: "medium",
    projectId: "proj-tempo-10",
    createdAt: MOCK_REFERENCE_MS - 259200000,
    completedAt: MOCK_REFERENCE_MS - 86400000,
  },
  {
    id: "task-proj-5",
    title: "Brand style guide — v1",
    status: "done",
    priority: "low",
    projectId: "proj-tempo-10",
    createdAt: MOCK_REFERENCE_MS - 345600000,
    completedAt: MOCK_REFERENCE_MS - 172800000,
  },
];

export const mockBrainDumpDefaultText =
  "Remember to finish the landing copy. Book dentist. Ask Sam about the Convex migration. Pick up groceries on the way home. Worry: am I shipping fast enough? Idea: use the orange gradient on the first-run splash. Journal later about the talk.";

export const mockBrainDumpSortedItems: MockBrainDumpSortedItem[] = [
  { text: "Finish the landing copy", type: "task", confidence: 0.94 },
  { text: "Book dentist", type: "task", confidence: 0.97 },
  { text: "Ask Sam about the Convex migration", type: "task", confidence: 0.91 },
  { text: "Pick up groceries on the way home", type: "reminder", confidence: 0.86 },
  { text: "Am I shipping fast enough?", type: "worry", confidence: 0.88 },
  { text: "Orange gradient on the first-run splash", type: "idea", confidence: 0.82 },
  { text: "Journal about the talk", type: "reminder", confidence: 0.79 },
];

export const mockBrainDumpPrompts = [
  "What's one thing you've been avoiding?",
  "Any small wins from yesterday?",
  "What would help your shoulders drop?",
] as const;

/** Today header + copy — screens-1.jsx */
export const mockTodayPage = {
  dateLabel: "Thursday, April 23",
  crumb: "Thursday, April 23",
  greeting: "Good morning, Amit.",
  lede: "Three things look doable this afternoon. Your energy tends to dip after lunch — that's allowed.",
  streakDays: 5,
  energyLevel: 4,
  pebbleQuote:
    '"10 minute walk" beats "some movement." — small, gentle, specific.',
  upNextLines: [
    "11:00 Review PRs · 30 min",
    "12:30 10-minute walk",
    "14:00 Respond to founder Qs",
  ],
  habitsSidebar: [
    { name: "Morning pages", streakLabel: "5-day streak", ringPct: 1 },
    { name: "10-min walk", pill: "due" as const, ringPct: 0.5 },
    { name: "Shutdown sequence", pill: "8pm" as const, ringPct: 0 },
  ],
} as const;

/** Planning timeline — screens-1.jsx ScreenPlan */
export const mockPlanBlocks: MockPlanBlock[] = [
  {
    id: "plan-1",
    startLabel: "8:00",
    endLabel: "8:15",
    title: "Morning pages",
    tone: "moss",
  },
  {
    id: "plan-2",
    startLabel: "9:30",
    endLabel: "10:30",
    title: "Draft Tempo 1.0 launch post",
    tone: "accent",
  },
  {
    id: "plan-3",
    startLabel: "11:00",
    endLabel: "11:30",
    title: "Review PRs",
    tone: "slate",
  },
  {
    id: "plan-4",
    startLabel: "12:30",
    endLabel: "12:40",
    title: "10-minute walk",
    tone: "moss",
  },
  {
    id: "plan-5",
    startLabel: "14:00",
    endLabel: "14:25",
    title: "Respond to founder Qs",
    tone: "accent",
  },
  {
    id: "plan-6",
    startLabel: "16:00",
    endLabel: "16:10",
    title: "Shutdown sequence",
    tone: "slate",
  },
];

export const mockPlanSummary =
  "6 blocks · 2h 30m focused work · 4h 30m open";
