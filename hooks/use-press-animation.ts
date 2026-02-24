import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface PressAnimationOptions {
  scaleDown?: number;
  damping?: number;
  stiffness?: number;
}

/**
 * Provides a press scale animation for Pressable components.
 * Returns animatedStyle, onPressIn, and onPressOut handlers.
 */
export function usePressAnimation(options?: PressAnimationOptions) {
  const {
    scaleDown = 0.97,
    damping = 15,
    stiffness = 300,
  } = options ?? {};

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(scaleDown, { damping, stiffness });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping, stiffness });
  };

  return { animatedStyle, onPressIn, onPressOut };
}
