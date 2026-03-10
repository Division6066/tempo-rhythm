// ============================================================================
// דף הצלחה לאחר Checkout
// ============================================================================
// Polar מפנה לכאן לאחר תשלום מוצלח (לפי POLAR_SUCCESS_URL).
//
// כרגע הדף מציג אישור בסיסי בלבד.
// כדי להפוך את זה ל"מערכת תשלומים מלאה", יש להוסיף:
// - Webhook מ-Polar
// - אימות התשלום בצד שרת
// - עדכון userType ל-'paid' ב-Convex

type SuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const checkoutIdRaw = params.checkout_id;
  const checkoutId = Array.isArray(checkoutIdRaw) ? checkoutIdRaw[0] : checkoutIdRaw;

  return (
    <div className="min-h-screen p-8">
      <main className="container mx-auto" dir="rtl">
        <h1 className="mb-4 font-bold text-4xl">התשלום התקבל בהצלחה</h1>
        <p className="text-lg text-foreground/80 leading-relaxed">
          תודה! אם תרצו, ניתן להשתמש ב-Checkout ID כדי לאמת את הרכישה מול Polar ולעדכן את סטטוס
          המשתמש.
        </p>

        <div className="mt-6 rounded-xl border border-orange-500/30 bg-orange-500/5 p-4">
          <div className="text-sm text-gray-500">Checkout ID</div>
          <div className="mt-1 font-mono text-sm text-gray-200 break-all">
            {checkoutId || "(לא התקבל Checkout ID)"}
          </div>
        </div>
      </main>
    </div>
  );
}
