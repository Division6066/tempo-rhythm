import { Stack } from "expo-router";

/**
 * (tempo) group — wraps the new Tempo Flow mobile surfaces.
 * Tabs live under (tempo)/(tabs); modal routes live as siblings.
 */
export default function TempoLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="habits" />
      <Stack.Screen name="journal" />
      <Stack.Screen name="routines" />
      <Stack.Screen name="session-player" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="accessibility" />
      <Stack.Screen name="templates" />
      <Stack.Screen name="capture" options={{ presentation: "modal" }} />
    </Stack>
  );
}
