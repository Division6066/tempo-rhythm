import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../tempo-app/convex/_generated/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";

export default function SettingsScreen() {
  const prefs = useQuery(api.preferences.get);
  const updatePrefs = useMutation(api.preferences.upsert);
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    adhdMode: true,
    wakeTime: "07:00",
    sleepTime: "23:00",
    focusSessionMinutes: 25,
    breakMinutes: 5,
  });

  useEffect(() => {
    if (prefs) {
      setFormData({
        adhdMode: prefs.adhdMode,
        wakeTime: prefs.wakeTime,
        sleepTime: prefs.sleepTime,
        focusSessionMinutes: prefs.focusSessionMinutes,
        breakMinutes: prefs.breakMinutes,
      });
    }
  }, [prefs]);

  const handleSave = async () => {
    setSaving(true);
    try { await updatePrefs(formData); } finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", marginLeft: 12 }}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Ionicons name="sparkles" size={16} color={colors.primary} />
                <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700" }}>ADHD Mode</Text>
              </View>
              <Text style={{ color: colors.muted, fontSize: 12 }}>Gentle prompts, visual chunking, overwhelm reduction.</Text>
            </View>
            <Switch
              value={formData.adhdMode}
              onValueChange={(v) => setFormData({ ...formData, adhdMode: v })}
              trackColor={{ false: colors.surfaceLight, true: `${colors.primary}88` }}
              thumbColor={formData.adhdMode ? colors.primary : colors.muted}
            />
          </View>
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700", marginBottom: 16 }}>Routine</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Wake Time</Text>
              <TextInput value={formData.wakeTime} onChangeText={(v) => setFormData({ ...formData, wakeTime: v })} style={{ backgroundColor: colors.background, borderRadius: 12, padding: 12, color: colors.foreground, borderWidth: 1, borderColor: colors.border }} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Sleep Time</Text>
              <TextInput value={formData.sleepTime} onChangeText={(v) => setFormData({ ...formData, sleepTime: v })} style={{ backgroundColor: colors.background, borderRadius: 12, padding: 12, color: colors.foreground, borderWidth: 1, borderColor: colors.border }} />
            </View>
          </View>
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700", marginBottom: 16 }}>Focus Sessions</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Focus (min)</Text>
              <TextInput value={String(formData.focusSessionMinutes)} onChangeText={(v) => setFormData({ ...formData, focusSessionMinutes: parseInt(v) || 25 })} keyboardType="numeric" style={{ backgroundColor: colors.background, borderRadius: 12, padding: 12, color: colors.foreground, borderWidth: 1, borderColor: colors.border }} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Break (min)</Text>
              <TextInput value={String(formData.breakMinutes)} onChangeText={(v) => setFormData({ ...formData, breakMinutes: parseInt(v) || 5 })} keyboardType="numeric" style={{ backgroundColor: colors.background, borderRadius: 12, padding: 12, color: colors.foreground, borderWidth: 1, borderColor: colors.border }} />
            </View>
          </View>
        </View>

        <Pressable onPress={handleSave} disabled={saving} style={{ backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center", opacity: saving ? 0.7 : 1, marginBottom: 20 }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>{saving ? "Saving..." : "Save Settings"}</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            Alert.alert("Sign Out", "Are you sure you want to sign out?", [
              { text: "Cancel" },
              { text: "Sign Out", style: "destructive", onPress: () => signOut() },
            ]);
          }}
          style={{ backgroundColor: "rgba(255,107,107,0.1)", borderRadius: 14, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: "rgba(255,107,107,0.2)" }}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={{ color: colors.danger, fontWeight: "700", fontSize: 16 }}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
