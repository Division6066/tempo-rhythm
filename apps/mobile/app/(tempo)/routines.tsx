import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MovementRoutine = {
  id: string;
  title: string;
  duration: string;
  intensity: string;
};

type MovementCategory = {
  id: string;
  title: string;
  description: string;
  routines: MovementRoutine[];
};

const movementCategories: MovementCategory[] = [
  {
    id: "wake-up",
    title: "Wake up",
    description: "Tiny starts for stiff mornings or low-energy launches.",
    routines: [
      {
        id: "wake-up-neck-shoulders",
        title: "Neck and shoulders",
        duration: "4 min",
        intensity: "gentle",
      },
      {
        id: "wake-up-standing-flow",
        title: "Standing wake-up flow",
        duration: "7 min",
        intensity: "easy",
      },
    ],
  },
  {
    id: "focus",
    title: "Focus",
    description: "Short movement breaks to help the next task feel reachable.",
    routines: [
      {
        id: "focus-desk-reset",
        title: "Desk reset",
        duration: "5 min",
        intensity: "gentle",
      },
      {
        id: "focus-cross-crawl",
        title: "Cross-crawl primer",
        duration: "6 min",
        intensity: "easy",
      },
    ],
  },
  {
    id: "reset",
    title: "Reset",
    description: "Grounding routines for transitions, overwhelm, or restarts.",
    routines: [
      {
        id: "reset-breath-and-sway",
        title: "Breath and sway",
        duration: "3 min",
        intensity: "soft",
      },
      {
        id: "reset-floor-release",
        title: "Floor release",
        duration: "8 min",
        intensity: "gentle",
      },
    ],
  },
  {
    id: "strength",
    title: "Strength",
    description: "Low-friction strength snacks that do not require equipment.",
    routines: [
      {
        id: "strength-wall-push",
        title: "Wall push circuit",
        duration: "6 min",
        intensity: "steady",
      },
      {
        id: "strength-chair-legs",
        title: "Chair leg set",
        duration: "9 min",
        intensity: "steady",
      },
    ],
  },
  {
    id: "wind-down",
    title: "Wind down",
    description: "Quiet movement for easing out of the day or into sleep.",
    routines: [
      {
        id: "wind-down-hips",
        title: "Hips and hamstrings",
        duration: "7 min",
        intensity: "soft",
      },
      {
        id: "wind-down-bedside-stretch",
        title: "Bedside stretch",
        duration: "5 min",
        intensity: "soft",
      },
    ],
  },
];

export default function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 p-6 pb-10"
        testID="movement-library"
      >
        <View className="gap-2">
          <Text
            accessibilityRole="header"
            className="text-3xl font-semibold text-foreground"
          >
            Movement routines
          </Text>
          <Text className="text-base text-muted-foreground">
            Pick the smallest useful category. Every routine is meant to meet
            you where you are.
          </Text>
        </View>

        {movementCategories.map((category) => (
          <View
            className="gap-3 rounded-3xl border border-border bg-card p-4"
            key={category.id}
            testID={`movement-category-${category.id}`}
          >
            <View className="gap-1">
              <Text className="text-xl font-semibold text-foreground">
                {category.title}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {category.description}
              </Text>
            </View>

            <View className="gap-2">
              {category.routines.map((routine) => (
                <View
                  className="rounded-2xl bg-muted px-4 py-3"
                  key={routine.id}
                  testID={`movement-routine-${routine.id}`}
                >
                  <Text className="text-base font-medium text-foreground">
                    {routine.title}
                  </Text>
                  <Text className="text-xs uppercase tracking-wide text-muted-foreground">
                    {routine.duration} · {routine.intensity}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
