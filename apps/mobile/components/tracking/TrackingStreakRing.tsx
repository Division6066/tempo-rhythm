import { tempoColors } from "@tempo/ui/theme";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { buildStreakRingGeometry } from "@/lib/tracking-streak-ring";

type TrackingStreakRingProps = {
  streakCount: number;
};

export function TrackingStreakRing({ streakCount }: TrackingStreakRingProps) {
  const ring = buildStreakRingGeometry({ streakCount });
  const dayWord = ring.streakCount === 1 ? "day" : "days";

  return (
    <View className="rounded-3xl border border-border bg-card px-6 py-8 gap-5">
      <View className="gap-1">
        <Text className="text-sm font-semibold uppercase tracking-[2px] text-muted-foreground">
          Habit streak
        </Text>
        <Text className="text-2xl font-semibold text-foreground">
          Keep the thread warm
        </Text>
        <Text className="text-sm leading-6 text-muted-foreground">
          {ring.streakCount === 0
            ? "No streak yet. A habit you already keep will show up here."
            : "One gentle check-in is enough to keep today connected to the days before it."}
        </Text>
      </View>

      <View className="items-center gap-5">
        <Svg
          accessibilityLabel={`Streak progress: ${ring.streakCount} of ${ring.weeklyGoal}`}
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: ring.weeklyGoal,
            now: Math.min(ring.streakCount, ring.weeklyGoal),
          }}
          height={ring.size}
          testID="enso-ring"
          viewBox={`0 0 ${ring.size} ${ring.size}`}
          width={ring.size}
        >
          <Circle
            cx={ring.size / 2}
            cy={ring.size / 2}
            fill="none"
            r={ring.radius}
            stroke={tempoColors.lineSoft}
            strokeWidth={ring.stroke}
          />
          <Circle
            cx={ring.size / 2}
            cy={ring.size / 2}
            fill="none"
            r={ring.radius}
            stroke={tempoColors.tempoOrange}
            strokeDasharray={ring.circumference}
            strokeDashoffset={ring.dashOffset}
            strokeLinecap="round"
            strokeWidth={ring.stroke}
            testID="enso-ring-progress"
            transform={`rotate(-90 ${ring.size / 2} ${ring.size / 2})`}
          />
        </Svg>

        <View className="items-center gap-1">
          <Text
            className="text-5xl font-semibold text-foreground"
            testID="streak-value"
          >
            {ring.streakCount}
          </Text>
          <Text className="text-base text-muted-foreground">
            {dayWord} in a row
          </Text>
        </View>
      </View>
    </View>
  );
}
