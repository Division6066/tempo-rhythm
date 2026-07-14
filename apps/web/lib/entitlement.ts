export type BetaAccess = "none" | "tester" | "founder";
export type EntitlementTier = "none" | "basic" | "pro" | "max" | "god";
export type UserType = "free" | "paid";

export type EntitlementProfile = {
  betaAccess?: BetaAccess;
  entitlementTier?: EntitlementTier;
  userType?: UserType;
  isActive?: boolean;
};

export type EntitlementState = {
  accessKind: "free" | "paid" | "promo";
  billingStatus: "active" | "inactive";
  currentTier: "free" | "free-beta" | "basic" | "pro" | "max" | "founder-lifetime";
  isApprovedTester: boolean;
  isFounder: boolean;
  isPaid: boolean;
};

const paidTierLabels: Record<"basic" | "pro" | "max", string> = {
  basic: "Basic",
  pro: "Pro",
  max: "Max",
};

export function getEntitlementState(profile: EntitlementProfile | null | undefined): EntitlementState {
  const betaAccess = profile?.betaAccess ?? "none";
  const entitlementTier = profile?.entitlementTier ?? "none";
  const isFounder = betaAccess === "founder" || entitlementTier === "god";
  const isApprovedTester = betaAccess === "tester";
  const paidTier =
    entitlementTier === "basic" || entitlementTier === "pro" || entitlementTier === "max"
      ? entitlementTier
      : null;
  const isPaid = profile?.userType === "paid" || paidTier !== null;

  if (isFounder) {
    return {
      accessKind: "promo",
      billingStatus: "active",
      currentTier: "founder-lifetime",
      isApprovedTester,
      isFounder,
      isPaid: true,
    };
  }

  if (paidTier) {
    return {
      accessKind: "paid",
      billingStatus: "active",
      currentTier: paidTier,
      isApprovedTester,
      isFounder,
      isPaid: true,
    };
  }

  if (isApprovedTester) {
    return {
      accessKind: "promo",
      billingStatus: "inactive",
      currentTier: "free-beta",
      isApprovedTester,
      isFounder,
      isPaid,
    };
  }

  return {
    accessKind: "free",
    billingStatus: isPaid ? "active" : "inactive",
    currentTier: "free",
    isApprovedTester,
    isFounder,
    isPaid,
  };
}

export function getCurrentTierLabel(state: EntitlementState): string {
  if (state.currentTier === "free-beta") return "Free beta";
  if (state.currentTier === "founder-lifetime") return "Founder lifetime";
  if (state.currentTier === "free") return "Free";
  return paidTierLabels[state.currentTier];
}

export function getBillingNotice(state: EntitlementState): string {
  if (state.isFounder) {
    return "Founder lifetime access is active. No payment action is needed.";
  }

  if (state.isApprovedTester) {
    return "Approved beta tester promo access is active: the core app stays open while billing remains inactive.";
  }

  if (state.isPaid) {
    return "Your payable tier is represented here. Live checkout changes still require billing approval.";
  }

  return "Payments are not live yet. This account can review billing, but paid access is not active.";
}

export function canUseCoreApp(state: EntitlementState): boolean {
  return state.isPaid || state.isFounder || state.isApprovedTester;
}
