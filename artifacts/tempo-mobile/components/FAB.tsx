import { useState } from "react";
import { View, Pressable, Text, Modal } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";
import { hapticLight } from "../lib/haptics";

const ACTIONS: { icon: string; label: string; route: string; color: string }[] = [
  { icon: "add-circle", label: "Add Task", route: "/(tabs)/inbox", color: colors.primary },
  { icon: "document-text", label: "New Note", route: "/notes", color: colors.teal },
  { icon: "today", label: "Plan My Day", route: "/plan", color: colors.amber },
  { icon: "sparkles", label: "Open Chat", route: "/(tabs)/chat", color: colors.primary },
  { icon: "timer", label: "Focus Timer", route: "/focus", color: "#FF6B6B" },
  { icon: "sparkles-outline", label: "Extract Tasks", route: "/extract", color: "#9D4EDD" },
];

export default function FAB() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleAction = (route: string) => {
    setOpen(false);
    hapticLight();
    router.push(route as never);
  };

  return (
    <>
      <Modal visible={open} transparent animationType="fade">
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end", paddingBottom: 120, paddingHorizontal: 20 }}>
          <View style={{ gap: 8 }}>
            {ACTIONS.map((action) => (
              <Pressable
                key={action.label}
                onPress={() => handleAction(action.route)}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 14,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${action.color}20`, alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name={action.icon as any} size={20} color={action.color} />
                </View>
                <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "600" }}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Pressable
        onPress={() => { setOpen(true); hapticLight(); }}
        style={{
          position: "absolute",
          bottom: 100,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 16,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name={open ? "close" : "flash"} size={24} color="#fff" />
      </Pressable>
    </>
  );
}
