import {
  accessibleReadingTokens,
} from "@tempo/ui/theme";

export const comfortableReadingOn = "on";
export const comfortableReadingOff = "off";

export type ReadingDocumentRoot = {
  style: {
    setProperty: (name: string, value: string) => void;
    removeProperty: (name: string) => void;
    fontSize: string;
    lineHeight: string;
  };
  setAttribute: (name: string, value: string) => void;
  removeAttribute: (name: string) => void;
};

export function isComfortableReadingStored(value: string | null): boolean {
  return value === comfortableReadingOn;
}

export function comfortableReadingStorageValue(enabled: boolean): string {
  return enabled ? comfortableReadingOn : comfortableReadingOff;
}

export function computeAccessibleReadingRoot(
  enabled: boolean,
  reducedMotion: boolean,
): {
  attributes: {
    "data-accessible-motion": "reduced" | "standard";
    "data-comfortable-reading": "on" | null;
  };
  cssVars: {
    "--tempo-reading-font-step-px": string;
    "--tempo-reading-line-height": string;
    "--tempo-reading-paragraph-spacing": string;
    "--tempo-reading-motion-duration": string;
  };
  style: {
    fontSize: string | null;
    lineHeight: string | null;
  };
} {
  const motionDuration = reducedMotion
    ? accessibleReadingTokens.motion.reducedDuration
    : accessibleReadingTokens.motion.standardDuration;

  return {
    attributes: {
      "data-accessible-motion": reducedMotion ? "reduced" : "standard",
      "data-comfortable-reading": enabled ? comfortableReadingOn : null,
    },
    cssVars: {
      "--tempo-reading-font-step-px": `${accessibleReadingTokens.fontSizeStepPx}px`,
      "--tempo-reading-line-height": String(accessibleReadingTokens.lineHeight),
      "--tempo-reading-paragraph-spacing": `${accessibleReadingTokens.paragraphSpacingPx}px`,
      "--tempo-reading-motion-duration": motionDuration,
    },
    style: enabled
      ? {
          fontSize: `${accessibleReadingTokens.rootFontSizePx}px`,
          lineHeight: String(accessibleReadingTokens.lineHeight),
        }
      : { fontSize: null, lineHeight: null },
  };
}

export function applyAccessibleReadingToRoot(
  root: ReadingDocumentRoot,
  enabled: boolean,
  reducedMotion: boolean,
): void {
  const next = computeAccessibleReadingRoot(enabled, reducedMotion);

  root.style.setProperty(
    "--tempo-reading-font-step-px",
    next.cssVars["--tempo-reading-font-step-px"],
  );
  root.style.setProperty(
    "--tempo-reading-line-height",
    next.cssVars["--tempo-reading-line-height"],
  );
  root.style.setProperty(
    "--tempo-reading-paragraph-spacing",
    next.cssVars["--tempo-reading-paragraph-spacing"],
  );
  root.style.setProperty(
    "--tempo-reading-motion-duration",
    next.cssVars["--tempo-reading-motion-duration"],
  );

  root.setAttribute(
    "data-accessible-motion",
    next.attributes["data-accessible-motion"],
  );

  if (next.attributes["data-comfortable-reading"] === null) {
    root.removeAttribute("data-comfortable-reading");
    root.style.removeProperty("font-size");
    root.style.removeProperty("line-height");
    return;
  }

  root.setAttribute(
    "data-comfortable-reading",
    next.attributes["data-comfortable-reading"],
  );
  root.style.fontSize = next.style.fontSize ?? "";
  root.style.lineHeight = next.style.lineHeight ?? "";
}
