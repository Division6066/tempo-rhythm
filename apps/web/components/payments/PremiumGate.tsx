"use client";

// ============================================================================
// PremiumGate
// ============================================================================
// Wrapper that locks content behind a paywall for free users.
//
// Paywall opens when:
// - PAYWALL_ENABLED is on
// - The user is signed in
// - The user is not on a paid plan (userType !== 'paid')
//
// Note: if PAYWALL_ENABLED is off, we render the content without gating.

import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";

import PaywallModal from "@/components/payments/PaywallModal";
import { MOCK_PAYMENTS, PAYWALL_ENABLED } from "@/config/appConfig";
import { api } from "@/convex/_generated/api";

type PremiumGateProps = {
  children: React.ReactNode;
  // Force preview mode (used by the dev console).
  forcePreview?: boolean;
};

export default function PremiumGate({ children, forcePreview }: PremiumGateProps) {
  const user = useQuery(api.users.getCurrentUser);
  const updateUserType = useMutation(api.users.updateUserType);

  const [paywallOpen, setPaywallOpen] = useState(false);

  const isPaid = useMemo(() => {
    return user?.userType === "paid";
  }, [user?.userType]);

  // Auto-open the paywall when the page is locked.
  useEffect(() => {
    if (!PAYWALL_ENABLED) {
      return;
    }

    // forcePreview: open regardless of user status (debug helper).
    if (forcePreview) {
      setPaywallOpen(true);
      return;
    }

    if (user && !isPaid) {
      setPaywallOpen(true);
    }
  }, [forcePreview, isPaid, user]);

  const handleMockUpgradeToPaid = async () => {
    if (!MOCK_PAYMENTS) {
      return;
    }

    // Dev-only: mark the user as paid without running checkout.
    await updateUserType({ userType: "paid" });
  };

  if (!PAYWALL_ENABLED) {
    return <>{children}</>;
  }

  // Hold while the user is loading so free content doesn't flash.
  if (user === undefined) {
    return <div className="min-h-[60vh]" />;
  }

  // Signed-out users see content — route protection happens in middleware.
  if (user === null) {
    return <>{children}</>;
  }

  if (isPaid) {
    return <>{children}</>;
  }

  return (
    <>
      <PaywallModal
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        onMockUpgradeToPaid={handleMockUpgradeToPaid}
        preview={Boolean(forcePreview)}
      />

      {/* Content stays hidden behind the paywall until the user continues. */}
      <div className="min-h-[60vh]" />
    </>
  );
}
