import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  emptyStateActionLabel,
  emptyStateLeaveQuiet,
  emptyStateReassurance,
} from "@/lib/tempo-empty-state";

type TempoEmptyStateProps = {
  screenId: string;
  title: string;
  summary: string;
  actionLabel?: string;
};

export function TempoEmptyState({
  screenId,
  title,
  summary,
  actionLabel,
}: TempoEmptyStateProps) {
  return (
    <SafeAreaView
      className="flex-1 bg-background"
      testID={`${screenId}-empty-state`}
      accessible={true}
      accessibilityLabel={`${title} empty state`}
    >
      <View className="flex-1 justify-center gap-5 px-6 py-8">
        <View className="self-start rounded-full border border-border bg-card px-3 py-1">
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Empty state
          </Text>
        </View>

        <View className="gap-3 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <Text className="text-3xl font-semibold text-foreground">{title}</Text>
          <Text className="text-base leading-7 text-muted-foreground">
            {summary}
          </Text>
          <View className="rounded-2xl bg-muted px-4 py-3">
            <Text className="text-sm leading-6 text-muted-foreground">
              {emptyStateReassurance}
            </Text>
          </View>
        </View>

        <View className="gap-2 rounded-2xl border border-border bg-card px-4 py-3">
          <Text className="text-sm font-semibold text-foreground">
            {emptyStateActionLabel(actionLabel)}
          </Text>
          <Text className="text-xs leading-5 text-muted-foreground">
            {emptyStateLeaveQuiet}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
