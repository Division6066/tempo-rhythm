export type MockUserTier = "basic" | "pro" | "max";

export type MockUser = {
  id: string;
  name: string;
  email: string;
  tier: MockUserTier;
  coachDial: number;
  timezone: string;
  voiceMinutesUsedToday: number;
};

export type MockTask = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  project: string;
  energy: "low" | "medium" | "high";
  estimateMinutes: number;
  dueDateLabel: string;
  tags: string[];
};

export type MockHabit = {
  id: string;
  title: string;
  streak: number;
  frequencyLabel: string;
  completionPercent: number;
  completedToday: boolean;
};

export type MockNote = {
  id: string;
  title: string;
  type: "plain" | "meeting" | "idea" | "research";
  excerpt: string;
  tags: string[];
  updatedAtLabel: string;
};

export type MockJournalEntry = {
  id: string;
  dateLabel: string;
  mood: string;
  excerpt: string;
  tags: string[];
};

export type MockEvent = {
  id: string;
  title: string;
  startLabel: string;
  endLabel: string;
  lane: "scheduled" | "unscheduled";
};

export type MockCoachMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAtLabel: string;
};

export type MockTemplate = {
  id: string;
  title: string;
  type: "task_list" | "project" | "journal_format" | "note_structure";
  generationMethod: "manual" | "natural_language" | "picture_sketch";
  summary: string;
};

export type MockGoal = {
  id: string;
  title: string;
  progressPercent: number;
  dueDateLabel: string;
};

export type MockProject = {
  id: string;
  title: string;
  color: string;
  openTaskCount: number;
  dueDateLabel: string;
};

export const mockUser: MockUser = {
  id: "user_amit",
  name: "Amit",
  email: "amit@tempo.local",
  tier: "pro",
  coachDial: 6,
  timezone: "Asia/Jerusalem",
  voiceMinutesUsedToday: 18,
};

export const mockTasks: MockTask[] = [
  {
    id: "task_ship_preview",
    title: "Ship mobile preview v1",
    status: "in_progress",
    project: "Tempo Flow",
    energy: "high",
    estimateMinutes: 60,
    dueDateLabel: "Today · 10:30",
    tags: ["#tempo", "#launch"],
  },
  {
    id: "task_review_pr",
    title: "Review PR from Sam",
    status: "done",
    project: "Tempo Flow",
    energy: "medium",
    estimateMinutes: 20,
    dueDateLabel: "Today · 11:00",
    tags: ["#tempo"],
  },
  {
    id: "task_dentist_call",
    title: "Call the dentist",
    status: "todo",
    project: "Personal",
    energy: "low",
    estimateMinutes: 5,
    dueDateLabel: "Today · 14:00",
    tags: ["#health", "#admin"],
  },
  {
    id: "task_expense_report",
    title: "Submit expense report",
    status: "todo",
    project: "Admin",
    energy: "low",
    estimateMinutes: 5,
    dueDateLabel: "Tomorrow · 09:30",
    tags: ["#admin"],
  },
];

export const mockHabits: MockHabit[] = [
  {
    id: "habit_meds",
    title: "Morning meds",
    streak: 12,
    frequencyLabel: "Daily",
    completionPercent: 100,
    completedToday: true,
  },
  {
    id: "habit_walk",
    title: "Walk outside",
    streak: 7,
    frequencyLabel: "Daily",
    completionPercent: 86,
    completedToday: false,
  },
  {
    id: "habit_journal",
    title: "Journal check-in",
    streak: 4,
    frequencyLabel: "Daily",
    completionPercent: 72,
    completedToday: true,
  },
];

export const mockNotes: MockNote[] = [
  {
    id: "note_launch_copy",
    title: "Launch copy scratchpad",
    type: "idea",
    excerpt: "Need calmer headline. Current line feels sharp and salesy.",
    tags: ["#tempo", "#copy"],
    updatedAtLabel: "Edited 32m ago",
  },
  {
    id: "note_convex_auth",
    title: "Convex auth notes",
    type: "research",
    excerpt: "Session lifetime question for Sam. Check provider fallback path.",
    tags: ["#tempo", "#auth"],
    updatedAtLabel: "Edited yesterday",
  },
  {
    id: "note_weekly_review",
    title: "Weekly review template",
    type: "plain",
    excerpt: "Energy check-in, top 3, blockers, wins, what I avoided.",
    tags: ["#template"],
    updatedAtLabel: "Edited 2d ago",
  },
];

export const mockJournal: MockJournalEntry[] = [
  {
    id: "journal_2026_04_18",
    dateLabel: "Thu · Apr 18",
    mood: "foggy",
    excerpt: "Strong morning. Fog after lunch. Shipping fear showed up again.",
    tags: ["#work", "#pattern"],
  },
  {
    id: "journal_2026_04_17",
    dateLabel: "Wed · Apr 17",
    mood: "okay",
    excerpt: "Meds at 8am felt better than 7am. Keep morning protected.",
    tags: ["#body"],
  },
  {
    id: "journal_2026_04_16",
    dateLabel: "Tue · Apr 16",
    mood: "bright",
    excerpt: "Walk with Maya made launch anxiety feel smaller.",
    tags: ["#friends"],
  },
];

export const mockEvents: MockEvent[] = [
  {
    id: "evt_focus",
    title: "Deep focus · mobile preview",
    startLabel: "09:00",
    endLabel: "10:30",
    lane: "scheduled",
  },
  {
    id: "evt_pr",
    title: "Sam PR review",
    startLabel: "11:00",
    endLabel: "11:30",
    lane: "scheduled",
  },
  {
    id: "evt_dentist",
    title: "Call the dentist",
    startLabel: "14:00",
    endLabel: "14:05",
    lane: "scheduled",
  },
  {
    id: "evt_unscheduled",
    title: "Draft launch post",
    startLabel: "Unscheduled",
    endLabel: "",
    lane: "unscheduled",
  },
];

export const mockCoachThread: MockCoachMessage[] = [
  {
    id: "coach_1",
    role: "assistant",
    content:
      "Good morning. You have three open items from yesterday. Want to move them or finish one first?",
    createdAtLabel: "09:41",
  },
  {
    id: "coach_2",
    role: "user",
    content: "Stage them for today, but keep it gentle.",
    createdAtLabel: "09:42",
  },
  {
    id: "coach_3",
    role: "assistant",
    content:
      "Done. I staged expense report, dentist call, and Sam follow-up. Should I set a 10-minute check-in tonight?",
    createdAtLabel: "09:43",
  },
];

export const mockTemplates: MockTemplate[] = [
  {
    id: "tpl_weekly_review",
    title: "Weekly review · low-shame",
    type: "journal_format",
    generationMethod: "natural_language",
    summary: "Energy check-in, top 3, blockers, wins.",
  },
  {
    id: "tpl_builder_day",
    title: "Builder day scaffold",
    type: "task_list",
    generationMethod: "manual",
    summary: "Deep work block + admin sweep + shutdown.",
  },
  {
    id: "tpl_project_breakdown",
    title: "Project breakdown board",
    type: "project",
    generationMethod: "picture_sketch",
    summary: "Milestones + dependencies + next action.",
  },
];

export const mockGoals: MockGoal[] = [
  {
    id: "goal_launch",
    title: "Launch Tempo Flow MVP",
    progressPercent: 68,
    dueDateLabel: "Due May 30",
  },
  {
    id: "goal_health",
    title: "Stabilize afternoon energy",
    progressPercent: 42,
    dueDateLabel: "Due Jun 15",
  },
];

export const mockProjects: MockProject[] = [
  {
    id: "project_tempo",
    title: "Tempo Flow",
    color: "terracotta",
    openTaskCount: 11,
    dueDateLabel: "Due Apr 28",
  },
  {
    id: "project_home",
    title: "Home admin",
    color: "moss",
    openTaskCount: 4,
    dueDateLabel: "No due date",
  },
];

export const mockTodayScreen = {
  title: "Thursday, April 18",
  greeting:
    "You've got three things from yesterday still open. Want to move them, or finish one first?",
  energyPrompt: "How's your energy?",
  quickActions: ["Reschedule all", "Plan my hour"],
};

export const mockCaptureScreen = {
  modes: ["Task", "Note", "Brain dump"],
  placeholder: "Type anything. No structure needed.",
  voiceHint: "Hold mic to dictate, release to transcribe.",
};

export const mockCoachScreen = {
  suggestedPrompts: [
    "Stage tasks",
    "Plan my next hour",
    "What am I avoiding?",
    "Gentle check-in",
  ],
};

export const mockCalendarWeek = {
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  activeDay: "Thu",
};

export const mockRoutines = [
  {
    id: "routine_startup",
    title: "Morning startup",
    schedule: "Weekdays · 08:30",
    steps: 5,
    completionRatePercent: 82,
  },
  {
    id: "routine_shutdown",
    title: "Evening shutdown",
    schedule: "Daily · 21:30",
    steps: 4,
    completionRatePercent: 64,
  },
];

export const mockSettingsSections = [
  {
    id: "coach",
    label: "AI & Coach",
    detail: "Warmth 6/10 · default planning mode",
  },
  {
    id: "voice",
    label: "Voice",
    detail: "Walkie-talkie · 18 / 90 min",
  },
  {
    id: "privacy",
    label: "Privacy",
    detail: "Analytics off · export available",
  },
  {
    id: "subscription",
    label: "Subscription",
    detail: "Pro trial · 4 days left",
  },
];

export const mockOnboarding = {
  steps: [
    "Welcome",
    "Personalization",
    "Template pick",
    "First brain dump",
    "First plan",
  ],
  profileTags: [
    "ADHD",
    "Autism",
    "Anxiety",
    "Dyslexia",
    "Burnout",
    "Executive dysfunction",
  ],
  templateOptions: ["Student", "Builder", "Daily Life", "Start blank"],
};

export * from "./screens";
export * from "./types";
