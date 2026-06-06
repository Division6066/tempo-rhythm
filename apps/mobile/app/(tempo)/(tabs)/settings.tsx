/**
 * @generated-by: app-shell navigation scaffold.
 * @screen: settings
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/mobile/mobile-shell.jsx
 * @summary: Primary Settings tab that keeps profile, preferences, and support surfaces together.
 * @notes: Shell-only navigation hub; settings behavior remains delegated to feature tickets.
 */
import { Link } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SETTINGS_LINKS = [
  { href: "/settings" as const, label: "Settings home", summary: "Profile and preferences scaffold." },
  { href: "/templates" as const, label: "Templates", summary: "Reusable day and week patterns." },
  { href: "/capture" as const, label: "Capture", summary: "Quick capture modal scaffold." },
] as const;

export default function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 gap-5 p-6">
        <View className="gap-2">
          <Text className="text-2xl font-semibold text-foreground">
            Settings
          </Text>
          <Text className="text-sm leading-6 text-muted-foreground">
            Preferences, account surfaces, and support links will live here.
            Nothing changes until you choose it.
          </Text>
        </View>

        <View className="gap-3">
          {SETTINGS_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              accessibilityLabel={item.label}
              accessibilityHint={item.summary}
              className="rounded-2xl border border-border bg-card px-4 py-3"
            >
              <Text className="text-base font-semibold text-foreground">
                {item.label}
              </Text>
              <Text className="mt-1 text-sm text-muted-foreground">
                {item.summary}
              </Text>
            </Link>
          ))}
        </View>

        <Text className="text-xs text-muted-foreground font-mono">
          scaffold · primary mobile tab
        </Text>
      </View>
    </SafeAreaView>
  );
}
