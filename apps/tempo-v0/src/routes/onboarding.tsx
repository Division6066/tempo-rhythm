import { createFileRoute } from "@/lib/tempo-graft/router";
import { OnboardingView } from "@tempo-v0/components/tempo/onboarding-view";

export const Route = createFileRoute("/onboarding")({ component: OnboardingPage });

function OnboardingPage() {
  return <OnboardingView />;
}
