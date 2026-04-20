import { Stack } from 'expo-router';

/**
 * (tempo) group — wraps the new Tempo Flow mobile surfaces.
 * Tabs live under (tempo)/(tabs); modal routes live as siblings.
 */
export default function TempoLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="capture" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
