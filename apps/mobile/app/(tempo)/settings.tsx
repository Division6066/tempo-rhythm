/**
 * @screen: settings
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
 * @queries: users.getMe
 * @mutations: users.setPreferences
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
import { mockUser } from "@tempo/mock-data";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 gap-4 p-4">
        <Text className="text-xl font-semibold text-foreground">Settings</Text>
        <Text className="text-sm text-muted-foreground">{mockUser.name}</Text>
        <Text className="text-xs text-muted-foreground">{mockUser.email}</Text>
        {/*
          @action openThemeSettings
          @mutation: users.setPreferences
          @auth: required
          @env: NEXT_PUBLIC_CONVEX_URL
        */}
        <Pressable
          accessible
          accessibilityRole="button"
          accessibilityLabel="Theme"
          hitSlop={8}
          className="rounded-lg border border-border bg-card p-4"
        >
          <Text className="text-foreground">Theme: {mockUser.preferences.theme}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
