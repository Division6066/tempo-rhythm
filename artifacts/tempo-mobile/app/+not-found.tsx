import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";
import { useThemeColors } from "../lib/theme";

export default function NotFoundScreen() {
  const colors = useThemeColors();

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: colors.background }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.foreground }}>This screen doesn&apos;t exist.</Text>

        <Link href="/" style={{ marginTop: 15, paddingVertical: 15 }}>
          <Text style={{ fontSize: 14, color: colors.primary }}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
