/**
 * Comfortable-reading token overlay.
 *
 * This file is intentionally additive: base Tempo tokens remain in T1's theme
 * system, while this module describes the alternate reading/accessibility set.
 */

export const accessibleReadingStorageKey = "tempo.comfortableReading";

export const accessibleReadingTokens = {
  fontSizeStepPx: 2,
  rootFontSizePx: 18,
  lineHeight: 1.7,
  paragraphSpacingPx: 20,
  motion: {
    standardDuration: "220ms",
    reducedDuration: "0ms",
  },
} as const;

export type AccessibleReadingTokens = typeof accessibleReadingTokens;
