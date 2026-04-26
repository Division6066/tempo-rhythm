import { MOCK_REFERENCE_MS } from "./constants";
import type { MockProject } from "./types";

/** Library · Projects — screens-3.jsx */
export const mockProjects: MockProject[] = [
  {
    id: "proj-tempo-10",
    name: "Tempo 1.0",
    color: "orange",
    taskIds: [
      "task-proj-1",
      "task-proj-2",
      "task-proj-3",
      "task-proj-4",
      "task-proj-5",
    ],
    noteIds: ["note-1", "note-2", "note-3"],
  },
  {
    id: "proj-landing",
    name: "Landing redesign",
    color: "amber",
    taskIds: [],
    noteIds: [],
  },
  {
    id: "proj-book",
    name: "Book: Everyday Anchors",
    color: "moss",
    taskIds: [],
    noteIds: [],
  },
];

export const mockProjectCards = [
  {
    projectId: "proj-tempo-10",
    dueLabel: "May 30",
    taskCount: 42,
    teamSize: 1,
    percent: 72,
  },
  {
    projectId: "proj-landing",
    dueLabel: "Apr 29",
    taskCount: 11,
    teamSize: 1,
    percent: 54,
  },
  {
    projectId: "proj-book",
    dueLabel: "Sep 1",
    taskCount: 27,
    teamSize: 1,
    percent: 18,
  },
] as const;

export const mockProjectKanbanColumns: Array<{
  title: string;
  items: readonly string[];
}> = [
  {
    title: "Backlog",
    items: [
      "Pricing page v2",
      "Recovery email flow",
      "Onboarding analytics",
      "Dark mode polish",
    ],
  },
  {
    title: "This week",
    items: ["Submit to Apple", "Finish landing copy", "Record founder vlog"],
  },
  {
    title: "In progress",
    items: ["Launch post draft", "Landing rewrite"],
  },
  {
    title: "Shipped",
    items: ["Brand style guide v1", "Convex migration", "All 42 screens"],
  },
];

export const mockProjectLinkedNoteTitles = [
  "A letter, not a form",
  "Onboarding rewrite",
  "Convex migration",
] as const;
