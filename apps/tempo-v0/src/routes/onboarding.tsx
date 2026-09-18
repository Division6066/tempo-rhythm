import { createFileRoute } from "@tanstack/react-router";
import { OnboardingView } from "@/components/tempo/onboarding-view";

export const Route = createFileRoute("/onboarding")({ component: OnboardingPage });

function OnboardingPage() {
  return <OnboardingView />;
}
