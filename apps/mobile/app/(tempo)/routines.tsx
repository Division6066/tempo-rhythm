/**
 * @screen: routines
 * @tier: tier-a
 * @platform: mobile
 * @owner: cursor-cloud-2
 * @prd: PRD §4 Screen 42
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
 * @summary: Routines list with start-now and quick edit controls.
 */
import { mockRoutines } from "@tempo/mock-data";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 py-5">
        <Text className="text-2xl font-semibold text-foreground">Routines</Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          Step-by-step routines for morning startup, shutdown, and weekly reset.
        </Text>

        <View className="mt-4 gap-3">
          {mockRoutines.map((routine) => (
            <View
              key={routine.id}
              className="rounded-2xl border border-border bg-card px-4 py-3"
            >
              <Text className="text-base font-semibold text-foreground">{routine.title}</Text>
              <Text className="mt-1 text-xs text-muted-foreground">
                {routine.schedule} · {routine.steps} steps · {routine.completionRatePercent}% completion
              </Text>

              <View className="mt-3 flex-row gap-2">
                {/* @behavior: Starts guided routine run mode immediately from this card. @convex-mutation-needed: routines.startRun @prd: PRD §4 Screen 42 @source: mobile-screens-b.jsx */}
                <Pressable
                  className="rounded-full bg-primary px-3 py-2"
                  accessibilityRole="button"
                  accessibilityLabel={`Start routine ${routine.title} now`}
                >
                  <Text className="text-xs font-semibold text-primary-foreground">Start now</Text>
                </Pressable>

                {/* @behavior: Navigates to routine detail for step editing and reorder actions. @navigate: /(tempo)/routines/[id] @prd: PRD §4 Screen 42 @source: mobile-screens-b.jsx */}
                <Pressable
                  className="rounded-full border border-border px-3 py-2"
                  accessibilityRole="button"
                  accessibilityLabel={`Open routine details for ${routine.title}`}
                  onPress={() => {
                    router.push("/(tempo)/routines");
                  }}
                >
                  <Text className="text-xs text-foreground">Details</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* @behavior: Opens create routine flow for new reusable routine definitions. @convex-mutation-needed: routines.create @schema-delta: routines.steps.durationMinutes @prd: PRD §4 Screen 42 @source: mobile-screens-b.jsx */}
        <Pressable
          className="mt-5 rounded-full border border-border px-4 py-3"
          accessibilityRole="button"
          accessibilityLabel="Create new routine"
        >
          <Text className="text-center text-sm font-medium text-foreground">+ New routine</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
