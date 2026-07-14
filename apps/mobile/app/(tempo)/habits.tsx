/**
 * @generated-by: T-F008 scaffold — replace with T-F009* port.
 * @screen: habits
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
 * @summary: Mobile habits with ring rows.
 * @notes: Copy placeholder from Claude export; copy pass in a later ticket.
 */
import { habitRoutineCopy } from '@tempo/utils';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-6 gap-3">
        <Text className="text-2xl font-semibold text-foreground">
          {habitRoutineCopy.habits.title}
        </Text>
        <Text className="text-sm text-muted-foreground">
          {habitRoutineCopy.habits.mobileSummary}
        </Text>
        <Text className="text-xs text-muted-foreground font-mono">
          scaffold · port from mobile/mobile-screens-b.jsx
        </Text>
      </View>
    </SafeAreaView>
  );
}
