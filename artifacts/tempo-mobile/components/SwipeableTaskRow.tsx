import { useRef } from "react";
import { View, Text, Pressable, Animated as RNAnimated } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeOut, Layout as LayoutAnimation } from "react-native-reanimated";
import { colors } from "../lib/theme";
import type { Id } from "../../../tempo-app/convex/_generated/dataModel";

type Task = {
  _id: Id<"tasks">;
  title: string;
  status: string;
  priority: string;
  estimatedMinutes?: number;
  aiGenerated?: boolean;
};

type Props = {
  task: Task;
  onComplete: () => void;
  onDefer: () => void;
  onPress: () => void;
  showPriority?: boolean;
};

function renderLeftActions(progress: RNAnimated.AnimatedInterpolation<number>) {
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, 0],
  });
  return (
    <RNAnimated.View
      style={{
        backgroundColor: colors.teal,
        justifyContent: "center",
        alignItems: "flex-end",
        paddingRight: 24,
        borderRadius: 14,
        marginBottom: 10,
        width: 80,
        transform: [{ translateX }],
      }}
    >
      <Ionicons name="checkmark-circle" size={28} color="#fff" />
    </RNAnimated.View>
  );
}

function renderRightActions(progress: RNAnimated.AnimatedInterpolation<number>) {
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 0],
  });
  return (
    <RNAnimated.View
      style={{
        backgroundColor: colors.amber,
        justifyContent: "center",
        alignItems: "flex-start",
        paddingLeft: 24,
        borderRadius: 14,
        marginBottom: 10,
        width: 80,
        transform: [{ translateX }],
      }}
    >
      <Ionicons name="time" size={28} color="#fff" />
    </RNAnimated.View>
  );
}

export default function SwipeableTaskRow({ task, onComplete, onDefer, onPress, showPriority = true }: Props) {
  const swipeableRef = useRef<Swipeable>(null);
  const isDone = task.status === "done";
  const priorityColor = task.priority === "high" ? colors.teal : task.priority === "medium" ? colors.amber : colors.muted;

  const handleSwipeLeft = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDefer();
    swipeableRef.current?.close();
  };

  const handleSwipeRight = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete();
    swipeableRef.current?.close();
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} layout={LayoutAnimation.springify()}>
      <Swipeable
        ref={swipeableRef}
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        onSwipeableOpen={(direction) => {
          if (direction === "left") handleSwipeRight();
          else handleSwipeLeft();
        }}
        overshootLeft={false}
        overshootRight={false}
        friction={2}
      >
        <Pressable
          onPress={onPress}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 14,
            padding: 16,
            marginBottom: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onComplete(); }} hitSlop={12}>
            <Ionicons name={isDone ? "checkmark-circle" : "ellipse-outline"} size={22} color={isDone ? colors.primary : colors.muted} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: isDone ? colors.muted : colors.foreground,
                fontSize: 14,
                fontWeight: "600",
                textDecorationLine: isDone ? "line-through" : "none",
              }}
            >
              {task.title}
            </Text>
            {showPriority && (
              <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                <View style={{ backgroundColor: `${priorityColor}33`, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ color: priorityColor, fontSize: 10, fontWeight: "600" }}>{task.priority}</Text>
                </View>
                {task.estimatedMinutes != null && task.estimatedMinutes > 0 && (
                  <Text style={{ color: colors.muted, fontSize: 10 }}>{task.estimatedMinutes}m</Text>
                )}
                {task.aiGenerated && (
                  <View style={{ backgroundColor: "rgba(108,99,255,0.15)", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ color: colors.primary, fontSize: 10, fontWeight: "600" }}>AI</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
}
