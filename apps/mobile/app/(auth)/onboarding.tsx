/**
 * @screen: onboarding
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
 * @mutations: users.completeOnboarding
 * @auth: public
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const steps = ["Welcome", "Pick theme", "First capture", "Done"] as const;

export default function Screen() {
  const router = useRouter();
  const [i, setI] = useState(0);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center gap-4 p-6">
        <Text className="text-center text-xs text-muted-foreground">
          Step {i + 1} of {steps.length}
        </Text>
        <Text className="text-center text-2xl font-semibold text-foreground">{steps[i]}</Text>
        <Text className="text-center text-sm text-muted-foreground">
          Tempo meets you where you are. Tap through when ready.
        </Text>
        {i < steps.length - 1 ? (
          <Pressable
            accessible
            accessibilityRole="button"
            accessibilityLabel="Continue onboarding"
            hitSlop={8}
            onPress={() => setI((x) => x + 1)}
            className="rounded-lg bg-primary py-3"
          >
            <Text className="text-center text-sm font-medium text-primary-foreground">Continue</Text>
          </Pressable>
        ) : (
          <Pressable
            accessible
            accessibilityRole="button"
            accessibilityLabel="Finish onboarding"
            hitSlop={8}
            onPress={() => router.replace("/(tempo)/(tabs)/today" as never)}
            className="rounded-lg bg-primary py-3"
          >
            <Text className="text-center text-sm font-medium text-primary-foreground">Enter app</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
