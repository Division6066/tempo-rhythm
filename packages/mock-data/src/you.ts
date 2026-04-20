/** You + Settings + Command surfaces — screens-5.jsx + screens-6.jsx */

export const mockInsightStats = [
  { label: "Tasks completed (7d)", value: "24", delta: "+6 vs prior week" },
  { label: "Focus blocks", value: "11", delta: "steady" },
  { label: "Journal words", value: "3.1k", delta: "gentle upward" },
] as const;

export const mockActivityLines = [
  { id: "act-1", text: "Completed · Morning pages", at: "08:12" },
  { id: "act-2", text: "Updated · Launch post draft", at: "09:40" },
  { id: "act-3", text: "Coach · Staged outline for Tempo 1.0 post", at: "10:05" },
  { id: "act-4", text: "Logged · 10-minute walk", at: "12:41" },
] as const;

export const mockSearchResults = [
  { id: "sr-1", title: "Launch post — draft", subtitle: "Notes · writing", href: "/notes/note-1" },
  { id: "sr-2", title: "Draft Tempo 1.0 launch post", subtitle: "Tasks · today", href: "/tasks" },
  { id: "sr-3", title: "Plan · Thursday", subtitle: "Screens", href: "/plan" },
] as const;

export const mockCommandActions = [
  { id: "cmd-1", label: "Go to Today", shortcut: "G T" },
  { id: "cmd-2", label: "Go to Brain Dump", shortcut: "G B" },
  { id: "cmd-3", label: "Go to Coach", shortcut: "G C" },
] as const;

export const mockEmptyStateExamples = [
  { title: "No tasks yet", body: "Add one small thing. It counts.", cta: "Add a task" },
  { title: "No notes yet", body: "Start with a sentence. The rest can wait.", cta: "New note" },
] as const;

export const mockNotificationItems = [
  { id: "n-1", title: "Trial · day 4 of 7", body: "Three gentle days left on your walk.", unread: true },
  { id: "n-2", title: "Coach nudge", body: "The launch post outline is ready when you are.", unread: false },
] as const;
