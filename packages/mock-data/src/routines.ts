import { MOCK_REFERENCE_MS } from "./constants";
import type { MockRoutine } from "./types";

/** Library · Routines — screens-2.jsx */
export const mockRoutines: MockRoutine[] = [
  {
    id: "routine-morning",
    name: "Morning routine",
    description: "Daily · 7:30 AM",
    steps: [
      { id: "routine-morning-s1", title: "Kettle on", durationMin: 2 },
      {
        id: "routine-morning-s2",
        title: "Open Tempo, check today's plan",
        durationMin: 2,
      },
      {
        id: "routine-morning-s3",
        title: "Morning pages — three pages",
        durationMin: 15,
      },
      { id: "routine-morning-s4", title: "Ten-minute walk", durationMin: 10 },
      { id: "routine-morning-s5", title: "Shower", durationMin: 8 },
    ],
    lastRunAt: MOCK_REFERENCE_MS - 3600000,
  },
  {
    id: "routine-shutdown",
    name: "Shutdown sequence",
    description: "Weekdays · 4:00 PM",
    steps: [
      { id: "routine-shutdown-s1", title: "Close browser tabs", durationMin: 5 },
      { id: "routine-shutdown-s2", title: "Inbox zero-ish", durationMin: 10 },
      {
        id: "routine-shutdown-s3",
        title: "Write tomorrow's top 3",
        durationMin: 5,
      },
      { id: "routine-shutdown-s4", title: "Dim the lights", durationMin: 1 },
      { id: "routine-shutdown-s5", title: "Phone on charger", durationMin: 1 },
      { id: "routine-shutdown-s6", title: "One line in journal", durationMin: 3 },
      { id: "routine-shutdown-s7", title: "Laptop closed", durationMin: 1 },
    ],
    lastRunAt: MOCK_REFERENCE_MS - 86400000,
  },
  {
    id: "routine-weekly",
    name: "Weekly review",
    description: "Fri · 3:00 PM",
    steps: Array.from({ length: 9 }, (_, i) => ({
      id: `routine-weekly-s${i + 1}`,
      title: `Weekly review step ${i + 1}`,
      durationMin: 5,
    })),
    lastRunAt: MOCK_REFERENCE_MS - 5 * 86400000,
  },
  {
    id: "routine-deep",
    name: "Deep work kickoff",
    description: "On demand",
    steps: Array.from({ length: 4 }, (_, i) => ({
      id: `routine-deep-s${i + 1}`,
      title: `Deep work prep ${i + 1}`,
      durationMin: 3,
    })),
    lastRunAt: MOCK_REFERENCE_MS - 2 * 86400000,
  },
];

export const mockRoutineListMeta = [
  {
    routineId: "routine-morning",
    scheduleLabel: "5 steps · Daily · 7:30 AM",
    lastLabel: "Today",
    completionRate: 92,
  },
  {
    routineId: "routine-shutdown",
    scheduleLabel: "7 steps · Weekdays · 4:00 PM",
    lastLabel: "Yesterday",
    completionRate: 78,
  },
  {
    routineId: "routine-weekly",
    scheduleLabel: "9 steps · Fri · 3:00 PM",
    lastLabel: "Last Fri",
    completionRate: 81,
  },
  {
    routineId: "routine-deep",
    scheduleLabel: "4 steps · On demand",
    lastLabel: "Mon",
    completionRate: 65,
  },
] as const;
