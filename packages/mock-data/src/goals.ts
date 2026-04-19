import { MOCK_REFERENCE_MS } from "./constants";
import type { MockGoal } from "./types";

/** Library · Goals — screens-3.jsx */
export const mockGoals: MockGoal[] = [
  {
    id: "goal-ship-tempo",
    title: "Ship Tempo 1.0",
    description: "Full MVP, all 42 screens, PWA + iOS + Android. Due May 30. 72% there.",
    progress: 0.72,
    targetAt: MOCK_REFERENCE_MS + 37 * 86400000,
    milestones: [
      { id: "g1-ms-1", title: "Lock down all 42 screens", done: true },
      { id: "g1-ms-2", title: "Hire a designer for review", done: true },
      { id: "g1-ms-3", title: "Internal alpha (5 users)", done: true },
      { id: "g1-ms-4", title: "Closed beta (30 users)", done: true },
      { id: "g1-ms-5", title: "Public beta · iOS + Android", done: true },
      { id: "g1-ms-6", title: "RevenueCat + $1 trial live", done: true },
      { id: "g1-ms-7", title: "PWA + Apple Store approval", done: false },
      { id: "g1-ms-8", title: "Launch post + founder vlog", done: false },
    ],
  },
  {
    id: "goal-letters",
    title: "Publish twelve letters this year",
    description: "Creative cadence for the year.",
    progress: 0.41,
    targetAt: MOCK_REFERENCE_MS + 252 * 86400000,
    milestones: Array.from({ length: 12 }, (_, i) => ({
      id: `g2-ms-${i}`,
      title: `Letter ${i + 1}`,
      done: i < 5,
    })),
  },
  {
    id: "goal-walk",
    title: "Walk 10 km a week",
    description: "Ongoing health anchor.",
    progress: 1,
    milestones: [
      { id: "g3-ms-1", title: "Week 1", done: true },
      { id: "g3-ms-2", title: "Week 2", done: true },
      { id: "g3-ms-3", title: "Week 3", done: true },
      { id: "g3-ms-4", title: "Week 4", done: true },
    ],
  },
  {
    id: "goal-bach",
    title: "Read the Bach biography",
    description: "Learning goal.",
    progress: 0.55,
    targetAt: MOCK_REFERENCE_MS + 83 * 86400000,
    milestones: Array.from({ length: 8 }, (_, i) => ({
      id: `g4-ms-${i}`,
      title: `Chapter chunk ${i + 1}`,
      done: i < 4,
    })),
  },
];

export const mockGoalCategories = [
  { goalId: "goal-ship-tempo", category: "work" as const },
  { goalId: "goal-letters", category: "creative" as const },
  { goalId: "goal-walk", category: "health" as const },
  { goalId: "goal-bach", category: "learning" as const },
];

export const mockGoalDueLabels: Record<string, string> = {
  "goal-ship-tempo": "May 30",
  "goal-letters": "Dec 31",
  "goal-walk": "ongoing",
  "goal-bach": "Jul 15",
};
