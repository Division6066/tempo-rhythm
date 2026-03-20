import { useState, useRef } from "react";
import { View, Text, Pressable, TextInput, ScrollView, Dimensions, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../tempo-app/convex/_generated/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";
import { hapticSuccess, hapticLight } from "../lib/haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ENERGY_PATTERNS = [
  { id: "morning", label: "Morning Person", icon: "sunny" as const, desc: "Peak energy before noon" },
  { id: "afternoon", label: "Afternoon Peak", icon: "partly-sunny" as const, desc: "Best focus mid-day" },
  { id: "evening", label: "Night Owl", icon: "moon" as const, desc: "Most productive at night" },
  { id: "variable", label: "Variable", icon: "swap-horizontal" as const, desc: "Energy shifts day to day" },
];

const WAKE_TIMES = ["05:00", "05:30", "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00"];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, justifyContent: "center", marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i === current ? colors.primary : i < current ? colors.teal : colors.surfaceLight,
          }}
        />
      ))}
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const updatePrefs = useMutation(api.preferences.upsert);
  const createTask = useMutation(api.tasks.create);
  const scrollRef = useRef<ScrollView>(null);

  const [step, setStep] = useState(0);
  const [wakeTime, setWakeTime] = useState("07:00");
  const [energyPattern, setEnergyPattern] = useState("morning");
  const [firstTask, setFirstTask] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const goNext = () => {
    if (step < 3) {
      const next = step + 1;
      setStep(next);
      scrollRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
      hapticLight();
    }
  };

  const goBack = () => {
    if (step > 0) {
      const prev = step - 1;
      setStep(prev);
      scrollRef.current?.scrollTo({ x: prev * SCREEN_WIDTH, animated: true });
    }
  };

  const handleComplete = async () => {
    try {
      await updatePrefs({
        wakeTime,
        energyPeaks: [energyPattern],
        onboardingComplete: true,
      });

      if (firstTask.trim()) {
        await createTask({ title: firstTask.trim(), status: "today", priority: "medium" });
      }

      hapticSuccess();
      router.replace("/(tabs)/" as never);
    } catch {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <StepIndicator current={step} total={4} />
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <View style={{ width: SCREEN_WIDTH, paddingHorizontal: 24, justifyContent: "center" }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(255,179,71,0.15)", alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 24 }}>
            <Ionicons name="sunny" size={36} color={colors.amber} />
          </View>
          <Text style={{ color: colors.foreground, fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: 8 }}>When do you wake up?</Text>
          <Text style={{ color: colors.muted, fontSize: 14, textAlign: "center", marginBottom: 32 }}>This helps TEMPO schedule tasks at the right time.</Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {WAKE_TIMES.map((t) => (
              <Pressable
                key={t}
                onPress={() => { setWakeTime(t); hapticLight(); }}
                style={{
                  backgroundColor: wakeTime === t ? colors.primary : colors.surface,
                  borderRadius: 12,
                  paddingHorizontal: 18,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: wakeTime === t ? colors.primary : colors.border,
                }}
              >
                <Text style={{ color: wakeTime === t ? "#fff" : colors.foreground, fontSize: 15, fontWeight: "600" }}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ width: SCREEN_WIDTH, paddingHorizontal: 24, justifyContent: "center" }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(108,99,255,0.15)", alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 24 }}>
            <Ionicons name="flash" size={36} color={colors.primary} />
          </View>
          <Text style={{ color: colors.foreground, fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: 8 }}>What's your energy pattern?</Text>
          <Text style={{ color: colors.muted, fontSize: 14, textAlign: "center", marginBottom: 32 }}>TEMPO will prioritize hard tasks during your peak hours.</Text>

          <View style={{ gap: 10 }}>
            {ENERGY_PATTERNS.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => { setEnergyPattern(p.id); hapticLight(); }}
                style={{
                  backgroundColor: energyPattern === p.id ? "rgba(108,99,255,0.15)" : colors.surface,
                  borderRadius: 14,
                  padding: 18,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  borderWidth: 1,
                  borderColor: energyPattern === p.id ? colors.primary : colors.border,
                }}
              >
                <Ionicons name={p.icon} size={24} color={energyPattern === p.id ? colors.primary : colors.muted} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "700" }}>{p.label}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>{p.desc}</Text>
                </View>
                {energyPattern === p.id && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ width: SCREEN_WIDTH, paddingHorizontal: 24, justifyContent: "center" }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(0,201,167,0.15)", alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 24 }}>
            <Ionicons name="checkmark-done" size={36} color={colors.teal} />
          </View>
          <Text style={{ color: colors.foreground, fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: 8 }}>Capture your first task</Text>
          <Text style={{ color: colors.muted, fontSize: 14, textAlign: "center", marginBottom: 32 }}>What's one thing you want to get done today?</Text>

          <TextInput
            value={firstTask}
            onChangeText={setFirstTask}
            placeholder="e.g., Review quarterly report"
            placeholderTextColor={colors.muted}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 14,
              paddingHorizontal: 18,
              paddingVertical: 16,
              color: colors.foreground,
              fontSize: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />
          <Text style={{ color: colors.muted, fontSize: 12, textAlign: "center", marginTop: 12 }}>You can skip this — we'll add it to your Today list.</Text>
        </View>

        <View style={{ width: SCREEN_WIDTH, paddingHorizontal: 24, justifyContent: "center" }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(108,99,255,0.15)", alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 24 }}>
            <Ionicons name="notifications" size={36} color={colors.primary} />
          </View>
          <Text style={{ color: colors.foreground, fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: 8 }}>Stay on track</Text>
          <Text style={{ color: colors.muted, fontSize: 14, textAlign: "center", marginBottom: 32 }}>Get gentle reminders when it's time to focus or take a break.</Text>

          <View style={{ gap: 12 }}>
            <Pressable
              onPress={() => { setNotificationsEnabled(true); hapticLight(); }}
              style={{
                backgroundColor: notificationsEnabled ? "rgba(108,99,255,0.15)" : colors.surface,
                borderRadius: 14,
                padding: 18,
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                borderWidth: 1,
                borderColor: notificationsEnabled ? colors.primary : colors.border,
              }}
            >
              <Ionicons name="notifications" size={24} color={notificationsEnabled ? colors.primary : colors.muted} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "700" }}>Enable notifications</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>Recommended for best experience</Text>
              </View>
              {notificationsEnabled && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
            </Pressable>
            <Pressable
              onPress={() => { setNotificationsEnabled(false); hapticLight(); }}
              style={{
                backgroundColor: !notificationsEnabled ? "rgba(108,99,255,0.15)" : colors.surface,
                borderRadius: 14,
                padding: 18,
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                borderWidth: 1,
                borderColor: !notificationsEnabled ? colors.primary : colors.border,
              }}
            >
              <Ionicons name="notifications-off" size={24} color={!notificationsEnabled ? colors.primary : colors.muted} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "700" }}>Maybe later</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>You can change this anytime</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingBottom: 24, paddingTop: 12, flexDirection: "row", gap: 12 }}>
        {step > 0 && (
          <Pressable onPress={goBack} style={{ backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 24, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 15 }}>Back</Text>
          </Pressable>
        )}
        <Pressable
          onPress={step === 3 ? handleComplete : goNext}
          style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center" }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>{step === 3 ? "Get Started" : "Continue"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
