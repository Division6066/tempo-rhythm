/**
 * @screen: settings
 * @tier: A
 * @platform: mobile
 * @owner: cursor-cloud-2
 * @prd: PRD §25 (Settings), §26 (Account), §27 (Subscription), §30 (Privacy), §32 (Accessibility), §33 (Appearance), §34 (Voice), §35 (Ask the Founder), §36 (Notifications)
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
 * @summary: Mobile settings hub rendered from shared mock fixtures for backend handoff only.
 */
import { mockSettingsSections, mockUser } from "@tempo/mock-data";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  const sectionRouteMap: Record<string, string> = {
    coach: "/(tempo)/(tabs)/coach",
    voice: "/(tempo)/(tabs)/coach",
    privacy: "/(tempo)/settings",
    subscription: "/(auth)/paywall",
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 py-6">
        <Text className="text-2xl font-semibold text-foreground">Settings</Text>
        <Text className="mt-2 text-sm text-muted-foreground">
          Account for {mockUser.name} · {mockUser.tier.toUpperCase()}
        </Text>
        <View className="mt-5 rounded-2xl border border-border bg-card p-4">
          <Text className="text-base font-medium text-foreground">
            {mockUser.email}
          </Text>
          <Text className="mt-1 text-xs text-muted-foreground">
            Coach dial {mockUser.coachDial}/10 · {mockUser.timezone}
          </Text>
          <Text className="mt-1 text-xs text-muted-foreground">
            Voice used today: {mockUser.voiceMinutesUsedToday} minutes
          </Text>
        </View>

        <View className="mt-4 rounded-2xl border border-border bg-card px-4 py-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-base font-medium text-foreground">
                Reduced motion
              </Text>
              <Text className="mt-1 text-xs text-muted-foreground">
                Respect device preference on transitions.
              </Text>
            </View>
            {/* @behavior: Toggle reduced-motion preference for all animated transitions in the app shell. */}
            {/* @convex-mutation-needed: profiles.updateAccessibilityPreferences */}
            {/* @schema-delta: profiles.reduceMotion */}
            {/* @convex-query-needed: profiles.getAccessibilityPreferences */}
            {/* @prd: PRD §32 */}
            {/* @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx */}
            <Switch value={false} />
          </View>
        </View>

        <View className="mt-4 gap-3">
          {mockSettingsSections.map((section) => (
            <Pressable
              key={section.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <Text className="text-base font-medium text-foreground">
                {section.label}
              </Text>
              <Text className="mt-1 text-xs text-muted-foreground">
                {section.detail}
              </Text>
              <Text className="mt-2 text-xs text-muted-foreground">
                Route: {sectionRouteMap[section.id] ?? "/(tempo)/settings"}
              </Text>
              {/* @behavior: Open dedicated settings sub-screen while preserving unsaved toggles in this root screen. */}
              {/* @navigate: /(tempo)/settings/{section} */}
              {/* @convex-query-needed: settings.loadSection */}
              {/* @behavior: Fetch latest section state before rendering controls to avoid stale toggles. */}
              {/* @prd: PRD §25-§36 */}
              {/* @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx */}
            </Pressable>
          ))}
        </View>

        <View className="mt-4 rounded-2xl border border-border bg-card px-4 py-3">
          <Text className="text-base font-medium text-foreground">
            Manage plan
          </Text>
          <Text className="mt-1 text-xs text-muted-foreground">
            Open paywall and RevenueCat-managed billing.
          </Text>
          <Pressable className="mt-3 rounded-xl bg-foreground px-4 py-3">
            <Text className="text-center text-sm font-semibold text-background">
              Continue to billing
            </Text>
            {/* @behavior: Open paywall flow and fetch current entitlement state before showing plan cards. */}
            {/* @navigate: /(auth)/paywall */}
            {/* @convex-query-needed: subscriptionStates.getCurrentPlan */}
            {/* @provider-needed: revenuecat */}
            {/* @tier-caps: basic 30 min/day live voice, pro 90 min/day, max 180 min/day */}
            {/* @prd: PRD §15, §27, §28, §34 */}
            {/* @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx */}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
