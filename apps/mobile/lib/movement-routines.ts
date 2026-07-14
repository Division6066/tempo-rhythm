export type MovementCategoryId =
  | "animal-flow"
  | "fighter-yoga-mobility"
  | "joint-prep-cars"
  | "bodyweight-sc"
  | "recovery";

export type MovementRoutine = {
  id: string;
  categoryId: MovementCategoryId;
  title: string;
  durationMinutes: number;
  intensity: "easy" | "moderate" | "strong";
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
    id: "animal-flow",
    title: "Animal Flow",
    description: "Ground-based locomotion for coordination and playful strength.",
  },
  {
    id: "fighter-yoga-mobility",
    title: "Fighter-Yoga Mobility",
    description: "Mobility rounds with breath, guard posture, and calm control.",
  },
  {
    id: "joint-prep-cars",
    title: "Joint Prep/CARs",
    description: "Controlled articular rotations for joints that want a check-in.",
  },
  {
    id: "bodyweight-sc",
    title: "Bodyweight S&C",
    description: "Simple strength and conditioning without equipment.",
  },
  {
    id: "recovery",
    title: "Recovery",
    description: "Downshift sessions for soreness, stress, or low-energy days.",
  },
] as const;

export const movementRoutines: readonly MovementRoutine[] = [
  {
    id: "animal-flow-primer",
    categoryId: "animal-flow",
    title: "Animal Flow Primer",
    durationMinutes: 12,
    intensity: "moderate",
    summary: "A short ape-to-beast flow that wakes up wrists, hips, and shoulders.",
    steps: [
      "Wrist rocks and palm pulses",
      "Loaded beast breathing",
      "Ape reach to crab reach",
      "Beast step-through flow",
    ],
  },
  {
    id: "fighter-yoga-hips",
    categoryId: "fighter-yoga-mobility",
    title: "Fighter-Yoga Hips",
    durationMinutes: 15,
    intensity: "moderate",
    summary: "Hip mobility rounds built around stance switches and long exhales.",
    steps: [
      "Boxer bounce with nasal breathing",
      "Lunge pulse to hamstring fold",
      "Shin box switch series",
      "Low squat breathing reset",
    ],
  },
  {
    id: "joint-prep-morning-cars",
    categoryId: "joint-prep-cars",
    title: "Morning CARs",
    durationMinutes: 10,
    intensity: "easy",
    summary: "A gentle head-to-toe joint prep pass for the start of a day.",
    steps: [
      "Neck and shoulder CARs",
      "Elbow, wrist, and finger circles",
      "Hip and knee CARs",
      "Ankle circles with slow balance",
    ],
  },
  {
    id: "bodyweight-engine",
    categoryId: "bodyweight-sc",
    title: "Bodyweight Engine",
    durationMinutes: 18,
    intensity: "strong",
    summary: "A compact conditioning circuit using squats, push-ups, and crawls.",
    steps: [
      "Air squat cadence round",
      "Incline or floor push-up round",
      "Bear crawl forward and back",
      "Breathing walk cooldown",
    ],
  },
  {
    id: "recovery-downshift",
    categoryId: "recovery",
    title: "Recovery Downshift",
    durationMinutes: 14,
    intensity: "easy",
    summary: "A soft reset for days when your body is asking for less friction.",
    steps: [
      "Supine breathing with feet elevated",
      "Open book thoracic rotations",
      "Couch stretch with support",
      "Long exhale rest",
    ],
  },
] as const;

export const movementRoutineSections: readonly MovementRoutineSection[] =
  movementCategories.map((category) => ({
    ...category,
    data: movementRoutines.filter((routine) => routine.categoryId === category.id),
  }));

export function getMovementRoutineById(
  routineId: string
): MovementRoutine | undefined {
  return movementRoutines.find((routine) => routine.id === routineId);
}
