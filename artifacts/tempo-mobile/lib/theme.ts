import { createContext, useContext } from "react";

const darkColors = {
  background: "#1A1A2E",
  surface: "#262640",
  surfaceLight: "#303050",
  primary: "#6C63FF",
  primaryDark: "#5A52D5",
  teal: "#00C9A7",
  amber: "#FFB347",
  danger: "#FF6B6B",
  foreground: "#F0F0FF",
  muted: "#8888AA",
  border: "rgba(255,255,255,0.1)",
  borderLight: "rgba(255,255,255,0.15)",
  cardBg: "rgba(38,38,64,0.8)",
};

const lightColors = {
  background: "#F5F5FA",
  surface: "#FFFFFF",
  surfaceLight: "#EBEBF0",
  primary: "#6C63FF",
  primaryDark: "#5A52D5",
  teal: "#00C9A7",
  amber: "#FFB347",
  danger: "#FF6B6B",
  foreground: "#1A1A2E",
  muted: "#777799",
  border: "rgba(0,0,0,0.1)",
  borderLight: "rgba(0,0,0,0.08)",
  cardBg: "rgba(255,255,255,0.9)",
};

export const colors = darkColors;

export type ThemeMode = "dark" | "light";

export const ThemeContext = createContext<{
  mode: ThemeMode;
  colors: typeof darkColors;
  toggle: () => void;
}>({
  mode: "dark",
  colors: darkColors,
  toggle: () => {},
});

export function getThemeColors(mode: ThemeMode) {
  return mode === "dark" ? darkColors : lightColors;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
