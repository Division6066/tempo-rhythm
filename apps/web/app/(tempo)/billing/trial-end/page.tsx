import { TrialEndScreen } from "@/components/tempo/screens/TrialEndScreen";

/**
 * @screen: trial-end
 * @category: Settings
 * @owner: cursor-cloud-3
 * @prd: PRD §15
 * @source: docs/design/claude-export/design-system/screens-6.jsx
 * @summary: Anti-shame trial-ended page with keep-or-downgrade CTAs + export.
 * @actions:
 *   - billing.subscribePro
 *   - account.exportAllData
 * @mutations:
 *   - billing.downgradeToBasic
 * @providers:
 *   - revenuecat
 * @auth: required
 */
export default function TrialEndPage() {
  return <TrialEndScreen />;
}
