import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../tempo-app/convex/_generated/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";
import { hapticSuccess, hapticLight, hapticHeavy } from "../lib/haptics";
import type { Id } from "../../../tempo-app/convex/_generated/dataModel";

type TimerState = "idle" | "running" | "paused" | "complete";

export default function FocusScreen() {
  const router = useRouter();
  const prefs = useQuery(api.preferences.get);
  const tasks = useQuery(api.tasks.list, { status: "today" });
  const completeTask = useMutation(api.tasks.complete);

  const focusMinutes = prefs?.focusSessionMinutes ?? 25;
  const breakMinutes = prefs?.breakMinutes ?? 5;

  const [selectedTaskId, setSelectedTaskId] = useState<Id<"tasks"> | null>(null);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = isBreak ? breakMinutes * 60 : focusMinutes * 60;
  const progress = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) : 0;

  useEffect(() => {
    setSecondsLeft(focusMinutes * 60);
  }, [focusMinutes]);

  const handleTimerComplete = useCallback(() => {
    hapticHeavy();
    setIsBreak((currentIsBreak) => {
      if (!currentIsBreak) {
        setSessionsCompleted((s) => s + 1);
        setTimerState("complete");
      } else {
        setSecondsLeft(focusMinutes * 60);
        setTimerState("idle");
        return false;
      }
      return currentIsBreak;
    });
  }, [focusMinutes]);

  useEffect(() => {
    if (timerState === "running") {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState, handleTimerComplete]);

  const handleStart = () => {
    hapticLight();
    setTimerState("running");
  };

  const handlePause = () => {
    setTimerState("paused");
  };

  const handleResume = () => {
    setTimerState("running");
  };

  const handleReset = () => {
    setTimerState("idle");
    setIsBreak(false);
    setSecondsLeft(focusMinutes * 60);
  };

  const handleStartBreak = () => {
    setIsBreak(true);
    setSecondsLeft(breakMinutes * 60);
    setTimerState("running");
    hapticLight();
  };

  const handleCompleteTask = async () => {
    if (selectedTaskId) {
      await completeTask({ id: selectedTaskId });
      hapticSuccess();
      setSelectedTaskId(null);
    }
    handleReset();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const selectedTask = tasks?.find((t) => t._id === selectedTaskId);
  const activeTasks = tasks?.filter((t) => t.status !== "done") || [];

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", marginLeft: 12, flex: 1 }}>Focus Timer</Text>
        <View style={{ backgroundColor: "rgba(108,99,255,0.15)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>{sessionsCompleted} sessions</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100, alignItems: "center" }} showsVerticalScrollIndicator={false}>
        {timerState === "complete" ? (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(0,201,167,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
              <Ionicons name="checkmark-done" size={48} color={colors.teal} />
            </View>
            <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "800", marginBottom: 8 }}>Session Complete!</Text>
            <Text style={{ color: colors.muted, fontSize: 14, textAlign: "center", marginBottom: 32 }}>
              Great focus! You've completed {sessionsCompleted} session{sessionsCompleted !== 1 ? "s" : ""} today.
            </Text>

            <View style={{ gap: 12, width: "100%" }}>
              {selectedTask && (
                <Pressable
                  onPress={handleCompleteTask}
                  style={{ backgroundColor: colors.teal, borderRadius: 14, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Mark "{selectedTask.title}" Done</Text>
                </Pressable>
              )}
              <Pressable
                onPress={handleStartBreak}
                style={{ backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
              >
                <Ionicons name="cafe" size={20} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Take a {breakMinutes}m Break</Text>
              </Pressable>
              <Pressable
                onPress={handleReset}
                style={{ backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 16, alignItems: "center", borderWidth: 1, borderColor: colors.border }}
              >
                <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 15 }}>Start New Session</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <View style={{ width: 280, height: 280, alignItems: "center", justifyContent: "center", marginVertical: 32 }}>
              <View style={{ position: "absolute", width: 280, height: 280 }}>
                <View style={{ width: 280, height: 280, borderRadius: 140, borderWidth: 8, borderColor: colors.surfaceLight, position: "absolute" }} />
                <View style={{ width: 280, height: 280, borderRadius: 140, borderWidth: 8, borderColor: isBreak ? colors.teal : colors.primary, position: "absolute", opacity: progress }} />
              </View>
              <Text style={{ color: colors.foreground, fontSize: 56, fontWeight: "800", fontVariant: ["tabular-nums"] }}>
                {formatTime(secondsLeft)}
              </Text>
              <Text style={{ color: isBreak ? colors.teal : colors.primary, fontSize: 14, fontWeight: "600", marginTop: 4 }}>
                {isBreak ? "Break Time" : "Focus Time"}
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 16, marginBottom: 32 }}>
              {timerState === "idle" && (
                <Pressable
                  onPress={handleStart}
                  style={{ backgroundColor: colors.primary, borderRadius: 20, width: 72, height: 72, alignItems: "center", justifyContent: "center" }}
                >
                  <Ionicons name="play" size={32} color="#fff" />
                </Pressable>
              )}
              {timerState === "running" && (
                <Pressable
                  onPress={handlePause}
                  style={{ backgroundColor: colors.amber, borderRadius: 20, width: 72, height: 72, alignItems: "center", justifyContent: "center" }}
                >
                  <Ionicons name="pause" size={32} color="#fff" />
                </Pressable>
              )}
              {timerState === "paused" && (
                <>
                  <Pressable
                    onPress={handleResume}
                    style={{ backgroundColor: colors.primary, borderRadius: 20, width: 72, height: 72, alignItems: "center", justifyContent: "center" }}
                  >
                    <Ionicons name="play" size={32} color="#fff" />
                  </Pressable>
                  <Pressable
                    onPress={handleReset}
                    style={{ backgroundColor: colors.surface, borderRadius: 20, width: 72, height: 72, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border }}
                  >
                    <Ionicons name="refresh" size={28} color={colors.foreground} />
                  </Pressable>
                </>
              )}
            </View>

            {timerState === "idle" && (
              <View style={{ width: "100%" }}>
                <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
                  Focus on a task
                </Text>
                {activeTasks.length === 0 ? (
                  <Text style={{ color: colors.muted, fontSize: 13, textAlign: "center", padding: 20 }}>No tasks for today.</Text>
                ) : (
                  activeTasks.slice(0, 5).map((task) => (
                    <Pressable
                      key={task._id}
                      onPress={() => { setSelectedTaskId(selectedTaskId === task._id ? null : task._id); hapticLight(); }}
                      style={{
                        backgroundColor: selectedTaskId === task._id ? "rgba(108,99,255,0.12)" : colors.surface,
                        borderRadius: 12,
                        padding: 14,
                        marginBottom: 8,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        borderWidth: 1,
                        borderColor: selectedTaskId === task._id ? colors.primary : colors.border,
                      }}
                    >
                      <Ionicons
                        name={selectedTaskId === task._id ? "radio-button-on" : "radio-button-off"}
                        size={20}
                        color={selectedTaskId === task._id ? colors.primary : colors.muted}
                      />
                      <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", flex: 1 }}>{task.title}</Text>
                      {task.estimatedMinutes && (
                        <Text style={{ color: colors.muted, fontSize: 11 }}>{task.estimatedMinutes}m</Text>
                      )}
                    </Pressable>
                  ))
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
