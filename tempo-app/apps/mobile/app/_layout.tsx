import { Stack } from "expo-router";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { StatusBar } from "expo-status-bar";
import { convex, secureStorage } from "../lib/convex";
import "../global.css";

export default function RootLayout() {
  return (
    <ConvexAuthProvider client={convex} storage={secureStorage}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#1A1A2E" },
          animation: "slide_from_right",
        }}
      />
    </ConvexAuthProvider>
  );
}
