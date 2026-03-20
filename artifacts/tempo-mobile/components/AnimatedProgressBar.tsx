import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { colors } from "../lib/theme";

type Props = {
  progress: number;
};

export default function AnimatedProgressBar({ progress }: Props) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(progress, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={{ flex: 1, height: 6, backgroundColor: colors.surfaceLight, borderRadius: 3, overflow: "hidden" }}>
      <Animated.View style={[{ height: "100%", backgroundColor: colors.primary, borderRadius: 3 }, animatedStyle]} />
    </View>
  );
}
