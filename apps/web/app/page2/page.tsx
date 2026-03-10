import PremiumGate from "@/components/payments/PremiumGate";

// דף דוגמה 2
export default function Page2() {
  return (
    <PremiumGate>
      <div className="min-h-screen p-8">
        <main className="container mx-auto">
          <h1 className="font-bold text-4xl">עמוד 2</h1>
        </main>
      </div>
    </PremiumGate>
  );
}
