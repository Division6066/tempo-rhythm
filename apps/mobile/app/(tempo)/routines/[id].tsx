import { Link, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getMovementRoutineById } from "@/lib/movement-routines";

function getRouteId(id: string | string[] | undefined): string | undefined {
  return Array.isArray(id) ? id[0] : id;
}

export default function RoutineSessionPlayer() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const routine = getMovementRoutineById(getRouteId(id) ?? "");

  if (!routine) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center gap-4 p-6">
          <Text className="text-2xl font-semibold text-foreground">
            Routine not found
          </Text>
          <Text className="text-base leading-6 text-muted-foreground">
            This routine may have moved. You can return to the library and pick
            another one.
          </Text>
          <Link
            accessibilityRole="link"
            className="text-base font-semibold text-primary"
            href="/routines"
          >
            Back to movement library
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 p-6 pb-10"
      >
        <View className="gap-2 rounded-2xl border border-border bg-card p-5">
          <Text className="text-xs font-semibold uppercase tracking-wide text-primary">
            Session player
          </Text>
          <Text
            className="text-3xl font-semibold text-card-foreground"
            testID="routine-player-title"
          >
            {routine.title}
          </Text>
          <Text className="text-base leading-6 text-muted-foreground">
            {routine.intention}
          </Text>
          <Text className="text-sm font-semibold text-foreground">
            {routine.duration}
          </Text>
        </View>

        <View className="gap-3" testID="routine-player-steps">
          {routine.steps.map((step, index) => (
            <View
              className="gap-2 rounded-xl border border-border-soft bg-cream-raised p-4"
              key={step.id}
            >
              <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Step {index + 1} · {step.duration}
              </Text>
              <Text className="text-lg font-semibold text-foreground">
                {step.title}
              </Text>
              <Text className="text-sm leading-5 text-muted-foreground">
                {step.guidance}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
