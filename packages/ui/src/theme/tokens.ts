/**
 * Tempo Flow — TypeScript mirror of design tokens.
 *
 * @source docs/design/claude-export/design-system/tokens.css
 *
 * Used by:
 *   - Mobile (`apps/mobile`) where CSS custom properties are not available.
 *   - Any JS that needs raw hex values (charts, SVG gradients, theme previews).
 *
 * Web (`apps/web`) reads tokens via CSS custom properties from `globals.css`;
 * do NOT import this file just to style a web component.
 */

export const tempoColors = {
  // Core palette
  ink: "#131312",
  cream: "#f3ebe2",
  creamRaised: "#faf6f0",
  creamDeep: "#ebe0d2",
  tempoOrange: "#d97757",
  softOrange: "#e8a87c",
  dustGrey: "#6b6864",
  dustGreySoft: "#9a968f",
  line: "#d7cec2",
  lineSoft: "#e6ddd1",
  // Status
  moss: "#4a7c59",
  brick: "#c8553d",
  amber: "#d4a44c",
  slateBlue: "#6e88a7",
} as const;

export const tempoColorsDark = {
  ink: "#131312",
  cream: "#f3ebe2",
  surfaceCard: "#1c1c1a",
  surfaceSunken: "#161615",
  fg: "#f3ebe2",
  fgMuted: "#a8a49f",
  fgSubtle: "#7a7672",
  border: "#2c2b28",
  borderSoft: "#242320",
  ring: "#e8a87c",
} as const;

export const tempoFonts = {
  serif: "Newsreader",
  sans: "Inter",
  mono: "IBM Plex Mono",
  dyslexia: "OpenDyslexic",
} as const;

export const tempoRadii = {
  sm: 4,
  base: 8,
  md: 10,
  lg: 12,
  xl: 16,
  "2xl": 24,
  pill: 9999,
} as const;

export const tempoSpacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const tempoMotion = {
  ease: "cubic-bezier(0.4, 0, 0.2, 1)",
  snap: 120,
  default: 220,
  hero: 420,
} as const;

export type TempoColorToken = keyof typeof tempoColors;
