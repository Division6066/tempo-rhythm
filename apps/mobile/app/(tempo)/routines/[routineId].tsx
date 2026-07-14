import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { type ComponentProps, type ComponentType, useCallback } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getMovementRoutineById } from "@/lib/movement-routines";
import { tw } from "@/lib/rtl";

type Direction = "ltr" | "rtl";
type Language = "en" | "he";
type DirectionalViewProps = ComponentProps<typeof View> & {
  dir?: Direction;
};

const DirectionalView = View as ComponentType<DirectionalViewProps>;

const playerCopy = {
  en: {
    back: "Back to routines",
    missingTitle: "Routine not found",
    missingBody: "This routine is not in the movement library yet.",
    sessionPlayer: "Session player",
    duration: "Duration",
    intensity: "Intensity",
    sequence: "Sequence",
  },
  he: {
    back: "חזרה לרוטינות",
    missingTitle: "הרוטינה לא נמצאה",
    missingBody: "הרוטינה הזו עדיין לא בספריית התנועה.",
    sessionPlayer: "נגן סשן",
    duration: "משך",
    intensity: "עוצמה",
    sequence: "רצף",
  },
} as const;

function getLanguage(language?: string): Language {
  return language === "he" ? "he" : "en";
}

function getDirection(language: Language): Direction {
  return language === "he" ? "rtl" : "ltr";
}

function getLibraryHref(language: Language): Href {
  return (language === "he" ? "/routines?language=he" : "/routines") as Href;
}

export default function RoutinePlayerScreen() {
  const { routineId, language } = useLocalSearchParams<{
    routineId?: string;
    language?: string;
  }>();
  const selectedLanguage = getLanguage(language);
  const direction = getDirection(selectedLanguage);
  const copy = playerCopy[selectedLanguage];
  const router = useRouter();
  const routine =
    typeof routineId === "string" ? getMovementRoutineById(routineId) : undefined;

  const goBackToLibrary = useCallback(() => {
    router.push(getLibraryHref(selectedLanguage));
  }, [router, selectedLanguage]);

  if (!routine) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <DirectionalView className="flex-1 p-6" dir={direction}>
          <Text className={`text-2xl font-semibold text-foreground ${tw.textStart}`}>
            {copy.missingTitle}
          </Text>
          <Text className={`mt-3 text-base text-muted-foreground ${tw.textStart}`}>
            {copy.missingBody}
          </Text>
          <Pressable
            accessibilityLabel={copy.back}
            accessibilityRole="button"
            accessible={true}
            className="mt-6 min-h-12 items-center justify-center rounded-full bg-primary px-5"
            onPress={goBackToLibrary}
          >
            <Text className="font-semibold text-primary-foreground">
              {copy.back}
            </Text>
          </Pressable>
        </DirectionalView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <DirectionalView
        className="flex-1"
        dir={direction}
        testID="session-player"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-6 px-6 pb-10 pt-6"
        >
          <Pressable
            accessibilityLabel={copy.back}
            accessibilityRole="button"
            accessible={true}
            className="min-h-12 self-start justify-center rounded-full border border-border px-4"
            onPress={goBackToLibrary}
          >
            <Text className="font-semibold text-foreground">{copy.back}</Text>
          </Pressable>

          <View className="gap-3 rounded-2xl border border-border bg-card p-5">
            <Text className={`text-sm font-semibold uppercase text-primary ${tw.textStart}`}>
              {copy.sessionPlayer}
            </Text>
            <Text className={`text-3xl font-semibold leading-9 text-card-foreground ${tw.textStart}`}>
              {routine.title}
            </Text>
            <Text className={`text-base leading-6 text-muted-foreground ${tw.textStart}`}>
              {routine.summary}
            </Text>
          </View>

          <View className={`gap-3 ${tw.flexRow}`}>
            <View className="flex-1 rounded-2xl bg-muted p-4">
              <Text className={`text-xs font-semibold uppercase text-muted-foreground ${tw.textStart}`}>
                {copy.duration}
              </Text>
              <Text className={`mt-2 text-lg font-semibold text-foreground ${tw.textStart}`}>
                {routine.durationMinutes} min
              </Text>
            </View>
            <View className="flex-1 rounded-2xl bg-muted p-4">
              <Text className={`text-xs font-semibold uppercase text-muted-foreground ${tw.textStart}`}>
                {copy.intensity}
              </Text>
              <Text className={`mt-2 text-lg font-semibold capitalize text-foreground ${tw.textStart}`}>
                {routine.intensity}
              </Text>
            </View>
          </View>

          <View className="gap-3">
            <Text className={`text-xl font-semibold text-foreground ${tw.textStart}`}>
              {copy.sequence}
            </Text>
            {routine.steps.map((step, index) => (
              <View
                className={`items-center gap-3 rounded-2xl border border-border bg-card p-4 ${tw.flexRow}`}
                key={step}
              >
                <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <Text className="font-semibold text-primary-foreground">
                    {index + 1}
                  </Text>
                </View>
                <Text className={`flex-1 text-base text-card-foreground ${tw.textStart}`}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </DirectionalView>
    </SafeAreaView>
  );
}
