/**
 * @screen: movement
 * @platform: mobile
 * @summary: Movement-library leftover from #186. Sibling of routines so the breath timer stays put.
 */

import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getGuidedMovementRoutineById,
  getMovementRoutineById,
  guidedMovementRoutines,
  isGuidedMovementRoutineId,
  isMovementRoutineId,
  movementRoutineSections,
} from '@/lib/movement-routines';

export default function Screen() {
  const params = useLocalSearchParams<{ routine?: string }>();
  const initialId =
    typeof params.routine === 'string' &&
    (isMovementRoutineId(params.routine) ||
      isGuidedMovementRoutineId(params.routine))
      ? params.routine
      : undefined;
  const [routineId, setRoutineId] = useState<string | undefined>(initialId);
  const selected = routineId ? getMovementRoutineById(routineId) : undefined;
  const guided = routineId
    ? getGuidedMovementRoutineById(routineId)
    : undefined;
  const unknownSelected = Boolean(routineId) && !selected && !guided;

  if (unknownSelected) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 p-6 gap-5">
          <Text className="text-2xl font-semibold text-foreground">
            Movement
          </Text>
          <Text className="text-sm leading-6 text-muted-foreground">
            That session is not in the library yet. The catalog is still here
            when you want to pick another one.
          </Text>
          <Pressable
            accessibilityRole="button"
            className="min-h-11 self-start justify-center rounded-full border border-border px-4"
            onPress={() => setRoutineId(undefined)}
          >
            <Text className="text-sm font-semibold text-foreground">
              Back to the library
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (guided) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-6 px-6 pb-10 pt-6"
        >
          <Pressable
            accessibilityRole="button"
            className="min-h-11 self-start justify-center rounded-full border border-border px-4"
            onPress={() => setRoutineId(undefined)}
          >
            <Text className="text-sm font-semibold text-foreground">
              Back to the library
            </Text>
          </Pressable>

          <View className="gap-3 rounded-2xl border border-border bg-card p-5">
            <Text className="text-sm font-semibold uppercase text-muted-foreground">
              Guided loop
            </Text>
            <Text className="text-3xl font-semibold leading-9 text-foreground">
              {guided.title}
            </Text>
            <Text className="text-base leading-6 text-muted-foreground">
              {guided.summary}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {guided.durationMinutes} min
            </Text>
          </View>

          <Link href={`/session-player?routine=${guided.id}`} asChild>
            <Text
              accessibilityRole="link"
              className="text-base font-semibold text-foreground"
            >
              Open in the session player
            </Text>
          </Link>

          <View className="gap-3">
            <Text className="text-xl font-semibold text-foreground">
              Sequence
            </Text>
            {guided.steps.map((step, index) => (
              <View
                className="gap-2 rounded-2xl border border-border bg-card p-4"
                key={step.id}
              >
                <Text className="text-xs font-semibold uppercase text-muted-foreground">
                  Step {index + 1} · {step.durationMinutes} min
                </Text>
                <Text className="text-lg font-semibold text-foreground">
                  {step.title}
                </Text>
                <Text className="text-sm leading-6 text-muted-foreground">
                  {step.guidance}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (selected) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-6 px-6 pb-10 pt-6"
        >
          <Pressable
            accessibilityRole="button"
            className="min-h-11 self-start justify-center rounded-full border border-border px-4"
            onPress={() => setRoutineId(undefined)}
          >
            <Text className="text-sm font-semibold text-foreground">
              Back to the library
            </Text>
          </Pressable>

          <View className="gap-3 rounded-2xl border border-border bg-card p-5">
            <Text className="text-sm font-semibold uppercase text-muted-foreground">
              Movement session
            </Text>
            <Text className="text-3xl font-semibold leading-9 text-foreground">
              {selected.title}
            </Text>
            <Text className="text-base leading-6 text-muted-foreground">
              {selected.summary}
            </Text>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 rounded-2xl bg-muted p-4">
              <Text className="text-xs font-semibold uppercase text-muted-foreground">
                Duration
              </Text>
              <Text className="mt-2 text-lg font-semibold text-foreground">
                {selected.durationMinutes} min
              </Text>
            </View>
            <View className="flex-1 rounded-2xl bg-muted p-4">
              <Text className="text-xs font-semibold uppercase text-muted-foreground">
                Intensity
              </Text>
              <Text className="mt-2 text-lg font-semibold capitalize text-foreground">
                {selected.intensity}
              </Text>
            </View>
          </View>

          <View className="gap-3">
            <Text className="text-xl font-semibold text-foreground">
              Sequence
            </Text>
            {selected.steps.map((step, index) => (
              <View
                className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4"
                key={step}
              >
                <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <Text className="font-semibold text-primary-foreground">
                    {index + 1}
                  </Text>
                </View>
                <Text className="flex-1 text-base text-card-foreground">
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-6 pb-10 pt-6"
      >
        <View className="gap-2">
          <Text className="text-2xl font-semibold text-foreground">
            Movement
          </Text>
          <Text className="text-sm leading-6 text-muted-foreground">
            Category sessions plus three guided loops. Open one when moving
            would help. Nothing here is required.
          </Text>
        </View>

        {movementRoutineSections.map((section) => (
          <View className="gap-3" key={section.id}>
            <View className="gap-1">
              <Text className="text-lg font-semibold text-foreground">
                {section.title}
              </Text>
              <Text className="text-sm leading-6 text-muted-foreground">
                {section.description}
              </Text>
            </View>
            {section.data.map((routine) => (
              <Pressable
                accessibilityRole="button"
                className="gap-2 rounded-2xl border border-border bg-card p-4"
                key={routine.id}
                onPress={() => setRoutineId(routine.id)}
              >
                <Text className="text-base font-semibold text-foreground">
                  {routine.title}
                </Text>
                <Text className="text-sm leading-6 text-muted-foreground">
                  {routine.summary}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {routine.durationMinutes} min · {routine.intensity}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}

        <View className="gap-3">
          <View className="gap-1">
            <Text className="text-lg font-semibold text-foreground">
              Gentle resets
            </Text>
            <Text className="text-sm leading-6 text-muted-foreground">
              Timed loops you can open in the session player.
            </Text>
          </View>
          {guidedMovementRoutines.map((routine) => (
            <Pressable
              accessibilityRole="button"
              className="gap-2 rounded-2xl border border-border bg-card p-4"
              key={routine.id}
              onPress={() => setRoutineId(routine.id)}
            >
              <Text className="text-base font-semibold text-foreground">
                {routine.title}
              </Text>
              <Text className="text-sm leading-6 text-muted-foreground">
                {routine.summary}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {routine.durationMinutes} min
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
