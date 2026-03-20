import React, { useState, useCallback, useMemo } from "react";
import { useConvexAuth } from "convex/react";
import { Redirect, Stack, usePathname } from "expo-router";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { convex, secureStorage } from "../lib/convex";
import { ThemeContext, getThemeColors, useTheme } from "../lib/theme";
import type { ThemeMode } from "../lib/theme";
import { NetworkProvider } from "../lib/NetworkContext";
import { OfflineBanner } from "../components/OfflineBanner";
import { useNetwork } from "../lib/NetworkContext";
import "../global.css";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1A1A2E", padding: 24 }}>
          <Ionicons name="warning-outline" size={48} color="#FF6B6B" style={{ marginBottom: 16 }} />
          <Text style={{ color: "#F0F0FF", fontSize: 18, fontWeight: "700", marginBottom: 8, textAlign: "center" }}>
            Something went wrong
          </Text>
          <Text style={{ color: "#8888AA", fontSize: 14, textAlign: "center", marginBottom: 24 }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </Text>
          <Pressable
            onPress={() => this.setState({ hasError: false, error: null })}
            style={{ backgroundColor: "#6C63FF", borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

function OfflineBannerWrapper() {
  const { isConnected, wasOffline, isSyncing, pendingCount } = useNetwork();
  return (
    <OfflineBanner
      isConnected={isConnected}
      wasOffline={wasOffline}
      isSyncing={isSyncing}
      pendingCount={pendingCount}
    />
  );
}

function RootNavigator() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const pathname = usePathname();
  const { mode, colors } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.muted, fontSize: 13, marginTop: 16 }}>Connecting...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (pathname === "/login") {
    return <Redirect href="/(tabs)/" />;
  }

  return (
    <>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <OfflineBannerWrapper />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "slide_from_right",
        }}
      />
    </>
  );
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const toggle = useCallback(() => setMode((m) => (m === "dark" ? "light" : "dark")), []);
  const themeColors = useMemo(() => getThemeColors(mode), [mode]);
  const value = useMemo(() => ({ mode, colors: themeColors, toggle }), [mode, themeColors, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ConvexAuthProvider client={convex} storage={secureStorage}>
        <NetworkProvider>
          <ThemeProvider>
            <RootNavigator />
          </ThemeProvider>
        </NetworkProvider>
      </ConvexAuthProvider>
    </ErrorBoundary>
  );
}
