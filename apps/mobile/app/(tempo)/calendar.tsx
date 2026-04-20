/**
 * @screen: calendar
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
 * @queries: calendarEvents (Long Run 2)
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
import { mockCalendarEvents, mockCalendarWeekLabel } from "@tempo/mock-data";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function fmt(ms: number) {
  return new Date(ms).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 gap-2 p-4">
        <Text className="text-xl font-semibold text-foreground">Calendar</Text>
        <Text className="text-xs text-muted-foreground">{mockCalendarWeekLabel}</Text>
        <FlatList
          data={mockCalendarEvents}
          keyExtractor={(e) => e.id}
          renderItem={({ item }) => (
            <View className="mb-2 rounded-lg border border-border bg-card p-3">
              <Text className="font-medium text-foreground">{item.title}</Text>
              <Text className="text-xs text-muted-foreground">
                {fmt(item.startAt)} – {fmt(item.endAt)}
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
