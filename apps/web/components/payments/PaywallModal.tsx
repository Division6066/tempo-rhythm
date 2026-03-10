"use client";

// ============================================================================
// מודל Paywall (תשלום)
// ============================================================================
// המודל הזה מציג למשתמש 3 תוכניות (חינם/חודשי/שנתי) בעיצוב דומה לצילום.
//
// התנהגות:
// - בחירת "חינם" תאפשר להמשיך בלי Checkout.
// - בחירת תוכנית בתשלום תנסה לבצע Redirect ל-Polar Checkout.
// - אם מערכת התשלומים עדיין כבויה או חסרים Product IDs, נציג הודעת Preview.

import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  IS_DEV_MODE,
  MOCK_PAYMENTS,
  PAYMENT_SYSTEM_ENABLED,
  PRIVACY_URL,
  TERMS_URL,
} from "@/config/appConfig";
import { PLAN_DISPLAY } from "@/config/planDisplay";
import { POLAR_MONTHLY_PRODUCT_ID, POLAR_YEARLY_PRODUCT_ID } from "@/config/polarConfig";
import { cn } from "@/lib/utils";

export type PaywallPlanId = "free" | "monthly" | "yearly";

type PaywallModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // מאפשר למצב בדיקה "להעלות" את המשתמש ל-paid בלי Polar
  onMockUpgradeToPaid?: () => Promise<void> | void;
  // מאפשר פתיחה במצב Preview (מטרת דיבאג)
  preview?: boolean;
};

const FEATURES_FREE: string[] = ["תכונה בסיסית אחת (להתחלה)"];

const FEATURES_PAID: string[] = [
  "שיחות והתראות",
  "אפליקציות iOS ו-Android",
  "10+ סוגי ניטור",
  "מדיניות הסלמה ותורנות",
];

function getPolarProductId(plan: PaywallPlanId): string {
  if (plan === "monthly") {
    return POLAR_MONTHLY_PRODUCT_ID;
  }
  if (plan === "yearly") {
    return POLAR_YEARLY_PRODUCT_ID;
  }
  return "";
}

export default function PaywallModal({
  open,
  onOpenChange,
  onMockUpgradeToPaid,
  preview,
}: PaywallModalProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PaywallPlanId>("yearly");
  const [error, setError] = useState<string>("");

  const isPreviewMode = Boolean(preview && IS_DEV_MODE);

  // פונקציה לחזרה לעמוד הקודם
  const handleBack = () => {
    onOpenChange(false);
    router.back();
  };

  const continueLabel = useMemo(() => {
    if (selectedPlan === "free") {
      return "המשך בחינם";
    }
    return "המשך";
  }, [selectedPlan]);

  const handleContinue = async () => {
    setError("");

    // בחירה בחינם = לא מבצעים checkout
    if (selectedPlan === "free") {
      onOpenChange(false);
      return;
    }

    // מצב Preview או מערכת תשלומים כבויה
    if (isPreviewMode || !PAYMENT_SYSTEM_ENABLED) {
      setError(
        "מצב תצוגה מקדימה: מערכת התשלומים כבויה כרגע. ניתן להפעיל אותה דרך appConfig.ts לאחר הגדרה מלאה."
      );

      // אם רוצים לבדוק "שדרוג" בלי Polar
      if (MOCK_PAYMENTS && onMockUpgradeToPaid) {
        await onMockUpgradeToPaid();
        onOpenChange(false);
      }

      return;
    }

    // מערכת תשלומים פעילה — חייבים Product ID
    const productId = getPolarProductId(selectedPlan);
    if (!productId) {
      setError(
        "לא הוגדרו מזהי מוצרים (Product IDs) ב-Polar עבור התוכנית שנבחרה. הגדר NEXT_PUBLIC_POLAR_MONTHLY_PRODUCT_ID / NEXT_PUBLIC_POLAR_YEARLY_PRODUCT_ID."
      );
      return;
    }

    // Redirect ל-Polar Checkout דרך השרת
    const checkoutUrl = new URL("/checkout", window.location.origin);
    checkoutUrl.searchParams.set("products", productId);
    window.location.href = checkoutUrl.toString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* הסתרת כפתור X ברירת מחדל - מוצג רק במצב Preview */}
      <DialogContent
        className="sm:max-w-3xl bg-linear-to-br from-gray-900 via-gray-800 to-black border-gray-700 p-0"
        hideCloseButton={!isPreviewMode}
      >
        <div className="rounded-2xl bg-gray-900/40 backdrop-blur-sm p-6" dir="rtl">
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between">
              {/* כפתור חזרה - מחזיר לעמוד הקודם */}
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 text-gray-400 hover:text-gray-200 transition"
                aria-label="חזור"
              >
                <ChevronRight className="h-5 w-5" />
                <span className="text-sm">חזור</span>
              </button>
              <DialogTitle className="text-3xl font-bold text-white text-center flex-1">
                בחר תוכנית לצוות שלך
              </DialogTitle>
              {/* ריווח לאיזון הכותרת */}
              <div className="w-16" />
            </div>
            <p className="text-gray-400 text-center mt-2">תוכל לשדרג בכל עת. בטל מתי שתרצה.</p>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* חינם */}
            <PlanCard
              planId="free"
              title={PLAN_DISPLAY.free.title}
              subtitle={PLAN_DISPLAY.free.subtitle}
              selectedPlan={selectedPlan}
              onSelect={setSelectedPlan}
              features={FEATURES_FREE}
            />

            {/* חודשי */}
            <PlanCard
              planId="monthly"
              title={PLAN_DISPLAY.monthly.title}
              subtitle={PLAN_DISPLAY.monthly.subtitle}
              priceLine={PLAN_DISPLAY.monthly.priceLine}
              selectedPlan={selectedPlan}
              onSelect={setSelectedPlan}
              features={FEATURES_PAID}
            />

            {/* שנתי */}
            <PlanCard
              planId="yearly"
              title={PLAN_DISPLAY.yearly.title}
              subtitle={PLAN_DISPLAY.yearly.subtitle}
              priceLine={PLAN_DISPLAY.yearly.priceLine}
              selectedPlan={selectedPlan}
              onSelect={setSelectedPlan}
              features={FEATURES_PAID}
              isRecommended={true}
            />
          </div>

          {isPreviewMode && (
            <div className="mt-5 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
              מצב תצוגה מקדימה פעיל — רכישות מושבתות
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-orange-500/40 bg-orange-500/10 px-4 py-3 text-sm text-orange-100">
              {error}
            </div>
          )}

          <div className="mt-6">
            <button
              type="button"
              onClick={handleContinue}
              className="w-full rounded-xl bg-linear-to-r from-orange-500 to-red-600 px-6 py-4 font-bold text-white shadow-md transition-all hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              {continueLabel}
            </button>

            <p className="mt-3 text-center text-xs text-gray-500">
              המשך עם התחייבות להחזר כספי (דוגמה). את הטקסט הזה אפשר לשנות לפי הצורך.
            </p>
          </div>

          {/* קישורים תחתונים */}
          <div className="mt-6 flex items-center justify-center gap-6 text-sm">
            <Link
              href={TERMS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              תנאי שימוש
            </Link>
            <span className="text-gray-600">•</span>
            <Link
              href={PRIVACY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              פרטיות
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type PlanCardProps = {
  planId: PaywallPlanId;
  title: string;
  subtitle: string;
  priceLine?: string;
  features: string[];
  selectedPlan: PaywallPlanId;
  onSelect: (plan: PaywallPlanId) => void;
  isRecommended?: boolean;
};

function PlanCard({
  planId,
  title,
  subtitle,
  priceLine,
  features,
  selectedPlan,
  onSelect,
  isRecommended,
}: PlanCardProps) {
  const isSelected = selectedPlan === planId;

  return (
    <button
      type="button"
      onClick={() => onSelect(planId)}
      className={cn(
        "relative rounded-2xl border bg-gray-900/40 p-5 text-right transition",
        "hover:bg-gray-900/55",
        isSelected ? "border-orange-500/80 ring-1 ring-orange-500/30" : "border-gray-700"
      )}
    >
      {isRecommended && (
        <div className="absolute -top-3 right-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
          מומלץ
        </div>
      )}

      {/* אינדיקטור בחירה */}
      <div
        className={cn(
          "absolute left-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border",
          isSelected ? "border-orange-500 bg-orange-500" : "border-gray-600"
        )}
        aria-hidden="true"
      >
        {isSelected ? <Check className="h-4 w-4 text-black" /> : null}
      </div>

      <div className="mb-3">
        <div className="text-lg font-bold text-white">{title}</div>
        <div className="mt-1 text-sm text-gray-400">{subtitle}</div>

        {priceLine ? (
          <div className="mt-3 text-3xl font-extrabold text-white">{priceLine}</div>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-3">
            <Check className="h-4 w-4 text-orange-400" />
            <div className="text-sm text-gray-200">{feature}</div>
          </div>
        ))}
      </div>
    </button>
  );
}
