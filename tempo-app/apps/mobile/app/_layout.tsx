import { useConvexAuth } from "convex/react";
import { Redirect, Slot, Stack } from "expo-router";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { convex, secureStorage } from "../lib/convex";
import "../global.css";

function RootNavigator() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1A1A2E" }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#1A1A2E" },
          animation: "slide_from_right",
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <ConvexAuthProvider client={convex} storage={secureStorage}>
      <RootNavigator />
    </ConvexAuthProvider>
  );
}
