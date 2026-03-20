import { useColorScheme } from "react-native";

export const lightColors = {
  background: "#FAF9F7",
  surface: "#FFFFFF",
  surfaceLight: "#F0EFED",
  primary: "#C96442",
  primaryDark: "#B85838",
  teal: "#6B9E7D",
  success: "#6B9E7D",
  amber: "#C9A54E",
  warning: "#C9A54E",
  danger: "#B85450",
  destructive: "#B85450",
  info: "#5B8A9A",
  foreground: "#1A1815",
  muted: "#6B6660",
  border: "rgba(0,0,0,0.1)",
  borderLight: "rgba(0,0,0,0.06)",
  cardBg: "rgba(255,255,255,0.9)",
};

export const darkColors = {
  background: "#1A1815",
  surface: "#2A2825",
  surfaceLight: "#3A3835",
  primary: "#C96442",
  primaryDark: "#B85838",
  teal: "#6B9E7D",
  success: "#6B9E7D",
  amber: "#C9A54E",
  warning: "#C9A54E",
  danger: "#B85450",
  destructive: "#B85450",
  info: "#5B8A9A",
  foreground: "#F5F3F0",
  muted: "#8A8580",
  border: "rgba(255,255,255,0.08)",
  borderLight: "rgba(255,255,255,0.12)",
  cardBg: "rgba(42,40,37,0.8)",
};

export const colors = darkColors;

export function useThemeColors() {
  const scheme = useColorScheme();
  return scheme === "light" ? lightColors : darkColors;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
