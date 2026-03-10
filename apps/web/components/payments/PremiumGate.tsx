"use client";

// ============================================================================
// PremiumGate
// ============================================================================
// רכיב מעטפת שמאפשר "לנעול" תוכן למשתמשים חינמיים.
//
// מתי נציג Paywall?
// - PAYWALL_ENABLED דולק
// - המשתמש מחובר
// - המשתמש אינו בתשלום (userType !== 'paid')
//
// הערה:
// - אם PAYWALL_ENABLED כבוי — אנחנו לא נפריע למשתמש ונציג את התוכן.

import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";

import PaywallModal from "@/components/payments/PaywallModal";
import { MOCK_PAYMENTS, PAYWALL_ENABLED } from "@/config/appConfig";
import { api } from "@/convex/_generated/api";

type PremiumGateProps = {
  children: React.ReactNode;
  // מאפשר Preview ידני (למשל מהדיבאג)
  forcePreview?: boolean;
};

export default function PremiumGate({ children, forcePreview }: PremiumGateProps) {
  const user = useQuery(api.users.getCurrentUser);
  const updateUserType = useMutation(api.users.updateUserType);

  const [paywallOpen, setPaywallOpen] = useState(false);

  const isPaid = useMemo(() => {
    return user?.userType === "paid";
  }, [user?.userType]);

  // פתיחה אוטומטית של Paywall כשהעמוד "נעול"
  useEffect(() => {
    if (!PAYWALL_ENABLED) {
      return;
    }

    // forcePreview: לא תלוי בסטטוס משתמש (מטרת דיבאג)
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

    // מצב בדיקה: מאפשר לסמן את המשתמש כ-paid בלי Checkout אמיתי
    await updateUserType({ userType: "paid" });
  };

  if (!PAYWALL_ENABLED) {
    return <>{children}</>;
  }

  // אם המשתמש עדיין נטען, נמתין (לא נציג תוכן כדי למנוע "פלאש" של תוכן חינמי)
  if (user === undefined) {
    return <div className="min-h-[60vh]" />; // מצב טעינה
  }

  // אם המשתמש לא מחובר, נציג את התוכן (ההגנה על נתיבים מתבצעת ב-middleware)
  if (user === null) {
    return <>{children}</>;
  }

  // אם המשתמש בתשלום, נציג את התוכן
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

      {/* במצב נעול אנחנו לא מציגים את התוכן מאחורי Paywall */}
      <div className="min-h-[60vh]" />
    </>
  );
}
