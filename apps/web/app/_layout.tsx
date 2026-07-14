import { Link, Slot } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { shellRoutes } from "../components/shell/routes";

export default function RootLayout() {
  return (
    <View style={styles.shell}>
      <View style={styles.sidebar}>
        <Text style={styles.brand}>Agentwright</Text>
        <Text style={styles.subtitle}>Universal shell</Text>
        <View accessibilityRole="navigation" style={styles.nav}>
          {shellRoutes.map((route) => (
            <Link key={route.href} accessibilityRole="link" href={route.href} style={styles.navLink}>
              <Text style={styles.navText}>{route.label}</Text>
            </Link>
          ))}
        </View>
      </View>
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    minHeight: "100%",
    backgroundColor: "#f3ebe2",
    flexDirection: "row",
  },
  sidebar: {
    width: 280,
    backgroundColor: "#231f1b",
    paddingHorizontal: 22,
    paddingVertical: 28,
    gap: 12,
  },
  brand: {
    color: "#fffaf3",
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: "#d8cec1",
    fontSize: 14,
    marginBottom: 10,
  },
  nav: {
    gap: 8,
  },
  navLink: {
    borderRadius: 14,
    borderCurve: "continuous",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  navText: {
    color: "#fffaf3",
    fontSize: 16,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
  },
});
