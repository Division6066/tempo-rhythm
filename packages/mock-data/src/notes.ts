import { MOCK_REFERENCE_MS } from "./constants";
import type { MockDailyNoteBody, MockNote } from "./types";

/** Library · Notes — screens-2.jsx */
export const mockNotes: MockNote[] = [
  {
    id: "note-1",
    title: "Launch post — draft",
    body:
      "Lorem warmth. A thoughtful opening paragraph. The note rolls gently onward, never rushing, never corporate…",
    tags: ["writing"],
    updatedAt: MOCK_REFERENCE_MS,
  },
  {
    id: "note-2",
    title: "Onboarding copy rewrite",
    body:
      "Lorem warmth. A thoughtful opening paragraph. The note rolls gently onward, never rushing, never corporate…",
    tags: ["writing"],
    updatedAt: MOCK_REFERENCE_MS - 86400000,
  },
  {
    id: "note-3",
    title: "Convex migration — notes",
    body:
      "Lorem warmth. A thoughtful opening paragraph. The note rolls gently onward, never rushing, never corporate…",
    tags: ["eng"],
    updatedAt: MOCK_REFERENCE_MS - 172800000,
  },
  {
    id: "note-4",
    title: "Meeting: Sam + Ari · alignment",
    body:
      "Lorem warmth. A thoughtful opening paragraph. The note rolls gently onward, never rushing, never corporate…",
    tags: ["meeting"],
    updatedAt: MOCK_REFERENCE_MS - 172800000,
  },
  {
    id: "note-5",
    title: "Idea: gradient on first-run splash",
    body:
      "Lorem warmth. A thoughtful opening paragraph. The note rolls gently onward, never rushing, never corporate…",
    tags: ["idea"],
    updatedAt: MOCK_REFERENCE_MS - 259200000,
  },
  {
    id: "note-6",
    title: "Research: magic-link vs passkey",
    body:
      "Lorem warmth. A thoughtful opening paragraph. The note rolls gently onward, never rushing, never corporate…",
    tags: ["research"],
    updatedAt: MOCK_REFERENCE_MS - 345600000,
  },
];

export const mockNoteFolders: Array<{ name: string; count: number }> = [
  { name: "All notes", count: 42 },
  { name: "Writing", count: 14 },
  { name: "Engineering", count: 9 },
  { name: "Journal prompts", count: 6 },
  { name: "Research", count: 8 },
  { name: "Archive", count: 5 },
];

export const mockNoteTags = ["writing", "eng", "meeting", "idea", "research"] as const;

/** Note detail — screens-2.jsx ScreenNoteDetail */
export const mockNoteDetailLaunchPost = {
  id: "note-1",
  title: "Launch post — draft",
  tags: ["writing"] as const,
  pinned: true,
  savedCaption: "Saved · 2 minutes ago · 1,204 words",
  h1: "A letter, not a form.",
  subtitle: "Draft for the Tempo 1.0 launch. Tone: Uncle Iroh with a notebook.",
  paragraphs: [
    "Most productivity apps want you to be a machine. They count. They streak. They buzz. They reward you for optimizing things that do not, on any honest day, need to be optimized.",
    "Tempo Flow is built for the other days — the low-spoons ones, the ones where the calendar is a cathedral you cannot enter, the ones where make a plan is itself the impossible task.",
    "It is a planner that feels like a letter from a thoughtful friend, not a form to fill…",
  ],
  coachStrip:
    "Coach suggests a sharper opening line. Want to see it?",
} as const;

/** Daily note (bare) — screens-7.jsx + mobile-screens-a.jsx cues */
export const mockDailyNote: MockDailyNoteBody = {
  fileName: "2026-04-23.md",
  headline: "Thursday · April 23 · Week 17",
  coachGreeting:
    "Good morning. You've got three things from yesterday still open. Want to move them, or finish one first?",
  streakLabel: "7 day streak · habits on track",
  topTasks: [
    {
      id: "dn-1",
      title: "Review PR from Sam",
      done: true,
      time: "20 min",
      tag: "tempo",
    },
    {
      id: "dn-2",
      title: "Ship mobile preview v1",
      done: false,
      time: "60 min",
      energy: "high",
      tag: "tempo",
    },
    {
      id: "dn-3",
      title: "Call the dentist",
      done: false,
      time: "5 min",
      energy: "low",
    },
  ],
  laterTasks: [
    { id: "dn-4", title: "Pay invoice", done: false, tag: "admin" },
    {
      id: "dn-5",
      title: "Read Convex auth docs",
      done: false,
      time: "30 min",
      tag: "learning",
    },
  ],
};
