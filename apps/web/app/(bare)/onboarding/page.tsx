/**
 * @generated-by: T-F004 scaffold — onboarding pseudo-code pass T-0023.
 * @screen: onboarding
 * @category: Auth
 * @owner: cursor-cloud-1
 * @prd: PRD §4 Screen 38-41, §6, §8, §10, §15
 * @source: docs/design/claude-export/design-system/screens-7.jsx
 * @summary: 5-step onboarding scaffold (welcome, personalization, template, first dump, first plan).
 * @auth: required
 */
import { ScaffoldScreen } from "@/components/tempo/ScaffoldScreen";

/*
 * @component: OnboardingTagSelector
 * @behavior: Save selected neurodivergent profile tags and coach tone preferences.
 * @convex-mutation-needed: profiles.setOnboardingPreferences
 * @schema-delta: profiles.neurodivergentTags
 * @prd: PRD §4 Screen 38, §8
 * @source: docs/design/claude-export/design-system/screens-7.jsx
 */
/*
 * @component: OnboardingBrainDumpSubmit
 * @behavior: Process first onboarding dump into proposal cards before plan confirmation.
 * @convex-action-needed: brainDump.processInitialDump
 * @provider-needed: openrouter
 * @convex-mutation-needed: brainDumps.create
 * @confirm: required before apply
 * @prd: PRD §4 Screen 40, §6
 * @source: docs/design/claude-export/design-system/screens-7.jsx
 */
/*
 * @component: OnboardingContinueButton
 * @behavior: Complete onboarding and route user into the today screen.
 * @convex-mutation-needed: users.completeOnboarding
 * @navigate: /today
 * @provider-needed: revenuecat
 * @tier-caps: basic 30 min/day; pro 90 min/day; max 180 min/day
 * @prd: PRD §4 Screen 41, §9, §15
 * @source: docs/design/claude-export/design-system/screens-7.jsx
 */
export default function Page() {
  return (
    <ScaffoldScreen
      title="Onboarding"
      category="Onboarding"
      source="screens-7.jsx"
      summary="5-step onboarding (welcome → personalization → template → first brain dump → first plan)."
    />
  );
}
