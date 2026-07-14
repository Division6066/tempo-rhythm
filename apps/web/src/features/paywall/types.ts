import type { ReactNode } from "react";

export type PaywallFeature = "chat" | "image" | "voice";

export type PaywallTier = "trial" | "paid";

export type QuotaUnit = "messages" | "images" | "voice";

export type QuotaSnapshot =
  | {
      status: "available" | "exhausted";
      used: number;
      limit: number;
      unit: QuotaUnit;
    }
  | {
      status: "unavailable";
      unit: QuotaUnit;
    };

export type PaywallGateProps = {
  children?: ReactNode;
  feature: PaywallFeature;
  tier: PaywallTier;
  quota?: QuotaSnapshot;
  billingHref?: string;
};
