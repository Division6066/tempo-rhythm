import { tempoColors } from "@tempo/ui/theme";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

const initialStreak = 3;
const weeklyStreakGoal = 7;
const ringSize = 160;
const ringStroke = 12;
const ringRadius = (ringSize - ringStroke) / 2;
const ringCircumference = 2 * Math.PI * ringRadius;

export function TrackingDashboard() {
  const [completedToday, setCompletedToday] = useState(false);

  const streak = initialStreak + (completedToday ? 1 : 0);
  const ringProgress = Math.min(streak / weeklyStreakGoal, 1);
  const ringDashOffset = ringCircumference * (1 - ringProgress);

  return (
    <View className="flex-1 bg-background px-6 py-10">
      <View className="gap-8 rounded-3xl border border-border bg-card px-6 py-8">
        <View className="gap-2">
          <Text className="text-sm font-semibold uppercase tracking-[2px] text-muted-foreground">
            Tracking
          </Text>
          <Text className="text-3xl font-semibold text-foreground">
            Keep the thread warm
          </Text>
          <Text className="text-base leading-6 text-muted-foreground">
            One gentle check-in is enough to keep today connected to the days before it.
          </Text>
        </View>

        <View className="items-center gap-5">
          <Svg
            testID="enso-ring"
            width={ringSize}
            height={ringSize}
            viewBox={`0 0 ${ringSize} ${ringSize}`}
            accessibilityLabel={`Streak progress: ${streak} of ${weeklyStreakGoal}`}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: weeklyStreakGoal, now: streak }}
          >
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              fill="none"
              stroke={tempoColors.lineSoft}
              strokeWidth={ringStroke}
            />
            <Circle
              testID="enso-ring-progress"
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              fill="none"
              stroke={tempoColors.tempoOrange}
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringDashOffset}
              strokeLinecap="round"
              strokeWidth={ringStroke}
              transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
            />
          </Svg>

          <View className="items-center gap-1">
            <Text testID="streak-value" className="text-5xl font-semibold text-foreground">
              {streak}
            </Text>
            <Text className="text-base text-muted-foreground">day streak</Text>
          </View>
        </View>

        <Pressable
          testID="complete-today-button"
          accessible={true}
          accessibilityHint="Adds today to your tracking streak"
          accessibilityLabel={completedToday ? "Today is already counted" : "Count today"}
          accessibilityRole="button"
          disabled={completedToday}
          onPress={() => {
            setCompletedToday(true);
          }}
          className="min-h-12 items-center justify-center rounded-2xl bg-primary px-5 py-4 disabled:bg-muted"
        >
          <Text className="text-base font-semibold text-primary-foreground">
            {completedToday ? "Today counts" : "Count today"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
