import { OnboardingScreen } from "@/components/tempo/screens/OnboardingScreen";

/**
 * @screen: onboarding
 * @category: Onboarding
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 38-41, §6, §8, §10, §15
 * @source: docs/design/claude-export/design-system/screens-7.jsx
 * @summary: 5-step onboarding (welcome, personalization, template pick, first
 * brain dump, first plan). Ends by routing to /today.
 * @queries:
 *   - users.getOnboardingState
 * @mutations:
 *   - profiles.setOnboardingPreferences
 *   - users.setOnboardingTemplate
 *   - users.completeOnboarding
 * @actions:
 *   - brainDump.processInitialDump
 * @providers:
 *   - openrouter
 *   - revenuecat (trial gating after onboarding)
 * @schema-deltas:
 *   - profiles.neurodivergentTags
 * @auth: public (starts onboarding for unauthenticated visitors)
 */
export default function OnboardingPage() {
  return <OnboardingScreen />;
}
