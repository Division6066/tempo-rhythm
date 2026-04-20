import type { MockJournalEntry } from "./types";

export const mockJournalTodayDraft =
  "Steady this morning. Pages came easy. The launch post still feels big but it's one paragraph at a time — and today I only need one paragraph.";

export const mockJournalPromptTitle = "What does today want to be?";

export const mockJournalEntries: MockJournalEntry[] = [
  {
    id: "journal-1",
    date: "2026-04-23",
    mood: "settled",
    prompt: "Morning",
    wordCount: 284,
    body: mockJournalTodayDraft,
  },
  {
    id: "journal-2",
    date: "2026-04-22",
    mood: "tired",
    prompt: "Evening",
    wordCount: 156,
    body: "Evening entry placeholder.",
  },
  {
    id: "journal-3",
    date: "2026-04-21",
    mood: "anxious",
    prompt: "Morning",
    wordCount: 410,
    body: "Morning entry placeholder.",
  },
  {
    id: "journal-4",
    date: "2026-04-20",
    mood: "steady",
    prompt: "Free",
    wordCount: 221,
    body: "Free prompt entry placeholder.",
  },
];
