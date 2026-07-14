import type { PaywallFeature, QuotaSnapshot } from "./types";

const featureNouns: Record<PaywallFeature, string> = {
  chat: "chatting",
  image: "creating",
  voice: "voice",
};

export function quotaLine(quota: QuotaSnapshot): string {
  if (quota.status === "unavailable") {
    return "Quota unavailable. You can keep viewing while usage refreshes.";
  }

  return `You used ${quota.used} of ${quota.limit} trial ${quota.unit}.`;
}

export function upgradeCtaLabel(feature: PaywallFeature): string {
  if (feature === "voice") {
    return "Upgrade for voice";
  }

  return `Upgrade to keep ${featureNouns[feature]}`;
}

export function exhaustedTitle(feature: PaywallFeature): string {
  if (feature === "chat") {
    return "Trial message limit reached";
  }

  if (feature === "image") {
    return "Your generated image is ready";
  }

  return "Voice is paid-only for now.";
}

export function exhaustedBody(feature: PaywallFeature, quota: QuotaSnapshot): string {
  if (feature === "voice") {
    return "Live voice is reserved for paid plans in this v1 trial. You can still use text chat and review existing moments.";
  }

  if (quota.status === "unavailable") {
    return quotaLine(quota);
  }

  if (feature === "image") {
    return "Upgrade when you want to reveal this result and keep creating.";
  }

  return `You used all ${quota.limit} trial messages. Upgrade when you are ready to keep the conversation going.`;
}
