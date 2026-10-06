import { BillingPlan } from "@/components/billing-plan/BillingPlan";

export default function Page() {
  return (
    <div data-testid="billing-page" className="flex flex-col gap-6 p-6">
      <h2 className="text-lg font-medium">Trial &amp; billing</h2>
      <BillingPlan />
    </div>
  );
}
