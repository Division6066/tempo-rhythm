/**
 * @generated-by: app-shell navigation scaffold.
 * @screen: library
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/mobile/mobile-shell.jsx
 * @summary: Mobile Library tab home for notes, journal, calendar, habits, routines, and templates.
 * @notes: Navigation shell only; feature agents own the linked screen internals.
 */
import { Link } from "expo-router";
import { BookOpen, Calendar, Flame, Notebook, Repeat, Search } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { tempoColors } from "@tempo/ui/theme";

const libraryLinks = [
  { href: "/(tempo)/(tabs)/notes", label: "Notes", icon: Notebook },
  { href: "/(tempo)/journal", label: "Journal", icon: BookOpen },
  { href: "/(tempo)/calendar", label: "Calendar", icon: Calendar },
  { href: "/(tempo)/habits", label: "Habits", icon: Flame },
  { href: "/(tempo)/routines", label: "Routines", icon: Repeat },
  { href: "/(tempo)/templates", label: "Templates", icon: Search },
] as const;

export default function Screen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 gap-5 p-6">
        <View className="gap-2">
          <Text className="text-2xl font-semibold text-foreground">
            Library
          </Text>
          <Text className="text-sm leading-5 text-muted-foreground">
            Notes, journals, routines, and templates live here. Pick a shelf
            when you're ready.
          </Text>
        </View>

        <View className="gap-3">
          {libraryLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} asChild>
                <Pressable
                  accessible={true}
                  accessibilityRole="link"
                  accessibilityLabel={item.label}
                  accessibilityHint={`Opens ${item.label}`}
                  className="min-h-14 flex-row items-center gap-3 rounded-2xl border border-border-soft bg-card px-4 py-3 active:bg-surface-sunken"
                >
                  <Icon size={18} color={tempoColors.tempoOrange} />
                  <Text className="text-base font-medium text-foreground">
                    {item.label}
                  </Text>
                </Pressable>
              </Link>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}
