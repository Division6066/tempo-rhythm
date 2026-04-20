/**
 * @screen: templates
 * @tier: A
 * @platform: mobile
 * @owner: cursor-cloud-2
 * @prd: PRD §10 Template System, PRD §4 Screen 22, PRD §4 Screen 23
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
 * @summary: Template gallery with generator entrypoints and starter cards.
 */
import {
  mockTemplates,
  type MockTemplate,
} from "@tempo/mock-data";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function TemplateBadge({
  type,
}: {
  type: MockTemplate["type"];
}) {
  return (
    <View className="rounded-full bg-muted px-2 py-1">
      <Text className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {type.replace("_", " ")}
      </Text>
    </View>
  );
}

export default function TemplatesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 py-4">
        <Text className="text-2xl font-semibold text-foreground">
          Templates
        </Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          Start from a known shape, then tune it.
        </Text>

        <View className="mt-4 flex-row gap-2">
          {/*
            @behavior: Open natural-language template builder.
            @navigate: /(tempo)/templates/builder
            @convex-action-needed: templates.generateFromNaturalLanguage
            @provider-needed: openrouter
            @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
          */}
          <Pressable
            accessibilityHint="Open template builder from text"
            accessibilityLabel="Generate from natural language"
            accessibilityRole="button"
            className="rounded-full bg-foreground px-4 py-2"
            onPress={() =>
              router.push("/(tempo)/templates/builder")
            }
          >
            <Text className="font-medium text-background">
              Generate by text
            </Text>
          </Pressable>

          {/*
            @behavior: Open sketch-to-template generator.
            @navigate: /(tempo)/templates/sketch
            @convex-action-needed: templates.generateFromSketch
            @provider-needed: openrouter
            @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
          */}
          <Pressable
            accessibilityHint="Open sketch import flow"
            accessibilityLabel="Generate from sketch"
            accessibilityRole="button"
            className="rounded-full border border-border px-4 py-2"
            onPress={() =>
              router.push("/(tempo)/templates/sketch")
            }
          >
            <Text className="font-medium text-foreground">
              Generate by sketch
            </Text>
          </Pressable>
        </View>

        <View className="mt-5 gap-3">
          {mockTemplates.map((template) => (
            <Pressable
              key={template.id}
              accessibilityHint="Open template preview and actions"
              accessibilityLabel={`Open template ${template.title}`}
              accessibilityRole="button"
              className="rounded-2xl border border-border bg-card p-4"
              onPress={() =>
                router.push(
                  `/(tempo)/templates/run/${template.id}`,
                )
              }
            >
              {/*
                @behavior: Open template detail/run flow with selected template id.
                @navigate: /(tempo)/templates/run/{templateId}
                @convex-query-needed: templates.getById
                @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
              */}
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-medium text-foreground">
                  {template.title}
                </Text>
                <TemplateBadge type={template.type} />
              </View>

              <Text className="mt-2 text-sm text-muted-foreground">
                {template.summary}
              </Text>

              <View className="mt-3 flex-row items-center justify-between">
                <Text className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  method: {template.generationMethod}
                </Text>
                {/*
                  @behavior: Duplicate template into current user's library.
                  @convex-mutation-needed: templates.duplicate
                  @convex-query-needed: templates.list
                  @source: docs/design/claude-export/design-system/mobile/mobile-screens-b.jsx
                */}
                <Pressable
                  accessibilityHint="Duplicate this template"
                  accessibilityLabel={`Duplicate ${template.title}`}
                  accessibilityRole="button"
                  className="rounded-full border border-border px-3 py-1.5"
                >
                  <Text className="font-mono text-[11px] text-foreground">
                    Duplicate
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
