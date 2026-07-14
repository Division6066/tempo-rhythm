import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import {
  type ComponentProps,
  type ComponentType,
  memo,
  useCallback,
} from "react";
import {
  Pressable,
  SectionList,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  type MovementRoutine,
  type MovementRoutineSection,
  movementRoutineSections,
} from "@/lib/movement-routines";
import { tw } from "@/lib/rtl";

type Direction = "ltr" | "rtl";
type Language = "en" | "he";
type DirectionalViewProps = ComponentProps<typeof View> & {
  dir?: Direction;
};

const DirectionalView = View as ComponentType<DirectionalViewProps>;

const libraryCopy = {
  en: {
    eyebrow: "Movement library",
    title: "Choose the kind of movement your body can meet today.",
    subtitle:
      "Browse short routines by category. Start anywhere; each card opens a guided session player.",
    start: "Open session",
  },
  he: {
    eyebrow: "ספריית תנועה",
    title: "בחרו תנועה שהגוף יכול לפגוש היום.",
    subtitle:
      "דפדפו ברוטינות קצרות לפי קטגוריה. כל כרטיס פותח נגן סשן מודרך.",
    start: "פתחו סשן",
  },
} as const;

function getLanguage(language?: string): Language {
  return language === "he" ? "he" : "en";
}

function getDirection(language: Language): Direction {
  return language === "he" ? "rtl" : "ltr";
}

type CategoryHeaderProps = {
  section: MovementRoutineSection;
};

const CategoryHeader = memo(function CategoryHeader({
  section,
}: CategoryHeaderProps) {
  return (
    <View className="mt-7 gap-1">
      <Text
        accessibilityRole="header"
        className={`text-xl font-semibold text-foreground ${tw.textStart}`}
      >
        {section.title}
      </Text>
      <Text className={`text-sm leading-5 text-muted-foreground ${tw.textStart}`}>
        {section.description}
      </Text>
    </View>
  );
});

type RoutineCardProps = {
  routine: MovementRoutine;
  language: Language;
  startLabel: string;
};

const RoutineCard = memo(function RoutineCard({
  routine,
  language,
  startLabel,
}: RoutineCardProps) {
  const router = useRouter();

  const openRoutine = useCallback(() => {
    const query = language === "he" ? "?language=he" : "";
    router.push(`/routines/${routine.id}${query}` as Href);
  }, [language, routine.id, router]);

  return (
    <Pressable
      accessibilityHint="Opens this routine in the session player."
      accessibilityLabel={`${startLabel}: ${routine.title}`}
      accessibilityRole="button"
      accessible={true}
      className="mt-3 min-h-28 rounded-2xl border border-border bg-card p-4 active:opacity-80"
      onPress={openRoutine}
      testID={`routine-card-${routine.id}`}
    >
      <View className={`items-start justify-between gap-3 ${tw.flexRow}`}>
        <View className="flex-1 gap-2">
          <Text className={`text-lg font-semibold text-card-foreground ${tw.textStart}`}>
            {routine.title}
          </Text>
          <Text className={`text-sm leading-5 text-muted-foreground ${tw.textStart}`}>
            {routine.summary}
          </Text>
        </View>
        <View className="rounded-full bg-muted px-3 py-1">
          <Text className="text-xs font-semibold uppercase text-muted-foreground">
            {routine.durationMinutes} min
          </Text>
        </View>
      </View>
      <Text className={`mt-3 text-xs font-semibold uppercase text-primary ${tw.textStart}`}>
        {startLabel}
      </Text>
    </Pressable>
  );
});

export default function RoutinesScreen() {
  const { language } = useLocalSearchParams<{ language?: string }>();
  const selectedLanguage = getLanguage(language);
  const direction = getDirection(selectedLanguage);
  const copy = libraryCopy[selectedLanguage];

  const renderSectionHeader = useCallback(
    ({ section }: { section: MovementRoutineSection }) => (
      <CategoryHeader section={section} />
    ),
    []
  );

  const renderRoutine = useCallback(
    ({ item }: { item: MovementRoutine }) => (
      <RoutineCard
        language={selectedLanguage}
        routine={item}
        startLabel={copy.start}
      />
    ),
    [copy.start, selectedLanguage]
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <DirectionalView
        className="flex-1"
        dir={direction}
        testID="movement-library"
      >
        <SectionList
          ListHeaderComponent={
            <View className="gap-3 pb-1 pt-6">
              <Text className={`text-sm font-semibold uppercase text-primary ${tw.textStart}`}>
                {copy.eyebrow}
              </Text>
              <Text className={`text-3xl font-semibold leading-9 text-foreground ${tw.textStart}`}>
                {copy.title}
              </Text>
              <Text className={`text-base leading-6 text-muted-foreground ${tw.textStart}`}>
                {copy.subtitle}
              </Text>
            </View>
          }
          className="flex-1"
          contentContainerClassName="px-6 pb-8"
          keyExtractor={(routine) => routine.id}
          renderItem={renderRoutine}
          renderSectionHeader={renderSectionHeader}
          sections={movementRoutineSections}
          stickySectionHeadersEnabled={false}
        />
      </DirectionalView>
    </SafeAreaView>
  );
}
