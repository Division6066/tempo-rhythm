import { BillingScreen } from "@/components/tempo/screens/BillingScreen";

/**
 * @screen: billing
 * @category: Settings
 * @owner: cursor-cloud-3
 * @prd: PRD §15
 * @source: docs/design/claude-export/design-system/screens-6.jsx (ScreenBilling)
 * @summary: Trial + subscription page with three tiers and RevenueCat portal link.
 * @queries:
 *   - billing.getCurrentEntitlement
 *   - billing.listInvoices
 * @actions:
 *   - billing.changeTier
 *   - billing.openCustomerPortal
 * @providers:
 *   - revenuecat
 * @tier-caps: basic 30 / pro 90 / max 180 voice min/day
 * @auth: required
 */
export default function BillingPage() {
  return <BillingScreen />;
}
