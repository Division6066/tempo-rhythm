import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";

export default function LoginScreen() {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  async function handleSubmit() {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (isSignUp && !fullName.trim()) {
      setError("Please enter your name.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await signIn("password", {
        email,
        password,
        flow: isSignUp ? "signUp" : "signIn",
        ...(isSignUp && fullName ? { name: fullName } : {}),
      });
    } catch (err: any) {
      if (isSignUp) {
        setError(err?.message || "Could not create account. Please try again.");
      } else {
        setError(err?.message || "Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center", marginBottom: 48 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <Ionicons name="flash" size={32} color={colors.primary} />
            <Text
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: colors.foreground,
                letterSpacing: -0.5,
              }}
            >
              Tempo
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: colors.muted }}>
            Your ADHD-friendly daily planner
          </Text>
        </View>

        <View style={{ gap: 16 }}>
          {isSignUp && (
            <View style={{ gap: 6 }}>
              <Text
                style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}
              >
                Full Name
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: colors.foreground,
                }}
                placeholder="Your name"
                placeholderTextColor={colors.muted}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
          )}

          <View style={{ gap: 6 }}>
            <Text
              style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}
            >
              Email
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 16,
                color: colors.foreground,
              }}
              placeholder="you@example.com"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
            />
          </View>

          <View style={{ gap: 6 }}>
            <Text
              style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}
            >
              Password
            </Text>
            <View style={{ position: "relative" }}>
              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  paddingRight: 48,
                  fontSize: 16,
                  color: colors.foreground,
                }}
                placeholder={isSignUp ? "Create a password" : "Enter your password"}
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 14,
                  top: 0,
                  bottom: 0,
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={colors.muted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {error ? (
            <View
              style={{
                backgroundColor: "rgba(255,107,107,0.1)",
                borderWidth: 1,
                borderColor: "rgba(255,107,107,0.2)",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
            >
              <Text style={{ fontSize: 14, color: colors.danger }}>
                {error}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={{
              backgroundColor: loading ? colors.primaryDark : colors.primary,
              borderRadius: 8,
              paddingVertical: 14,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}
                >
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </Text>
              </>
            ) : (
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}
              >
                {isSignUp ? "Create account" : "Sign in"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            style={{ alignItems: "center", paddingVertical: 12 }}
          >
            <Text style={{ fontSize: 14, color: colors.muted }}>
              {isSignUp
                ? "Already have an account? "
                : "Don't have an account? "}
              <Text style={{ color: colors.primary, fontWeight: "600" }}>
                {isSignUp ? "Sign in" : "Sign up"}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
