import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Switch, Alert, Share, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useAction } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../tempo-app/convex/_generated/api";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../lib/theme";
import { hapticSuccess, hapticWarning } from "../lib/haptics";

export default function SettingsScreen() {
  const colors = useThemeColors();
  const colorScheme = useColorScheme();
  const prefs = useQuery(api.preferences.get);
  const allTasks = useQuery(api.tasks.list, {});
  const notes = useQuery(api.notes.list);
  const updatePrefs = useMutation(api.preferences.upsert);
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [notifReminders, setNotifReminders] = useState(true);
  const [notifAI, setNotifAI] = useState(true);
  const [notifDaily, setNotifDaily] = useState(true);

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
    try {
      await updatePrefs(formData);
      hapticSuccess();
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    const taskCount = allTasks?.length ?? 0;
    const noteCount = notes?.length ?? 0;
    const completedTasks = allTasks?.filter((t) => t.status === "done").length ?? 0;

    const exportData = [
      "TEMPO Data Export",
      `Date: ${new Date().toLocaleDateString()}`,
      "",
      `Total Tasks: ${taskCount}`,
      `Completed Tasks: ${completedTasks}`,
      `Total Notes: ${noteCount}`,
      "",
      "--- Tasks ---",
      ...(allTasks || []).map((t) => `[${t.status}] ${t.title} (${t.priority})`),
      "",
      "--- Notes ---",
      ...(notes || []).map((n) => `${n.title}`),
    ].join("\n");

    try {
      await Share.share({ message: exportData, title: "TEMPO Data Export" });
      hapticSuccess();
    } catch {
      // user cancelled
    }
  };

  const SectionCard = ({ children, style }: { children: React.ReactNode; style?: object }) => (
    <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.border, ...style }}>
      {children}
    </View>
  );

  type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

  const SettingRow = ({ icon, label, description, right }: { icon: IoniconsName; label: string; description?: string; right: React.ReactNode }) => (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: description ? 4 : 0 }}>
          <Ionicons name={icon} size={16} color={colors.primary} />
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700" }}>{label}</Text>
        </View>
        {description && <Text style={{ color: colors.muted, fontSize: 12 }}>{description}</Text>}
      </View>
      {right}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={{ color: colors.foreground, fontSize: 20, fontWeight: "800", marginLeft: 12 }}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <SectionCard>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>Profile</Text>
          {editingName ? (
            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
              <TextInput
                value={profileName}
                onChangeText={setProfileName}
                placeholder="Your name"
                placeholderTextColor={colors.muted}
                autoFocus
                style={{ flex: 1, backgroundColor: colors.background, borderRadius: 12, padding: 12, color: colors.foreground, borderWidth: 1, borderColor: colors.border }}
              />
              <Pressable
                onPress={() => {
                  setEditingName(false);
                  hapticSuccess();
                }}
                style={{ backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12 }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Save</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setEditingName(true)} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.primary}33`, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700" }}>{profileName || "Set your name"}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>Tap to edit</Text>
              </View>
              <Ionicons name="pencil-outline" size={18} color={colors.muted} />
            </Pressable>
          )}
        </SectionCard>

        <SectionCard>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>Appearance</Text>
          <SettingRow
            icon="moon"
            label="Theme"
            description="Follows your device system setting"
            right={
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "600" }}>
                {colorScheme === "dark" ? "Dark" : "Light"}
              </Text>
            }
          />
        </SectionCard>

        <SectionCard>
          <SettingRow
            icon="sparkles"
            label="ADHD Mode"
            description="Gentle prompts, visual chunking, overwhelm reduction."
            right={
              <Switch
                value={formData.adhdMode}
                onValueChange={(v) => setFormData({ ...formData, adhdMode: v })}
                trackColor={{ false: colors.surfaceLight, true: `${colors.primary}88` }}
                thumbColor={formData.adhdMode ? colors.primary : colors.muted}
              />
            }
          />
        </SectionCard>

        <SectionCard>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>Notifications</Text>
          <View style={{ gap: 16 }}>
            <SettingRow
              icon="alarm-outline"
              label="Task Reminders"
              right={
                <Switch
                  value={notifReminders}
                  onValueChange={setNotifReminders}
                  trackColor={{ false: colors.surfaceLight, true: `${colors.primary}88` }}
                  thumbColor={notifReminders ? colors.primary : colors.muted}
                />
              }
            />
            <SettingRow
              icon="sparkles-outline"
              label="AI Suggestions"
              right={
                <Switch
                  value={notifAI}
                  onValueChange={setNotifAI}
                  trackColor={{ false: colors.surfaceLight, true: `${colors.primary}88` }}
                  thumbColor={notifAI ? colors.primary : colors.muted}
                />
              }
            />
            <SettingRow
              icon="sunny-outline"
              label="Daily Planning"
              right={
                <Switch
                  value={notifDaily}
                  onValueChange={setNotifDaily}
                  trackColor={{ false: colors.surfaceLight, true: `${colors.primary}88` }}
                  thumbColor={notifDaily ? colors.primary : colors.muted}
                />
              }
            />
          </View>
        </SectionCard>

        <SectionCard>
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
        </SectionCard>

        <SectionCard>
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
        </SectionCard>

        <Pressable onPress={handleSave} disabled={saving} style={{ backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center", opacity: saving ? 0.7 : 1, marginBottom: 12 }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>{saving ? "Saving..." : "Save Settings"}</Text>
        </Pressable>

        <Pressable onPress={handleExport} style={{ backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
          <Ionicons name="share-outline" size={20} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 16 }}>Export Data</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            hapticWarning();
            Alert.alert("Sign Out", "Are you sure you want to sign out?", [
              { text: "Cancel" },
              { text: "Sign Out", style: "destructive", onPress: () => signOut() },
            ]);
          }}
          style={{ backgroundColor: "rgba(184,84,80,0.1)", borderRadius: 14, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: "rgba(184,84,80,0.2)" }}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
          <Text style={{ color: colors.destructive, fontWeight: "700", fontSize: 16 }}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
