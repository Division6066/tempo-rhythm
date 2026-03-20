import React from "react";
import { useConvexAuth } from "convex/react";
import { Redirect, Stack, usePathname } from "expo-router";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View, Text, Pressable, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { convex, secureStorage } from "../lib/convex";
import { useThemeColors } from "../lib/theme";
import { NetworkProvider } from "../lib/NetworkContext";
import { OfflineBanner } from "../components/OfflineBanner";
import { useNetwork } from "../lib/NetworkContext";
import "../global.css";

function ErrorUI({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  const colors = useThemeColors();
  const scheme = useColorScheme();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background, padding: 24 }}>
      <Ionicons name="warning-outline" size={48} color={colors.destructive} style={{ marginBottom: 16 }} />
      <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "700", marginBottom: 8, textAlign: "center" }}>
        Something went wrong
      </Text>
      <Text style={{ color: colors.muted, fontSize: 14, textAlign: "center", marginBottom: 24 }}>
        {error?.message || "An unexpected error occurred."}
      </Text>
      <Pressable
        onPress={onRetry}
        style={{ backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 }}
      >
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Try Again</Text>
      </Pressable>
    </View>
  );
}

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
        <ErrorUI
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
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
  const colors = useThemeColors();
  const colorScheme = useColorScheme();

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
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
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

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <ConvexAuthProvider client={convex} storage={secureStorage}>
          <NetworkProvider>
            <RootNavigator />
          </NetworkProvider>
        </ConvexAuthProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
