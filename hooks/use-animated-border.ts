import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { COLORS } from "@/constants/theme";

/**
 * Provides an animated border color that transitions between
 * normal, focused, and error states.
 */
export function useAnimatedBorder(borderColor: string, focusColor: string) {
  const focusProgress = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focusProgress.value, [0, 1], [borderColor, focusColor]),
  }));

  const borderStyleWithError = (error?: string | null) => {
    if (error) {
      return { borderColor: COLORS.error };
    }
    return borderStyle;
  };

  const onFocus = () => {
    focusProgress.value = withTiming(1, { duration: 200 });
  };

  const onBlur = () => {
    focusProgress.value = withTiming(0, { duration: 200 });
  };

  return { borderStyle, borderStyleWithError, onFocus, onBlur };
}
