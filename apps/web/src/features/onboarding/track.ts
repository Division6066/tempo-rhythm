export type OnboardingStep =
  | "age-gate"
  | "preset"
  | "chat-preview"
  | "starter"
  | "first-chat";

export type OnboardingEventName =
  | "onboarding_age_gate_viewed"
  | "onboarding_preset_viewed"
  | "onboarding_chat_preview_viewed"
  | "onboarding_starter_viewed"
  | "onboarding_first_chat_viewed";

export type OnboardingFunnelEvent = {
  name: OnboardingEventName;
  step: OnboardingStep;
};

declare global {
  interface Window {
    __tempoOnboardingTrack?: (event: OnboardingFunnelEvent) => void;
  }
}

export function track(event: OnboardingFunnelEvent) {
  if (typeof window === "undefined") {
    return;
  }

  window.__tempoOnboardingTrack?.(event);
}
