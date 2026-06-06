import { Tabs } from "expo-router";
import {
  BookOpen,
  CheckSquare,
  Heart,
  Home,
  Settings,
} from "lucide-react-native";
import { tempoColors } from "@tempo/ui/theme";

/**
 * Tempo Flow bottom tab bar.
 * @source docs/design/claude-export/design-system/mobile/mobile-shell.jsx
 * @action navigateTab
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tempoColors.tempoOrange,
        tabBarInactiveTintColor: tempoColors.dustGreySoft,
        tabBarStyle: {
          backgroundColor: tempoColors.creamRaised,
          borderTopColor: tempoColors.lineSoft,
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size }) => (
            <CheckSquare size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: "Coach",
          tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="notes" options={{ href: null }} />
    </Tabs>
  );
}
