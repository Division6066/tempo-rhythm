import React from "react";
import { quotaLine } from "./copy";
import type { QuotaSnapshot } from "./types";

type QuotaBadgeProps = {
  quota: QuotaSnapshot;
};

export function QuotaBadge({ quota }: QuotaBadgeProps) {
  const tone =
    quota.status === "exhausted"
      ? {
          background: "rgba(200, 85, 61, 0.12)",
          border: "rgba(200, 85, 61, 0.32)",
          color: "#7f2d1f",
        }
      : {
          background: "rgba(235, 224, 210, 0.72)",
          border: "rgba(215, 206, 194, 0.88)",
          color: "#4b4742",
        };

  return React.createElement(
    "p",
    {
      "data-paywall": "quota-badge",
      style: {
        display: "inline-flex",
        alignItems: "center",
        border: `1px solid ${tone.border}`,
        borderRadius: 999,
        background: tone.background,
        color: tone.color,
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.2,
        margin: 0,
        padding: "7px 11px",
      },
    },
    quotaLine(quota)
  );
}
