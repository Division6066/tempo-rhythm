import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Platform, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  accessibleReadingStorageKey,
  accessibleReadingTokens,
} from "../../../../../packages/theme/src/tokens.accessible";

const enabledValue = "on";
const disabledValue = "off";

function prefersReducedMotion(): boolean {
  if (Platform.OS !== "web" || typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function applyAccessibleReading(enabled: boolean): void {
  if (Platform.OS !== "web" || typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const motionDuration = prefersReducedMotion()
    ? accessibleReadingTokens.motion.reducedDuration
    : accessibleReadingTokens.motion.standardDuration;

  root.style.setProperty(
    "--tempo-reading-font-step-px",
    `${accessibleReadingTokens.fontSizeStepPx}px`,
  );
  root.style.setProperty(
    "--tempo-reading-line-height",
    String(accessibleReadingTokens.lineHeight),
  );
  root.style.setProperty(
    "--tempo-reading-paragraph-spacing",
    `${accessibleReadingTokens.paragraphSpacingPx}px`,
  );
  root.style.setProperty("--tempo-reading-motion-duration", motionDuration);
  root.setAttribute(
    "data-accessible-motion",
    prefersReducedMotion() ? "reduced" : "standard",
  );

  if (enabled) {
    root.setAttribute("data-comfortable-reading", enabledValue);
    root.style.fontSize = `${accessibleReadingTokens.rootFontSizePx}px`;
    root.style.lineHeight = String(accessibleReadingTokens.lineHeight);
    return;
  }

  root.removeAttribute("data-comfortable-reading");
  root.style.removeProperty("font-size");
  root.style.removeProperty("line-height");
}

async function readStoredComfortableReading(): Promise<boolean> {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return (
      window.localStorage.getItem(accessibleReadingStorageKey) === enabledValue
    );
  }

  return (
    (await AsyncStorage.getItem(accessibleReadingStorageKey)) === enabledValue
  );
}

async function persistComfortableReading(enabled: boolean): Promise<void> {
  const nextValue = enabled ? enabledValue : disabledValue;

  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.localStorage.setItem(accessibleReadingStorageKey, nextValue);
    return;
  }

  await AsyncStorage.setItem(accessibleReadingStorageKey, nextValue);
}

export default function AccessibilitySettingsScreen() {
  const [isComfortableReading, setIsComfortableReading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPreference(): Promise<void> {
      const storedPreference = await readStoredComfortableReading();

      if (!isMounted) {
        return;
      }

      setIsComfortableReading(storedPreference);
      applyAccessibleReading(storedPreference);
      setIsLoaded(true);
    }

    void loadPreference();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionPreferenceChange = (): void => {
      applyAccessibleReading(isComfortableReading);
    };

    mediaQuery.addEventListener("change", handleMotionPreferenceChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMotionPreferenceChange);
    };
  }, [isComfortableReading]);

  const handleComfortableReadingChange = useCallback((nextValue: boolean) => {
    setIsComfortableReading(nextValue);
    applyAccessibleReading(nextValue);
    void persistComfortableReading(nextValue);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 p-6"
        contentInsetAdjustmentBehavior="automatic"
      >
        <View className="gap-2">
          <Text className="text-2xl font-semibold text-foreground">
            Accessibility
          </Text>
          <Text className="text-base leading-7 text-muted-foreground">
            Adjust reading comfort without changing your tasks or plans.
          </Text>
        </View>

        <View className="gap-4 rounded-2xl border border-border-soft bg-card p-5">
          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-1 gap-1">
              <Text className="text-lg font-semibold text-foreground">
                Comfortable reading
              </Text>
              <Text className="text-sm leading-6 text-muted-foreground">
                Larger text, roomier lines, and calmer motion defaults.
              </Text>
            </View>
            <Switch
              accessibilityHint="Turns comfortable reading on or off."
              accessibilityLabel="Comfortable reading"
              accessibilityRole="switch"
              accessibilityState={{ checked: isComfortableReading }}
              disabled={!isLoaded}
              onValueChange={handleComfortableReadingChange}
              value={isComfortableReading}
            />
          </View>
        </View>

        <View className="rounded-2xl border border-border-soft bg-card p-5">
          <Text className="text-sm leading-6 text-muted-foreground">
            If your device asks apps to reduce motion, Tempo uses the reduced
            motion token set automatically.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
