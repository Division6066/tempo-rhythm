// ============================================================================
// Post-checkout success page
// ============================================================================
// Polar redirects here after a successful purchase (POLAR_SUCCESS_URL).
//
// Right now this page shows a basic confirmation. To make it a full payment
// system you'd want to add:
// - A webhook from Polar
// - Server-side payment verification
// - A Convex mutation bumping userType to 'paid'

type SuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const checkoutIdRaw = params.checkout_id;
  const checkoutId = Array.isArray(checkoutIdRaw) ? checkoutIdRaw[0] : checkoutIdRaw;

  return (
    <div className="min-h-screen p-8">
      <main className="container mx-auto">
        <h1 className="mb-4 font-bold text-4xl">Payment received</h1>
        <p className="text-lg text-foreground/80 leading-relaxed">
          Thanks! You can use the Checkout ID below to verify the purchase with Polar and sync the
          user's subscription status.
        </p>

        <div className="mt-6 rounded-xl border border-orange-500/30 bg-orange-500/5 p-4">
          <div className="text-sm text-gray-500">Checkout ID</div>
          <div className="mt-1 font-mono text-sm text-gray-200 break-all">
            {checkoutId || "(no Checkout ID received)"}
          </div>
        </div>
      </main>
    </div>
  );
}
