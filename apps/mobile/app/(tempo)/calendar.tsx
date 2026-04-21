/**
 * @screen: calendar
 * @tier: A
 * @platform: mobile
 * @owner: cursor-cloud-2
 * @prd: §4 Screen 8, §4 Screen 9, §4 Screen 10, §9
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
 * @summary: Week calendar with day rail, scheduled blocks, and unscheduled lane.
 */
import { mockCalendarWeek, mockEvents } from "@tempo/mock-data";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CalendarScreen() {
  const router = useRouter();
  const scheduled = mockEvents.filter((event) => event.lane === "scheduled");
  const unscheduled = mockEvents.filter((event) => event.lane === "unscheduled");

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 pt-6" contentContainerClassName="pb-8">
        <View className="mb-4">
          <Text className="text-2xl font-semibold text-foreground">Calendar</Text>
          <Text className="text-sm text-muted-foreground">
            Week view with drag-ready blocks.
          </Text>
        </View>

        <View className="mb-4 flex-row gap-1 rounded-2xl border border-border bg-card p-2">
          {mockCalendarWeek.days.map((day) => {
            const isActive = day === mockCalendarWeek.activeDay;
            return (
              <Pressable
                key={day}
                className={`flex-1 rounded-xl px-2 py-3 ${isActive ? "bg-foreground" : "bg-transparent"}`}
                onPress={() => {}}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Focus ${day}`}
              >
                {/* @behavior: Focuses selected day and refreshes day-lane blocks from calendarEvents. */}
                {/* @convex-query-needed: calendarEvents.listWeekByDay */}
                {/* @navigate: /(tempo)/calendar?day={day} */}
                {/* @schema-delta: calendarEvents.energyOverlay */}
                <Text
                  className={`text-center text-xs font-medium ${isActive ? "text-background" : "text-muted-foreground"}`}
                >
                  {day}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mb-4 rounded-2xl border border-border bg-card p-4">
          <Text className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
            Scheduled
          </Text>
          {scheduled.map((event, index) => (
            <Pressable
              key={event.id}
              className={`rounded-xl border border-border bg-background p-3 ${index > 0 ? "mt-2" : ""}`}
              onPress={() => {}}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Open event ${event.title}`}
            >
              {/* @behavior: Opens event detail and allows drag-reschedule when backend is wired. */}
              {/* @convex-query-needed: calendarEvents.getById */}
              {/* @convex-mutation-needed: calendarEvents.reschedule */}
              {/* @navigate: /(tempo)/calendar/event/{eventId} */}
              <Text className="text-base font-medium text-foreground">{event.title}</Text>
              <Text className="mt-1 text-xs text-muted-foreground">
                {event.startLabel} - {event.endLabel}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="rounded-2xl border border-border bg-card p-4">
          <Text className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
            Unscheduled
          </Text>
          {unscheduled.map((event) => (
            <Pressable
              key={event.id}
              className="mb-2 rounded-xl border border-dashed border-border bg-background p-3"
              onPress={() => {}}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Schedule ${event.title}`}
            >
              {/* @behavior: Moves unscheduled task into a time slot selected by the user. */}
              {/* @convex-mutation-needed: calendarEvents.createTaskBlock */}
              {/* @navigate: /(tempo)/calendar/pick-time?taskId={eventId} */}
              <Text className="text-sm font-medium text-foreground">{event.title}</Text>
            </Pressable>
          ))}

          <Pressable
            className="mt-1 rounded-full bg-foreground px-4 py-3"
            onPress={() => {
              router.push("/(tempo)/capture");
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Create event"
          >
            {/* @behavior: Opens capture modal prefilled for calendar event creation. */}
            {/* @navigate: /(tempo)/capture?mode=event */}
            {/* @convex-mutation-needed: calendarEvents.createManual */}
            <Text className="text-center text-sm font-medium text-background">
              Create event
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
