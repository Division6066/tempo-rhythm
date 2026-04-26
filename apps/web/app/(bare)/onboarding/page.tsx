/**
 * @generated-by: T-F004 scaffold — replace with T-F005* port.
 * @screen: onboarding
 * @category: Onboarding
 * @source: docs/design/claude-export/design-system/screens-5.jsx#ScreenOnboarding
 * @summary: 5-step onboarding (welcome → personalization → template → first brain dump → first plan).
 * @queries: (none)
 * @mutations: users.completeOnboarding
 * @routes-to: /today
 * @auth: required
 * @notes: Copy placeholder from Claude export; copy pass in a later ticket.
 */
import { ScaffoldScreen } from "@/components/tempo/ScaffoldScreen";

export default function Page() {
  return (
    <ScaffoldScreen
      title="Onboarding"
      category="Onboarding"
      source="screens-5.jsx#ScreenOnboarding"
      summary="5-step onboarding (welcome → personalization → template → first brain dump → first plan)."
    />
  );
}
