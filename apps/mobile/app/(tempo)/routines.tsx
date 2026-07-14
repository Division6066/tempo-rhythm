/**
 * @generated-by: T-F008 scaffold — replace with T-F009* port.
 * @screen: routines
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
 * @summary: Mobile routines.
 * @notes: Copy placeholder from Claude export; copy pass in a later ticket.
 */
import { BreathworkTimer } from "@/components/breathwork/BreathworkTimer";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6 gap-5">
        <View className="gap-3">
          <Text className="text-2xl font-semibold text-foreground">
            Routines
          </Text>
          <Text className="text-sm text-muted-foreground">
            A gentle breathwork timer is ready when a reset would help.
          </Text>
        </View>
        <BreathworkTimer />
        <Text className="text-xs text-muted-foreground font-mono">
          scaffold · port from mobile/mobile-screens-b.jsx
        </Text>
      </View>
    </SafeAreaView>
  );
}
