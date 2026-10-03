import type { Routine } from './session-player';

export type MovementCategoryId =
  | 'animal-flow'
  | 'fighter-yoga-mobility'
  | 'joint-prep-cars'
  | 'bodyweight-sc'
  | 'recovery';

export type MovementIntensity = 'easy' | 'moderate' | 'strong';

export type MovementRoutine = {
  id: string;
  categoryId: MovementCategoryId;
  title: string;
  durationMinutes: number;
  intensity: MovementIntensity;
  summary: string;
  steps: readonly string[];
};

export type MovementCategory = {
  id: MovementCategoryId;
  title: string;
  description: string;
};

export type MovementRoutineSection = MovementCategory & {
  data: readonly MovementRoutine[];
};

export const movementCategories: readonly MovementCategory[] = [
  {
    id: 'animal-flow',
    title: 'Animal Flow',
    description:
      'Ground-based locomotion for coordination and playful strength.',
  },
  {
    id: 'fighter-yoga-mobility',
    title: 'Fighter-Yoga Mobility',
    description:
      'Mobility rounds with breath, guard posture, and calm control.',
  },
  {
    id: 'joint-prep-cars',
    title: 'Joint Prep/CARs',
    description:
      'Controlled articular rotations for joints that want a check-in.',
  },
  {
    id: 'bodyweight-sc',
    title: 'Bodyweight S&C',
    description: 'Simple strength and conditioning without equipment.',
  },
  {
    id: 'recovery',
    title: 'Recovery',
    description: 'Downshift sessions for soreness, stress, or low-energy days.',
  },
] as const;

export const movementRoutines: readonly MovementRoutine[] = [
  {
    id: 'animal-flow-primer',
    categoryId: 'animal-flow',
    title: 'Animal Flow Primer',
    durationMinutes: 12,
    intensity: 'moderate',
    summary:
      'A short ape-to-beast flow that wakes up wrists, hips, and shoulders.',
    steps: [
      'Wrist rocks and palm pulses',
      'Loaded beast breathing',
      'Ape reach to crab reach',
      'Beast step-through flow',
    ],
  },
  {
    id: 'fighter-yoga-hips',
    categoryId: 'fighter-yoga-mobility',
    title: 'Fighter-Yoga Hips',
    durationMinutes: 15,
    intensity: 'moderate',
    summary:
      'Hip mobility rounds built around stance switches and long exhales.',
    steps: [
      'Boxer bounce with nasal breathing',
      'Lunge pulse to hamstring fold',
      'Shin box switch series',
      'Low squat breathing reset',
    ],
  },
  {
    id: 'joint-prep-morning-cars',
    categoryId: 'joint-prep-cars',
    title: 'Morning CARs',
    durationMinutes: 10,
    intensity: 'easy',
    summary: 'A gentle head-to-toe joint prep pass for the start of a day.',
    steps: [
      'Neck and shoulder CARs',
      'Elbow, wrist, and finger circles',
      'Hip and knee CARs',
      'Ankle circles with slow balance',
    ],
  },
  {
    id: 'bodyweight-engine',
    categoryId: 'bodyweight-sc',
    title: 'Bodyweight Engine',
    durationMinutes: 18,
    intensity: 'strong',
    summary:
      'A compact conditioning circuit using squats, push-ups, and crawls.',
    steps: [
      'Air squat cadence round',
      'Incline or floor push-up round',
      'Bear crawl forward and back',
      'Breathing walk cooldown',
    ],
  },
  {
    id: 'recovery-downshift',
    categoryId: 'recovery',
    title: 'Recovery Downshift',
    durationMinutes: 14,
    intensity: 'easy',
    summary:
      'A soft reset for days when your body is asking for less friction.',
    steps: [
      'Supine breathing with feet elevated',
      'Open book thoracic rotations',
      'Couch stretch with support',
      'Long exhale rest',
    ],
  },
] as const;

export const movementRoutineIds = movementRoutines.map((routine) => routine.id);

export const movementRoutineSections: readonly MovementRoutineSection[] =
  movementCategories.map((category) => ({
    ...category,
    data: movementRoutines.filter(
      (routine) => routine.categoryId === category.id
    ),
  }));

export function isMovementRoutineId(value: string | undefined): boolean {
  return typeof value === 'string' && movementRoutineIds.includes(value);
}

export function getMovementRoutineById(
  routineId: string
): MovementRoutine | undefined {
  return movementRoutines.find((routine) => routine.id === routineId);
}

export type GuidedMovementStep = {
  id: string;
  title: string;
  guidance: string;
  durationMinutes: number;
};

export type GuidedMovementRoutine = {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  durationMinutes: number;
  steps: readonly GuidedMovementStep[];
};

/** Leftover from #221 — timed, guided loops that can open in the session player. */
export const guidedMovementRoutines: readonly GuidedMovementRoutine[] = [
  {
    id: 'morning-reset',
    title: 'Morning reset',
    subtitle: 'A gentle start for stiff or scattered mornings.',
    summary: 'Arrive in your body before the day asks anything from you.',
    durationMinutes: 6,
    steps: [
      {
        id: 'stand',
        title: 'Stand and notice',
        guidance: 'Plant both feet. Let your shoulders drop once.',
        durationMinutes: 1,
      },
      {
        id: 'roll',
        title: 'Shoulder rolls',
        guidance: 'Roll slowly forward, then back. Keep it easy.',
        durationMinutes: 2,
      },
      {
        id: 'reach',
        title: 'Side reach',
        guidance: 'Reach one arm overhead, switch sides, and breathe out.',
        durationMinutes: 2,
      },
      {
        id: 'choose',
        title: 'Choose the next tiny move',
        guidance: 'Name one small thing you can do next.',
        durationMinutes: 1,
      },
    ],
  },
  {
    id: 'desk-unlock',
    title: 'Desk unlock',
    subtitle: 'Loosen up after a long sit without changing clothes.',
    summary: 'Release neck, wrists, and hips enough to keep going.',
    durationMinutes: 5,
    steps: [
      {
        id: 'neck',
        title: 'Neck half-circles',
        guidance: 'Draw small half-circles from shoulder to shoulder.',
        durationMinutes: 1,
      },
      {
        id: 'wrists',
        title: 'Wrist circles',
        guidance: 'Circle both wrists, then shake your hands out.',
        durationMinutes: 1,
      },
      {
        id: 'hips',
        title: 'Seated hip shift',
        guidance: 'Shift your weight side to side and notice what softens.',
        durationMinutes: 2,
      },
      {
        id: 'eyes',
        title: 'Look far away',
        guidance: 'Rest your eyes on something across the room.',
        durationMinutes: 1,
      },
    ],
  },
  {
    id: 'shutdown-stretch',
    title: 'Shutdown stretch',
    subtitle: 'Close the day with a low-pressure body check.',
    summary: 'Signal that work can loosen its grip now.',
    durationMinutes: 7,
    steps: [
      {
        id: 'breath',
        title: 'Long exhale',
        guidance: 'Breathe in naturally, then make the exhale a little longer.',
        durationMinutes: 2,
      },
      {
        id: 'fold',
        title: 'Easy forward fold',
        guidance: 'Bend your knees and let your head be heavy.',
        durationMinutes: 2,
      },
      {
        id: 'twist',
        title: 'Gentle twist',
        guidance: 'Twist from the ribs, not from force.',
        durationMinutes: 2,
      },
      {
        id: 'done',
        title: 'Mark one good-enough thing',
        guidance: 'Say one thing that counted today, even if it was small.',
        durationMinutes: 1,
      },
    ],
  },
];

export const guidedMovementRoutineIds = guidedMovementRoutines.map(
  (routine) => routine.id
);

export function isGuidedMovementRoutineId(value: string | undefined): boolean {
  return typeof value === 'string' && guidedMovementRoutineIds.includes(value);
}

export function getGuidedMovementRoutineById(
  routineId: string
): GuidedMovementRoutine | undefined {
  return guidedMovementRoutines.find((routine) => routine.id === routineId);
}

export function guidedMovementToSession(
  routine: GuidedMovementRoutine
): Routine {
  return {
    id: routine.id,
    title: routine.title,
    subtitle: routine.subtitle,
    steps: routine.steps.map((step) => ({
      id: step.id,
      title: step.title,
      guidance: step.guidance,
      durationMs: step.durationMinutes * 60_000,
    })),
  };
}
