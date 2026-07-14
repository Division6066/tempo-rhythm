export type MovementRoutineStep = {
  readonly id: string;
  readonly title: string;
  readonly duration: string;
  readonly guidance: string;
};

export type MovementRoutine = {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly duration: string;
  readonly intention: string;
  readonly steps: readonly MovementRoutineStep[];
};

export const movementRoutines = [
  {
    id: "morning-reset",
    title: "Morning reset",
    subtitle: "A gentle start for stiff or scattered mornings.",
    duration: "6 min",
    intention: "Arrive in your body before the day asks anything from you.",
    steps: [
      {
        id: "stand",
        title: "Stand and notice",
        duration: "1 min",
        guidance: "Plant both feet. Let your shoulders drop once.",
      },
      {
        id: "roll",
        title: "Shoulder rolls",
        duration: "2 min",
        guidance: "Roll slowly forward, then back. Keep it easy.",
      },
      {
        id: "reach",
        title: "Side reach",
        duration: "2 min",
        guidance: "Reach one arm overhead, switch sides, and breathe out.",
      },
      {
        id: "choose",
        title: "Choose the next tiny move",
        duration: "1 min",
        guidance: "Name one small thing you can do next.",
      },
    ],
  },
  {
    id: "desk-unlock",
    title: "Desk unlock",
    subtitle: "Loosen up after a long sit without changing clothes.",
    duration: "5 min",
    intention: "Release neck, wrists, and hips enough to keep going.",
    steps: [
      {
        id: "neck",
        title: "Neck half-circles",
        duration: "1 min",
        guidance: "Draw small half-circles from shoulder to shoulder.",
      },
      {
        id: "wrists",
        title: "Wrist circles",
        duration: "1 min",
        guidance: "Circle both wrists, then shake your hands out.",
      },
      {
        id: "hips",
        title: "Seated hip shift",
        duration: "2 min",
        guidance: "Shift your weight side to side and notice what softens.",
      },
      {
        id: "eyes",
        title: "Look far away",
        duration: "1 min",
        guidance: "Rest your eyes on something across the room.",
      },
    ],
  },
  {
    id: "shutdown-stretch",
    title: "Shutdown stretch",
    subtitle: "Close the day with a low-pressure body check.",
    duration: "7 min",
    intention: "Signal that work can loosen its grip now.",
    steps: [
      {
        id: "breath",
        title: "Long exhale",
        duration: "2 min",
        guidance: "Breathe in naturally, then make the exhale a little longer.",
      },
      {
        id: "fold",
        title: "Easy forward fold",
        duration: "2 min",
        guidance: "Bend your knees and let your head be heavy.",
      },
      {
        id: "twist",
        title: "Gentle twist",
        duration: "2 min",
        guidance: "Twist from the ribs, not from force.",
      },
      {
        id: "done",
        title: "Mark one good-enough thing",
        duration: "1 min",
        guidance: "Say one thing that counted today, even if it was small.",
      },
    ],
  },
] as const satisfies readonly MovementRoutine[];

export function getMovementRoutineById(
  routineId: string
): MovementRoutine | undefined {
  return movementRoutines.find((routine) => routine.id === routineId);
}
