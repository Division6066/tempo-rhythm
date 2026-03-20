import React, { useEffect, useState } from "react";
import { View, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";

type OfflineBannerProps = {
  isConnected: boolean;
  wasOffline: boolean;
  isSyncing: boolean;
  pendingCount?: number;
};

export function OfflineBanner({ isConnected, wasOffline, isSyncing, pendingCount = 0 }: OfflineBannerProps) {
  const [opacity] = useState(new Animated.Value(0));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const shouldShow = !isConnected || wasOffline || isSyncing;

    if (shouldShow) {
      setVisible(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }
  }, [isConnected, wasOffline, isSyncing]);

  if (!visible) return null;

  let backgroundColor = "#FF6B6B";
  let icon: keyof typeof Ionicons.glyphMap = "cloud-offline-outline";
  let message = "You're offline";

  if (isSyncing) {
    backgroundColor = colors.amber;
    icon = "sync-outline";
    message = `Syncing${pendingCount > 0 ? ` (${pendingCount})` : ""}...`;
  } else if (isConnected && wasOffline) {
    backgroundColor = colors.teal;
    icon = "cloud-done-outline";
    message = "Back online";
  }

  return (
    <Animated.View style={{ opacity }}>
      <View
        style={{
          backgroundColor,
          paddingVertical: 6,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <Ionicons name={icon} size={14} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>{message}</Text>
      </View>
    </Animated.View>
  );
}
