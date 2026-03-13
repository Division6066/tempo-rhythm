module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#1A1A2E",
        surface: "#262640",
        primary: "#6C63FF",
        teal: "#00C9A7",
        amber: "#FFB347",
        danger: "#FF6B6B",
        foreground: "#F0F0FF",
        muted: "#8888AA",
        border: "rgba(255,255,255,0.1)",
      },
    },
  },
  plugins: [],
};
