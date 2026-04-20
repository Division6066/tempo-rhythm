/**
 * @screen: onboarding
 * @platform: mobile
 * @tier: tier-a
 * @owner: T-0023-c
 * @prd: PRD_Phase_1_MVP §4 Screen 37-41, §6, §8, §10, §15
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx (MobileOnboarding)
 * @summary: Five-step onboarding flow with personalization, template pick, first brain dump, and first plan.
 */
import { mockOnboarding, mockTasks, mockTodayScreen } from "@tempo/mock-data";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    mockOnboarding.profileTags[0] ?? "ADHD",
    mockOnboarding.profileTags[4] ?? "Burnout",
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState(
    mockOnboarding.templateOptions[1] ?? "Builder",
  );
  const [agreePrivacy, setAgreePrivacy] = useState(true);

  const canContinue = useMemo(() => {
    if (stepIndex === 1) {
      return selectedTags.length > 0;
    }
    if (stepIndex === 2) {
      return selectedTemplate.length > 0;
    }
    if (stepIndex === 4) {
      return agreePrivacy;
    }
    return true;
  }, [agreePrivacy, selectedTags.length, selectedTemplate.length, stepIndex]);

  const progressRatio = (stepIndex + 1) / mockOnboarding.steps.length;
  const onboardingPlanPreview = mockTasks.slice(0, 3);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((item) => item !== tag);
      }
      return [...prev, tag];
    });
  };

  const onBack = () => {
    setStepIndex((prev) => Math.max(0, prev - 1));
  };

  const onContinue = () => {
    if (!canContinue) {
      return;
    }
    setStepIndex((prev) => Math.min(mockOnboarding.steps.length - 1, prev + 1));
  };

  const stepTitle = mockOnboarding.steps[stepIndex] ?? "Onboarding";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 py-6 gap-4">
        <View className="gap-2">
          <Text className="text-xs uppercase tracking-[1.5px] text-muted-foreground font-mono">
            Tempo setup
          </Text>
          <Text className="text-3xl font-semibold text-foreground">{stepTitle}</Text>
          <Text className="text-sm text-muted-foreground">
            Step {stepIndex + 1} of {mockOnboarding.steps.length}
          </Text>
          <View className="h-1.5 rounded-full bg-muted overflow-hidden">
            <View
              className="h-full bg-primary"
              style={{ width: `${Math.round(progressRatio * 100)}%` }}
            />
          </View>
        </View>

        {stepIndex === 0 && (
          <View className="rounded-2xl border border-border bg-card p-4 gap-2">
            <Text className="text-lg text-foreground font-semibold">
              Your brain's operating system.
            </Text>
            <Text className="text-sm text-muted-foreground">
              We keep this calm and editable. No pressure, no streak shame.
            </Text>
          </View>
        )}

        {stepIndex === 1 && (
          <View className="rounded-2xl border border-border bg-card p-4 gap-3">
            <Text className="text-sm text-muted-foreground">
              Choose what fits so coach tone and defaults match your day.
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {mockOnboarding.profileTags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    className={`px-3 py-2 rounded-full border ${active ? "bg-primary border-primary" : "bg-background border-border"}`}
                    onPress={() => {
                      /**
                       * @behavior: Toggle neurodivergent profile tag in onboarding personalization.
                       * @convex-mutation-needed: profiles.setOnboardingPreferences
                       * @schema-delta: profiles.neurodivergentTags requires optional-array migration alignment
                       * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx (MobileOnboarding step 1)
                       * @prd: §4 Screen 38, §8
                       */
                      toggleTag(tag);
                    }}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Toggle ${tag}`}
                  >
                    <Text className={active ? "text-primary-foreground text-xs" : "text-foreground text-xs"}>
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {stepIndex === 2 && (
          <View className="rounded-2xl border border-border bg-card p-4 gap-2">
            <Text className="text-sm text-muted-foreground">
              Pick a template start. You can switch later.
            </Text>
            {mockOnboarding.templateOptions.map((option) => {
              const selected = option === selectedTemplate;
              return (
                <Pressable
                  key={option}
                  className={`rounded-xl px-3 py-3 border ${selected ? "border-primary bg-primary/10" : "border-border bg-background"}`}
                  onPress={() => {
                    /**
                     * @behavior: Select onboarding template profile and persist as first-plan seed.
                     * @convex-mutation-needed: profiles.setOnboardingTemplate
                     * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx (MobileOnboarding step 2)
                     * @prd: §4 Screen 39, §10
                     */
                    setSelectedTemplate(option);
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Choose ${option} template`}
                >
                  <Text className="text-foreground text-sm">{option}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {stepIndex === 3 && (
          <View className="rounded-2xl border border-border bg-card p-4 gap-2">
            <Text className="text-sm text-muted-foreground">
              First dump uses the same capture model as daily flow.
            </Text>
            <Text className="text-sm text-foreground">
              "{mockTodayScreen.greeting}"
            </Text>
            <Pressable
              className="self-start rounded-full px-3 py-2 bg-primary"
              onPress={() => {
                /**
                 * @behavior: Submit first onboarding brain dump and open extraction preview.
                 * @convex-action-needed: brainDump.processInitialDump
                 * @provider-needed: openrouter (Gemma for extraction, Mistral fallback)
                 * @convex-mutation-needed: brainDumps.create
                 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx (MobileOnboarding step 3)
                 * @prd: §4 Screen 40, §6, §7
                 */
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Process first brain dump"
            >
              <Text className="text-primary-foreground text-xs font-medium">
                Process first dump
              </Text>
            </Pressable>
          </View>
        )}

        {stepIndex === 4 && (
          <View className="rounded-2xl border border-border bg-card p-4 gap-3">
            <Text className="text-sm text-muted-foreground">
              Confirm top three for today:
            </Text>
            {onboardingPlanPreview.map((task, index) => (
              <View
                key={task.id}
                className="rounded-xl border border-border bg-background px-3 py-2"
              >
                <Text className="text-xs text-muted-foreground">#{index + 1}</Text>
                <Text className="text-sm text-foreground">{task.title}</Text>
              </View>
            ))}
            <Pressable
              className="flex-row items-center gap-2"
              onPress={() => {
                /**
                 * @behavior: Toggle privacy/legal consent before account create + first plan commit.
                 * @convex-mutation-needed: profiles.setConsent
                 * @schema-delta: profiles.onboardingConsentAt missing in current schema draft
                 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx (MobileOnboarding step 4)
                 * @prd: §4 Screen 41, §10, §15
                 */
                setAgreePrivacy((prev) => !prev);
              }}
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel="Agree to privacy and terms"
              accessibilityState={{ checked: agreePrivacy }}
            >
              <View
                className={`h-5 w-9 rounded-full ${agreePrivacy ? "bg-primary" : "bg-muted"}`}
              />
              <Text className="text-xs text-muted-foreground">
                I agree to Privacy + Terms to create my account.
              </Text>
            </Pressable>
          </View>
        )}

        <View className="mt-auto flex-row gap-3">
          <Pressable
            className={`flex-1 rounded-full border border-border px-4 py-3 ${stepIndex === 0 ? "opacity-40" : ""}`}
            onPress={() => {
              /**
               * @behavior: Go to previous onboarding step.
               * @navigate: previous-onboarding-step
               * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx (MobileOnboarding footer)
               * @prd: §4 Screen 37-41
               */
              onBack();
            }}
            disabled={stepIndex === 0}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text className="text-sm text-foreground text-center">Back</Text>
          </Pressable>
          <Pressable
            className={`flex-1 rounded-full px-4 py-3 ${canContinue ? "bg-primary" : "bg-muted"}`}
            onPress={() => {
              /**
               * @behavior: Continue onboarding flow; final step creates first plan and enters authenticated app.
               * @navigate: /(tempo)/(tabs)/today
               * @convex-mutation-needed: plans.createInitialPlan
               * @convex-mutation-needed: users.completeOnboarding
               * @provider-needed: revenuecat (trial/paywall gate after onboarding)
               * @tier-caps: Voice caps derived from selected entitlement (basic=30m, pro=90m, max=180m)
               * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx (MobileOnboarding footer)
               * @prd: §4 Screen 41, §9, §15
               */
              onContinue();
            }}
            disabled={!canContinue}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Continue onboarding"
          >
            <Text className="text-sm text-primary-foreground text-center">Continue</Text>
          </Pressable>
        </View>

        <Text className="text-[11px] text-muted-foreground font-mono">
          tier-a mock-data only · backend handoff tagging complete
        </Text>
      </View>
    </SafeAreaView>
  );
}
