/**
 * @generated-by: T-F008 scaffold — replace with T-F009* port.
 * @screen: notes
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-a.jsx
 * @summary: Notes list.
 * @notes: Copy placeholder from Claude export; copy pass in a later ticket.
 */
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6 gap-3">
        <Text className="text-2xl font-semibold text-foreground">Notes</Text>
        <Text className="text-sm text-muted-foreground">Notes list.</Text>
        <Text className="text-xs text-muted-foreground font-mono">
          scaffold · port from mobile/mobile-screens-a.jsx
        </Text>
      </View>
    </SafeAreaView>
  );
}
