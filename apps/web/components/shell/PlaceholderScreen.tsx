import { StyleSheet, Text, View } from "react-native";
import type { ShellRoute } from "./routes";

type PlaceholderScreenProps = {
  route: ShellRoute;
  detail?: string;
};

export function PlaceholderScreen({ route, detail }: PlaceholderScreenProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Placeholder route</Text>
      <Text accessibilityRole="header" style={styles.heading}>
        {route.heading}
      </Text>
      <Text style={styles.body}>{route.description}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      <Text style={styles.note}>
        Later UI tickets can replace this file without editing shared navigation.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 760,
    borderRadius: 24,
    borderCurve: "continuous",
    borderColor: "#d8cec1",
    borderWidth: 1,
    backgroundColor: "#fffaf3",
    padding: 28,
    gap: 14,
  },
  eyebrow: {
    color: "#76685b",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  heading: {
    color: "#231f1b",
    fontSize: 38,
    fontWeight: "800",
    lineHeight: 44,
  },
  body: {
    color: "#4c4035",
    fontSize: 18,
    lineHeight: 28,
  },
  detail: {
    color: "#66584b",
    fontSize: 15,
    lineHeight: 22,
  },
  note: {
    color: "#7b6f62",
    fontSize: 14,
    lineHeight: 20,
  },
});
