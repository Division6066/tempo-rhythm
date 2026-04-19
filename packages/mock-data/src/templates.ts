import { MOCK_REFERENCE_MS } from "./constants";
import type { MockTemplate } from "./types";

/** Starter catalog — screens-templates.jsx TF_STARTERS */
export const mockTemplateStarters: MockTemplate[] = [
  {
    id: "weekly-review",
    name: "Weekly Review",
    emoji: "🗓",
    description:
      "Nine questions that turn the week into a plan for the next one.",
    stepCount: 9,
    kicker: "Every Friday · 15 min",
    cadence: "Weekly",
    author: "Amit · Tempo",
    tone: "amber",
    lastRunAt: MOCK_REFERENCE_MS - 3 * 86400000,
  },
  {
    id: "morning-pages",
    name: "Morning Pages",
    emoji: "☀",
    description:
      "Three long-form pages before the inbox. No prompts, just the blinking cursor.",
    stepCount: 3,
    kicker: "Daily · 10 min",
    cadence: "Daily",
    author: "Julia Cameron style",
    tone: "orange",
  },
  {
    id: "builder-shutdown",
    name: "Builder Shutdown",
    emoji: "🌙",
    description:
      "Close the loops. Park the next thread. Put the laptop down with a clean room.",
    stepCount: 6,
    kicker: "End of workday · 8 min",
    cadence: "Daily",
    author: "Cal Newport style",
    tone: "slate",
  },
  {
    id: "sunday-reset",
    name: "Sunday Reset",
    emoji: "🌿",
    description:
      "Recap · clear · re-aim. The single most-forked template in the library.",
    stepCount: 11,
    kicker: "Weekly · 20 min",
    cadence: "Weekly",
    author: "Community · 2.4k forks",
    tone: "moss",
    starred: true,
    lastRunAt: MOCK_REFERENCE_MS - 86400000,
  },
  {
    id: "monthly-retro",
    name: "Monthly Retrospective",
    emoji: "📊",
    description:
      "Wins, misses, what changed, what's next. Feeds the yearly review.",
    stepCount: 7,
    kicker: "Last day of month · 30 min",
    cadence: "Monthly",
    author: "Amit · Tempo",
    tone: "rust",
  },
  {
    id: "yearly-review",
    name: "Yearly Review",
    emoji: "🎯",
    description:
      "Big one. Twelve monthly retros compressed into the shape of a year.",
    stepCount: 14,
    kicker: "December 28 · 90 min",
    cadence: "Yearly",
    author: "Amit · Tempo",
    tone: "tempo",
  },
  {
    id: "energy-checkin",
    name: "Energy Check-in",
    emoji: "🔥",
    description:
      "Mood, body, sleep, spoons. Runs in under two minutes so you actually do it.",
    stepCount: 4,
    kicker: "Anytime · 90 sec",
    cadence: "Ad-hoc",
    author: "Amit · Tempo",
    tone: "orange",
  },
  {
    id: "project-kickoff",
    name: "Project Kickoff",
    emoji: "⚡",
    description:
      "Why, who, what shippable looks like, what would make this fail. Ten questions.",
    stepCount: 10,
    kicker: "Once per project · 25 min",
    cadence: "Ad-hoc",
    author: "Shape Up style",
    tone: "amber",
  },
  {
    id: "daily-standup",
    name: "Daily Standup (solo)",
    emoji: "✅",
    description:
      "Yesterday · today · blockers. The PM script, for people with no PM.",
    stepCount: 3,
    kicker: "Daily · 3 min",
    cadence: "Daily",
    author: "Community · 812 forks",
    tone: "moss",
  },
];

export const mockMyTemplates: MockTemplate[] = [
  {
    id: "my-shipping",
    name: "Shipping-day routine",
    emoji: "🚢",
    description: "Last run · Tue",
    stepCount: 7,
    kicker: "Last run · Tue",
    cadence: "Ad-hoc",
    author: "You",
    lastRunAt: MOCK_REFERENCE_MS - 2 * 86400000,
  },
  {
    id: "my-weekly",
    name: "Weekly Review — my version",
    emoji: "🗓",
    description: "Every Friday 4pm",
    stepCount: 12,
    kicker: "Every Friday 4pm",
    cadence: "Weekly",
    author: "You · forked from Amit",
    lastRunAt: MOCK_REFERENCE_MS - 5 * 86400000,
  },
  {
    id: "my-reset",
    name: "Sunday Reset",
    emoji: "🌿",
    description: "Every Sunday",
    stepCount: 11,
    kicker: "Every Sunday",
    cadence: "Weekly",
    author: "Community · forked",
    lastRunAt: MOCK_REFERENCE_MS - 86400000,
  },
];
