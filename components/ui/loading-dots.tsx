import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

interface LoadingDotsProps {
  color?: string;
  size?: number;
  count?: number;
}

function Dot({ color, size, delay }: { color: string; size: number; delay: number }) {
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }),
          withTiming(0.4, { duration: 400, easing: Easing.in(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }),
          withTiming(0.3, { duration: 400, easing: Easing.in(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

export function LoadingDots({ color = "#fff", size = 6, count = 3 }: LoadingDotsProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: size * 0.8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Dot key={i} color={color} size={size} delay={i * 160} />
      ))}
    </View>
  );
}
