export const WEEKLY_STREAK_GOAL = 7;
export const DEFAULT_RING_SIZE = 160;
export const DEFAULT_RING_STROKE = 12;

export type StreakRingGeometry = {
  size: number;
  stroke: number;
  radius: number;
  circumference: number;
  progress: number;
  dashOffset: number;
  streakCount: number;
  weeklyGoal: number;
};

/** Map a real streak count onto SVG ring dash geometry. Zero stays empty. */
export function buildStreakRingGeometry(input: {
  streakCount: number;
  weeklyGoal?: number;
  size?: number;
  stroke?: number;
}): StreakRingGeometry {
  const streakCount = Number.isFinite(input.streakCount)
    ? Math.max(0, Math.floor(input.streakCount))
    : 0;
  const weeklyGoal = Math.max(
    1,
    Math.floor(input.weeklyGoal ?? WEEKLY_STREAK_GOAL),
  );
  const size = input.size ?? DEFAULT_RING_SIZE;
  const stroke = input.stroke ?? DEFAULT_RING_STROKE;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(streakCount / weeklyGoal, 1);
  const dashOffset = circumference * (1 - progress);

  return {
    size,
    stroke,
    radius,
    circumference,
    progress,
    dashOffset,
    streakCount,
    weeklyGoal,
  };
}
