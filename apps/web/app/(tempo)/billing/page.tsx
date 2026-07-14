/**
 * @generated-by: T-F004 scaffold — replace with T-F005* port.
 * @screen: billing
 * @category: Settings
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 * @summary: Trial countdown + RevenueCat entitlement status.
 * @queries: billing.status
 * @mutations: (none)
 * @auth: required
 * @notes: Billing remains visible while live payments stay approval-gated.
 */
import { BillingScreen } from "@/components/billing/BillingScreen";

export default function Page() {
  return <BillingScreen />;
}
