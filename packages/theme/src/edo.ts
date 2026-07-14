export const edoTheme = {
  colors: {
    indigo: "#243b6b",
    vermilion: "#d84f2a",
    sumi: "#14110f",
    goldLeaf: "#c79a3b",
    washi: "#f4efe2",
    washiRaised: "#fffaf0",
    sumiMuted: "#5f5750",
    mist: "#ddd3c4",
  },
  type: {
    display: "Newsreader",
    body: "Inter",
    annotation: "IBM Plex Mono",
    kanji: "serif",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radii: {
    sm: 6,
    md: 12,
    lg: 20,
    full: 9999,
  },
  motion: {
    quiet: 160,
    settle: 260,
    brush: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
} as const;

export type EdoTheme = typeof edoTheme;
export type EdoColorToken = keyof EdoTheme["colors"];
export type EdoTypeToken = keyof EdoTheme["type"];
export type EdoSpacingToken = keyof EdoTheme["spacing"];
