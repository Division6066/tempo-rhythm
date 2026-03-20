module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#1A1815",
        surface: "#2A2825",
        primary: "#C96442",
        success: "#6B9E7D",
        warning: "#C9A54E",
        destructive: "#B85450",
        info: "#6B8E9E",
        foreground: "#F5F3F0",
        muted: "#8A8580",
        border: "rgba(255,255,255,0.08)",
      },
    },
  },
  plugins: [],
};
