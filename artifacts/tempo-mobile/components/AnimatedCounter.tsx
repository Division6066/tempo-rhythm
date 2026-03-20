import { useEffect, useState } from "react";
import { Text } from "react-native";
import { useSharedValue, withTiming, runOnJS } from "react-native-reanimated";
import { colors } from "../lib/theme";

type Props = {
  value: number;
  style?: object;
};

export default function AnimatedCounter({ value, style }: Props) {
  const [displayValue, setDisplayValue] = useState(0);
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration: 800 }, () => {
      runOnJS(setDisplayValue)(value);
    });

    const interval = setInterval(() => {
      const current = Math.round(animatedValue.value);
      setDisplayValue(current);
    }, 16);

    return () => clearInterval(interval);
  }, [value, animatedValue]);

  return (
    <Text style={[{ color: colors.foreground, fontSize: 22, fontWeight: "800" }, style]}>
      {displayValue}
    </Text>
  );
}
