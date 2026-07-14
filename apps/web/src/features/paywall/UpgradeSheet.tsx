import Link from "next/link";
import React from "react";

type UpgradeSheetProps = {
  body: string;
  ctaLabel: string;
  dataPaywall: string;
  href: string;
  title: string;
};

export function UpgradeSheet({ body, ctaLabel, dataPaywall, href, title }: UpgradeSheetProps) {
  return React.createElement(
    "aside",
    {
      "aria-live": "polite",
      "data-paywall": dataPaywall,
      style: {
        background: "rgba(250, 246, 240, 0.96)",
        border: "1px solid rgba(215, 206, 194, 0.96)",
        borderRadius: 24,
        boxShadow: "0 30px 60px -30px rgba(19, 19, 18, 0.35)",
        color: "#131312",
        maxWidth: 440,
        padding: 24,
      },
    },
    React.createElement(
      "p",
      {
        style: {
          color: "#6b6864",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.08em",
          margin: "0 0 8px",
          textTransform: "uppercase",
        },
      },
      "Trial pause"
    ),
    React.createElement(
      "h2",
      {
        style: {
          fontFamily: "var(--font-newsreader), Georgia, serif",
          fontSize: 28,
          lineHeight: 1,
          margin: "0 0 10px",
        },
      },
      title
    ),
    React.createElement(
      "p",
      { style: { color: "#4b4742", fontSize: 15, lineHeight: 1.5, margin: "0 0 18px" } },
      body
    ),
    React.createElement(
      Link,
      {
        href,
        style: {
          alignItems: "center",
          background: "#d97757",
          borderRadius: 999,
          color: "#131312",
          display: "inline-flex",
          fontSize: 15,
          fontWeight: 700,
          minHeight: 44,
          padding: "0 18px",
          textDecoration: "none",
        },
      },
      ctaLabel
    )
  );
}
