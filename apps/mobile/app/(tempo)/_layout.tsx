import { useConvexAuth } from "convex/react";
import { Redirect, Stack, useRootNavigationState } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { PAYMENT_SYSTEM_ENABLED } from "@/config/appConfig";
import { useRevenueCat } from "@/contexts/RevenueCatContext";

/**
 * (tempo) group — wraps the new Tempo Flow mobile surfaces.
 * Tabs live under (tempo)/(tabs); modal routes live as siblings.
 */
export default function TempoLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { isPremium, isLoading: isRevenueCatLoading } = useRevenueCat();
  const navigationState = useRootNavigationState();

  if (!navigationState?.key) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#d97757" />
      </View>
    );
  }

  if (isLoading || isRevenueCatLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#d97757" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (PAYMENT_SYSTEM_ENABLED && !isPremium) {
    return <Redirect href="/(auth)/paywall" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="capture" options={{ presentation: "modal" }} />
    </Stack>
  );
}
