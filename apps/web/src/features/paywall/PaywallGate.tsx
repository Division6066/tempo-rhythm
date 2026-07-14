import type { ReactNode } from "react";
import React from "react";

import { BlurOverlay } from "./BlurOverlay";
import { exhaustedBody, exhaustedTitle, upgradeCtaLabel } from "./copy";
import { QuotaBadge } from "./QuotaBadge";
import type { PaywallFeature, PaywallGateProps, QuotaSnapshot } from "./types";
import { UpgradeSheet } from "./UpgradeSheet";

const defaultBillingHref = "/billing";
const h = React.createElement;

function fallbackQuota(feature: PaywallFeature): QuotaSnapshot {
  if (feature === "chat") {
    return { status: "unavailable", unit: "messages" };
  }

  if (feature === "image") {
    return { status: "unavailable", unit: "images" };
  }

  return { status: "unavailable", unit: "voice" };
}

function GateFrame({ children, dataPaywall }: { children?: ReactNode; dataPaywall: string }) {
  return h(
    "div",
    {
      "data-paywall": dataPaywall,
      style: {
        display: "grid",
        gap: 16,
        position: "relative",
      },
    },
    children
  );
}

export function PaywallGate({
  billingHref = defaultBillingHref,
  children,
  feature,
  quota: quotaProp,
  tier,
}: PaywallGateProps) {
  if (tier === "paid") {
    return h(React.Fragment, null, children);
  }

  const quota = quotaProp ?? fallbackQuota(feature);

  if (feature === "voice") {
    return h(
      GateFrame,
      { dataPaywall: "voice-gate" },
      h(UpgradeSheet, {
        body: exhaustedBody(feature, quota),
        ctaLabel: upgradeCtaLabel(feature),
        dataPaywall: "voice-gate-sheet",
        href: billingHref,
        title: exhaustedTitle(feature),
      })
    );
  }

  if (quota.status === "unavailable") {
    return h(GateFrame, { dataPaywall: "quota-unavailable" }, h(QuotaBadge, { quota }), children);
  }

  if (quota.status === "available") {
    return h(GateFrame, { dataPaywall: `${feature}-quota` }, h(QuotaBadge, { quota }), children);
  }

  if (feature === "image") {
    return h(
      GateFrame,
      { dataPaywall: "image-blur" },
      h(QuotaBadge, { quota }),
      h(
        "div",
        { style: { display: "grid", gap: 16, position: "relative" } },
        h(BlurOverlay, null, children),
        h(UpgradeSheet, {
          body: exhaustedBody(feature, quota),
          ctaLabel: upgradeCtaLabel(feature),
          dataPaywall: "image-upgrade-sheet",
          href: billingHref,
          title: exhaustedTitle(feature),
        })
      )
    );
  }

  return h(
    GateFrame,
    { dataPaywall: "chat-hard-stop" },
    h(QuotaBadge, { quota }),
    h(
      "fieldset",
      {
        "aria-describedby": "paywall-chat-hard-stop",
        disabled: true,
        style: { border: 0, margin: 0, padding: 0 },
      },
      children
    ),
    h(
      "div",
      { id: "paywall-chat-hard-stop" },
      h(UpgradeSheet, {
        body: exhaustedBody(feature, quota),
        ctaLabel: upgradeCtaLabel(feature),
        dataPaywall: "hard-stop-sheet",
        href: billingHref,
        title: exhaustedTitle(feature),
      })
    )
  );
}
