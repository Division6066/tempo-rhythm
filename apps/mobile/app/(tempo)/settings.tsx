import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getPrefs,
  setPrefs,
  type LanguagePreference,
} from "@/lib/prefsStore";

type LanguageOption = {
  value: LanguagePreference;
  label: string;
  helper: string;
};

const languageOptions: LanguageOption[] = [
  {
    value: "en",
    label: "English",
    helper: "Left-to-right",
  },
  {
    value: "he",
    label: "עברית",
    helper: "ימין לשמאל",
  },
];

const notificationRows = [
  "Practice reminders",
  "Routine nudges",
  "Dojo check-ins",
];

function getVersionLabel(): string {
  return Constants.expoConfig?.version ?? "1.0.0";
}

function applyDocumentDirection(language: LanguagePreference): void {
  if (typeof document === "undefined") {
    return;
  }

  const direction = language === "he" ? "rtl" : "ltr";
  document.documentElement.setAttribute("dir", direction);
  document.documentElement.setAttribute("lang", language);
}

export default function Screen() {
  const [language, setLanguage] = useState<LanguagePreference>("en");

  useEffect(() => {
    let isMounted = true;

    getPrefs()
      .then((prefs) => {
        if (!isMounted) {
          return;
        }
        setLanguage(prefs.language);
        applyDocumentDirection(prefs.language);
      })
      .catch(() => {
        applyDocumentDirection("en");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const chooseLanguage = (nextLanguage: LanguagePreference): void => {
    setLanguage(nextLanguage);
    applyDocumentDirection(nextLanguage);
    void setPrefs({ language: nextLanguage });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 p-6 pb-10"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="gap-2">
          <Text
            accessibilityRole="header"
            aria-level={1}
            className="text-3xl font-semibold text-foreground"
          >
            Settings
          </Text>
          <Text className="text-base leading-6 text-muted-foreground">
            Tiny choices for how the dojo meets you today.
          </Text>
        </View>

        <View className="gap-4 rounded-2xl border border-border bg-card p-4">
          <View className="gap-1">
            <Text
              accessibilityRole="header"
              aria-level={2}
              className="text-lg font-semibold text-foreground"
            >
              Language
            </Text>
            <Text className="text-sm leading-5 text-muted-foreground">
              Switch English and Hebrew any time. The layout follows right away.
            </Text>
          </View>

          <View className="gap-3">
            {languageOptions.map((option) => {
              const isSelected = option.value === language;

              return (
                <Pressable
                  key={option.value}
                  accessible={true}
                  accessibilityHint={`Switch Settings to ${option.label}`}
                  accessibilityLabel={option.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  aria-pressed={isSelected}
                  className={`min-h-12 rounded-xl border px-4 py-3 ${
                    isSelected
                      ? "border-primary bg-muted"
                      : "border-border-soft bg-background"
                  }`}
                  onPress={() => chooseLanguage(option.value)}
                >
                  <View className="flex-row items-center justify-between gap-3">
                    <View className="gap-1">
                      <Text className="text-base font-semibold text-foreground">
                        {option.label}
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        {option.helper}
                      </Text>
                    </View>
                    <Text
                      aria-hidden={true}
                      className="text-lg font-semibold text-primary"
                    >
                      {isSelected ? "✓" : ""}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View
          accessibilityElementsHidden={true}
          className="hidden gap-3 rounded-2xl border border-border bg-card p-4"
          importantForAccessibility="no-hide-descendants"
        >
          <Text className="text-lg font-semibold text-foreground">
            Notifications
          </Text>
          {notificationRows.map((row) => (
            <View
              key={row}
              accessibilityState={{ disabled: true }}
              className="rounded-xl border border-border-soft bg-background px-4 py-3 opacity-60"
            >
              <Text className="text-base text-foreground">{row}</Text>
              <Text className="text-sm text-muted-foreground">
                Reminders arrive in a later version.
              </Text>
            </View>
          ))}
        </View>

        <View className="gap-4 rounded-2xl border border-border bg-card p-4">
          <View className="gap-1">
            <Text
              accessibilityRole="header"
              aria-level={2}
              className="text-lg font-semibold text-foreground"
            >
              About
            </Text>
            <Text className="text-sm leading-5 text-muted-foreground">
              Built as a quiet training space for attention and return.
            </Text>
          </View>

          <View className="gap-3">
            <View className="rounded-xl border border-border-soft bg-background px-4 py-3">
              <Text className="text-sm text-muted-foreground">Version</Text>
              <Text
                className="text-base font-semibold text-foreground"
                testID="settings-about-version"
              >
                {getVersionLabel()}
              </Text>
            </View>

            <View className="rounded-xl border border-border-soft bg-background px-4 py-3">
              <Text className="text-sm text-muted-foreground">Dojo credit</Text>
              <Text className="text-base font-semibold text-foreground">
                settings.about.dojoCredit
              </Text>
            </View>

            <View className="rounded-xl border border-border-soft bg-background px-4 py-3">
              <Text className="text-sm text-muted-foreground">Contact</Text>
              <Text className="text-base font-semibold text-foreground">
                hello@tempo.example
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
