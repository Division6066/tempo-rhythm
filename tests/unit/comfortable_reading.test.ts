import { describe, expect, test } from "bun:test";
import {
  accessibleReadingStorageKey,
  accessibleReadingTokens,
} from "../../packages/ui/src/theme/tokens.accessible";
import {
  applyAccessibleReadingToRoot,
  comfortableReadingOff,
  comfortableReadingOn,
  comfortableReadingStorageValue,
  computeAccessibleReadingRoot,
  isComfortableReadingStored,
  type ReadingDocumentRoot,
} from "../../apps/mobile/lib/comfortable-reading";

function createFakeRoot(): ReadingDocumentRoot & {
  attributes: Record<string, string>;
  cssVars: Record<string, string>;
} {
  const attributes: Record<string, string> = {};
  const cssVars: Record<string, string> = {};
  const styleProps: Record<string, string> = {};

  return {
    attributes,
    cssVars,
    style: {
      setProperty(name, value) {
        cssVars[name] = value;
      },
      removeProperty(name) {
        delete cssVars[name];
        delete styleProps[name];
      },
      get fontSize() {
        return styleProps["font-size"] ?? "";
      },
      set fontSize(value: string) {
        styleProps["font-size"] = value;
      },
      get lineHeight() {
        return styleProps["line-height"] ?? "";
      },
      set lineHeight(value: string) {
        styleProps["line-height"] = value;
      },
    },
    setAttribute(name, value) {
      attributes[name] = value;
    },
    removeAttribute(name) {
      delete attributes[name];
    },
  };
}

describe("comfortable reading tokens", () => {
  test("uses the same storage key as the original accessibility PR", () => {
    expect(accessibleReadingStorageKey).toBe("tempo.comfortableReading");
  });

  test("steps root type by 2px with roomier line height", () => {
    expect(accessibleReadingTokens.fontSizeStepPx).toBe(2);
    expect(accessibleReadingTokens.rootFontSizePx).toBe(18);
    expect(accessibleReadingTokens.lineHeight).toBe(1.7);
    expect(accessibleReadingTokens.paragraphSpacingPx).toBe(20);
  });
});

describe("comfortable reading storage helpers", () => {
  test("treats only the on token as enabled", () => {
    expect(isComfortableReadingStored("on")).toBe(true);
    expect(isComfortableReadingStored("off")).toBe(false);
    expect(isComfortableReadingStored(null)).toBe(false);
  });

  test("persists on/off tokens", () => {
    expect(comfortableReadingStorageValue(true)).toBe(comfortableReadingOn);
    expect(comfortableReadingStorageValue(false)).toBe(comfortableReadingOff);
  });
});

describe("computeAccessibleReadingRoot", () => {
  test("enables comfortable reading and standard motion", () => {
    const next = computeAccessibleReadingRoot(true, false);

    expect(next.attributes["data-comfortable-reading"]).toBe("on");
    expect(next.attributes["data-accessible-motion"]).toBe("standard");
    expect(next.style.fontSize).toBe("18px");
    expect(next.style.lineHeight).toBe("1.7");
    expect(next.cssVars["--tempo-reading-font-step-px"]).toBe("2px");
    expect(next.cssVars["--tempo-reading-motion-duration"]).toBe("220ms");
  });

  test("uses reduced motion tokens when the device asks", () => {
    const next = computeAccessibleReadingRoot(false, true);

    expect(next.attributes["data-comfortable-reading"]).toBeNull();
    expect(next.attributes["data-accessible-motion"]).toBe("reduced");
    expect(next.style.fontSize).toBeNull();
    expect(next.cssVars["--tempo-reading-motion-duration"]).toBe("0ms");
  });
});

describe("applyAccessibleReadingToRoot", () => {
  test("writes CSS vars and attributes, then clears them on disable", () => {
    const root = createFakeRoot();

    applyAccessibleReadingToRoot(root, true, false);
    expect(root.attributes["data-comfortable-reading"]).toBe("on");
    expect(root.attributes["data-accessible-motion"]).toBe("standard");
    expect(root.cssVars["--tempo-reading-line-height"]).toBe("1.7");
    expect(root.style.fontSize).toBe("18px");

    applyAccessibleReadingToRoot(root, false, true);
    expect(root.attributes["data-comfortable-reading"]).toBeUndefined();
    expect(root.attributes["data-accessible-motion"]).toBe("reduced");
    expect(root.cssVars["--tempo-reading-motion-duration"]).toBe("0ms");
    expect(root.style.fontSize).toBe("");
  });
});
