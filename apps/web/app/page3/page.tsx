import PremiumGate from "@/components/payments/PremiumGate";

// Example page 3 (scaffold, gated by PremiumGate).
export default function Page3() {
  return (
    <PremiumGate>
      <div className="min-h-screen p-8">
        <main className="container mx-auto">
          <h1 className="font-bold text-4xl">Page 3</h1>
        </main>
      </div>
    </PremiumGate>
  );
}
