import { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../tempo-app/convex/_generated/api";
import type { Id } from "../../../tempo-app/convex/_generated/dataModel";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../lib/theme";
import { hapticLight } from "../lib/haptics";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addDays,
  isToday,
  isSameMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns";

type ViewMode = "week" | "month";

export default function CalendarScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventStart, setEventStart] = useState("09:00");
  const [eventEnd, setEventEnd] = useState("10:00");
  const [selectedEvent, setSelectedEvent] = useState<{ title: string; date: string; startTime: string; endTime: string; description?: string; color?: string } | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const rangeStart = viewMode === "week" ? weekStart : monthStart;
  const rangeEnd = viewMode === "week" ? weekEnd : monthEnd;

  const startDate = format(rangeStart, "yyyy-MM-dd");
  const endDate = format(rangeEnd, "yyyy-MM-dd");

  const tasks = useQuery(api.tasks.listByDateRange, { startDate, endDate });
  const events = useQuery(api.calendarEvents.list, { startDate, endDate });
  const createEvent = useMutation(api.calendarEvents.create);
  const updateEvent = useMutation(api.calendarEvents.update);
  const deleteEvent = useMutation(api.calendarEvents.remove);

  const days = useMemo(() => {
    if (viewMode === "week") {
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
    const firstDay = startOfWeek(monthStart, { weekStartsOn: 1 });
    const lastDay = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: firstDay, end: lastDay });
  }, [viewMode, currentDate]);

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

  const handlePrev = () => {
    if (viewMode === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const handleEventTap = (event: { title: string; date: string; startTime: string; endTime: string; description?: string; color?: string }) => {
    hapticLight();
    setSelectedEvent(event);
    setShowDetailModal(true);
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

      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 10, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: "row", backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
          <Pressable
            onPress={() => setViewMode("week")}
            style={{ paddingHorizontal: 20, paddingVertical: 8, backgroundColor: viewMode === "week" ? colors.primary : "transparent" }}
          >
            <Text style={{ color: viewMode === "week" ? "#fff" : colors.muted, fontSize: 13, fontWeight: "700" }}>Week</Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode("month")}
            style={{ paddingHorizontal: 20, paddingVertical: 8, backgroundColor: viewMode === "month" ? colors.primary : "transparent" }}
          >
            <Text style={{ color: viewMode === "month" ? "#fff" : colors.muted, fontSize: 13, fontWeight: "700" }}>Month</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 10 }}>
        <Pressable onPress={handlePrev} hitSlop={12}>
          <Ionicons name="chevron-back" size={20} color={colors.muted} />
        </Pressable>
        <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700" }}>
          {viewMode === "week"
            ? `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
            : format(currentDate, "MMMM yyyy")}
        </Text>
        <Pressable onPress={handleNext} hitSlop={12}>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {viewMode === "month" && (
          <View style={{ flexDirection: "row", marginBottom: 8 }}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <View key={d} style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600" }}>{d}</Text>
              </View>
            ))}
          </View>
        )}

        {viewMode === "month" ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {days.map((day) => {
              const items = getItemsForDate(day);
              const today = isToday(day);
              const inMonth = isSameMonth(day, currentDate);
              const hasItems = items.tasks.length > 0 || items.events.length > 0;
              return (
                <Pressable
                  key={day.toISOString()}
                  onPress={() => {
                    setSelectedDate(format(day, "yyyy-MM-dd"));
                    setShowEventModal(true);
                  }}
                  style={{
                    width: "14.28%",
                    aspectRatio: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 2,
                  }}
                >
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: today ? colors.primary : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Text style={{ color: today ? "#fff" : inMonth ? colors.foreground : colors.muted, fontSize: 14, fontWeight: today ? "800" : "500", opacity: inMonth ? 1 : 0.4 }}>
                      {format(day, "d")}
                    </Text>
                  </View>
                  {hasItems && (
                    <View style={{ flexDirection: "row", gap: 2, marginTop: 2 }}>
                      {items.tasks.length > 0 && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary }} />}
                      {items.events.length > 0 && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.success }} />}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        ) : (
          days.map((day) => {
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
                  backgroundColor: today ? "rgba(201,100,66,0.08)" : colors.surface,
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: today ? "rgba(201,100,66,0.3)" : colors.border,
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
                    style={{ backgroundColor: "rgba(201,100,66,0.12)", borderRadius: 8, padding: 10, marginBottom: 4, borderLeftWidth: 3, borderLeftColor: colors.primary }}
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
                  <Pressable
                    key={e._id}
                    onPress={() => handleEventTap(e)}
                    style={{ backgroundColor: "rgba(107,158,125,0.12)", borderRadius: 8, padding: 10, marginBottom: 4, borderLeftWidth: 3, borderLeftColor: colors.success }}
                  >
                    <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>{e.title}</Text>
                    <Text style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>
                      {e.startTime} - {e.endTime}
                    </Text>
                  </Pressable>
                ))}
              </Pressable>
            );
          })
        )}

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
            <Ionicons name="calendar-outline" size={18} color={colors.success} />
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

      <Modal visible={showDetailModal} transparent animationType="fade">
        <Pressable onPress={() => setShowDetailModal(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border }}>
            {selectedEvent && (
              <>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: selectedEvent.color || colors.success }} />
                  <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", flex: 1 }}>{selectedEvent.title}</Text>
                  <Pressable onPress={() => setShowDetailModal(false)} hitSlop={12}>
                    <Ionicons name="close" size={22} color={colors.muted} />
                  </Pressable>
                </View>
                <View style={{ backgroundColor: colors.background, borderRadius: 12, padding: 16, gap: 10, borderWidth: 1, borderColor: colors.border }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                    <Text style={{ color: colors.foreground, fontSize: 14 }}>{selectedEvent.date}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Ionicons name="time-outline" size={16} color={colors.primary} />
                    <Text style={{ color: colors.foreground, fontSize: 14 }}>{selectedEvent.startTime} - {selectedEvent.endTime}</Text>
                  </View>
                  {selectedEvent.description && (
                    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 4 }}>
                      <Ionicons name="document-text-outline" size={16} color={colors.primary} />
                      <Text style={{ color: colors.muted, fontSize: 14, flex: 1 }}>{selectedEvent.description}</Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
