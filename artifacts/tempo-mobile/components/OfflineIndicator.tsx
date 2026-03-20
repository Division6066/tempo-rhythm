import { useState, useEffect } from "react";
import { View, Text, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") return;

    let unsubscribe: (() => void) | undefined;

    const setup = async () => {
      try {
        const NetInfo = await import("@react-native-community/netinfo");
        unsubscribe = NetInfo.default.addEventListener((state) => {
          setIsOffline(!(state.isConnected && state.isInternetReachable !== false));
        });
      } catch {
        // netinfo not available
      }
    };

    setup();
    return () => { unsubscribe?.(); };
  }, []);

  if (!isOffline) return null;

  return (
    <View style={{
      backgroundColor: "rgba(255,179,71,0.15)",
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "center",
      marginBottom: 8,
      borderWidth: 1,
      borderColor: "rgba(255,179,71,0.3)",
    }}>
      <Ionicons name="cloud-offline" size={14} color={colors.amber} />
      <Text style={{ color: colors.amber, fontSize: 11, fontWeight: "600" }}>You're offline</Text>
    </View>
  );
}
