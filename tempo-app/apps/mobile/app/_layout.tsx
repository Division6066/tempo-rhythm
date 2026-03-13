import { Stack } from "expo-router";
import { ConvexProvider } from "convex/react";
import { StatusBar } from "expo-status-bar";
import { convex } from "../lib/convex";
import "../global.css";

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#1A1A2E" },
          animation: "slide_from_right",
        }}
      />
    </ConvexProvider>
  );
}
