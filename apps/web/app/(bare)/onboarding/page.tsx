import { ProfileReady } from "@/components/today/ProfileReady";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default function Page() {
  return (
    <div data-testid="onboarding-route">
      <ProfileReady>
        <OnboardingFlow />
      </ProfileReady>
    </div>
  );
}
