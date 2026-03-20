import { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors } from "../lib/theme";

type FABAction = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
};

type Props = {
  actions: FABAction[];
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FABActionItem({ action, idx, total, progress, onDismiss }: { action: FABAction; idx: number; total: number; progress: Animated.SharedValue<number>; onDismiss: () => void }) {
  const itemStyle = useAnimatedStyle(() => {
    const offset = (total - idx) * 60;
    return {
      transform: [
        { translateY: interpolate(progress.value, [0, 1], [offset, 0]) },
        { scale: interpolate(progress.value, [0, 0.5, 1], [0, 0.5, 1]) },
      ],
      opacity: progress.value,
    };
  });

  return (
    <Animated.View style={[{ flexDirection: "row", alignItems: "center", marginBottom: 12 }, itemStyle]}>
      <View style={{ backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginRight: 10, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }}>{action.label}</Text>
      </View>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onDismiss();
          action.onPress();
        }}
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: action.color,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: action.color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 6,
        }}
      >
        <Ionicons name={action.icon} size={22} color="#fff" />
      </Pressable>
    </Animated.View>
  );
}

export default function FloatingActionButton({ actions }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const progress = useSharedValue(0);

  const toggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = !isOpen;
    setIsOpen(next);
    progress.value = withSpring(next ? 1 : 0, { damping: 14, stiffness: 150 });
  }, [isOpen, progress]);

  const mainButtonStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(progress.value, [0, 1], [0, 45])}deg` }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.4,
  }));

  return (
    <>
      {isOpen && (
        <Animated.View style={[StyleSheet.absoluteFill, overlayStyle, { backgroundColor: "#000" }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={toggle} />
        </Animated.View>
      )}

      <View style={{ position: "absolute", right: 20, bottom: 100, alignItems: "flex-end" }} pointerEvents="box-none">
        {actions.map((action, index) => (
          <FABActionItem key={action.label} action={action} idx={index} total={actions.length} progress={progress} onDismiss={toggle} />
        ))}

        <AnimatedPressable
          onPress={toggle}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Animated.View style={mainButtonStyle}>
            <Ionicons name="add" size={28} color="#fff" />
          </Animated.View>
        </AnimatedPressable>
      </View>
    </>
  );
}
