import { useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  movementRoutines,
  type MovementRoutine,
} from "@/lib/movement-routines";

type RoutineCardProps = {
  readonly routine: MovementRoutine;
  readonly onOpenRoutine: (routineId: string) => void;
};

function RoutineCard({ routine, onOpenRoutine }: RoutineCardProps) {
  return (
    <Pressable
      accessibilityHint="Opens the guided session player for this routine."
      accessibilityLabel={`Open ${routine.title}`}
      accessibilityRole="button"
      accessible={true}
      className="min-h-28 rounded-2xl border border-border bg-card p-4 active:bg-muted"
      onPress={() => onOpenRoutine(routine.id)}
      testID={`routine-card-${routine.id}`}
    >
      <View className="gap-2">
        <View className="flex-row items-start justify-between gap-3">
          <Text className="flex-1 text-xl font-semibold text-card-foreground">
            {routine.title}
          </Text>
          <Text className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            {routine.duration}
          </Text>
        </View>
        <Text className="text-sm leading-5 text-muted-foreground">
          {routine.subtitle}
        </Text>
        <Text className="text-xs font-semibold uppercase tracking-wide text-primary">
          Start session
        </Text>
      </View>
    </Pressable>
  );
}

export default function Screen() {
  const router = useRouter();

  const openRoutine = (routineId: string) => {
    router.push({
      pathname: "/routines/[id]",
      params: { id: routineId },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 gap-5 p-6">
        <View className="gap-2">
          <Text className="text-3xl font-semibold text-foreground">
            Movement library
          </Text>
          <Text className="text-base leading-6 text-muted-foreground">
            Pick any routine and Tempo will open it in the guided session player.
          </Text>
        </View>

        <FlatList
          ItemSeparatorComponent={() => <View className="h-3" />}
          contentContainerClassName="pb-6"
          data={movementRoutines}
          keyExtractor={(routine) => routine.id}
          renderItem={({ item }) => (
            <RoutineCard onOpenRoutine={openRoutine} routine={item} />
          )}
        />
      </View>
    </SafeAreaView>
  );
}
