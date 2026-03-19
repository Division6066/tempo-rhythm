import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../tempo-app/convex/_generated/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  isToday,
  eachDayOfInterval,
} from "date-fns";

export default function CalendarScreen() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventStart, setEventStart] = useState("09:00");
  const [eventEnd, setEventEnd] = useState("10:00");

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const startDate = format(weekStart, "yyyy-MM-dd");
  const endDate = format(weekEnd, "yyyy-MM-dd");

  const tasks = useQuery(api.tasks.listByDateRange, { startDate, endDate });
  const events = useQuery(api.calendarEvents.list, { startDate, endDate });
  const createEvent = useMutation(api.calendarEvents.create);

  const handleCreateEvent = async () => {
    if (!eventTitle.trim() || !selectedDate) return;
    await createEvent({
      title: eventTitle,
      date: selectedDate,
      startTime: eventStart,
      endTime: eventEnd,
    });
    setEventTitle("");
    setShowEventModal(false);
  };

  const getItemsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return {
      tasks: (tasks || []).filter((t) => t.scheduledDate === dateStr),
      events: (events || []).filter((e) => e.date === dateStr),
    };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, justifyContent: "space-between" }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800" }}>Calendar</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable onPress={() => setCurrentDate(new Date())} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "600" }}>Today</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 10 }}>
        <Pressable onPress={() => setCurrentDate(subWeeks(currentDate, 1))} hitSlop={12}>
          <Ionicons name="chevron-back" size={20} color={colors.muted} />
        </Pressable>
        <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700" }}>
          {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
        </Text>
        <Pressable onPress={() => setCurrentDate(addWeeks(currentDate, 1))} hitSlop={12}>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {days.map((day) => {
          const items = getItemsForDate(day);
          const today = isToday(day);
          return (
            <Pressable
              key={day.toISOString()}
              onPress={() => {
                setSelectedDate(format(day, "yyyy-MM-dd"));
                setShowEventModal(true);
              }}
              style={{
                backgroundColor: today ? "rgba(108,99,255,0.08)" : colors.surface,
                borderRadius: 14,
                padding: 16,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: today ? "rgba(108,99,255,0.3)" : colors.border,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: today ? colors.primary : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Text style={{ color: today ? "#fff" : colors.foreground, fontSize: 16, fontWeight: "700" }}>
                      {format(day, "d")}
                    </Text>
                  </View>
                  <Text style={{ color: colors.muted, fontSize: 13, fontWeight: "600" }}>
                    {format(day, "EEEE")}
                  </Text>
                </View>
                <Ionicons name="add-circle-outline" size={20} color={colors.muted} />
              </View>

              {items.tasks.length === 0 && items.events.length === 0 && (
                <Text style={{ color: colors.muted, fontSize: 12, fontStyle: "italic" }}>No items</Text>
              )}

              {items.tasks.map((t) => (
                <Pressable
                  key={t._id}
                  onPress={() => router.push(`/task/${t._id}` as never)}
                  style={{ backgroundColor: "rgba(108,99,255,0.12)", borderRadius: 8, padding: 10, marginBottom: 4, borderLeftWidth: 3, borderLeftColor: colors.primary }}
                >
                  <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>{t.title}</Text>
                  {t.startTime && (
                    <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>
                      {t.startTime} ({t.duration || 30}m)
                    </Text>
                  )}
                </Pressable>
              ))}

              {items.events.map((e) => (
                <View
                  key={e._id}
                  style={{ backgroundColor: "rgba(0,201,167,0.12)", borderRadius: 8, padding: 10, marginBottom: 4, borderLeftWidth: 3, borderLeftColor: colors.teal }}
                >
                  <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>{e.title}</Text>
                  <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>
                    {e.startTime} - {e.endTime}
                  </Text>
                </View>
              ))}
            </Pressable>
          );
        })}

        <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
          <Pressable
            onPress={() => router.push("/notes/period/weekly" as never)}
            style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, alignItems: "center", gap: 4 }}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "600" }}>Weekly Note</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/notes/period/monthly" as never)}
            style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, alignItems: "center", gap: 4 }}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.teal} />
            <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "600" }}>Monthly Note</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={showEventModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>New Event</Text>
              <Pressable onPress={() => setShowEventModal(false)} hitSlop={12}>
                <Ionicons name="close" size={24} color={colors.muted} />
              </Pressable>
            </View>
            <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>{selectedDate}</Text>
            <TextInput
              value={eventTitle}
              onChangeText={setEventTitle}
              placeholder="Event title"
              placeholderTextColor={colors.muted}
              style={{ backgroundColor: colors.background, borderRadius: 12, padding: 14, color: colors.foreground, fontSize: 15, borderWidth: 1, borderColor: colors.border, marginBottom: 12 }}
            />
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 4 }}>Start</Text>
                <TextInput
                  value={eventStart}
                  onChangeText={setEventStart}
                  placeholder="09:00"
                  placeholderTextColor={colors.muted}
                  style={{ backgroundColor: colors.background, borderRadius: 12, padding: 12, color: colors.foreground, borderWidth: 1, borderColor: colors.border }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 4 }}>End</Text>
                <TextInput
                  value={eventEnd}
                  onChangeText={setEventEnd}
                  placeholder="10:00"
                  placeholderTextColor={colors.muted}
                  style={{ backgroundColor: colors.background, borderRadius: 12, padding: 12, color: colors.foreground, borderWidth: 1, borderColor: colors.border }}
                />
              </View>
            </View>
            <Pressable
              onPress={handleCreateEvent}
              disabled={!eventTitle.trim()}
              style={{ backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center", opacity: eventTitle.trim() ? 1 : 0.5 }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Create Event</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
