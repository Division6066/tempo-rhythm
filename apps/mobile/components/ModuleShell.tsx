import { Link, Slot, usePathname, type Href } from "expo-router";
import {
  Activity,
  BarChart3,
  Dumbbell,
  Home,
  Leaf,
  Settings,
} from "lucide-react-native";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ModuleKey =
  | "home"
  | "breathe"
  | "move"
  | "condition"
  | "progress"
  | "settings";

type ModuleIcon = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

type ModuleRoute = {
  key: ModuleKey;
  label: string;
  path: Href;
  icon: ModuleIcon;
  eyebrow: string;
  title: string;
  copy: string;
  prompt: string;
};

export const moduleRoutes = [
  {
    key: "home",
    label: "Home",
    path: "/home",
    icon: Home,
    eyebrow: "Start softly",
    title: "Home is ready for your next gentle step.",
    copy: "Your daily rhythm will gather here once the first routines land.",
    prompt: "For now, this calm shell confirms the space is open.",
  },
  {
    key: "breathe",
    label: "Breathe",
    path: "/breathe",
    icon: Leaf,
    eyebrow: "Nervous system",
    title: "Breathe practices will live here.",
    copy: "Short grounding routines can meet you here without pressure.",
    prompt: "Empty is okay. A quiet placeholder is better than a blank wall.",
  },
  {
    key: "move",
    label: "Move",
    path: "/move",
    icon: Dumbbell,
    eyebrow: "Body cue",
    title: "Move sessions will collect here.",
    copy: "Tiny movement options will appear when the module is connected.",
    prompt: "No streaks, no guilt - just an easy place to begin again.",
  },
  {
    key: "condition",
    label: "Condition",
    path: "/condition",
    icon: Activity,
    eyebrow: "Capacity",
    title: "Condition tracking will start here.",
    copy: "This module will help notice patterns without judging them.",
    prompt: "The shell is here first so the later data has a kind home.",
  },
  {
    key: "progress",
    label: "Progress",
    path: "/progress",
    icon: BarChart3,
    eyebrow: "Evidence",
    title: "Progress views will grow here.",
    copy: "Wins, trends, and gentle reflections will show up in this space.",
    prompt: "Nothing to prove today. The route is ready when the data is.",
  },
  {
    key: "settings",
    label: "Settings",
    path: "/settings",
    icon: Settings,
    eyebrow: "Control panel",
    title: "Settings will give you control.",
    copy: "Preferences, accessibility, and account controls will collect here.",
    prompt: "You get the switches before the app asks more from you.",
  },
] as const satisfies readonly ModuleRoute[];

export const moduleByKey = Object.fromEntries(
  moduleRoutes.map((module) => [module.key, module]),
) as Record<ModuleKey, (typeof moduleRoutes)[number]>;

export function ModuleShell() {
  const pathname = usePathname();
  const isRTL = useDocumentDirection() === "rtl";
  const orderedRoutes = useMemo(
    () => (isRTL ? [...moduleRoutes].reverse() : moduleRoutes),
    [isRTL],
  );

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1">
        <Slot />
      </View>
      <View
        className="border-t border-border bg-card px-3 py-2"
        testID="module-navigation"
      >
        <View className="flex-row justify-between gap-1">
          {orderedRoutes.map((module) => {
            const isActive = pathname === module.path;
            const tintClass = isActive
              ? "text-primary"
              : "text-muted-foreground";
            const iconColor = isActive ? "#D97757" : "#6B6864";

            return (
              <Link href={module.path} asChild={true} key={module.key}>
                <Pressable
                  accessibilityHint={`Open the ${module.label} module`}
                  accessibilityLabel={module.label}
                  accessibilityRole="link"
                  className={`min-h-12 flex-1 items-center justify-center gap-1 rounded-2xl px-1 py-2 ${
                    isActive ? "bg-muted" : "bg-transparent"
                  }`}
                  testID={`module-nav-${module.key}`}
                >
                  <module.icon color={iconColor} size={19} strokeWidth={2.1} />
                  <Text className={`text-[11px] font-semibold ${tintClass}`}>
                    {module.label}
                  </Text>
                </Pressable>
              </Link>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export function ModuleScreen({ module }: { module: ModuleRoute }) {
  const Icon = module.icon;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="min-h-full px-5 py-6"
      >
        <View className="gap-5">
          <View className="gap-2">
            <Text className="text-xs font-bold uppercase tracking-[2px] text-muted-foreground">
              {module.eyebrow}
            </Text>
            <Text
              accessibilityRole="header"
              className="font-serif text-4xl font-semibold leading-tight text-foreground"
            >
              {module.label}
            </Text>
          </View>

          <View
            className="min-h-48 gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm"
            testID="module-empty-state"
          >
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Icon color="#D97757" size={28} strokeWidth={2} />
            </View>
            <View className="gap-2">
              <Text
                className="text-2xl font-semibold leading-snug text-card-foreground"
                testID="module-empty-state-title"
              >
                {module.title}
              </Text>
              <Text
                className="text-base leading-6 text-muted-foreground"
                testID="module-empty-state-copy"
              >
                {module.copy}
              </Text>
            </View>
            <View className="rounded-2xl bg-muted px-4 py-3">
              <Text className="text-sm leading-5 text-foreground">
                {module.prompt}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function useDocumentDirection(): "ltr" | "rtl" {
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const readDirection = () => {
      setDirection(document.documentElement.dir === "rtl" ? "rtl" : "ltr");
    };

    readDirection();
    const observer = new MutationObserver(readDirection);
    observer.observe(document.documentElement, {
      attributeFilter: ["dir"],
      attributes: true,
    });

    return () => observer.disconnect();
  }, []);

  return direction;
}
